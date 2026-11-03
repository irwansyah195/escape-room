import { supabase, isSupabaseConfigured } from './client.js';
import { defaultRooms } from '../data/defaultRooms.js';
import { defaultRaceQuestions } from '../data/defaultRaceQuestions.js';
import { hashPin, DEFAULT_PIN_HASH } from '../utils/crypto.js';

const LOCAL_STORAGE_ROOMS_KEY = 'dunia_bermain_rooms_cache';
const LOCAL_STORAGE_RACE_KEY = 'dunia_bermain_race_questions';
const LOCAL_STORAGE_RESULTS_KEY = 'dunia_bermain_student_results';
const LOCAL_STORAGE_PIN_KEY = 'dunia_bermain_dosen_pin_hash';
const DEFAULT_HASH = DEFAULT_PIN_HASH || '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';

// ====================================================================
// 1. RUANGAN & GEMBOK ESCAPE ROOM
// ====================================================================

export async function getRoomsFromDb() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('rooms_content')
        .select('list')
        .eq('key', 'default')
        .single();

      if (!error && data && Array.isArray(data.list) && data.list.length > 0) {
        localStorage.setItem(LOCAL_STORAGE_ROOMS_KEY, JSON.stringify(data.list));
        return data.list;
      }

      // Jika di tabel Supabase masih kosong, coba inisialisasi dengan data default/cache
      const localCached = localStorage.getItem(LOCAL_STORAGE_ROOMS_KEY);
      const initialRooms = localCached ? JSON.parse(localCached) : defaultRooms;

      await supabase.from('rooms_content').upsert({
        key: 'default',
        list: initialRooms,
        updated_at: new Date().toISOString()
      });

      localStorage.setItem(LOCAL_STORAGE_ROOMS_KEY, JSON.stringify(initialRooms));
      return initialRooms;
    } catch (e) {
      console.warn("Gagal membaca ruangan dari Supabase, beralih ke cache:", e);
    }
  }

  // Fallback cache lokal
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ROOMS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return defaultRooms;
}

export async function saveRoomsToDb(rooms) {
  if (!Array.isArray(rooms)) return { success: false };
  localStorage.setItem(LOCAL_STORAGE_ROOMS_KEY, JSON.stringify(rooms));

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('rooms_content').upsert({
        key: 'default',
        list: rooms,
        updated_at: new Date().toISOString()
      });

      if (error) {
        console.warn("Gagal menyimpan ruangan ke Supabase:", error);
        return { success: true, offline: true, error: error.message };
      }
      return { success: true };
    } catch (e) {
      console.warn("Gagal menyimpan ruangan ke Supabase:", e);
      return { success: true, offline: true, error: e.message };
    }
  }
  return { success: true, localOnly: true };
}

export async function resetRoomsInDb() {
  return await saveRoomsToDb(defaultRooms);
}

// ====================================================================
// 2. BANK SOAL BALAP (QUIZ SPRINT RACE)
// ====================================================================

export async function getRaceQuestionsFromDb() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('race_questions')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        // Map database fields to frontend structure
        const mapped = data.map(q => ({
          id: q.id,
          story: q.story || '',
          question: q.question,
          options: q.options || [],
          correctOption: q.correct_option ?? 0,
          explanation: q.explanation || ''
        }));
        localStorage.setItem(LOCAL_STORAGE_RACE_KEY, JSON.stringify(mapped));
        return mapped;
      }

      // Jika masih kosong di Supabase, coba seed data default
      const localCached = localStorage.getItem(LOCAL_STORAGE_RACE_KEY);
      const initial = localCached ? JSON.parse(localCached) : defaultRaceQuestions;

      const rowsToInsert = initial.map(q => ({
        id: q.id,
        story: q.story || '',
        question: q.question,
        options: q.options || [],
        correct_option: q.correctOption ?? 0,
        explanation: q.explanation || ''
      }));

      await supabase.from('race_questions').upsert(rowsToInsert);
      localStorage.setItem(LOCAL_STORAGE_RACE_KEY, JSON.stringify(initial));
      return initial;
    } catch (e) {
      console.warn("Gagal membaca soal balap dari Supabase:", e);
    }
  }

  // Fallback cache lokal
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_RACE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return defaultRaceQuestions;
}

