# 🔑 Escape Room: Dunia Bermain Anak

Aplikasi web edugame interaktif berbasis **React + Vite** yang dirancang untuk pembelajaran observasi perkembangan bermain anak (teori Hurlock, Parten, Piaget-Smilansky). Dilengkapi dengan **Portal Manajemen Dosen** yang aman untuk mengelola soal secara massal lewat Excel (.xlsx) maupun antarmuka web, serta rekapitulasi nilai mahasiswa secara real-time melalui **Firebase Firestore**.

---

## 🌟 Fitur Utama

### 🎮 1. Permainan Mahasiswa (Gameplay Edukatif)
- **Registrasi Sesi Cepat**: Input Nama Mahasiswa dan NIM sebelum bermain.
- **Indikator Progres Interaktif**: Menampilkan tahapan ruangan yang sedang aktif dan yang telah diselesaikan.
- **Acak Pilihan Ganda (*Option Shuffling*)**: Urutan opsi jawaban diacak secara otomatis setiap sesi agar mahasiswa tidak saling menyontek urutan opsi A/B/C.
- **Dialog Konfirmasi**: Pop-up konfirmasi *"Yakin dengan pilihan ini?"* untuk melatih ketelitian mahasiswa sebelum jawaban dikunci.
- **Sistem Skor Proporsional & Bertingkat**:
  - Percobaan 1: Mendapatkan skor penuh (`100 / total_gembok`).
  - Percobaan 2: Mendapatkan setengah skor maksimal.
  - Percobaan 3 (opsi sisa): Skor 0 poin.
- **Bantuan Petunjuk (*Hint*)**: Tombol petunjuk dinamis untuk memandu mahasiswa menganalisis bukti perilaku pada narasi skenario.
- **Reward Kunci Ruangan**: Setiap ruangan menghadiahkan kunci emoji unik (misal: 🟦, 🟥, 🟩).
- **Layar Kemenangan & Selebrasi**: Animasi *confetti*, ringkasan refleksi teori bermain anak, dan penyimpanan otomatis nilai ke cloud database.

---

### 🔐 2. Portal Manajemen Dosen (Halaman Penuh Khusus `/dosen`)
Dosen memiliki halaman khusus terpisah di URL **`/dosen`** (bukan modal pop-up) dengan fitur:

#### A. Keamanan Akses (*Anti-Inspect Element*)
- Password dosen diverifikasi menggunakan algoritma kriptografi **SHA-256 dengan Salt Rahasia** (`Web Crypto API`).
- Teks sandi asli (*plaintext*) **tidak pernah disimpan di kode JavaScript, DOM, localStorage, ataupun Firestore**.
- Mahasiswa yang membuka *Inspect Element (DevTools)* hanya akan melihat hash satu arah 64-karakter yang tidak dapat didekripsi.
- Sesi login dosen disimpan di `sessionStorage` (otomatis terhapus saat tab browser ditutup).

#### B. Pengelolaan Ruangan & Soal (CRUD Fleksibel)
- **Visual Icon & Key Picker**: Dosen memilih ikon ruangan dari **18 tema bermain anak** dan **12 variasi kunci reward** secara visual (tanpa perlu mengetik teks emoji manual).
- **Tambah / Edit Ruangan**: Menentukan judul, ikon tema, kunci reward, dan narasi cerita skenario observasi bermain anak.
- **Tambah / Edit Gembok**: Menentukan teks pertanyaan, 2 hingga 4 opsi jawaban dinamis, penentuan kunci jawaban benar dengan radio button, dan petunjuk (*hint*).
- **Reset ke Soal Bawaan**: Tombol satu kali klik untuk mengembalikan soal ke 3 ruangan bawaan psikologi anak.

#### C. Integrasi Excel (.xlsx) dengan Native Dropdown List
- **📥 Unduh Template Excel**: Mengunduh template `.xlsx` yang sudah memiliki **Menu Dropdown Langsung di dalam Sel Excel**:
  - Dropdown Kolom `Ikon Ruangan`: 18 pilihan tema bermain anak.
  - Dropdown Kolom `Kunci Reward`: 12 pilihan kunci reward.
  - Dropdown Kolom `Kunci Jawaban`: Pilihan A, B, C, atau D.
- **📤 Upload Soal Excel**: Mengunggah kumpulan soal baru secara massal. Dilengkapi **Modal Pratinjau & Validasi** sebelum diterapkan ke sistem.
- **💾 Backup Soal ke Excel**: Mengunduh seluruh soal yang sedang aktif ke format Excel (juga lengkap dengan menu dropdown).
- **Konversi Cerdas**: Dosen juga dapat mengetik kata kunci teks biasa (misal: `"balok"`, `"dokter"`, `"biru"`, `"emas"`) dan sistem otomatis menerjemahkannya ke emoji yang sesuai.

