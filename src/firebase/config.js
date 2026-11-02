import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCSwvwXrlr9nI7aFuNgY4JbEwJEqYJeb0k",
  authDomain: "dunia-bermain-anak.firebaseapp.com",
  projectId: "dunia-bermain-anak",
  storageBucket: "dunia-bermain-anak.firebasestorage.app",
  messagingSenderId: "792384599532",
  appId: "1:792384599532:web:a62bce8111e03c623be875",
  databaseURL: "https://dunia-bermain-anak-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Inisialisasi Firebase App aman dari HMR reload ganda
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

// ====================================================================
// DELEGASI DATABASE UTAMA KE SUPABASE
// ====================================================================
export {
  getRoomsFromDb,
  saveRoomsToDb,
  resetRoomsInDb,
  getRaceQuestionsFromDb,
  saveRaceQuestionsToDb,
  getStudentResults,
  saveStudentResult,
  deleteStudentResult,
  getDosenPinHash,
  updateDosenPinHash,
  resetDosenPinInDb
} from '../supabase/db.js';

/**
 * Normalisasi data pengerjaan mahasiswa
 */
export function normalizeStudentRecord(raw) {
  if (!raw || typeof raw !== 'object') return {};
  const nama = raw.nama || raw.name || 'Mahasiswa';
  const answers = Array.isArray(raw.answers) ? raw.answers : (Array.isArray(raw.answersRecord) ? raw.answersRecord : []);
  const score = typeof raw.score === 'number' ? raw.score : 0;
  const correct = typeof raw.correct === 'number' ? raw.correct : (typeof raw.totalCorrect === 'number' ? raw.totalCorrect : 0);
  const totalLocks = typeof raw.totalLocks === 'number' ? raw.totalLocks : (answers.length || 5);

  return {
    ...raw,
    nama,
    name: nama,
    score,
    correct,
    totalLocks,
    answers
  };
}
