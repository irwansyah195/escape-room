/**
 * aiQuestionGenerator.js
 * Modul pembuat ruangan, skenario, dan soal observasi bermain anak berbasis AI
 * Menggunakan Google Gemini API dengan fallback cerdas dan panduan Taksonomi Bloom.
 */

export const DIFFICULTY_LEVELS = {
  mudah: {
    label: '🟢 Mudah (Tingkat Pemula / C1-C2)',
    description: 'Pemahaman konsep dasar, pengenalan terminologi, dan identifikasi tahapan bermain anak (Parten, Piaget, Hurlock).',
    guidance: 'Buatlah pertanyaan yang menguji pemahaman dan ingatan konsep dasar bermain anak. Pilihan jawaban harus jelas dengan pengecoh yang kontras.'
  },
  sedang: {
    label: '🟡 Sedang (Tingkat Menengah / C3-C4)',
    description: 'Analisis studi kasus observasi perilaku anak saat bermain di lingkungan PAUD, rumah, atau taman.',
    guidance: 'Sajikan narasi studi kasus observasi perilaku konkret anak. Pertanyaan meminta mahasiswa menganalisis bukti perilaku anak dan mengklasifikasikan tahapan bermain atau perkembangan kognitif/sosialnya.'
  },
  sulit: {
    label: '🔴 Sulit (Tingkat Lanjut / C5-C6)',
    description: 'Evaluasi kasus multi-anak kompleks, resolusi konflik bermain, identifikasi perilaku atipikal, dan formulasi intervensi edukatif.',
    guidance: 'Sajikan narasi skenario observasi anak yang kompleks dengan beberapa dinamika interaksi sosial/emosional. Pertanyaan menuntut evaluasi kritis, perbandingan teori yang beririsan, atau perumusan stimulasi edukatif yang tepat dengan opsi jawaban berpengecoh halus.'
  }
};

const GEMINI_API_KEY_STORAGE = 'dunia_bermain_gemini_api_key';
const DEFAULT_GEMINI_KEY = '';

export function getStoredGeminiKey() {
  const localKey = typeof localStorage !== 'undefined' ? localStorage.getItem(GEMINI_API_KEY_STORAGE) : null;
  const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ? import.meta.env.VITE_GEMINI_API_KEY : '';
  return localKey || envKey || '';
}

export function saveStoredGeminiKey(key) {
  if (typeof localStorage === 'undefined') return;
  if (!key) {
    localStorage.removeItem(GEMINI_API_KEY_STORAGE);
  } else {
    localStorage.setItem(GEMINI_API_KEY_STORAGE, key.trim());
  }
}

/**
 * Menghasilkan soal & ruangan observasi bermain anak menggunakan Google Gemini API.
 */