#### D. Rekapitulasi Nilai Mahasiswa
- **Statistik Cepat**: Total mahasiswa yang sudah mengerjakan, rata-rata nilai, dan skor tertinggi.
- **Pencarian Real-Time**: Pencarian cepat berdasarkan Nama Mahasiswa atau NIM.
- **Detail Jawaban Per Soal**: Memeriksa jawaban benar/salah, percobaan, dan poin per gembok tiap mahasiswa.
- **Hapus Data Uji Coba**: Menghapus data simulasi/testing.
- **Ekspor Excel Multi-Sheet**: Mengunduh rekap nilai ke format `.xlsx` dengan 2 lembar kerja (*Rekap Nilai* dan *Detail Jawaban* lengkap) serta ekspor **CSV**.

#### E. Pengaturan PIN & Keamanan
- Dosen dapat mengubah kata sandi akses dosen sewaktu-waktu langsung dari dashboard.

---

## 🛠️ Teknologi yang Digunakan

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Database & Cloud**: [Firebase Firestore](https://firebase.google.com/)
- **Excel Processor**: [ExcelJS](https://github.com/exceljs/exceljs) (Native Dropdowns) & [SheetJS (xlsx)](https://sheetjs.com/)
- **Ikonografi**: [Lucide React](https://lucide.dev/)
- **Animasi & Selebrasi**: [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Tipografi**: Google Fonts (*Fredoka* & *Plus Jakarta Sans*)

---

## 📁 Struktur Direktori Proyek

```
dunia-belajar-anak/
├── index.html                   # Entry HTML dengan meta SEO & Google Fonts
├── package.json                 # Konfigurasi dependensi & npm scripts
├── vite.config.js               # Konfigurasi Vite
├── dist/                        # Bundle hasil build siap produksi
├── src/
│   ├── main.jsx                 # Entry point React
│   ├── App.jsx                  # Root router (Rute "/" Game & "/dosen" Panel Dosen)
│   ├── index.css                # Desain sistem global (Modern Playful Edugame)
│   ├── pages/
│   │   ├── GamePage.jsx         # Halaman utama permainan mahasiswa
│   │   └── DosenPage.jsx        # Halaman khusus manajemen dosen
│   ├── firebase/
│   │   └── config.js            # Inisialisasi Firebase & CRUD Firestore dengan offline cache
│   ├── data/
│   │   └── defaultRooms.js      # Bank soal bawaan 3 ruangan observasi bermain anak
│   ├── utils/
│   │   ├── crypto.js            # Hashing SHA-256 kata sandi dosen
│   │   ├── shuffle.js           # Algoritma pengacakan pilihan ganda
│   │   ├── excelQuestions.js    # Generator template Excel dengan dropdown & parser upload
│   │   └── exportExcel.js       # Ekspor rekap nilai mahasiswa ke XLSX (2-sheet) & CSV
│   └── components/
│       ├── common/
│       │   ├── Header.jsx       # Header interaktif
│       │   ├── ProgressBar.jsx  # Titik indikator progres ruangan
│       │   └── SkyBackground.jsx# Latar belakang dinamis SVG
│       ├── game/
│       │   ├── StudentForm.jsx  # Form identitas mahasiswa
│       │   ├── RoomCard.jsx     # Tampilan skenario ruangan & gembok
│       │   ├── LockItem.jsx     # Gembok soal (konfirmasi, hint, scoring)
│       │   └── VictoryCard.jsx  # Layar selebrasi nilai akhir & confetti
│       └── dosen/
│           ├── EmojiPicker.jsx      # Visual picker 18 ikon tema & 12 kunci
│           ├── QuestionManager.jsx  # CRUD Ruangan, Soal & tombol aksi Excel
│           ├── UploadExcelModal.jsx # Modal upload, validasi & preview soal Excel
│           ├── ResultRecap.jsx      # Tabel rekap nilai, pencarian, & ekspor
│           ├── ResultDetailModal.jsx# Modal detail pengerjaan mahasiswa
│           └── SettingsTab.jsx      # Pengaturan ganti PIN dosen
└── escape-room.html             # File HTML referensi asli
```

---

## 🚀 Cara Menjalankan Proyek

### 1. Prasyarat
- [Node.js](https://nodejs.org/) versi 18 atau yang lebih baru.
- Git.

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Menjalankan di Mode Pengembangan (Dev Server)
```bash
npm run dev
```
Buka browser di:
- **Permainan Mahasiswa**: [http://localhost:5173/](http://localhost:5173/)
- **Panel Manajemen Dosen**: [http://localhost:5173/dosen](http://localhost:5173/dosen) *(PIN bawaan: `dosen123`)*

### 4. Melakukan Kompilasi Produksi (Production Build)
```bash
npm run build
npm run preview
```

---

## 📄 Lisensi
Proyek ini dikembangkan untuk keperluan edukasi dan pembelajaran observasi perkembangan bermain anak.
