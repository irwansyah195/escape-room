import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';

/**
 * Header Kolom Baku untuk Format Excel Soal Escape Room
 */
export const EXCEL_COLUMNS = [
  "Nama Ruangan",
  "Ikon Ruangan",
  "Kunci Reward",
  "Skenario Ruangan",
  "Nama Gembok",
  "Pertanyaan",
  "Pilihan A",
  "Pilihan B",
  "Pilihan C",
  "Pilihan D",
  "Kunci Jawaban",
  "Petunjuk (Hint)"
];

/**
 * Peta Kata Kunci Teks ke Ikon Ruangan
 */
export const ROOM_ICON_KEYWORDS = [
  { emoji: '🧱', name: 'Balok Susun', keywords: ['balok', 'susun', 'kayu', 'brick', 'lego'] },
  { emoji: '🩺', name: 'Dokter-dokteran', keywords: ['dokter', 'medis', 'klinik', 'perawat', 'sakit', 'obat'] },
  { emoji: '🎲', name: 'Congklak / Dadu', keywords: ['congklak', 'dadu', 'tradisional', 'game', 'board'] },
  { emoji: '🎨', name: 'Melukis & Seni', keywords: ['lukis', 'seni', 'gambar', 'cat', 'art', 'warna'] },
  { emoji: '🧩', name: 'Puzzle Kognitif', keywords: ['puzzle', 'teka-teki', 'kognitif', 'pasang'] },
  { emoji: '📚', name: 'Buku & Literasi', keywords: ['buku', 'cerita', 'literasi', 'dongeng', 'baca'] },
  { emoji: '🧸', name: 'Boneka & Peran', keywords: ['boneka', 'peran', 'dramatik', 'teddy'] },
  { emoji: '🎪', name: 'Sirkus & Karnaval', keywords: ['sirkus', 'karnaval', 'tenda', 'pesta'] },
  { emoji: '🔬', name: 'Eksplorasi Sains', keywords: ['sains', 'lab', 'penelitian', 'eksplorasi', 'science'] },
  { emoji: '🎵', name: 'Musik & Gerak', keywords: ['musik', 'lagu', 'nada', 'tari', 'nyanyi'] },
  { emoji: '🚀', name: 'Luar Angkasa', keywords: ['roket', 'angkasa', 'planet', 'bintang', 'space'] },
  { emoji: '🚂', name: 'Kereta & Kendaraan', keywords: ['kereta', 'mobil', 'transportasi', 'kendaraan', 'train'] },
  { emoji: '🏖️', name: 'Pasir & Alam', keywords: ['pasir', 'pantai', 'alam', 'beach', 'sand'] },
  { emoji: '🎭', name: 'Teater & Drama', keywords: ['drama', 'teater', 'sandiwara', 'topeng', 'akting'] },
  { emoji: '⚽', name: 'Gerak & Olahraga', keywords: ['olahraga', 'bola', 'motorik', 'gerak', 'sport'] },
  { emoji: '🏰', name: 'Istana & Bangunan', keywords: ['istana', 'kastil', 'benteng', 'castle'] },
  { emoji: '🍳', name: 'Masak-masakan', keywords: ['masak', 'dapur', 'makan', 'koki', 'cook'] },
  { emoji: '🔤', name: 'Balok Huruf & Angka', keywords: ['huruf', 'angka', 'alfabet', 'abjad', 'kata'] }
];

/**
 * Peta Kata Kunci Teks ke Kunci Reward
 */
export const KEY_REWARD_KEYWORDS = [
  { emoji: '🟦', name: 'Kunci Biru', keywords: ['biru', 'blue', 'kotak biru'] },
  { emoji: '🟥', name: 'Kunci Merah', keywords: ['merah', 'red', 'kotak merah'] },
  { emoji: '🟩', name: 'Kunci Hijau', keywords: ['hijau', 'green', 'kotak hijau'] },
  { emoji: '🟨', name: 'Kunci Kuning', keywords: ['kuning', 'yellow', 'kotak kuning'] },
  { emoji: '🟪', name: 'Kunci Ungu', keywords: ['ungu', 'purple', 'kotak ungu'] },
  { emoji: '🟧', name: 'Kunci Oranye', keywords: ['oranye', 'orange', 'jingga', 'kotak oranye'] },
  { emoji: '🔑', name: 'Kunci Emas', keywords: ['emas', 'gold', 'kunci emas', 'kunci', 'key'] },
  { emoji: '🗝️', name: 'Kunci Antik', keywords: ['antik', 'perak', 'silver', 'kuno', 'kunci antik'] },
  { emoji: '💎', name: 'Permata Berlian', keywords: ['permata', 'berlian', 'diamond', 'gem'] },
  { emoji: '👑', name: 'Mahkota Juara', keywords: ['mahkota', 'crown', 'raja', 'juara'] },
  { emoji: '🌟', name: 'Bintang Emas', keywords: ['bintang', 'star', 'kelip'] },
  { emoji: '🏆', name: 'Piala Kemenangan', keywords: ['piala', 'trofi', 'trophy'] }
];