export async function generateRoomsWithAI({
  topic = '',
  materialText = '',
  difficulty = 'sedang',
  roomCount = 3,
  locksPerRoom = 2,
  apiKey = ''
}) {
  const activeKey = (apiKey || getStoredGeminiKey()).trim();

  // Validasi input
  if (!topic.trim() && !materialText.trim()) {
    throw new Error('Harap masukkan tema/topik atau upload rangkuman materi pembelajaran.');
  }

  const selectedDiff = DIFFICULTY_LEVELS[difficulty] || DIFFICULTY_LEVELS.sedang;

  const prompt = `
Anda adalah seorang Dosen Ahli Psikologi Perkembangan Anak Usia Dini (PAUD) dan Evaluasi Pembelajaran.
Tugas Anda adalah merancang ${roomCount} buah Ruangan Observasi Edukasi Interaktif (Escape Room / Quiz Race) untuk mahasiswa.
Setiap ruangan berisi narasi studi kasus observasi anak yang kaya konteks dan ${locksPerRoom} butir pertanyaan analisis (gembok soal).

PANDUAN TINGKAT KESULITAN:
Tingkat: ${selectedDiff.label}
Panduan: ${selectedDiff.guidance}

SUMBER MATERI / TEMA:
Tema Utama: ${topic || 'Observasi Perkembangan Bermain Anak Usia Dini'}
Materi Tambahan / Rangkuman Modul:
${materialText ? materialText.slice(0, 4000) : 'Gunakan teori-teori bermain terkemuka (Parten: Solitary, Parallel, Associative, Cooperative Play; Piaget-Smilansky: Functional, Constructive, Dramatic, Games with Rules; Hurlock).'}

STRUKTUR OUTPUT:
Keluarkan HANYA JSON array murni tanpa format markdown tambahan, tanpa backtick \`\`\`json, tanpa komentar.
Struktur data JSON wajib persis seperti ini:
[
  {
    "id": "room-1",
    "title": "Nama Ruangan Tematik Menarik",
    "icon": "🧸",
    "decor": "🧸",
    "key": "🟦",
    "text": "Narasi skenario observasi perilaku bermain anak secara detail (minimal 2-3 paragraf kontekstual yang memuat bukti perilaku anak)...",
    "locks": [
      {
        "id": "lock-1-1",
        "question": "Pertanyaan analisis spesifik berdasarkan narasi di atas?",
        "options": [
          "Opsi Jawaban A",
          "Opsi Jawaban B",
          "Opsi Jawaban C",
          "Opsi Jawaban D"
        ],
        "correctOption": "Opsi Jawaban A",
        "hint": "Petunjuk teoritis singkat untuk memandu mahasiswa menelaah bukti pada narasi."
      }
    ]
  }
]

ATURAN KHUSUS:
1. Pastikan "icon" menggunakan satu emoji tema yang cocok dari: 🧸, 🧩, 🎨, ⚽, 🎭, 🪆, 🧱, 📖, 🚗, 🎪.
2. Pastikan "key" menggunakan satu emoji kunci reward dari: 🟦, 🟥, 🟩, 🟨, 🟪, 🟧, 🔑, ⭐, 💎, 👑.
3. "correctOption" harus persis sama karakternya dengan salah satu item yang ada di dalam array "options".
4. Setiap gembok harus memiliki 4 opsi jawaban dengan daya beda yang baik.
5. Bahasa Indonesia yang digunakan harus baku, edukatif, dan bernuansa akademis psikologi anak.
`;

  if (!activeKey) {
    // Mode Simulasi Edukatif jika API Key belum dipasang
    console.warn("Gemini API Key belum disetel. Menjalankan generator cerdas lokal (offline fallback template).");
    return generateLocalFallbackRooms({ topic, difficulty, roomCount, locksPerRoom });
  }

  // Model candidate priority: gemini-3.5-flash-lite (sangat cepat & stabil) lalu gemini-3.5-flash
  const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.5-flash'];
  let lastError = null;
  let rawText = null;

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
      responseMimeType: "application/json"
    }
  };

  for (const model of candidateModels) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        lastError = new Error(`Google Gemini API (${model} - ${response.status}): ${errorData.error?.message || response.statusText}`);
        continue;
      }

      const result = await response.json();
      rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) break;
    } catch (err) {
      lastError = err;
    }
  }

  if (!rawText) {
    throw lastError || new Error("Tidak menerima respons teks dari model Gemini.");
  }

  // Bersihkan respons dari markdown codeblocks jika ada
  let cleanedJson = rawText.trim();
  if (cleanedJson.startsWith("```json")) {
    cleanedJson = cleanedJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleanedJson.startsWith("```")) {
    cleanedJson = cleanedJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  const parsedRooms = JSON.parse(cleanedJson);

  if (!Array.isArray(parsedRooms) || parsedRooms.length === 0) {
    throw new Error("Format hasil AI tidak berupa array ruangan yang valid.");
  }

  // Validasi dan standarisasi struktur data
  return parsedRooms.map((room, rIdx) => ({
    id: `room-ai-${Date.now()}-${rIdx + 1}`,
    title: room.title || `Ruangan Observasi ${rIdx + 1}`,
    icon: room.icon || '🧩',
    decor: room.icon || '🧩',
    key: room.key || '🟦',
    text: room.text || 'Skenario observasi perilaku anak.',
    locks: (room.locks || []).map((lock, lIdx) => {
      const options = Array.isArray(lock.options) && lock.options.length >= 2
        ? lock.options
        : ['Opsi A', 'Opsi B', 'Opsi C', 'Opsi D'];

      let correct = lock.correctOption;
      if (!options.includes(correct)) {
        correct = options[0];
      }

      return {
        id: `lock-ai-${Date.now()}-${rIdx + 1}-${lIdx + 1}`,
        question: lock.question || 'Analisis observasi perilaku anak:',
        options,
        correctOption: correct,
        hint: lock.hint || 'Perhatikan interaksi verbal dan respons emosi anak.'
      };
    })
  }));
}

