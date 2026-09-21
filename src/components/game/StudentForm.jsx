import React, { useState } from 'react';
import { User, CreditCard, Sparkles, AlertCircle } from 'lucide-react';

export default function StudentForm({ onStart }) {
  const [name, setName] = useState('');
  const [nim, setNim] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !nim.trim()) {
      setError('⚠️ Nama Lengkap dan NIM wajib diisi sebelum mulai.');
      return;
    }
    setError('');
    onStart({ name: name.trim(), nim: nim.trim() });
  };

  return (
    <div className="game-card final-card">
      <div className="final-emoji">🎒</div>
      <h2 style={{ color: 'var(--purple-dark)', marginTop: 0, fontSize: '1.6em' }}>
        Sebelum Mulai, Isi Data Dulu ya!
      </h2>
      <p style={{ textAlign: 'left', color: '#475569', lineHeight: 1.6 }}>
        Isi nama dan NIM kamu agar hasil observasi bermain dan skor pengerjaan tercatat di rekap dosen.
      </p>
      <div style={{
        textAlign: 'left',
        background: 'var(--blue-light)',
        border: '1px solid #bfdbfe',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        fontSize: '0.9em',
        color: '#1e40af',
        marginBottom: '20px'
      }}>
        💡 <b>Petunjuk:</b> Setiap gembok memiliki petunjuk (hint). Pilihlah jawaban dengan cermat pada percobaan pertama untuk mendapatkan skor maksimal!
      </div>

      <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="student-name">
            <span style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: '6px' }}>
              <User size={18} color="var(--purple)" />
            </span>
            Nama Lengkap Mahasiswa
          </label>
          <input
            id="student-name"
            type="text"
            className="form-input"
            placeholder="Contoh: Siti Aisyah"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="student-nim">
            <span style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: '6px' }}>
              <CreditCard size={18} color="var(--blue)" />
            </span>
            Nomor Induk Mahasiswa (NIM)
          </label>
          <input
            id="student-nim"
            type="text"
            className="form-input"
            placeholder="Contoh: 2210201234"
            value={nim}
            onChange={(e) => { setNim(e.target.value); setError(''); }}
          />
        </div>

        {error && (
          <div className="feedback-box no" style={{ marginBottom: '16px' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="btnrow" style={{ justifyContent: 'center' }}>
          <button type="submit" className="main-btn" style={{ maxWidth: '320px' }}>
            <Sparkles size={20} />
            Mulai Bermain ✨
          </button>
        </div>
      </form>
    </div>
  );
}
