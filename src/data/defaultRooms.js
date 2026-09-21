export const defaultRooms = [
  // ─────────────────────────────────────────────
  // RUANGAN 1 — Area 1 & 2 (Soal 1–4)
  // ─────────────────────────────────────────────
  {
    id: "room-1",
    title: "Seni Kriya & Eksplorasi",
    icon: "🎨",
    decor: "🎨",
    text: `STUDI KASUS OBSERVASI: KELAS SENTRA EKSPLORASI "BINTANG KECIL"\nGuru Rina merancang kegiatan sentra untuk menstimulasi kreativitas anak usia 4-5 tahun.\n\n● Area 1 (Seni Kriya): Guru Rina mengadakan kegiatan "Membuat Kupu-kupu". Ia telah mengguntingkan kertas karton berbentuk sayap, badan, dan antena dengan presisi. Anak-anak diinstruksikan menempelkan bagian-bagian tersebut menggunakan lem sesuai contoh. Saat kegiatan berlangsung, Budi menempelkan sayap secara asimetris dan menaruh mata di bawah badan. Guru Rina berkata, "Wah, Budi salah tempel, yuk dipindah matanya ke atas biar mirip kupu-kupu sungguhan."\n\n● Area 2 (Bahan Alam/Loose Parts): Tersedia nampan berisi batu kerikil, ranting, kancing, dan daun kering tanpa instruksi spesifik. Siti mengabaikan contoh bentuk bunga yang dibuat guru, lalu menyusun batu dan ranting memanjang hingga keluar nampan sambil berkata, "Ini rel kereta api ajaib yang mau pergi ke bulan!"`,
    key: "🟦",
    locks: [
      {
        id: "lock-1-1",
        q: "Berdasarkan prinsip perkembangan kreativitas, evaluasi pedagogis yang paling tepat untuk kegiatan di Area 1 (Membuat Kupu-kupu) adalah...",
        options: [
          "Kegiatan tersebut sangat ideal karena melatih anak memecahkan masalah (problem solving) secara mandiri.",
          "Kegiatan tersebut termasuk Seni Proses (Process Art) yang merangsang pemikiran divergen anak.",
          "Kegiatan tersebut tergolong Seni Produk (Product Art) yang lebih menguji tingkat kepatuhan dan kemampuan meniru anak daripada kreativitasnya.",
          "Kegiatan tersebut efektif mengembangkan imajinasi spasial karena anak harus membayangkan bentuk asli kupu-kupu."
        ],
        correct: 2,
        hint: "Perhatikan siapa yang menyiapkan pola, dan apakah anak bebas berekspresi atau harus mengikuti hasil akhir yang sudah ditentukan guru."
      },
      {
        id: "lock-1-2",
        q: "Tindakan Guru Rina yang mengoreksi hasil tempelan Budi (\"Budi salah tempel...\") mencerminkan kesalahan umum pendidik, karena respons tersebut berpotensi...",
        options: [
          "Mengembangkan pemahaman kognitif anak tentang anatomi serangga secara akurat.",
          "Mematikan kebebasan berekspresi anak karena standar estetika dibatasi oleh sudut pandang realita orang dewasa.",
          "Melatih kedisiplinan anak dalam mengikuti instruksi berurutan (SOP) di dalam kelas.",
          "Mendorong Budi untuk mengeksplorasi bahan lain agar kupu-kupunya lebih menarik."
        ],
        correct: 1,
        hint: "Pikirkan: apakah 'salah' dalam seni anak harus selalu dikoreksi menuju realita versi orang dewasa? Apa dampaknya pada ekspresi diri anak?"
      },
      {
        id: "lock-1-3",
        q: "Menganalisis perilaku Siti di Area 2 saat bermain loose parts, fenomena psikologis apa yang sedang ditunjukkan oleh anak tersebut?",
        options: [
          "Siti mengalami kebingungan instruksional sehingga membutuhkan demonstrasi ulang dari guru.",
          "Siti menunjukkan tahapan pemikiran divergent, di mana benda tidak terstruktur berhasil ia beri makna baru melalui imajinasinya.",
          "Siti menunjukkan kurangnya rentang konsentrasi (attention span) karena keluar dari batas nampan yang disediakan.",
          "Siti sedang berada dalam fase egosentris karena menolak bekerja sama membuat bunga seperti temannya."
        ],
        correct: 1,
        hint: "Perhatikan bahwa bahan di Area 2 memang sengaja tidak memiliki instruksi spesifik. Apa yang terjadi saat anak diberi kebebasan penuh dengan bahan terbuka (loose parts)?"
      },
      {
        id: "lock-1-4",
        q: "Jika Anda harus merombak kegiatan di Area 1 agar murni menjadi pendekatan Seni Proses (Process Art), instruksi dan persiapan apa yang paling tepat diberikan?",
        options: [
          "Menyediakan kertas, cat, krayon, spons, dan berkata: \"Anak-anak, hari ini kita bereksplorasi dengan alat-alat ini. Kalian boleh membuat apa saja yang kalian bayangkan.\"",
          "Memberikan pola kupu-kupu yang lebih besar agar anak yang motorik halusnya belum matang lebih mudah menempel.",
          "Menambahkan nomor urut (1, 2, 3) di belakang potongan kertas agar anak bisa menempel secara logis dan terstruktur.",
          "Meminta anak mewarnai pola kupu-kupu yang sudah diprint di atas kertas menggunakan krayon sebelum mereka gunting."
        ],
        correct: 0,
        hint: "Seni Proses berpusat pada kebebasan eksplorasi bahan tanpa hasil akhir yang ditentukan. Manakah pilihan yang tidak memberikan target bentuk spesifik kepada anak?"
      }
    ]
  },

  // ─────────────────────────────────────────────
  // RUANGAN 2 — Area 3 & 4 (Soal 5–8)
  // ─────────────────────────────────────────────
  {
    id: "room-2",
    title: "Sensori & Bermain Peran",
    icon: "🎭",
    decor: "🎭",
    text: `STUDI KASUS OBSERVASI: KELAS SENTRA EKSPLORASI "BINTANG KECIL"\nGuru Rina merancang kegiatan sentra untuk menstimulasi kreativitas anak usia 4-5 tahun.\n\n● Area 3 (Sensory Play): Guru menyiapkan finger painting (melukis jari) dengan cat air bertekstur kental. Caca menolak memasukkan tangannya dan mulai menangis saat ujung jarinya tak sengaja terkena cat, ia berteriak, "Kotor! Caca jijik!" Guru Rina segera membawa Caca ke wastafel, mencuci tangannya bersih-bersih, lalu memberikan kertas dan krayon agar Caca tetap bisa menggambar dengan "bersih".\n\n● Area 4 (Bermain Peran/Dramatic Play): Tiga anak sedang bermain "Restoran". Anton mengambil sebuah balok kayu persegi panjang, menempelkannya ke telinga, dan pura-pura menelepon untuk memesan ayam goreng. Melihat hal itu, Guru Rina mengambilkan mainan telepon plastik dari rak dan memberikannya pada Anton sambil berkata, "Anton, kalau mau telepon pakai ini ya, balok kayu kan untuk dibangun, bukan untuk telepon."`,
    key: "🟥",
    locks: [
      {
        id: "lock-2-1",
        q: "Tindakan Guru Rina di Area 3 (memberikan krayon pada Caca) sepintas terlihat solutif. Namun, dari perspektif perkembangan eksplorasi anak, tindakan ini dianggap kurang tepat karena...",
        options: [
          "Caca menjadi tidak disiplin dalam menggunakan bahan cat air sesuai jadwal.",
          "Guru menghilangkan kesempatan anak untuk secara bertahap menoleransi stimulasi taktil (sentuhan) yang penting untuk keberanian bereksplorasi.",
          "Krayon tidak bisa melatih motorik halus sebaik cat air.",
          "Caca seharusnya dipaksa memasukkan seluruh tangannya agar langsung berani menghadapi ketakutannya."
        ],
        correct: 1,
        hint: "Bukan soal alat mana yang lebih baik, melainkan: apa yang terlewatkan dari perkembangan Caca saat guru langsung menghindari sumber ketakutannya?"
      },
      {
        id: "lock-2-2",
        q: "Intervensi (scaffolding) yang paling ideal untuk memfasilitasi Caca di Area 3 tanpa mematikan proses adaptasi sensoriknya adalah...",
        options: [
          "Membiarkan Caca duduk diam mengamati teman-temannya di pojok ruangan sampai ia bosan.",
          "Memberikan alat bantu jarak jauh (seperti kuas basah atau spons beralas) terlebih dahulu, atau guru mencontohkan menyentuh cat dengan satu jari secara menyenangkan.",
          "Mengurangi nilai catatan anekdotal Caca karena menolak berpartisipasi dalam kegiatan seni.",
          "Mengalihkan Caca ke Area 1 agar ia mengerjakan menempel kertas yang lebih bersih."
        ],
        correct: 1,
        hint: "Scaffolding yang baik tidak memaksa dan tidak pula menghindarkan. Manakah pilihan yang memberi anak 'jembatan' menuju pengalaman yang ia takuti, secara bertahap dan aman?"
      },
      {
        id: "lock-2-3",
        q: "Saat Anton menggunakan balok kayu sebagai telepon di Area 4, ia sebenarnya sedang menunjukkan kemampuan kognitif tingkat tinggi, yaitu...",
        options: [
          "Subtitusi objek dalam bermain simbolik (symbolic play), di mana fungsi sebuah benda diubah sesuai imajinasi dan kebutuhan narasi anak.",
          "Berpikir konkret, di mana ia hanya bisa memahami fungsi sebuah balok jika dimainkan bersama temannya.",
          "Kebingungan perseptual karena penglihatan spasialnya belum bisa membedakan mana mainan telepon dan mana kayu.",
          "Keterlambatan linguistik karena ia menggunakan benda mati untuk berkomunikasi alih-alih berbicara langsung."
        ],
        correct: 0,
        hint: "Anton tahu bahwa balok itu bukan telepon sungguhan — namun ia memilih menjadikannya telepon dalam narasi bermainnya. Kemampuan apa yang memungkinkan anak melakukan hal ini?"
      },
      {
        id: "lock-2-4",
        q: "Apa dampak pedagogis yang merugikan dari tindakan Guru Rina saat ia menukar balok kayu Anton dengan telepon plastik tiruan?",
        options: [
          "Membuat permainan restoran menjadi terlalu rapi dan tidak natural.",
          "Meningkatkan perbendaharaan kata Anton tentang nama-nama alat komunikasi modern.",
          "Menurunkan risiko balok kayu rusak atau kotor karena dipakai bermain peran.",
          "Mematikan kemampuan berpikir abstrak Anton, karena guru memaksakan realitas benda konkret (harus mirip aslinya) ke dalam dunia imajinasi anak."
        ],
        correct: 3,
        hint: "Dalam symbolic play, nilai terbesar justru ada pada kemampuan anak 'mengubah' sesuatu yang tidak mirip menjadi bermakna. Apa yang hilang saat guru memaksa benda 'harus mirip aslinya'?"
      }
    ]
  },

  // ─────────────────────────────────────────────
  // RUANGAN 3 — Area 5 & 6 (Soal 9–12)
  // ─────────────────────────────────────────────
  {
    id: "room-3",
    title: "Konstruksi & Sains Eksploratif",
    icon: "🔬",
    decor: "🔬",
    text: `STUDI KASUS OBSERVASI: KELAS SENTRA EKSPLORASI "BINTANG KECIL"\nGuru Rina merancang kegiatan sentra untuk menstimulasi kreativitas anak usia 4-5 tahun.\n\n● Area 5 (Balok Konstruksi): Tio dan Raka sedang menyusun balok kayu untuk membuat "Menara Langit". Sayangnya, setiap kali mencapai tumpukan kelima, menara itu selalu roboh. Tio mulai frustrasi dan ingin menyerah. Guru Rina datang, mengambil alih balok tersebut, dan menyusunkannya menjadi menara yang kokoh sambil berkata, "Nah, susun balok besarnya di bawah ya. Selesai! Menaranya sudah tidak jatuh lagi, kalian senang kan?"\n\n● Area 6 (Sains Eksploratif): Guru menyiapkan tiga gelas berisi air warna primer (merah, kuning, biru). Mia tidak sengaja menuangkan air kuning ke dalam gelas biru sehingga air berubah menjadi hijau. Mia takjub dan berseru, "Ibu Guru, lihat! Airnya berubah jadi jus daun!" Guru Rina segera mengoreksi, "Bukan jus daun, Mia. Itu warna hijau. Kalau mau buat jus daun, kita pakai daun sungguhan di luar."`,
    key: "🟩",
    locks: [
      {
        id: "lock-3-1",
        q: "Di Area 5, intervensi Guru Rina yang langsung menyusunkan balok untuk Tio dan Raka berdampak sangat buruk bagi proses kognitif anak karena...",
        options: [
          "Anak-anak menjadi malas merapikan balok kayu kembali ke tempatnya.",
          "Guru mematikan kesempatan anak untuk melakukan trial and error (uji coba) dan mematikan nalar pemecahan masalah (problem solving).",
          "Susunan balok buatan guru tidak sesuai dengan kurikulum arsitektur dasar.",
          "Anak-anak akan menangis karena menaranya tidak dibuat lebih tinggi lagi."
        ],
        correct: 1,
        hint: "Frustasi saat menara roboh adalah bagian dari proses belajar. Apa yang Tio dan Raka kehilangan saat guru langsung 'menyelesaikan' masalah untuk mereka?"
      },
      {
        id: "lock-3-2",
        q: "Berdasarkan teori Zone of Proximal Development (Vygotsky), bentuk scaffolding (pijakan) melalui pertanyaan terbuka (open-ended question) yang seharusnya digunakan guru di Area 5 adalah...",
        options: [
          "\"Ayo, siapa yang bisa meniru gambar menara di buku ini?\"",
          "\"Wah sayang roboh, yuk main puzzle saja di meja sebelah agar tidak sedih.\"",
          "\"Kira-kira kenapa ya menaranya terus jatuh saat tinggi? Apa yang bisa kita ubah di bagian dasarnya biar lebih kuat?\"",
          "\"Jangan ditaruh di situ baloknya! Yang panjang di bawah!\""
        ],
        correct: 2,
        hint: "ZPD Vygotsky berarti memberi bantuan yang memancing anak berpikir sendiri — bukan memberi jawaban, bukan mengalihkan, dan bukan memerintah. Manakah yang memancing refleksi dan eksplorasi?"
      },
      {
        id: "lock-3-3",
        q: "Pada Area 6, respons Guru Rina terhadap penemuan Mia (\"jus daun\") mencerminkan kegagalan pendidik dalam...",
        options: [
          "Mengajarkan sains eksak tentang pencampuran warna sekunder dengan tepat.",
          "Menghargai proses inkuiri (inquiry) dan kemampuan metafora kreatif yang diciptakan anak dari imajinasinya.",
          "Mencegah anak minum air kotor karena dikira jus daun sungguhan.",
          "Mengajarkan kosakata bahasa Indonesia baku yang baik dan benar."
        ],
        correct: 1,
        hint: "Mia menyebut 'jus daun' bukan karena salah, melainkan karena imajinasinya menghubungkan warna hijau dengan daun. Apa yang sebetulnya berharga dan terlewat dari momen itu?"
      },
      {
        id: "lock-3-4",
        q: "Mengapa peristiwa ketidaksengajaan Mia mencampur warna di Area 6 jauh lebih efektif untuk menumbuhkan jiwa inovator dibandingkan menghafal rumus warna (Biru + Kuning = Hijau)?",
        options: [
          "Karena Mia bisa bermain air lebih lama daripada teman-temannya.",
          "Karena lembar kerja mewarnai membutuhkan biaya cetak (print) yang mahal.",
          "Karena anak mengalami sendiri (hands-on experience) proses sebab-akibat melalui eksplorasi otonom yang memicu rasa ingin tahu alami.",
          "Karena anak-anak usia dini belum bisa membaca huruf sehingga tidak bisa menghafal."
        ],
        correct: 2,
        hint: "Pikirkan perbedaan antara 'mengetahui sesuatu karena diberitahu' vs 'menemukan sendiri secara tidak sengaja'. Mana yang lebih membekas dan memantik rasa ingin tahu?"
      }
    ]
  },

  // ─────────────────────────────────────────────
  // RUANGAN 4 — Area 7, 8 & Kesimpulan (Soal 13–16)
  // ─────────────────────────────────────────────
  {
    id: "room-4",
    title: "Motivasi, Lingkungan & Peran Guru",
    icon: "⭐",
    decor: "⭐",
    text: `STUDI KASUS OBSERVASI: KELAS SENTRA EKSPLORASI "BINTANG KECIL"\nGuru Rina merancang kegiatan sentra untuk menstimulasi kreativitas anak usia 4-5 tahun.\n\n● Area 7 (Melukis Bebas & Motivasi): Dodi menunjukkan lukisannya yang penuh coretan abstrak tebal kepada Guru Rina. Guru Rina memberinya stiker bintang besar dan berkata, "Wah, lukisan Dodi paling bagus di kelas! Gambar kamu selalu rapi. Besok bikin yang persis seperti ini lagi ya, biar dapat stiker bintang lagi!"\n\n● Area 8 (Lingkungan/Display Kelas): Saat melihat ke dinding kelas, Anda menyadari bahwa Guru Rina memajang 15 gambar "Bunga Matahari" hasil karya seluruh murid. Semua gambar tersebut memiliki bentuk kelopak, jumlah daun, dan warna (kuning dan hijau) yang 100% sama persis satu sama lain (berasal dari lembar kerja yang diwarnai).`,
    key: "🏆",
    locks: [
      {
        id: "lock-4-1",
        q: "Di Area 7, Guru Rina memberikan stiker bintang dan pujian \"paling bagus\". Risiko pedagogis jangka panjang dari pujian ekstrinsik semacam ini terhadap kreativitas anak adalah...",
        options: [
          "Meningkatkan motivasi intrinsik anak untuk mencoba gaya melukis yang lebih rumit.",
          "Mendorong anak lain untuk merebut stiker milik Dodi.",
          "Membuat anak terobsesi pada reward (hadiah), sehingga ia takut mengambil risiko berkreasi hal baru karena takut gagal mendapat \"bintang\" lagi.",
          "Melatih Dodi menjadi pelukis profesional yang disiplin sejak usia balita."
        ],
        correct: 2,
        hint: "Jika sumber motivasi berasal dari luar (stiker/pujian guru), apa yang terjadi saat hadiah itu tidak ada lagi? Dan apakah anak akan berani bereksperimen jika takut 'salah' dan tidak mendapat hadiah?"
      },
      {
        id: "lock-4-2",
        q: "Alih-alih memuji hasil akhir dengan kata \"paling bagus/rapi\", kalimat apresiasi berbasis proses (process-praise) yang ideal untuk memantik kreativitas Dodi di Area 7 adalah...",
        options: [
          "\"Kamu memang murid jenius, Dodi! Ibu bangga padamu.\"",
          "\"Wah, lukisanmu bagus sekali seperti buatan seniman terkenal!\"",
          "\"Ibu lihat lukisanmu tidak ada yang keluar garis sama sekali, hebat!\"",
          "\"Ibu perhatikan Dodi mencampur banyak sekali warna tebal di bagian ini. Boleh ceritakan pada Ibu apa yang sedang kamu gambar?\""
        ],
        correct: 3,
        hint: "Process-praise fokus pada APA yang anak lakukan (pilihan warna, teknik, usaha), bukan SIAPA anak itu atau seberapa bagus hasilnya. Manakah yang memancing anak merefleksikan prosesnya sendiri?"
      },
      {
        id: "lock-4-3",
        q: "Memajang 15 karya seni yang bentuk dan warnanya sama persis di Area 8 (dinding kelas) secara tidak langsung menanamkan hidden curriculum (kurikulum tersembunyi) kepada murid-murid bahwa...",
        options: [
          "Keberagaman ide dan kebebasan berekspresi sangat dijunjung tinggi di sekolah tersebut.",
          "Keseragaman (konformitas), kepatuhan, dan hasil akhir (produk) jauh lebih bernilai daripada proses orisinalitas pemikiran individu.",
          "Anak-anak di kelas tersebut memiliki tingkat kecerdasan motorik halus yang merata.",
          "Lingkungan tersebut sudah menggunakan pendekatan sentra Reggio Emilia yang berpusat pada minat anak."
        ],
        correct: 1,
        hint: "Bayangkan Anda adalah murid yang melihat dinding itu. Pesan tersirat apa yang Anda tangkap tentang apa yang 'benar' dan apa yang 'dihargai' di kelas ini?"
      },
      {
        id: "lock-4-4",
        q: "(Kesimpulan Keseluruhan). Jika Anda harus menyimpulkan peran ideal seorang pendidik PAUD berdasarkan seluruh observasi di Area 1 hingga Area 8, guru seharusnya berperan sebagai...",
        options: [
          "Instruktur tunggal yang memastikan semua karya anak indah, rapi, dan layak dipamerkan kepada orang tua.",
          "Pengamat pasif yang membiarkan kelas berantakan tanpa ada aturan sama sekali demi kebebasan anak.",
          "Fasilitator yang menyediakan lingkungan kaya stimulasi, memberi ruang aman untuk membuat kesalahan, dan tidak memaksakan standar estetika/realita orang dewasa pada proses berpikir anak.",
          "Hakim penilai yang memberikan skor objektif berdasarkan seberapa cepat anak menyelesaikan tugasnya."
        ],
        correct: 2,
        hint: "Dari 8 area yang diobservasi, di mana anak paling berkembang: saat guru mengontrol penuh, atau saat guru memberi ruang aman dan stimulasi tanpa memaksakan hasil akhir?"
      }
    ]
  }
];