export async function saveRaceQuestionsToDb(questions) {
  if (!Array.isArray(questions)) return { success: false };
  localStorage.setItem(LOCAL_STORAGE_RACE_KEY, JSON.stringify(questions));

  if (isSupabaseConfigured && supabase) {
    try {
      // Hapus soal lama yang sudah tidak ada
      const currentIds = questions.map(q => q.id);
      if (currentIds.length > 0) {
        await supabase
          .from('race_questions')
          .delete()
          .not('id', 'in', `(${currentIds.map(id => `"${id}"`).join(',')})`);
      } else {
        await supabase.from('race_questions').delete().neq('id', '___none___');
      }

      if (questions.length > 0) {
        const rows = questions.map(q => ({
          id: q.id,
          story: q.story || '',
          question: q.question,
          options: q.options || [],
          correct_option: q.correctOption ?? 0,
          explanation: q.explanation || ''
        }));
        const { error } = await supabase.from('race_questions').upsert(rows);
        if (error) throw error;
      }

      return { success: true };
    } catch (e) {
      console.warn("Gagal menyimpan bank soal balap ke Supabase:", e);
      return { success: true, offline: true, error: e.message };
    }
  }
  return { success: true, localOnly: true };
}

// ====================================================================
// 3. REKAP NILAI MAHASISWA (STUDENT RESULTS)
// ====================================================================

export async function saveStudentRecordToDb(record) {
  const cleanPin = record.sessionPin ? String(record.sessionPin).trim() : 'solo';
  const cleanNim = (record.nim || record.nama || record.name || 'anon').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  // Gunakan ID deterministik per sesi & per mahasiswa agar tidak terduplikasi saat re-submit
  const resultId = `res_${cleanPin}_${cleanNim}`;
  const answersList = Array.isArray(record.answers) ? record.answers : (Array.isArray(record.answersRecord) ? record.answersRecord : []);
  const correctCount = typeof record.correct === 'number' ? record.correct : (typeof record.totalCorrect === 'number' ? record.totalCorrect : answersList.filter(a => a.isSolved).length);
  const totalCount = typeof record.totalLocks === 'number' ? record.totalLocks : (typeof record.totalQuestions === 'number' ? record.totalQuestions : (answersList.length || 20));
  const timeStampIso = record.timestamp || record.submittedAt || (record.createdAt ? new Date(record.createdAt).toISOString() : new Date().toISOString());

  const numScore = Number(record.score);
  const safeScore = Number.isFinite(numScore) ? Math.round(numScore) : 0;
  const safeCorrect = Number.isFinite(Number(correctCount)) ? Math.round(Number(correctCount)) : 0;
  const safeTotal = Number.isFinite(Number(totalCount)) ? Math.round(Number(totalCount)) : 20;

  const payload = {
    id: resultId,
    name: (record.nama || record.name || '').trim(),
    nim: (record.nim || '').trim(),
    score: safeScore,
    total_correct: safeCorrect,
    total_questions: safeTotal,
    session_mode: record.sessionMode || 'quiz_race',
    session_pin: record.sessionPin || null,
    answers_record: answersList,
    created_at: timeStampIso
  };

  // Jika data masuk tidak membawa rincian jawaban (mis. arsip otomatis dari sisi dosen),
  // JANGAN menimpa rekaman mahasiswa yang sudah memiliki rincian jawaban.
  const hasAnswers = answersList.length > 0;

  // Simpan ke local cache (replace jika id sama)
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_RESULTS_KEY);
    let list = raw ? JSON.parse(raw) : [];
    const existingLocal = list.find(item => item.id === resultId);
    const existingHasAnswers = existingLocal && Array.isArray(existingLocal.answers) && existingLocal.answers.length > 0;
    if (hasAnswers || !existingLocal || !existingHasAnswers) {
      list = list.filter(item => item.id !== resultId);
      list.unshift({
        ...payload,
        nama: payload.name,
        correct: safeCorrect,
        totalCorrect: safeCorrect,
        totalLocks: safeTotal,
        totalQuestions: safeTotal,
        answers: answersList,
        answersRecord: answersList,
        timestamp: timeStampIso,
        submittedAt: timeStampIso,
        createdAt: new Date(timeStampIso)
      });
      localStorage.setItem(LOCAL_STORAGE_RESULTS_KEY, JSON.stringify(list));
    }
  } catch {}

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('student_results')
        .upsert([payload], hasAnswers ? undefined : { ignoreDuplicates: true });
      if (error) throw error;
      return { success: true, id: resultId };
    } catch (e) {
      console.warn("Gagal menyimpan nilai ke Supabase, tersimpan lokal:", e);
      return { success: true, id: resultId, offline: true };
    }
  }
  return { success: true, id: resultId, localOnly: true };
}

