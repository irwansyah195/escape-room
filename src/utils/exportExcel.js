import * as XLSX from 'xlsx';

/**
 * Ekspor data rekapitulasi nilai mahasiswa ke file Excel (.xlsx) dengan 2 sheet:
 * 1. Rekap Nilai: Ringkasan nama, nim, skor, jumlah benar, tanggal
 * 2. Detail Jawaban: Rincian pengerjaan tiap gembok/soal per mahasiswa
 */
export function exportToExcel(records) {
  if (!records || records.length === 0) {
    alert("Belum ada data untuk diunduh.");
    return;
  }

  // Sheet 1: Rekap Nilai
  const summaryData = records.map(r => {
    const studentName = r.name || r.nama || '-';
    const correct = r.correct !== undefined ? r.correct : (Array.isArray(r.answers) ? r.answers.filter(a => a.isSolved).length : 0);
    const totalLocks = r.totalLocks !== undefined ? r.totalLocks : (Array.isArray(r.answers) && r.answers.length > 0 ? r.answers.length : 12);
    const timeVal = r.timestamp || r.submittedAt;
    const timeStr = timeVal ? new Date(timeVal).toLocaleString('id-ID') : '-';

    return {
      "Nama Lengkap": studentName,
      "NIM": r.nim,
      "Skor Akhir": r.score,
      "Jumlah Benar": correct,
      "Total Soal": totalLocks,
      "Waktu Selesai": timeStr
    };
  });

  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary['!cols'] = [
    { wch: 26 },
    { wch: 18 },
    { wch: 12 },
    { wch: 14 },
    { wch: 12 },
    { wch: 22 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsSummary, "Rekap Nilai");

  // Sheet 2: Detail Jawaban Per Soal
  const detailData = [];
  records.forEach(r => {
    const studentName = r.name || r.nama || '-';
    (r.answers || []).forEach(a => {
      detailData.push({
        "Nama": studentName,
        "NIM": r.nim,
        "Ruangan": a.room,
        "Soal / Gembok": a.question,
        "Jawaban Benar": a.correctOptionText,
        "Status": a.isSolved ? 'Selesai' : 'Belum Selesai',
        "Percobaan Salah": a.wrongAttempts || 0,
        "Skor Soal": typeof a.scoreEarned === 'number' ? Number(a.scoreEarned.toFixed(2)) : 0
      });
    });
  });

  if (detailData.length > 0) {
    const wsDetail = XLSX.utils.json_to_sheet(detailData);
    wsDetail['!cols'] = [
      { wch: 24 },
      { wch: 16 },
      { wch: 20 },
      { wch: 45 },
      { wch: 45 },
      { wch: 14 },
      { wch: 16 },
      { wch: 12 }
    ];
    XLSX.utils.book_append_sheet(wb, wsDetail, "Detail Jawaban");
  }

  XLSX.writeFile(wb, "rekap_nilai_escape_room.xlsx");
}

/**
 * Ekspor data rekapitulasi ke format CSV
 */
export function exportToCSV(records) {
  if (!records || records.length === 0) {
    alert("Belum ada data untuk diunduh.");
    return;
  }

  let csv = "Nama,NIM,Skor,Benar,Total Soal,Waktu\n";
  records.forEach(r => {
    const studentName = r.name || r.nama || '-';
    const correct = r.correct !== undefined ? r.correct : (Array.isArray(r.answers) ? r.answers.filter(a => a.isSolved).length : 0);
    const totalLocks = r.totalLocks !== undefined ? r.totalLocks : (Array.isArray(r.answers) && r.answers.length > 0 ? r.answers.length : 12);
    const timeVal = r.timestamp || r.submittedAt;
    const timeStr = timeVal ? new Date(timeVal).toLocaleString('id-ID') : '-';
    csv += `"${studentName.replace(/"/g, '""')}","${(r.nim || '').replace(/"/g, '""')}",${r.score},${correct},${totalLocks},"${timeStr}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'rekap_nilai_escape_room.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