/**
 * Fallback lokal jika dosen belum memasukkan Gemini API Key
 */
function generateLocalFallbackRooms({ topic, difficulty, roomCount = 3, locksPerRoom = 2 }) {
  const diffBadge = difficulty.toUpperCase();
  const themeTitle = topic || 'Observasi Perkembangan Bermain Anak';

  const roomTemplates = [
    {
      title: `${themeTitle}: Stasiun Eksplorasi Sensori (${diffBadge})`,
      icon: '🧸',
      key: '🟦',
      text: `Di sudut bermain sensori, terlihat dua anak balita (Rian, 2.5 tahun dan Kinan, 3 tahun) sedang duduk berdekatan di atas matras bermain. Rian berulang kali meremas pasir kinetik dan memasukkannya ke dalam ember kecil, sesekali melihat apa yang dilakukan Kinan tanpa mengajak berbicara. Sementara itu, Kinan asyik mencetak pasir menjadi bentuk bintang menggunakan cetakan plastik dan tersenyum puas saat pasir berhasil dicetak utuh. Keduanya bermain dengan materi yang sama namun memiliki alur tujuan bermain mandiri masing-masing.`,
      locks: [
        {
          question: `Berdasarkan observasi di stasiun sensori di atas, tahapan bermain sosial manakah yang paling akurat menggambarkan interaksi antara Rian dan Kinan menurut Mildred Parten?`,
          options: [
            "Parallel Play (Bermain Sejajar)",
            "Associative Play (Bermain Asosiatif)",
            "Cooperative Play (Bermain Kooperatif)",
            "Solitary Independent Play (Bermain Sendiri Terpisah)"
          ],
          correctOption: "Parallel Play (Bermain Sejajar)",
          hint: "Perhatikan bahwa kedua anak bermain di tempat yang sama dengan materi yang sama dan saling mengamati, namun tidak saling membagi peran atau menyatukan tujuan."
        },
        {
          question: `Tindakan Rian yang berulang kali meremas dan mengisi pasir ke ember mencerminkan tahap perkembangan kognitif bermain Piaget pada kategori apa?`,
          options: [
            "Functional / Sensorimotor Play",
            "Constructive Play",
            "Dramatic / Pretend Play",
            "Games with Rules"
          ],
          correctOption: "Functional / Sensorimotor Play",
          hint: "Aktivitas motorik repetitif untuk merasakan sensasi tekstur dan fungsi fisik benda merupakan ciri utama tahap sensomotorik."
        }
      ]
    },
    {
      title: `${themeTitle}: Arena Konstruktif & Kolaborasi (${diffBadge})`,
      icon: '🧱',
      key: '🟩',
      text: `Di area balok kayu, tiga anak usia prasekolah (Bima, Salsa, dan Doni, rata-rata 4.5 tahun) sedang membangun 'Menara Kastil Kerajaan'. Bima bertugas mencari balok persegi panjang, Salsa menata bagian fondasi dinding kastil, sementara Doni membuat gerbang utama. Ketika balok di sudut roboh, Salsa berkata, 'Doni, tahan dulu pintunya biar aku pasang tiang baru!'. Mereka saling berdiskusi, membagi tugas, dan menyepakati aturan agar menara tidak runtuh kembali.`,
      locks: [
        {
          question: `Interaksi terstruktur antara Bima, Salsa, dan Doni dengan pembagian peran dan tujuan bersama menandakan tahap bermain:`,
          options: [
            "Cooperative Play (Bermain Kooperatif)",
            "Associative Play (Bermain Asosiatif)",
            "Parallel Play (Bermain Paralel)",
            "Onlooker Play (Perilaku Penonton)"
          ],
          correctOption: "Cooperative Play (Bermain Kooperatif)",
          hint: "Terdapat pembagian tugas yang jelas, negosiasi peran, dan tujuan kolektif untuk menyelesaikan satu proyek bersama."
        },
        {
          question: `Berdasarkan teori perkembangan kognitif Smilansky, jenis kegiatan bermain yang dominan dilakukan kelompok anak tersebut adalah:`,
          options: [
            "Constructive Play (Bermain Konstruktif)",
            "Functional Play (Bermain Fungsional)",
            "Symbolic Roleplay (Bermain Drama Murni)",
            "Competitive Games"
          ],
          correctOption: "Constructive Play (Bermain Konstruktif)",
          hint: "Fokus kegiatan adalah menggunakan materi objek (balok) secara sengaja untuk merancang, membangun, dan menciptakan suatu karya fisik."
        }
      ]
    },
    {
      title: `${themeTitle}: Sudut Bermain Peran & Sosiodrama (${diffBadge})`,
      icon: '🎭',
      key: '🟨',
      text: `Di sudut rumah-rumahan, Alya (5 tahun) mengenakan stetoskop mainan dan bertindak sebagai 'Dokter Hewan', sedangkan Fandi (5 tahun) membawa boneka kucing mainan yang ia sebut 'sedang sakit flu'. Alya memeriksa detak jantung boneka dengan stetoskop dan menuliskan resep di secarik kertas sambil berkata, 'Kucingmu harus minum susu hangat dan istirahat 3 hari ya, Pak!'. Fandi mengangguk dan membayar pemeriksaan menggunakan daun kering sebagai uang.`,
      locks: [
        {
          question: `Penggunaan daun kering sebagai representasi uang dalam skenario observasi di atas menunjukkan kemampuan berpikir:`,
          options: [
            "Representasi Simbolik (Semiotic Function)",
            "Reversibilitas Operasional Konkret",
            "Egosentrisme Pra-Operasional Ekstrem",
            "Konservasi Objek Materi"
          ],
          correctOption: "Representasi Simbolik (Semiotic Function)",
          hint: "Anak mampu menggunakan satu objek tiruan atau pengganti untuk melambangkan objek nyata lain dalam imajinasinya."
        },
        {
          question: `Menurut teori Vygotsky, nilai perkembangan terpenting dari aktivitas sosiodrama dokter hewan tersebut adalah:`,
          options: [
            "Mendorong Zone of Proximal Development (ZPD) melalui regulasi diri dan peniruan peran sosial orang dewasa",
            "Melatih kekuatan otot motorik kasar anak",
            "Mereduksi kebutuhan interaksi verbal anak",
            "Meningkatkan refleks motorik otomatis anak"
          ],
          correctOption: "Mendorong Zone of Proximal Development (ZPD) melalui regulasi diri dan peniruan peran sosial orang dewasa",
          hint: "Vygotsky menekankan bahwa bermain drama menciptakan ZPD di mana anak bertindak melampaui usia kronologisnya dengan mematuhi aturan peran sosial."
        }
      ]
    }
  ];

  const sliced = roomTemplates.slice(0, roomCount);

  return sliced.map((item, idx) => ({
    id: `room-ai-${Date.now()}-${idx + 1}`,
    title: item.title,
    icon: item.icon,
    decor: item.icon,
    key: item.key,
    text: item.text,
    locks: item.locks.slice(0, locksPerRoom).map((lock, lIdx) => ({
      id: `lock-ai-${Date.now()}-${idx + 1}-${lIdx + 1}`,
      question: lock.question,
      options: lock.options,
      correctOption: lock.correctOption,
      hint: lock.hint
    }))
  }));
}

