export const defaultRooms = [
  {
    id: "room-1",
    title: "Ruang Balok",
    icon: "🧱",
    decor: "🧱",
    text: `Rani (4 tahun) duduk di sudut ruang kelas bersama Dimas (4 tahun). Keduanya memiliki set balok kayu masing-masing. Rani sesekali melirik menara yang dibangun Dimas dan berkata, "Punyaku lebih tinggi lho," lalu kembali fokus menyusun baloknya sendiri. Mereka berdua duduk berdekatan, sesekali bertukar potongan balok berwarna merah, tetapi masing-masing membangun struktur yang berbeda dan tidak ada rencana bersama.`,
    key: "🟦",
    locks: [
      {
        id: "lock-1-1",
        q: "Gembok 1 — Jenis bermain berdasarkan fungsi (Hurlock):",
        options: [
          "Bermain aktif — anak mengikuti instruksi guru dalam menyusun balok bertahap",
          "Bermain aktif — anak terlibat langsung menyusun dan mengatur baloknya sendiri",
          "Bermain pasif — anak hanya menikmati hasil susunan balok milik temannya"
        ],
        correct: 1,
        hint: "Perhatikan siapa yang benar-benar memegang dan menyusun balok, serta apakah ada arahan dari orang dewasa dalam narasi."
      },
      {
        id: "lock-1-2",
        q: "Gembok 2 — Tahap bermain menurut Parten:",
        options: [
          "Parallel play — anak duduk berdampingan namun membangun struktur masing-masing",
          "Associative play — anak bermain bahan yang sama demi tujuan bersama",
          "Onlooker play — anak hanya mengamati temannya menyusun balok"
        ],
        correct: 0,
        hint: "Cek apakah ada rencana/tujuan yang disepakati bersama, atau apakah keduanya justru membangun struktur yang berbeda."
      },
      {
        id: "lock-1-3",
        q: "Gembok 3 — Jenis bermain kognitif (Piaget–Smilansky):",
        options: [
          "Constructive play — bahan disusun menjadi bentuk tertentu sesuai rancangan anak",
          "Functional play — gerakan tubuh diulang tanpa membentuk sesuatu yang jelas",
          "Games with rules — anak menaati aturan giliran yang disepakati bersama"
        ],
        correct: 0,
        hint: "Perhatikan hasil akhirnya: apakah balok berubah menjadi sebuah bentuk (misalnya menara), atau hanya gerakan berulang tanpa hasil bentuk."
      },
      {
        id: "lock-1-4",
        q: "Gembok 4 — Fungsi perkembangan yang paling menonjol dalam skenario ini:",
        options: [
          "Bahasa reseptif — anak lebih banyak mendengarkan ucapan temannya",
          "Motorik halus dan kesadaran sosial awal lewat perbandingan hasil karya",
          "Pemahaman moral kompleks tentang benar dan salah"
        ],
        correct: 1,
        hint: "Perhatikan dua hal: tindakan tangan menyusun balok, dan ucapan Rani yang membandingkan tinggi menara — bukan sekadar mendengarkan atau menilai moral."
      }
    ]
  },
  {
    id: "room-2",
    title: "Dokter-dokteran",
    icon: "🩺",
    decor: "🩺",
    text: `Sekelompok anak usia 5 tahun (Aisyah, Bima, dan Citra) bermain di sudut dramatik. Aisyah berperan sebagai dokter, Bima sebagai pasien yang berpura-pura sakit perut, dan Citra sebagai perawat yang menyiapkan "obat" dari plastisin. Mereka menyepakati alur cerita: pasien datang, diperiksa, diberi obat, lalu pulang. Ketika Bima ingin mengubah jalan cerita, Aisyah berkata, "Jangan gitu, kan tadi kamu sakit perut, harus nunggu dulu."`,
    key: "🟥",
    locks: [
      {
        id: "lock-2-1",
        q: "Gembok 1 — Jenis bermain berdasarkan fungsi (Hurlock):",
        options: [
          "Bermain pasif — anak-anak mengikuti skrip cerita yang sudah disusun guru",
          "Bermain aktif — ketiga anak berperan langsung dan mengatur alur ceritanya sendiri",
          "Bermain aktif — hanya satu anak yang bermain, dua lainnya menonton di sudut"
        ],
        correct: 1,
        hint: "Cek siapa yang benar-benar berperan dan berdialog, serta apakah alur ceritanya muncul dari anak-anak sendiri atau dari arahan guru."
      },
      {
        id: "lock-2-2",
        q: "Gembok 2 — Tahap bermain menurut Parten:",
        options: [
          "Cooperative play — ada pembagian peran dan alur cerita yang disepakati bersama",
          "Associative play — anak bermain barang yang sama tanpa pembagian peran jelas",
          "Parallel play — anak duduk berdekatan namun memainkan cerita masing-masing"
        ],
        correct: 0,
        hint: "Perhatikan apakah ada pembagian peran (dokter, pasien, perawat) dan apakah Aisyah menegakkan aturan cerita yang disepakati bersama."
      },
      {
        id: "lock-2-3",
        q: "Gembok 3 — Jenis bermain menurut Piaget–Smilansky:",
        options: [
          "Constructive play — anak menyusun properti dokter-dokteran menjadi bentuk tertentu",
          "Sociodramatic play — anak memerankan tokoh dan berdialog sesuai peran bersama",
          "Functional play — anak mengulang gerakan memeriksa pasien tanpa alur cerita"
        ],
        correct: 1,
        hint: "Fokus pada dialog, peran yang dimainkan, dan negosiasi alur cerita antar anak — bukan sekadar menyusun benda atau gerakan berulang."
      },
      {
        id: "lock-2-4",
        q: "Gembok 4 — Fungsi perkembangan yang paling menonjol dalam skenario ini:",
        options: [
          "Motorik kasar — anak-anak banyak bergerak berpindah peran dan posisi",
          "Bahasa ekspresif, pemahaman peran sosial, dan regulasi diri lewat konsistensi cerita",
          "Kemampuan berhitung — anak-anak menghitung jumlah obat yang diberikan"
        ],
        correct: 1,
        hint: "Perhatikan dialog antar anak, pembagian peran, dan cara Aisyah mempertahankan alur cerita agar tetap masuk akal bagi Bima."
      }
    ]
  },
  {
    id: "room-3",
    title: "Congklak di Halaman",
    icon: "🎲",
    decor: "🎲",
    text: `Sekelompok anak usia 6 tahun bermain congklak saat istirahat. Mereka bergiliran mengambil biji, menghitung langkah dengan teliti, dan salah satu anak mengingatkan, "Bukan gitu caranya, biji terakhir harus masuk lumbung dulu baru boleh ambil lagi." Anak yang lain menerima koreksi tersebut dan melanjutkan permainan sesuai aturan yang disepakati bersama.`,
    key: "🟩",
    locks: [
      {
        id: "lock-3-1",
        q: "Gembok 1 — Jenis bermain berdasarkan fungsi (Hurlock):",
        options: [
          "Bermain pasif — anak-anak menonton giliran temannya tanpa ikut mengambil biji",
          "Bermain aktif — setiap anak ikut mengambil biji dan menjalankan giliran sendiri",
          "Bermain aktif — anak-anak hanya mengikuti arahan guru di setiap langkahnya"
        ],
        correct: 1,
        hint: "Cek apakah setiap anak benar-benar ikut bermain dan menjalankan aturan sendiri, atau hanya menonton atau mengikuti arahan orang dewasa."
      },
      {
        id: "lock-3-2",
        q: "Gembok 2 — Jenis bermain menurut Piaget–Smilansky:",
        options: [
          "Constructive play — anak menyusun biji congklak menjadi pola tertentu",
          "Games with rules — anak menjalankan aturan baku dan giliran yang disepakati bersama",
          "Sociodramatic play — anak memerankan tokoh penjual dan pembeli biji congklak"
        ],
        correct: 1,
        hint: "Perhatikan adanya aturan tetap (biji terakhir masuk lumbung), giliran yang diatur, dan koreksi aturan yang diterima bersama."
      },
      {
        id: "lock-3-3",
        q: "Gembok 3 — Dibanding Skenario 1 (Rani & Dimas), dari sisi tahap sosial Parten, permainan congklak ini menunjukkan:",
        options: [
          "Tahap sosial yang setara, karena keduanya sama-sama melibatkan lebih dari satu anak",
          "Tahap sosial yang lebih matang, karena melibatkan aturan formal yang disepakati bersama",
          "Tahap sosial yang lebih rendah, karena anak hanya fokus pada bijinya masing-masing"
        ],
        correct: 1,
        hint: "Bandingkan apakah ada tujuan/aturan bersama yang disepakati dan ditegakkan, dibanding skenario 1 yang belum memiliki hal tersebut."
      },
      {
        id: "lock-3-4",
        q: "Gembok 4 — Fungsi perkembangan yang paling menonjol dalam skenario ini:",
        options: [
          "Motorik kasar — anak-anak banyak bergerak mengambil biji dari lumbung",
          "Bahasa ekspresif — anak-anak banyak berdialog selama permainan berlangsung",
          "Kontrol diri menunggu giliran serta ketelitian berhitung dan pemahaman aturan"
        ],
        correct: 2,
        hint: "Perhatikan cara anak menunggu giliran, menghitung biji dengan teliti, dan menerima koreksi aturan dari temannya."
      }
    ]
  }
];
