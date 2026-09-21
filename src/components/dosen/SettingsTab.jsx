import React, { useState } from 'react';
import { KeyRound, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { getDosenPinHash, updateDosenPinHash } from '../../firebase/config';
import { verifyPin } from '../../utils/crypto';

export default function SettingsTab() {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!currentPin.trim() || !newPin.trim() || !confirmPin.trim()) {
      setStatus({ type: 'error', text: 'Semua kolom wajib diisi.' });
      return;
    }

    if (newPin.trim().length < 4) {
      setStatus({ type: 'error', text: 'PIN baru minimal harus 4 karakter.' });
      return;
    }

    if (newPin.trim() !== confirmPin.trim()) {
      setStatus({ type: 'error', text: 'Konfirmasi PIN baru tidak sesuai.' });
      return;
    }

    setLoading(true);
    try {
      const storedHash = await getDosenPinHash();
      const isValid = await verifyPin(currentPin.trim(), storedHash);
      if (!isValid) {
        setStatus({ type: 'error', text: 'PIN saat ini salah.' });
        setLoading(false);
        return;
      }

      await updateDosenPinHash(newPin.trim());
      setStatus({ type: 'success', text: '✅ Kata sandi / PIN dosen berhasil diperbarui dengan enkripsi aman!' });
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (err) {
      setStatus({ type: 'error', text: 'Gagal memperbarui PIN: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'left' }}>
      <div style={{
        background: 'var(--purple-light)',
        border: '1px solid #e9d5ff',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        marginBottom: '20px',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start'
      }}>
        <ShieldCheck size={24} color="var(--purple-dark)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div style={{ fontWeight: 700, color: 'var(--purple-dark)', marginBottom: '4px' }}>
            Keamanan Akses Dosen
          </div>
          <div style={{ fontSize: '0.9em', color: '#475569', lineHeight: 1.5 }}>
            Gunakan menu ini untuk mengganti kata sandi akses dosen agar mahasiswa tidak dapat mengubah soal atau melihat rekapitulasi nilai.
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="cur-pin">PIN Saat Ini</label>
          <input
            id="cur-pin"
            type="password"
            className="form-input"
            placeholder="Masukkan kata sandi lama"
            value={currentPin}
            onChange={(e) => setCurrentPin(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="new-pin">PIN Baru</label>
          <input
            id="new-pin"
            type="password"
            className="form-input"
            placeholder="Minimal 4 karakter"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="conf-pin">Konfirmasi PIN Baru</label>
          <input
            id="conf-pin"
            type="password"
            className="form-input"
            placeholder="Ketik ulang PIN baru"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
          />
        </div>

        {status && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.92em',
            fontWeight: 600,
            marginBottom: '16px',
            background: status.type === 'success' ? 'var(--green-light)' : '#fee2e2',
            color: status.type === 'success' ? 'var(--green-dark)' : '#b91c1c'
          }}>
            {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{status.text}</span>
          </div>
        )}

        <div className="btnrow">
          <button
            type="submit"
            className="main-btn"
            disabled={loading}
            style={{ background: 'var(--purple)', boxShadow: '0 5px 0 var(--purple-dark)' }}
          >
            <KeyRound size={18} />
            {loading ? 'Menyimpan...' : 'Simpan PIN Baru'}
          </button>
        </div>
      </form>
    </div>
  );
}