/**
 * Mengonversi input Excel (emoji, label dropdown, atau teks bebas) menjadi emoji Ikon Ruangan
 */
export function resolveRoomIcon(input) {
  if (!input) return '🧱';
  const str = String(input).trim();

  // 1. Jika mengandung emoji langsung
  for (const item of ROOM_ICON_KEYWORDS) {
    if (str.includes(item.emoji)) return item.emoji;
  }

  // 2. Jika berupa kata kunci teks (case-insensitive)
  const lower = str.toLowerCase();
  for (const item of ROOM_ICON_KEYWORDS) {
    if (lower.includes(item.name.toLowerCase())) return item.emoji;
    for (const kw of item.keywords) {
      if (lower.includes(kw)) return item.emoji;
    }
  }

  return str.length <= 4 ? str : '🧱';
}

/**
 * Mengonversi input Excel menjadi emoji Kunci Reward
 */
export function resolveKeyReward(input) {
  if (!input) return '🟦';
  const str = String(input).trim();

  // 1. Jika mengandung emoji langsung
  for (const item of KEY_REWARD_KEYWORDS) {
    if (str.includes(item.emoji)) return item.emoji;
  }

  // 2. Jika berupa kata kunci teks (case-insensitive)
  const lower = str.toLowerCase();
  for (const item of KEY_REWARD_KEYWORDS) {
    if (lower.includes(item.name.toLowerCase())) return item.emoji;
    for (const kw of item.keywords) {
      if (lower.includes(kw)) return item.emoji;
    }
  }

  return str.length <= 4 ? str : '🟦';
}

/**
 * Helper untuk mengunduh buffer Excel di browser
 */
