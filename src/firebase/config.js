import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  query
} from 'firebase/firestore';
import { defaultRooms } from '../data/defaultRooms';
import { hashPin, DEFAULT_PIN_HASH } from '../utils/crypto';
import {
  isSessionAlreadySubmitted,
  markSessionSubmitted,
  validateStudentPayload
} from '../utils/securityLimiter';

const firebaseConfig = {
  apiKey: "AIzaSyCSwvwXrlr9nI7aFuNgY4JbEwJEqYJeb0k",
  authDomain: "dunia-bermain-anak.firebaseapp.com",
  projectId: "dunia-bermain-anak",
  storageBucket: "dunia-bermain-anak.firebasestorage.app",
  messagingSenderId: "792384599532",
  appId: "1:792384599532:web:e185ee5cfc9036288bbcc9",
  measurementId: "G-XXLXCBQ8R9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

const LOCAL_STORAGE_ROOMS_KEY = 'dunia_bermain_rooms_cache';
const LOCAL_STORAGE_RESULTS_KEY = 'dunia_bermain_results_cache';
const LOCAL_STORAGE_HASH_KEY = 'dunia_bermain_security_hash';
const LOCAL_STORAGE_HASH_TTL_KEY = 'dunia_bermain_security_hash_ttl';

// In-memory cache untuk PIN hash agar tidak memicu Firestore read berulang saat brute force
let inMemoryPinHash = null;
let inMemoryPinHashExpiresAt = 0;
const PIN_HASH_TTL_MS = 15 * 60 * 1000; // 15 menit

/**
 * Mengambil data seluruh ruangan & soal dari Firestore.
 * Jika Firestore belum memiliki data atau offline, menggunakan defaultRooms & localStorage.
 */
export async function getRoomsFromDb() {
  try {
    const docRef = doc(db, 'content', 'rooms_data');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && Array.isArray(docSnap.data().list) && docSnap.data().list.length > 0) {
      const rooms = docSnap.data().list;
      localStorage.setItem(LOCAL_STORAGE_ROOMS_KEY, JSON.stringify(rooms));
      return rooms;
    }

    // Jika belum ada di Firestore, coba simpan defaultRooms sebagai data awal
    const localCached = localStorage.getItem(LOCAL_STORAGE_ROOMS_KEY);
    const initialRooms = localCached ? JSON.parse(localCached) : defaultRooms;

    try {
      await setDoc(docRef, {
        list: initialRooms,
        updatedAt: serverTimestamp()
      });
    } catch (writeErr) {
      console.warn("Info: Tidak dapat menulis seed awal ke Firestore:", writeErr.message);
    }

    localStorage.setItem(LOCAL_STORAGE_ROOMS_KEY, JSON.stringify(initialRooms));
    return initialRooms;
  } catch (err) {
    console.warn("Koneksi Firestore membaca soal bermasalah, menggunakan cache/default:", err.message);
    const localCached = localStorage.getItem(LOCAL_STORAGE_ROOMS_KEY);
    return localCached ? JSON.parse(localCached) : defaultRooms;
  }
}

/**
 * Menyimpan seluruh perubahan ruangan & soal yang diedit dosen ke Firestore & cache lokal.
 */