export async function getStudentRecordsFromDb() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('student_results')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        const mapped = data.map(r => {
          const answersList = Array.isArray(r.answers_record) ? r.answers_record : [];
          const correctCount = typeof r.total_correct === 'number' && r.total_correct > 0
            ? r.total_correct
            : (answersList.length > 0 ? answersList.filter(a => a.isSolved).length : Math.round((r.score || 0) / (100 / (r.total_questions || 20))));
          const totalQ = typeof r.total_questions === 'number' ? r.total_questions : (answersList.length || 20);
          const timeIso = r.created_at || new Date().toISOString();

          return {
            id: r.id,
            name: r.name,
            nama: r.name,
            nim: r.nim,
            score: r.score,
            correct: correctCount,
            totalCorrect: correctCount,
            totalLocks: totalQ,
            totalQuestions: totalQ,
            sessionMode: r.session_mode,
            sessionPin: r.session_pin,
            answers: answersList,
            answersRecord: answersList,
            timestamp: timeIso,
            submittedAt: timeIso,
            createdAt: new Date(timeIso)
          };
        });
        localStorage.setItem(LOCAL_STORAGE_RESULTS_KEY, JSON.stringify(mapped));
        return mapped;
      }
    } catch (e) {
      console.warn("Gagal membaca rekap nilai dari Supabase:", e);
    }
  }

  // Fallback cache
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_RESULTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(r => {
          const answersList = Array.isArray(r.answers) ? r.answers : (Array.isArray(r.answersRecord) ? r.answersRecord : (Array.isArray(r.answers_record) ? r.answers_record : []));
          const correctCount = typeof r.correct === 'number' ? r.correct : (typeof r.totalCorrect === 'number' ? r.totalCorrect : (typeof r.total_correct === 'number' ? r.total_correct : answersList.filter(a => a.isSolved).length));
          const totalQ = typeof r.totalLocks === 'number' ? r.totalLocks : (typeof r.totalQuestions === 'number' ? r.totalQuestions : (typeof r.total_questions === 'number' ? r.total_questions : (answersList.length || 20)));
          const timeIso = r.timestamp || r.submittedAt || r.created_at || (r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString());

          return {
            ...r,
            name: r.name || r.nama,
            nama: r.nama || r.name,
            correct: correctCount,
            totalCorrect: correctCount,
            totalLocks: totalQ,
            totalQuestions: totalQ,
            answers: answersList,
            answersRecord: answersList,
            timestamp: timeIso,
            submittedAt: timeIso,
            createdAt: new Date(timeIso)
          };
        });
      }
    }
  } catch {}
  return [];
}

export async function deleteStudentRecordFromDb(id) {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_RESULTS_KEY);
    if (raw) {
      const list = JSON.parse(raw).filter(r => r.id !== id);
      localStorage.setItem(LOCAL_STORAGE_RESULTS_KEY, JSON.stringify(list));
    }
  } catch {}

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('student_results').delete().eq('id', id);
      return { success: true };
    } catch (e) {
      console.warn("Gagal menghapus nilai dari Supabase:", e);
    }
  }
  return { success: true };
}

// ====================================================================
// 4. PENGATURAN DOSEN & HASH PIN LOGIN
// ====================================================================

export async function getDosenPinHashFromDb() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'dosen_security')
        .single();

      if (!error && data && data.value && data.value.pinHash) {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(LOCAL_STORAGE_PIN_KEY, data.value.pinHash);
        }
        return data.value.pinHash;
      }
    } catch (e) {
      console.warn("Gagal membaca PIN dosen dari Supabase:", e);
    }
  }

  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(LOCAL_STORAGE_PIN_KEY) || DEFAULT_HASH;
  }
  return DEFAULT_HASH;
}

export async function saveDosenPinHashToDb(newPinHash) {
  if (!newPinHash || newPinHash.length !== 64) {
    throw new Error('Format hash PIN tidak valid.');
  }

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_PIN_KEY, newPinHash);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('app_settings').upsert({
        key: 'dosen_security',
        value: { pinHash: newPinHash, updatedAt: new Date().toISOString() },
        updated_at: new Date().toISOString()
      });
      return { success: true };
    } catch (e) {
      console.warn("Gagal menyimpan PIN dosen ke Supabase:", e);
      return { success: true, offline: true, error: e.message };
    }
  }
  return { success: true, localOnly: true };
}

export async function resetDosenPinInDb() {
  return await saveDosenPinHashToDb(DEFAULT_HASH);
}

// Aliases kompatibilitas
export const getStudentResults = getStudentRecordsFromDb;
export const saveStudentResult = saveStudentRecordToDb;
export const deleteStudentResult = deleteStudentRecordFromDb;
export const getDosenPinHash = getDosenPinHashFromDb;

export async function updateDosenPinHash(newPin) {
  const hash = await hashPin(newPin);
  return await saveDosenPinHashToDb(hash);
}