async function downloadExcelWorkbook(wb, filename) {
  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Mengunduh Template Excel Resmi dengan NATIVE DROPDOWN LIST untuk:
 * - Kolom B (Ikon Ruangan): Dropdown 18 tema bermain anak
 * - Kolom C (Kunci Reward): Dropdown 12 pilihan kunci reward
 * - Kolom K (Kunci Jawaban): Dropdown A, B, C, D
 */
export async function generateQuestionTemplate() {
  const wb = new ExcelJS.Workbook();
  const wsMain = wb.addWorksheet('Soal Escape Room');
  const wsRef = wb.addWorksheet('Pilihan Dropdown');

  // Daftar item dropdown
  const iconList = ROOM_ICON_KEYWORDS.map(i => `${i.emoji} ${i.name}`);
  const keyList = KEY_REWARD_KEYWORDS.map(k => `${k.emoji} ${k.name}`);
  const answerList = ['A', 'B', 'C', 'D'];

  // Isi data pilihan di sheet referensi
  iconList.forEach((val, idx) => { wsRef.getCell(`A${idx + 1}`).value = val; });
  keyList.forEach((val, idx) => { wsRef.getCell(`B${idx + 1}`).value = val; });
  answerList.forEach((val, idx) => { wsRef.getCell(`C${idx + 1}`).value = val; });

  // Sembunyikan sheet referensi agar tampilan rapi
  wsRef.state = 'veryHidden';

  // Format kolom lembar utama
  wsMain.columns = [
    { header: 'Nama Ruangan', key: 'room', width: 24 },
    { header: 'Ikon Ruangan', key: 'icon', width: 28 },
    { header: 'Kunci Reward', key: 'key', width: 24 },
    { header: 'Skenario Ruangan', key: 'text', width: 55 },
    { header: 'Nama Gembok', key: 'lock', width: 16 },
    { header: 'Pertanyaan', key: 'q', width: 45 },
    { header: 'Pilihan A', key: 'a', width: 35 },
    { header: 'Pilihan B', key: 'b', width: 35 },
    { header: 'Pilihan C', key: 'c', width: 35 },
    { header: 'Pilihan D', key: 'd', width: 35 },
    { header: 'Kunci Jawaban', key: 'correct', width: 16 },
    { header: 'Petunjuk (Hint)', key: 'hint', width: 40 }
  ];

  // Styling baris header
  const headerRow = wsMain.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF6B46C1' } // Ungu elegan
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 28;

  // Tambahkan baris data contoh
  const sampleData = [
    {
      room: 'Ruang Balok Kayu',
      icon: '🧱 Balok Susun',
      key: '🟦 Kunci Biru',
      text: 'Rani (4 tahun) dan Dimas (4 tahun) duduk di sudut kelas masing-masing menyusun menara balok kayu tanpa rencana bersama, namun sesekali bertukar potongan balok merah.',
      lock: 'Gembok 1',
      q: 'Gembok 1 — Jenis bermain berdasarkan fungsi menurut teori Hurlock:',
      a: 'Bermain aktif — anak terlibat langsung menyusun dan mengatur baloknya sendiri',
      b: 'Bermain pasif — anak hanya menonton hasil karya temannya',
      c: 'Bermain instruktif — anak menunggu perintah guru',
      d: '',
      correct: 'A',
      hint: 'Perhatikan siapa yang memegang balok secara fisik dan mengambil keputusan.'
    },
    {
      room: 'Ruang Balok Kayu',
      icon: '🧱 Balok Susun',
      key: '🟦 Kunci Biru',
      text: 'Rani (4 tahun) dan Dimas (4 tahun) duduk di sudut kelas masing-masing menyusun menara balok kayu tanpa rencana bersama, namun sesekali bertukar potongan balok merah.',
      lock: 'Gembok 2',
      q: 'Gembok 2 — Tahap perkembangan sosial bermain menurut Parten:',
      a: 'Parallel play — anak duduk berdampingan namun membangun struktur masing-masing',
      b: 'Cooperative play — ada pembagian peran yang teratur',
      c: 'Solitary play — anak bermain sendiri di ruangan terpisah',
      d: '',
      correct: 'A',
      hint: 'Cek apakah kedua anak menyepakati satu tujuan bersama atau membangun masing-masing.'
    },
    {
      room: 'Dokter-dokteran',
      icon: '🩺 Dokter-dokteran',
      key: '🟥 Kunci Merah',
      text: 'Aisyah (5 tahun) berperan menjadi dokter, Bima menjadi pasien yang sakit perut, dan Citra menjadi perawat yang menyiapkan obat plastisin sesuai kesepakatan alur cerita.',
      lock: 'Gembok 1',
      q: 'Gembok 1 — Tahap bermain sosial menurut Parten pada skenario ini:',
      a: 'Associative play — anak memakai benda sama tanpa aturan peran',
      b: 'Cooperative play — terdapat pembagian peran dokter-pasien yang disepakati bersama',
      c: 'Parallel play — masing-masing anak bermain sendiri tanpa komunikasi',
      d: '',
      correct: 'B',
      hint: 'Fokus pada adanya pembagian peran terkoordinasi antara dokter, perawat, dan pasien.'
    }
  ];

  sampleData.forEach((row) => wsMain.addRow(row));

  // Terapkan NATIVE EXCEL DROPDOWN untuk 100 baris ke bawah
  for (let r = 2; r <= 100; r++) {
    // 1. Dropdown Ikon Ruangan (Kolom B)
    wsMain.getCell(`B${r}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`'Pilihan Dropdown'!$A$1:$A$${iconList.length}`],
      showErrorMessage: true,
      errorTitle: 'Ikon Tidak Sesuai',
      error: 'Silakan pilih tema ikon ruangan dari daftar dropdown yang tersedia.'
    };

    // 2. Dropdown Kunci Reward (Kolom C)
    wsMain.getCell(`C${r}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`'Pilihan Dropdown'!$B$1:$B$${keyList.length}`],
      showErrorMessage: true,
      errorTitle: 'Kunci Tidak Sesuai',
      error: 'Silakan pilih jenis kunci reward dari daftar dropdown yang tersedia.'
    };

    // 3. Dropdown Kunci Jawaban (Kolom K)
    wsMain.getCell(`K${r}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`'Pilihan Dropdown'!$C$1:$C$${answerList.length}`],
      showErrorMessage: true,
      errorTitle: 'Kunci Jawaban Salah',
      error: 'Pilih salah satu huruf opsi: A, B, C, atau D.'
    };
  }

  await downloadExcelWorkbook(wb, "template_soal_escape_room.xlsx");
}

/**
 * Mengekspor seluruh ruangan & soal aktif yang ada di aplikasi ke Excel lengkap dengan dropdown
 */
export async function exportActiveRoomsToExcel(rooms) {
  if (!rooms || rooms.length === 0) {
    alert("Tidak ada ruangan soal untuk diekspor.");
    return;
  }

  const wb = new ExcelJS.Workbook();
  const wsMain = wb.addWorksheet('Soal Escape Room');
  const wsRef = wb.addWorksheet('Pilihan Dropdown');

  const iconList = ROOM_ICON_KEYWORDS.map(i => `${i.emoji} ${i.name}`);
  const keyList = KEY_REWARD_KEYWORDS.map(k => `${k.emoji} ${k.name}`);
  const answerList = ['A', 'B', 'C', 'D'];

  iconList.forEach((val, idx) => { wsRef.getCell(`A${idx + 1}`).value = val; });
  keyList.forEach((val, idx) => { wsRef.getCell(`B${idx + 1}`).value = val; });
  answerList.forEach((val, idx) => { wsRef.getCell(`C${idx + 1}`).value = val; });
  wsRef.state = 'veryHidden';

  wsMain.columns = [
    { header: 'Nama Ruangan', key: 'room', width: 24 },
    { header: 'Ikon Ruangan', key: 'icon', width: 28 },
    { header: 'Kunci Reward', key: 'key', width: 24 },
    { header: 'Skenario Ruangan', key: 'text', width: 55 },
    { header: 'Nama Gembok', key: 'lock', width: 16 },
    { header: 'Pertanyaan', key: 'q', width: 45 },
    { header: 'Pilihan A', key: 'a', width: 35 },
    { header: 'Pilihan B', key: 'b', width: 35 },
    { header: 'Pilihan C', key: 'c', width: 35 },
    { header: 'Pilihan D', key: 'd', width: 35 },
    { header: 'Kunci Jawaban', key: 'correct', width: 16 },
    { header: 'Petunjuk (Hint)', key: 'hint', width: 40 }
  ];

  const headerRow = wsMain.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF6B46C1' }
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 28;

  rooms.forEach((room) => {
    (room.locks || []).forEach((lock, lIdx) => {
      const opts = lock.options || [];
      const correctLetter = String.fromCharCode(65 + (lock.correct ?? 0));

      const matchedIcon = ROOM_ICON_KEYWORDS.find(i => i.emoji === room.icon);
      const iconLabel = matchedIcon ? `${matchedIcon.emoji} ${matchedIcon.name}` : (room.icon || '🧱');

      const matchedKey = KEY_REWARD_KEYWORDS.find(k => k.emoji === room.key);
      const keyLabel = matchedKey ? `${matchedKey.emoji} ${matchedKey.name}` : (room.key || '🟦');

      wsMain.addRow({
        room: room.title || "Ruangan Tanpa Nama",
        icon: iconLabel,
        key: keyLabel,
        text: room.text || "",
        lock: `Gembok ${lIdx + 1}`,
        q: lock.q || "",
        a: opts[0] || "",
        b: opts[1] || "",
        c: opts[2] || "",
        d: opts[3] || "",
        correct: correctLetter,
        hint: lock.hint || ""
      });
    });
  });

  const totalRows = Math.max(wsMain.rowCount + 50, 100);
  for (let r = 2; r <= totalRows; r++) {
    wsMain.getCell(`B${r}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`'Pilihan Dropdown'!$A$1:$A$${iconList.length}`]
    };
    wsMain.getCell(`C${r}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`'Pilihan Dropdown'!$B$1:$B$${keyList.length}`]
    };
    wsMain.getCell(`K${r}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`'Pilihan Dropdown'!$C$1:$C$${answerList.length}`]
    };
  }

  await downloadExcelWorkbook(wb, "backup_soal_escape_room_aktif.xlsx");
}