export async function saveRoomsToDb(rooms) {
  localStorage.setItem(LOCAL_STORAGE_ROOMS_KEY, JSON.stringify(rooms));
  try {
    const docRef = doc(db, 'content', 'rooms_data');
    await setDoc(docRef, {
      list: rooms,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (err) {
    console.warn("Gagal menyimpan ke Firestore online, tersimpan di cache browser:", err.message);
    return { success: true, offline: true, error: err.message };
  }
}

/**
 * Mengembalikan soal ke default bawaan psikologi bermain anak
 */
export async function resetRoomsInDb() {
  return await saveRoomsToDb(defaultRooms);
}

/**
 * Normalisasi data pengerjaan mahasiswa agar kompatibel dengan data lama & baru di Firestore
 */
export function normalizeStudentRecord(raw) {
  if (!raw || typeof raw !== 'object') return {};

  const name = raw.name || raw.nama || 'Mahasiswa';
  const nama = raw.nama || raw.name || 'Mahasiswa';
  const answers = Array.isArray(raw.answers) ? raw.answers : [];

  // Hitung jumlah benar jika tidak ada field 'correct' langsung
  let correct = raw.correct;
  if (correct === undefined || correct === null) {
    correct = answers.filter(a => a.isSolved).length;
  } else {
    correct = Number(correct) || 0;
  }

  // Hitung total locks jika tidak ada field 'totalLocks' langsung
  let totalLocks = raw.totalLocks;
  if (totalLocks === undefined || totalLocks === null) {
    totalLocks = answers.length > 0 ? answers.length : ((raw.totalRooms || 3) * 3);
  } else {
    totalLocks = Number(totalLocks) || 0;
  }

  // Ambil timestamp dari timestamp, submittedAt, atau createdAt (Firestore Timestamp)
  let timestamp = raw.timestamp || raw.submittedAt;
  if (!timestamp && raw.createdAt) {
    if (typeof raw.createdAt.toDate === 'function') {
      timestamp = raw.createdAt.toDate().toISOString();
    } else if (raw.createdAt.seconds) {
      timestamp = new Date(raw.createdAt.seconds * 1000).toISOString();
    }
  }

  return {
    ...raw,
    name,
    nama,
    correct,
    totalLocks,
    timestamp: timestamp || new Date().toISOString(),
    submittedAt: raw.submittedAt || timestamp || new Date().toISOString(),
    answers
  };
}

/**
 * Menyimpan hasil pengerjaan mahasiswa ke koleksi 'results'
 */
export async function saveStudentResult(record) {
  // 1. Validasi integritas payload data sebelum dikirim
  const validation = validateStudentPayload(record);
  if (!validation.valid) {
    console.warn("Payload mahasiswa tidak valid:", validation.error);
    return { success: false, error: validation.error };
  }

  // 2. Proteksi submit ganda / spamming token sesi
  if (record.sessionId && isSessionAlreadySubmitted(record.sessionId)) {
    console.warn("Sesi pengerjaan ini sudah pernah terkirim sebelumnya.");
    return { success: true, duplicate: true };
  }

  const nowIso = new Date().toISOString();
  const sanitizedRecord = {
    nama: String(record.nama || record.name || '').trim().slice(0, 60),
    name: String(record.name || record.nama || '').trim().slice(0, 60),
    nim: String(record.nim || '').trim().slice(0, 30),
    score: Math.max(0, Math.min(100, Math.round(Number(record.score) || 0))),
    correct: Number(record.correct) || (Array.isArray(record.answers) ? record.answers.filter(a => a.isSolved).length : 0),
    totalLocks: Number(record.totalLocks) || (Array.isArray(record.answers) && record.answers.length > 0 ? record.answers.length : 12),
    totalRooms: Number(record.totalRooms) || 3,
    answers: Array.isArray(record.answers) ? record.answers.slice(0, 50) : [],
    sessionId: record.sessionId || null,
    submittedAt: nowIso,
    timestamp: nowIso
  };

  // Simpan ke local cache juga sebagai backup
  try {
    const localRes = JSON.parse(localStorage.getItem(LOCAL_STORAGE_RESULTS_KEY) || '[]');
    localRes.unshift({ ...sanitizedRecord, id: 'local-' + Date.now() });
    localStorage.setItem(LOCAL_STORAGE_RESULTS_KEY, JSON.stringify(localRes));
  } catch (e) {
    console.error(e);
  }

  try {
    const docRef = await addDoc(collection(db, 'results'), {
      ...sanitizedRecord,
      createdAt: serverTimestamp()
    });

    if (record.sessionId) {
      markSessionSubmitted(record.sessionId);
    }

    return { success: true, id: docRef.id };
  } catch (err) {
    console.warn("Gagal menyimpan ke Firestore online:", err.message);
    if (record.sessionId) {
      markSessionSubmitted(record.sessionId);
    }
    return { success: false, error: err.message };
  }
}

/**
 * Mengambil seluruh rekap hasil mahasiswa
 */
export async function getStudentResults() {
  try {
    const q = query(collection(db, 'results'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const records = [];
    snap.forEach(d => {
      records.push(normalizeStudentRecord({ id: d.id, ...d.data() }));
    });

    if (records.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_RESULTS_KEY, JSON.stringify(records));
      return records;
    }
  } catch (err) {
    console.warn("Gagal membaca hasil dari Firestore:", err.message);
  }

  // Fallback ke local cache
  const localRes = localStorage.getItem(LOCAL_STORAGE_RESULTS_KEY);
  if (localRes) {
    try {
      const parsed = JSON.parse(localRes);
      return (Array.isArray(parsed) ? parsed : []).map(normalizeStudentRecord);
    } catch (e) {
      console.error(e);
    }
  }
  return [];
}

/**
 * Menghapus data hasil ujian mahasiswa (untuk menghapus data uji coba)
 */
export async function deleteStudentResult(id) {
  // Hapus dari local cache
  try {
    const localRes = JSON.parse(localStorage.getItem(LOCAL_STORAGE_RESULTS_KEY) || '[]');
    const filtered = localRes.filter(r => r.id !== id);
    localStorage.setItem(LOCAL_STORAGE_RESULTS_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error(e);
  }

  try {
    if (!id.startsWith('local-')) {
      await deleteDoc(doc(db, 'results', id));
    }
    return { success: true };
  } catch (err) {
    console.warn("Gagal menghapus di Firestore online:", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Mengambil Hash SHA-256 PIN Dosen aktif.
 * Menggunakan in-memory & localStorage cache ber-TTL 15 menit agar brute force
 * tidak memboroskan kuota read Firestore.
 */
export async function getDosenPinHash(forceRefresh = false) {
  const now = Date.now();

  // 1. Cek in-memory cache jika masih berlaku
  if (!forceRefresh && inMemoryPinHash && now < inMemoryPinHashExpiresAt) {
    return inMemoryPinHash;
  }

  // 2. Cek localStorage TTL cache jika masih berlaku
  const cachedHash = localStorage.getItem(LOCAL_STORAGE_HASH_KEY);
  const cachedTtl = parseInt(localStorage.getItem(LOCAL_STORAGE_HASH_TTL_KEY) || '0', 10);
  if (!forceRefresh && cachedHash && now < cachedTtl) {
    inMemoryPinHash = cachedHash;
    inMemoryPinHashExpiresAt = cachedTtl;
    return cachedHash;
  }

  // 3. Hanya jika cache kadaluarsa atau dipaksa refresh, lakukan read ke Firestore
  try {
    const docRef = doc(db, 'settings', 'security');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().pinHash) {
      const hash = docSnap.data().pinHash;
      inMemoryPinHash = hash;
      inMemoryPinHashExpiresAt = now + PIN_HASH_TTL_MS;
      localStorage.setItem(LOCAL_STORAGE_HASH_KEY, hash);
      localStorage.setItem(LOCAL_STORAGE_HASH_TTL_KEY, inMemoryPinHashExpiresAt.toString());
      return hash;
    }
  } catch (err) {
    console.warn("Gagal membaca hash keamanan dari Firestore:", err.message);
  }

  // 4. Fallback ke hash lokal atau default
  const fallback = cachedHash || DEFAULT_PIN_HASH;
  inMemoryPinHash = fallback;
  inMemoryPinHashExpiresAt = now + PIN_HASH_TTL_MS;
  return fallback;
}

/**
 * Memperbarui PIN Dosen.
 * Hanya menyimpan hasil hash kriptografi SHA-256 dan memperbarui cache.
 */
export async function updateDosenPinHash(newPin) {
  const hash = await hashPin(newPin);
  const now = Date.now();

  inMemoryPinHash = hash;
  inMemoryPinHashExpiresAt = now + PIN_HASH_TTL_MS;
  localStorage.setItem(LOCAL_STORAGE_HASH_KEY, hash);
  localStorage.setItem(LOCAL_STORAGE_HASH_TTL_KEY, inMemoryPinHashExpiresAt.toString());

  // Bersihkan key lama jika ada
  localStorage.removeItem('dunia_bermain_dosen_pin');

  try {
    const docRef = doc(db, 'settings', 'security');
    await setDoc(docRef, {
      pinHash: hash,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (err) {
    console.warn("Gagal menyimpan hash ke Firestore online:", err.message);
    return { success: true, offline: true };
  }
}
