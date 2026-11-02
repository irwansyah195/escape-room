/**
 * defaultRaceQuestions.js
 * Kumpulan butir soal murni untuk Game Balap (Quiz Sprint Race)
 * Berorientasi pada observasi perkembangan bermain anak usia dini (PAUD).
 */

export const defaultRaceQuestions = [
  {
    id: "race_q_1",
    story: "Di sudut balok, Arka (4 tahun) asyik menyusun menara balok seorang diri tanpa memedulikan teman di sebelahnya.",
    question: "Berdasarkan teori Mildred Parten, tahapan bermain yang ditunjukkan oleh Arka adalah...",
    options: [
      "Solitary Play (Bermain Sendiri)",
      "Parallel Play (Bermain Paralel)",
      "Associative Play (Bermain Asosiatif)",
      "Cooperative Play (Bermain Kooperatif)"
    ],
    correctOption: 0,
    explanation: "Solitary play ditandai dengan anak yang asyik bermain sendiri dengan mainannya tanpa berinteraksi dengan anak lain di sekitarnya."
  },
  {
    id: "race_q_2",
    story: "Siti dan Budi sama-sama bermain plastisin di meja yang sama. Keduanya saling meminjam cetakan dan mengobrol, namun membuat bentuk masing-masing tanpa aturan bersama.",
    question: "Tahapan sosial bermain anak pada skenario tersebut diklasifikasikan sebagai...",
    options: [
      "Unoccupied Behavior",
      "Parallel Play",
      "Associative Play (Bermain Asosiatif)",
      "Cooperative Play"
    ],
    correctOption: 2,
    explanation: "Associative play terjadi saat anak saling berinteraksi, berbagi alat main, namun belum memiliki tujuan kelompok yang terorganisir."
  },
  {
    id: "race_q_3",
    story: "Rian (3 tahun) menggunakan balok kayu sebagai telepon genggam dan berpura-pura sedang memesan makanan ke restoran.",
    question: "Menurut tahapan kognitif Piaget dan Smilansky, jenis bermain yang dilakukan Rian adalah...",
    options: [
      "Functional Play (Sensomotorik)",
      "Constructive Play (Membangun)",
      "Dramatic / Symbolic Play (Bermain Peran)",
      "Games with Rules (Permainan dengan Aturan)"
    ],
    correctOption: 2,
    explanation: "Dramatic/Symbolic play melibatkan penggunaan objek untuk mewakili benda lain dan memerankan situasi imajinatif."
  },
  {
    id: "race_q_4",
    story: "Empat anak usia 5 tahun bekerja sama membangun miniatur kebun binatang. Ada yang bertugas membuat pagar balok, mengatur hewan, dan menjadi penjaga tiket.",
    question: "Bentuk interaksi bermain dengan pembagian peran dan tujuan bersama ini disebut...",
    options: [
      "Cooperative Play (Bermain Kooperatif)",
      "Parallel Play",
      "Onlooker Play",
      "Solitary Independent Play"
    ],
    correctOption: 0,
    explanation: "Cooperative play memiliki ciri kerja sama terorganisir dengan pembagian peran untuk mencapai tujuan bermain bersama."
  },
  {
    id: "race_q_5",
    story: "Dono duduk di dekat ayunan mengamati teman-temannya bermain kejar-kejaran sambil sesekali bertanya tanpa ikut bergabung dalam permainan.",
    question: "Sikap observasi Dono dalam klasifikasi Parten dinamakan...",
    options: [
      "Unoccupied Play",
      "Onlooker Play (Bermain Menonton/Mengamati)",
      "Solitary Play",
      "Associative Play"
    ],
    correctOption: 1,
    explanation: "Onlooker play adalah ketika anak mengamati anak lain bermain dengan minat aktif dan bertanya, namun tidak terlibat langsung."
  },
  {
    id: "race_q_6",
    story: "Anak-anak kelompok B memainkan permainan tradisional 'Engklek' dan mematuhi giliran melempar gancu serta tidak boleh menginjak garis batas.",
    question: "Aktivitas tersebut merefleksikan tahapan bermain kognitif tingkat tertinggi menurut Piaget, yaitu...",
    options: [
      "Functional Play",
      "Symbolic Play",
      "Games with Rules (Permainan dengan Aturan)",
      "Constructive Play"
    ],
    correctOption: 2,
    explanation: "Games with Rules melibatkan pemahaman, kepatuhan, dan penerimaan aturan yang disepakati bersama."
  }
];

const LOCAL_STORAGE_RACE_KEY = 'dunia_bermain_race_questions';

/**
 * Mengambil bank soal balap dari localStorage atau fallback ke default
 */
export function getStoredRaceQuestions() {
  if (typeof localStorage === 'undefined') return defaultRaceQuestions;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_RACE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Gagal membaca bank soal balap:", e);
  }
  return defaultRaceQuestions;
}

import { saveRaceQuestionsToDb } from '../supabase/db.js';

/**
 * Menyimpan bank soal balap ke localStorage dan sinkron ke Supabase
 */
export function saveStoredRaceQuestions(questions) {
  if (typeof localStorage === 'undefined' || !Array.isArray(questions)) return;
  try {
    localStorage.setItem(LOCAL_STORAGE_RACE_KEY, JSON.stringify(questions));
    // Asynchronous background sync ke Supabase
    saveRaceQuestionsToDb(questions).catch(() => {});
  } catch (e) {
    console.warn("Gagal menyimpan bank soal balap:", e);
  }
}