/**
 * Membaca dan memvalidasi file Excel (.xlsx) yang diunggah
 * Mengelompokkan baris per 'Nama Ruangan' dan otomatis mengenali ikon & kunci reward
 */
export async function parseQuestionsExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          resolve({ success: false, errors: ["File Excel kosong atau tidak memiliki lembar kerja (sheet)."] });
          return;
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (!rawJson || rawJson.length === 0) {
          resolve({ success: false, errors: ["Tidak ada data soal yang ditemukan di dalam sheet Excel."] });
          return;
        }

        const errors = [];
        const roomsMap = new Map(); // roomTitle -> { roomData, locks: [] }

        rawJson.forEach((row, rowIndex) => {
          const rowNum = rowIndex + 2; // Baris 1 adalah header

          const roomTitle = String(row["Nama Ruangan"] || row["Ruangan"] || "").trim();
          const rawIcon = String(row["Ikon Ruangan"] || row["Ikon"] || "").trim();
          const rawKey = String(row["Kunci Reward"] || row["Kunci"] || "").trim();
          const roomText = String(row["Skenario Ruangan"] || row["Skenario"] || "").trim();

          const question = String(row["Pertanyaan"] || row["Soal"] || "").trim();
          const optA = String(row["Pilihan A"] || row["A"] || "").trim();
          const optB = String(row["Pilihan B"] || row["B"] || "").trim();
          const optC = String(row["Pilihan C"] || row["C"] || "").trim();
          const optD = String(row["Pilihan D"] || row["D"] || "").trim();

          const rawCorrect = String(row["Kunci Jawaban"] || row["Kunci"] || "A").trim().toUpperCase();
          const hint = String(row["Petunjuk (Hint)"] || row["Petunjuk"] || row["Hint"] || "").trim();

          // Lewati baris kosong
          if (!roomTitle && !question) return;

          if (!roomTitle) {
            errors.push(`Baris ${rowNum}: Kolom 'Nama Ruangan' tidak boleh kosong.`);
            return;
          }

          if (!question) {
            errors.push(`Baris ${rowNum} (${roomTitle}): Kolom 'Pertanyaan' tidak boleh kosong.`);
            return;
          }

          const options = [optA, optB, optC, optD].filter(o => o.length > 0);
          if (options.length < 2) {
            errors.push(`Baris ${rowNum} (${roomTitle}): Minimal harus ada 2 pilihan ganda (Pilihan A dan B).`);
            return;
          }

          // Petakan kunci jawaban (A, B, C, D) ke indeks (0, 1, 2, 3)
          let correctIndex = 0;
          if (rawCorrect === 'A' || rawCorrect === '1') correctIndex = 0;
          else if (rawCorrect === 'B' || rawCorrect === '2') correctIndex = 1;
          else if (rawCorrect === 'C' || rawCorrect === '3') correctIndex = 2;
          else if (rawCorrect === 'D' || rawCorrect === '4') correctIndex = 3;
          else {
            errors.push(`Baris ${rowNum} (${roomTitle}): Kunci jawaban "${rawCorrect}" tidak valid. Harap gunakan huruf A, B, C, atau D.`);
            return;
          }

          if (correctIndex >= options.length) {
            errors.push(`Baris ${rowNum} (${roomTitle}): Kunci jawaban (${rawCorrect}) melebihi jumlah pilihan yang tersedia (${options.length} opsi).`);
            return;
          }

          // Konversi cerdas nama teks / kata kunci / pilihan dropdown menjadi emoji ikon & kunci
          const resolvedIcon = resolveRoomIcon(rawIcon);
          const resolvedKey = resolveKeyReward(rawKey);

          // Buat atau perbarui ruangan di Map
          if (!roomsMap.has(roomTitle)) {
            roomsMap.set(roomTitle, {
              id: `room-${Date.now()}-${roomsMap.size + 1}`,
              title: roomTitle,
              icon: resolvedIcon,
              decor: resolvedIcon,
              key: resolvedKey,
              text: roomText || `Skenario observasi bermain anak untuk ${roomTitle}.`,
              locks: []
            });
          }

          const currentRoom = roomsMap.get(roomTitle);
          if (roomText && (!currentRoom.text || currentRoom.text.length < roomText.length)) {
            currentRoom.text = roomText;
          }
          if (rawIcon) {
            currentRoom.icon = resolvedIcon;
            currentRoom.decor = resolvedIcon;
          }
          if (rawKey) {
            currentRoom.key = resolvedKey;
          }

          // Tambahkan gembok ke ruangan
          currentRoom.locks.push({
            id: `lock-${currentRoom.id}-${currentRoom.locks.length + 1}`,
            q: question,
            options: options,
            correct: correctIndex,
            hint: hint
          });
        });

        const parsedRooms = Array.from(roomsMap.values());

        if (parsedRooms.length === 0) {
          resolve({
            success: false,
            errors: errors.length > 0 ? errors : ["Tidak ada data soal valid yang dapat diimpor."]
          });
          return;
        }

        const totalLocks = parsedRooms.reduce((sum, r) => sum + r.locks.length, 0);

        resolve({
          success: errors.length === 0,
          rooms: parsedRooms,
          summary: {
            totalRooms: parsedRooms.length,
            totalLocks: totalLocks
          },
          errors: errors
        });
      } catch (err) {
        resolve({
          success: false,
          errors: ["Gagal membaca file Excel: " + err.message]
        });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, errors: ["Gagal membuka file Excel dari perangkat Anda."] });
    };

    reader.readAsArrayBuffer(file);
  });
}
