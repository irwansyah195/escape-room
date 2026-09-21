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

#### A. Keamanan Akses (*Anti-Inspect Element & Anti Brute-Force*)
- **Kriptografi Salted SHA-256**: Password dosen diverifikasi menggunakan algoritma **SHA-256 dengan Salt Rahasia** (`Web Crypto API`). Teks sandi asli (*plaintext*) tidak pernah disimpan di kode JavaScript, DOM, localStorage, ataupun Firestore. Mahasiswa yang membuka *Inspect Element (DevTools)* hanya melihat hash satu arah 64-karakter.
- **Sistem Pembatasan Percobaan (*Rate-Limiter & Lockout*)**:
  - Dibatasi maksimal **5 kali percobaan salah berturut-turut**.
  - Jika melampaui batas, sistem **mengunci form secara otomatis selama 3 menit (180 detik)** dengan *countdown timer* real-time dan input dinonaktifkan.
  - Mencegah bot/skrip otomatis melakukan serangan brute-force kamus kata sandi.
- **Pencegahan Pemborosan Kuota (*Read Caching with 15-Minute TTL*)**:
  - Hash verifikasi disimpan dalam *in-memory cache* & *local storage* dengan batas waktu (TTL) 15 menit.
  - Percobaan kata sandi yang berulang tidak memicu pembacaan dokumen (*read query*) berulang ke server Firestore, melindungi kuota baca paket gratis Spark.
- **Sesi Aman**: Status login disimpan di `sessionStorage` (otomatis hangus saat tab browser ditutup).

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

## 🛡️ Proteksi Database Firebase & Panduan Aturan Keamanan (Firestore Rules)

Untuk mencegah pembengkakan kuota pembacaan/penulisan (*Denial of Wallet* / kehabisan kuota gratis harian Spark), proyek ini dilengkapi dengan berkas **`firestore.rules`** yang memvalidasi setiap transaksi langsung di server Google Firebase:

1. **Validasi Skema & Batas Karakter**:
   - Mahasiswa hanya dapat membuat dokumen nilai (`results`) jika panjang `nama` (2–60 karakter), panjang `nim` (4–30 karakter), dan `score` adalah angka 0–100.
   - Bank soal (`content/rooms_data`) dibatasi maksimal 25 ruangan untuk mencegah pengisian data berlebih (*storage bloat*).
   - Pembaruan PIN (`settings/security`) hanya menerima string hash SHA-256 tepat 64 karakter.
2. **Kunci Immutability (Anti-Tamper Nilai)**:
   - Dokumen nilai mahasiswa **tidak dapat diubah/diedit (`update: false`)** setelah dikirim.
3. **Pencegahan Replay & Spam Submission**:
   - Sisi klien dilengkapi generator `sessionId` unik per pengerjaan untuk memblokir submit ganda (*double-click* atau *looping script*).

### 📋 Cara Menerapkan Aturan Keamanan di Firebase Console:
1. Buka [Firebase Console](https://console.firebase.google.com/) dan pilih proyek Anda (`dunia-bermain-anak`).
2. Masuk ke menu **Firestore Database** di bilah navigasi kiri.
3. Klik tab **Rules** (Aturan).
4. Salin seluruh isi berkas [`firestore.rules`](file:///c:/Project%20Source%20Code/dunia-belajar-anak/firestore.rules) dari repositori ini dan tempelkan (*paste*) menggantikan aturan lama.
5. Klik tombol **Publish** (Publikasikan).

> [!TIP]
> Jika Anda menggunakan Firebase CLI di komputer, Anda juga dapat menerapkannya langsung melalui terminal dengan perintah:
> ```bash
> firebase deploy --only firestore:rules
> ```

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
