import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, X } from 'lucide-react';
import { getDosenPinHash } from '../../firebase/config';
import { verifyPin } from '../../utils/crypto';

export default function DosenLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pinInput.trim()) {
      setError('Masukkan kata sandi / PIN dosen.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const storedHash = await getDosenPinHash();
      const isValid = await verifyPin(pinInput.trim(), storedHash);
      if (isValid) {
        setPinInput('');
        onLoginSuccess();
      } else {
        setError('Kata sandi salah. Silakan periksa kembali.');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat memeriksa sandi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              background: 'var(--purple-light)',
              padding: '10px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Lock size={22} color="var(--purple)" />
            </div>
            <h3 style={{ margin: 0, color: 'var(--purple-dark)', fontSize: '1.3em' }}>Akses Dosen</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray)', padding: '4px' }}
          >
            <X size={22} />
          </button>
        </div>

        <p style={{ fontSize: '0.92em', color: '#475569', lineHeight: 1.5, marginTop: 0 }}>
          Masukkan kata sandi dosen untuk mengelola ruangan/soal dan melihat rekapitulasi nilai seluruh mahasiswa.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="dosen-pin">
              Kata Sandi / PIN Dosen
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="dosen-pin"
                type="password"
                className="form-input"
                placeholder="Default: dosen123"
                value={pinInput}
                onChange={(e) => { setPinInput(e.target.value); setError(''); }}
                autoFocus
              />
            </div>
          </div>

          {error && (
            <div className="feedback-box no" style={{ marginBottom: '16px' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="btnrow" style={{ marginTop: '20px' }}>
            <button
              type="submit"
              className="main-btn"
              disabled={loading}
              style={{ background: 'var(--purple)', boxShadow: '0 5px 0 var(--purple-dark)' }}
            >
              <KeyRound size={18} />
              {loading ? 'Memeriksa...' : 'Masuk Dashboard'}
            </button>
            <button
              type="button"
              className="btn-confirm-no"
              onClick={onClose}
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
