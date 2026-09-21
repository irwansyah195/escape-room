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
  const summaryData = records.map(r => ({
    "Nama Lengkap": r.name,
    "NIM": r.nim,
    "Skor Akhir": r.score,
    "Jumlah Benar": r.correct,
    "Total Soal": r.totalLocks,
    "Waktu Selesai": r.timestamp ? new Date(r.timestamp).toLocaleString('id-ID') : '-'
  }));

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
    (r.answers || []).forEach(a => {
      detailData.push({
        "Nama": r.name,
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
    const timeStr = r.timestamp ? new Date(r.timestamp).toLocaleString('id-ID') : '-';
    csv += `"${(r.name || '').replace(/"/g, '""')}","${(r.nim || '').replace(/"/g, '""')}",${r.score},${r.correct},${r.totalLocks},"${timeStr}"\n`;
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
