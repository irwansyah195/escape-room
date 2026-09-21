import React, { useState, useEffect } from 'react';
import { Download, Search, Trash2, Eye, RefreshCw, FileSpreadsheet, Users, Award, TrendingUp } from 'lucide-react';
import { getStudentResults, deleteStudentResult } from '../../firebase/config';
import { exportToExcel, exportToCSV } from '../../utils/exportExcel';
import ResultDetailModal from './ResultDetailModal';

export default function ResultRecap() {
  const [records, setRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getStudentResults();
      // Urutkan berdasarkan waktu pengerjaan terbaru
      data.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
      setRecords(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (rec) => {
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus data nilai mahasiswa: "${rec.name}" (${rec.nim})?`);
    if (!confirmDelete) return;

    setDeletingId(rec.id);
    try {
      await deleteStudentResult(rec.id);
      setRecords(prev => prev.filter(r => r.id !== rec.id));
    } catch (err) {
      alert('Gagal menghapus data: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredRecords = records.filter(r => {
    const q = searchQuery.toLowerCase();
    return (r.name || '').toLowerCase().includes(q) || (r.nim || '').toLowerCase().includes(q);
  });

  // Statistik ringkas
  const totalSubmissions = records.length;
  const avgScore = totalSubmissions > 0
    ? (records.reduce((acc, curr) => acc + (curr.score || 0), 0) / totalSubmissions).toFixed(1)
    : 0;
  const maxScore = totalSubmissions > 0
    ? Math.max(...records.map(r => r.score || 0))
    : 0;

  return (
    <div>
      {/* Kartu Ringkasan Statistik */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{
          background: 'var(--blue-light)',
          padding: '14px 18px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid #bfdbfe'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e40af', fontSize: '0.88em', fontWeight: 700 }}>
            <Users size={18} />
            <span>Total Mengerjakan</span>
          </div>
          <div style={{ fontSize: '1.6em', fontWeight: 800, color: 'var(--dark)', marginTop: '4px' }}>
            {totalSubmissions}
          </div>
        </div>

        <div style={{
          background: 'var(--purple-light)',
          padding: '14px 18px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid #e9d5ff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--purple-dark)', fontSize: '0.88em', fontWeight: 700 }}>
            <TrendingUp size={18} />
            <span>Rata-rata Nilai</span>
          </div>
          <div style={{ fontSize: '1.6em', fontWeight: 800, color: 'var(--dark)', marginTop: '4px' }}>
            {avgScore}
          </div>
        </div>

        <div style={{
          background: 'var(--green-light)',
          padding: '14px 18px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid #bbf7d0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--green-dark)', fontSize: '0.88em', fontWeight: 700 }}>
            <Award size={18} />
            <span>Skor Tertinggi</span>
          </div>
          <div style={{ fontSize: '1.6em', fontWeight: 800, color: 'var(--dark)', marginTop: '4px' }}>
            {maxScore}
          </div>
        </div>
      </div>

      {/* Bar Pencarian & Tombol Aksi */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '14px'
      }}>
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '360px' }}>
          <Search size={18} color="var(--gray)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '38px', paddingTop: '9px', paddingBottom: '9px' }}
            placeholder="Cari nama atau NIM..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-confirm-no"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            onClick={loadData}
            title="Muat Ulang Data"
          >
            <RefreshCw size={16} />
            <span>Segarkan</span>
          </button>

          <button
            type="button"
            className="btn-confirm-yes"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--green-dark)' }}
            onClick={() => exportToExcel(records)}
          >
            <FileSpreadsheet size={16} />
            <span>Unduh Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            className="btn-confirm-no"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            onClick={() => exportToCSV(records)}
          >
            <Download size={16} />
            <span>Unduh CSV</span>
          </button>
        </div>
      </div>

      {/* Tabel Data Mahasiswa */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '36px', color: 'var(--gray)' }}>
          <RefreshCw size={28} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '10px' }}>Memuat rekap data dari database...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          background: 'var(--gray-light)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--gray)'
        }}>
          <Users size={36} style={{ opacity: 0.5, marginBottom: '8px' }} />
          <p style={{ margin: 0, fontWeight: 600 }}>
            {searchQuery ? 'Tidak ada data yang cocok dengan pencarian.' : 'Belum ada mahasiswa yang menyelesaikan game.'}
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Nama Mahasiswa</th>
                <th>NIM</th>
                <th style={{ textAlign: 'center' }}>Skor Akhir</th>
                <th style={{ textAlign: 'center' }}>Benar</th>
                <th>Waktu Pengerjaan</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((rec) => (
                <tr key={rec.id}>
                  <td style={{ fontWeight: 700 }}>{rec.name}</td>
                  <td style={{ color: 'var(--gray)', fontWeight: 600 }}>{rec.nim}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-full)',
                      background: rec.score >= 80 ? 'var(--green-light)' : rec.score >= 60 ? 'var(--blue-light)' : '#fef2f2',
                      color: rec.score >= 80 ? 'var(--green-dark)' : rec.score >= 60 ? 'var(--blue-dark)' : '#b91c1c',
                      fontWeight: 800,
                      fontSize: '0.95em'
                    }}>
                      {rec.score}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>
                    {rec.correct} / {rec.totalLocks}
                  </td>
                  <td style={{ fontSize: '0.85em', color: 'var(--gray)' }}>
                    {rec.timestamp ? new Date(rec.timestamp).toLocaleString('id-ID') : '-'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn-confirm-no"
                        style={{ padding: '6px 10px', fontSize: '0.85em', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => setSelectedRecord(rec)}
                        title="Lihat Detail Jawaban"
                      >
                        <Eye size={14} /> Detail
                      </button>
                      <button
                        type="button"
                        className="btn-confirm-no"
                        style={{ padding: '6px 10px', fontSize: '0.85em', color: '#dc2626', borderColor: '#fca5a5' }}
                        disabled={deletingId === rec.id}
                        onClick={() => handleDelete(rec)}
                        title="Hapus Nilai Uji Coba"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedRecord && (
        <ResultDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
}