/**
 * Menghasilkan kumpulan soal murni untuk Game Balap (Quiz Sprint Race) berbasis AI
 * Tanpa konsep ruangan dan tanpa gembok (flat questions array).
 */
export async function generateRaceQuestionsWithAI({
  topic = '',
  materialText = '',
  difficulty = 'sedang',
  questionCount = 10,
  apiKey = ''
}) {
  const activeKey = (apiKey || getStoredGeminiKey()).trim();

  if (!topic.trim() && !materialText.trim()) {
    throw new Error('Harap masukkan tema/topik atau upload rangkuman materi pembelajaran.');
  }

  const selectedDiff = DIFFICULTY_LEVELS[difficulty] || DIFFICULTY_LEVELS.sedang;

  const prompt = `
Anda adalah Dosen Ahli Psikologi Perkembangan Anak Usia Dini (PAUD) dan Desainer Kuis Edukasi Balap (Quiz Race).
Tugas Anda adalah merancang tepat ${questionCount} butir Soal Kuis Balapan (Quiz Race Questions) untuk mahasiswa.
KARENA INI ADALAH GAME BALAPAN SPRINT CEPAT (FAST-PACED QUIZ RACE), SOAL DIBUAT LANGSUNG TANPA STRUKTUR RUANGAN DAN TANPA GEMBOK!

KARAKTERISTIK SOAL BALAP:
1. "story": Kasus observasi perilaku bermain anak yang ringkas dan padat (1-2 kalimat saja, mudah dan cepat dibaca oleh mahasiswa saat balapan).
2. "question": Pertanyaan analisis langsung yang jelas mengenai tahapan bermain, perkembangan kognitif/sosial, atau stimulasi edukatif.
3. "options": Tepat 4 pilihan jawaban yang padat (maksimal 1-2 baris per opsi).
4. "correctOption": Angka index (integer 0, 1, 2, atau 3) yang menunjukkan posisi jawaban benar di dalam array "options".
5. "explanation": Penjelasan teoritis singkat (1 kalimat).

PANDUAN TINGKAT KESULITAN:
Tingkat: ${selectedDiff.label}
Panduan: ${selectedDiff.guidance}

SUMBER MATERI / TEMA:
Tema Utama: ${topic || 'Observasi Perkembangan Bermain Anak Usia Dini'}
Materi Tambahan / Rangkuman Modul:
${materialText ? materialText.slice(0, 4000) : 'Gunakan teori-teori bermain terkemuka (Mildred Parten: Solitary, Parallel, Associative, Cooperative Play; Piaget & Smilansky: Functional, Constructive, Dramatic, Games with Rules; Hurlock; Vygotsky).'}

STRUKTUR OUTPUT:
Keluarkan HANYA JSON array murni tanpa format markdown tambahan, tanpa backtick \`\`\`json, tanpa komentar.
Struktur data JSON wajib persis seperti ini:
[
  {
    "id": "race_q_1",
    "story": "Kasus observasi ringkas (1-2 kalimat)...",
    "question": "Pertanyaan analisis langsung?",
    "options": [
      "Opsi Jawaban A",
      "Opsi Jawaban B",
      "Opsi Jawaban C",
      "Opsi Jawaban D"
    ],
    "correctOption": 0,
    "explanation": "Penjelasan teoritis singkat."
  }
]
`;

  if (!activeKey) {
    console.warn("Gemini API Key belum disetel. Menggunakan generator soal balap lokal cerdas.");
    return generateLocalFallbackRaceQuestions({ topic, difficulty, questionCount });
  }

  const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.5-flash'];
  let lastError = null;
  let rawText = null;

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
      responseMimeType: "application/json"
    }
  };

  for (const model of candidateModels) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        lastError = new Error(`Google Gemini API (${model} - ${response.status}): ${errorData.error?.message || response.statusText}`);
        continue;
      }

      const result = await response.json();
      rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) break;
    } catch (err) {
      lastError = err;
    }
  }

  if (!rawText) {
    throw lastError || new Error("Tidak menerima respons teks dari model Gemini.");
  }

  let cleanedJson = rawText.trim();
  if (cleanedJson.startsWith("```json")) {
    cleanedJson = cleanedJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleanedJson.startsWith("```")) {
    cleanedJson = cleanedJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  const parsedQuestions = JSON.parse(cleanedJson);

  if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
    throw new Error("Format hasil AI tidak berupa array soal balap yang valid.");
  }

  return parsedQuestions.map((q, qIdx) => ({
    id: `race_q_${Date.now()}_${qIdx + 1}`,
    story: q.story || '',
    question: q.question || `Soal Balap ${qIdx + 1}`,
    options: Array.isArray(q.options) && q.options.length === 4
      ? q.options
      : ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
    correctOption: typeof q.correctOption === 'number' && q.correctOption >= 0 && q.correctOption <= 3
      ? q.correctOption
      : (typeof q.correctOption === 'string' && q.options ? Math.max(0, q.options.indexOf(q.correctOption)) : 0),
    explanation: q.explanation || 'Jawaban berdasarkan kaidah perkembangan bermain anak.'
  }));
}

