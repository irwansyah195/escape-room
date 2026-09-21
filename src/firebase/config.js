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
 * Menyimpan hasil pengerjaan mahasiswa ke koleksi 'results'
 */
export async function saveStudentResult(record) {
  // Simpan ke local cache juga sebagai backup
  try {
    const localRes = JSON.parse(localStorage.getItem(LOCAL_STORAGE_RESULTS_KEY) || '[]');
    localRes.unshift({ ...record, id: 'local-' + Date.now() });
    localStorage.setItem(LOCAL_STORAGE_RESULTS_KEY, JSON.stringify(localRes));
  } catch (e) {
    console.error(e);
  }

  try {
    const docRef = await addDoc(collection(db, 'results'), {
      ...record,
      createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (err) {
    console.warn("Gagal menyimpan ke Firestore online:", err.message);
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
      records.push({ id: d.id, ...d.data() });
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
  return localRes ? JSON.parse(localRes) : [];
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
 * Password tidak pernah disimpan dalam bentuk teks polos (plaintext).
 */
export async function getDosenPinHash() {
  try {
    const docRef = doc(db, 'settings', 'security');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().pinHash) {
      const hash = docSnap.data().pinHash;
      localStorage.setItem(LOCAL_STORAGE_HASH_KEY, hash);
      return hash;
    }
  } catch (err) {
    console.warn("Gagal membaca hash keamanan dari Firestore:", err.message);
  }

  return localStorage.getItem(LOCAL_STORAGE_HASH_KEY) || DEFAULT_PIN_HASH;
}

/**
 * Memperbarui PIN Dosen.
 * Hanya menyimpan hasil hash kriptografi SHA-256, bukan password asli.
 */
export async function updateDosenPinHash(newPin) {
  const hash = await hashPin(newPin);
  localStorage.setItem(LOCAL_STORAGE_HASH_KEY, hash);

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
