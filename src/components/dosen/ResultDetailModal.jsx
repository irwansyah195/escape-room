import React from 'react';
import { X, CheckCircle2, XCircle, UserCheck } from 'lucide-react';

export default function ResultDetailModal({ record, onClose }) {
  if (!record) return null;

  const answers = record.answers || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '820px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: '0 0 4px', color: 'var(--purple-dark)', fontSize: '1.3em' }}>
              🔍 Rincian Pengerjaan Mahasiswa
            </h3>
            <div style={{ display: 'flex', gap: '14px', fontSize: '0.9em', color: 'var(--gray)' }}>
              <span><b>Nama:</b> {record.name || record.nama || '-'}</span>
              <span><b>NIM:</b> {record.nim}</span>
              <span><b>Skor:</b> <b style={{ color: 'var(--green-dark)' }}>{record.score}</b> / 100</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray)', padding: '4px' }}
          >
            <X size={24} />
          </button>
        </div>

        {answers.length === 0 ? (
          <p style={{ color: 'var(--gray)' }}>Tidak ada data rincian jawaban untuk entri ini.</p>
        ) : (
          <div className="table-responsive" style={{ maxHeight: '55vh' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Ruangan</th>
                  <th>Soal / Gembok</th>
                  <th>Jawaban Benar</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'center' }}>Percobaan Salah</th>
                  <th style={{ textAlign: 'center' }}>Skor Diperoleh</th>
                </tr>
              </thead>
              <tbody>
                {answers.map((ans, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: 'var(--purple-dark)' }}>{ans.room}</td>
                    <td style={{ maxWidth: '240px', lineHeight: 1.4 }}>{ans.question}</td>
                    <td style={{ maxWidth: '240px', color: '#334155' }}>{ans.correctOptionText}</td>
                    <td style={{ textAlign: 'center' }}>
                      {ans.isSolved ? (
                        <span style={{ color: 'var(--green-dark)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={16} /> Selesai
                        </span>
                      ) : (
                        <span style={{ color: '#e53e3e', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <XCircle size={16} /> Belum
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>
                      {ans.wrongAttempts || 0}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--green-dark)' }}>
                      {typeof ans.scoreEarned === 'number' ? ans.scoreEarned.toFixed(2) : ans.scoreEarned}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="btnrow" style={{ justifyContent: 'flex-end', marginTop: '16px' }}>
          <button type="button" className="btn-confirm-no" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