function generateLocalFallbackRaceQuestions({ topic = '', difficulty = 'sedang', questionCount = 6 }) {
  const pool = [
    {
      story: "Arka (4 tahun) bermain balok seorang diri di sudut kelas tanpa berinteraksi dengan anak lain di sekitarnya.",
      question: "Berdasarkan teori Parten, tahapan bermain yang ditunjukkan oleh Arka adalah...",
      options: [
        "Solitary Play (Bermain Sendiri)",
        "Parallel Play (Bermain Paralel)",
        "Associative Play (Bermain Asosiatif)",
        "Cooperative Play (Bermain Kooperatif)"
      ],
      correctOption: 0,
      explanation: "Solitary play ditandai dengan anak asyik dengan mainannya sendiri tanpa memedulikan orang lain."
    },
    {
      story: "Siti dan Budi duduk berdampingan bermain lilin mainan, saling meminjam cetakan dan mengobrol tanpa tujuan kelompok terpadu.",
      question: "Bentuk interaksi sosial bermain kedua anak tersebut adalah...",
      options: [
        "Unoccupied Behavior",
        "Parallel Play",
        "Associative Play (Bermain Asosiatif)",
        "Cooperative Play"
      ],
      correctOption: 2,
      explanation: "Associative play melibatkan komunikasi dan berbagi alat tanpa pembagian peran terorganisir."
    },
    {
      story: "Rian (3 tahun) menggunakan kotak kardus bekas sebagai mobil dan berpura-pura mengemudi ke pasar.",
      question: "Menurut Smilansky, jenis kegiatan bermain simbolik tersebut adalah...",
      options: [
        "Functional Play",
        "Constructive Play",
        "Dramatic / Symbolic Play (Bermain Peran)",
        "Games with Rules"
      ],
      correctOption: 2,
      explanation: "Dramatic/Symbolic play menggunakan objek representasi imajinatif untuk merefleksikan peran nyata."
    },
    {
      story: "Tiga anak usia 5 tahun bekerja sama membangun rumah sakit mini dengan pembagian peran dokter, perawat, dan pasien.",
      question: "Klasifikasi tahapan bermain kelompok anak tersebut adalah...",
      options: [
        "Cooperative Play (Bermain Kooperatif)",
        "Parallel Play",
        "Onlooker Play",
        "Solitary Independent Play"
      ],
      correctOption: 0,
      explanation: "Cooperative play memiliki tujuan bersama dan pembagian tugas terorganisir."
    },
    {
      story: "Rafa (3.5 tahun) berulang kali meluncurkan mobil-mobilan di lintasan luncur untuk melihat seberapa jauh rodanya berputar.",
      question: "Berdasarkan Piaget, tahapan bermain sensomotorik repetitif ini dinamakan...",
      options: [
        "Functional Play (Bermain Fungsional)",
        "Symbolic Play",
        "Constructive Play",
        "Games with Rules"
      ],
      correctOption: 0,
      explanation: "Functional play berpusat pada penjelajahan fungsi fisik dan sensasi mekanik benda."
    },
    {
      story: "Anak-anak kelompok B memainkan permainan petak umpet dan mematuhi aturan berhitung sampai sepuluh sebelum mencari.",
      question: "Aktivitas bermain beraturan tersebut mencerminkan tahap...",
      options: [
        "Constructive Play",
        "Functional Play",
        "Games with Rules (Permainan dengan Aturan)",
        "Dramatic Play"
      ],
      correctOption: 2,
      explanation: "Games with Rules menekankan kepatuhan terhadap aturan formal bersama."
    }
  ];

  // Ulangi / slice sesuai questionCount yang diinginkan
  const result = [];
  for (let i = 0; i < questionCount; i++) {
    const template = pool[i % pool.length];
    result.push({
      id: `race_q_local_${Date.now()}_${i + 1}`,
      story: template.story,
      question: `${template.question} (Soal #${i + 1} - ${topic || 'Observasi Anak'})`,
      options: template.options,
      correctOption: template.correctOption,
      explanation: template.explanation
    });
  }
  return result;
}

