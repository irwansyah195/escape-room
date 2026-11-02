import React, { useState } from 'react';
import {
  User,
  CreditCard,
  Sparkles,
  AlertCircle,
  Radio,
  LogIn
} from 'lucide-react';
import { verifyClassSession } from '../../utils/sessionSync';

export default function StudentForm({ onStart }) {
  const [name, setName] = useState('');
  const [nim, setNim] = useState('');
  const [pin, setPin] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return p.get('pin') || p.get('session') || '';
    }
    return '';
  });
  const [isFromQr] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return Boolean(p.get('pin') || p.get('session'));
    }
    return false;
  });
  const [error, setError] = useState('');
  const [validatingPin, setValidatingPin] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanNim = nim.trim();
    const cleanPin = pin.trim();

    if (!cleanName || !cleanNim) {
      setError('⚠️ Nama Lengkap dan NPM/NIM wajib diisi sebelum mulai.');
      return;
    }
    if (cleanName.length < 2 || cleanName.length > 60) {
      setError('⚠️ Nama Mahasiswa harus antara 2 hingga 60 karakter.');
      return;
    }
    if (cleanNim.length < 4 || cleanNim.length > 30) {
      setError('⚠️ Nomor Pokok Mahasiswa (NPM/NIM) harus antara 4 hingga 30 karakter.');
      return;
    }

    if (!cleanPin || cleanPin.length !== 6) {
      setError('⚠️ Kode PIN Sesi Kelas (6 digit) wajib dimasukkan! Silakan minta kode PIN kepada Dosen Anda di depan kelas.');
      return;
    }

    setValidatingPin(true);
    let sessionInfo = null;
    try {
      sessionInfo = await verifyClassSession(cleanPin);
    } catch (err) {
      console.warn("Gagal memverifikasi sesi:", err);
    } finally {
      setValidatingPin(false);
    }

    if (!sessionInfo) {
      setError(`⚠️ Kode PIN "${cleanPin}" tidak ditemukan atau sesi sudah ditutup oleh Dosen.`);
      return;
    }

    setError('');
    const uniqueSessionId = `sess_${cleanNim.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const isRace = sessionInfo.mode === 'quiz_race';

    onStart({
      name: cleanName,
      nim: cleanNim,
      sessionId: uniqueSessionId,
      sessionPin: cleanPin,
      sessionMode: sessionInfo.mode || 'quiz_race',
      sessionTitle: sessionInfo.title || 'Sesi Kelas',
      timePerQuestion: sessionInfo.timePerQuestion || sessionInfo.time_per_question || 30,
      raceQuestions: (sessionInfo.raceQuestions && sessionInfo.raceQuestions.length > 0)
        ? sessionInfo.raceQuestions
        : (sessionInfo.race_questions && sessionInfo.race_questions.length > 0)
        ? sessionInfo.race_questions
        : null,
      characterType: isRace ? 'kart' : 'runner',
      characterColor: 'blue'
    });
  };

  return (
    <div className="game-card final-card" style={{ maxWidth: '520px', margin: '0 auto' }}>
      <div className="final-emoji">🎒</div>
      <h2 style={{ color: '#c084fc', marginTop: 0, fontSize: '1.6em' }}>
        Masuk ke Dunia Belajar Anak
      </h2>
      <p style={{ textAlign: 'center', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 20px', fontSize: '0.92em' }}>
        Masukkan nama dan NPM/NIM untuk memulai permainan edukatif observasi perkembangan anak!
      </p>

      {/* Notifikasi Masuk Otomatis dari Scan QR */}
      {isFromQr && pin && (
        <div style={{
          marginBottom: '18px',
          padding: '12px 16px',
          borderRadius: '14px',
          background: 'rgba(34, 197, 94, 0.15)',
          border: '1px solid rgba(34, 197, 94, 0.4)',
          color: '#4ade80',
          fontSize: '0.9em',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Sparkles size={20} color="#4ade80" />
          <span>Terhubung dari <b>Scan QR Sesi Kelas</b> (PIN: <b style={{ letterSpacing: '2px' }}>{pin}</b>). Silakan masukkan Nama & NPM Anda!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
        {/* Nama Lengkap */}
        <div className="form-group" style={{ marginBottom: '14px' }}>
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

        {/* NPM / NIM */}
        <div className="form-group" style={{ marginBottom: '14px' }}>
          <label className="form-label" htmlFor="student-nim">
            <span style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: '6px' }}>
              <CreditCard size={18} color="var(--blue)" />
            </span>
            Nomor Pokok Mahasiswa (NPM / NIM)
          </label>
          <input
            id="student-nim"
            type="text"
            className="form-input"
            placeholder="Contoh: 23112828"
            value={nim}
            onChange={(e) => { setNim(e.target.value); setError(''); }}
          />
        </div>

        {/* PIN Sesi Kelas Dosen (Wajib) */}
        <div className="form-group" style={{ marginBottom: '22px' }}>
          <label className="form-label" htmlFor="student-pin" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Radio size={18} color="var(--green-dark)" />
              <span>PIN Sesi Kelas Dosen (Multiplayer)</span>
            </span>
            <span style={{ fontSize: '0.8em', color: isFromQr ? '#4ade80' : '#f59e0b', fontWeight: 700 }}>
              {isFromQr ? '✓ Terisi Otomatis' : '* Wajib Diisi (6 Digit)'}
            </span>
          </label>
          <input
            id="student-pin"
            type="text"
            className="form-input"
            placeholder="Masukkan 6 Digit PIN (Contoh: 849201)"
            value={pin}
            maxLength={6}
            onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }}
            style={{
              letterSpacing: pin ? '4px' : 'normal',
              fontWeight: pin ? 800 : 400,
              fontSize: '1.1em',
              borderColor: isFromQr ? 'rgba(34, 197, 94, 0.6)' : undefined,
              background: isFromQr ? 'rgba(34, 197, 94, 0.08)' : undefined
            }}
            required
          />
        </div>

        {error && (
          <div className="feedback-box no" style={{ marginBottom: '16px' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="btnrow" style={{ justifyContent: 'center' }}>
          <button
            type="submit"
            className="main-btn"
            disabled={validatingPin}
            style={{ width: '100%', maxWidth: '340px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {validatingPin ? (
              <>
                <Sparkles size={20} style={{ animation: 'spin 1.5s linear infinite' }} />
                <span>Memeriksa Sesi Kelas...</span>
              </>
            ) : (
              <>
                <LogIn size={20} />
                <span>Gabung ke Sesi Kelas</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
