import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  BookOpen,
  Users,
  Settings,
  LogOut,
  ArrowLeft,
  KeyRound,
  AlertCircle,
  Sparkles,
  Lock,
  Gamepad2
} from 'lucide-react';
import QuestionManager from '../components/dosen/QuestionManager';
import ResultRecap from '../components/dosen/ResultRecap';
import SettingsTab from '../components/dosen/SettingsTab';
import SkyBackground from '../components/common/SkyBackground';
import { getDosenPinHash, getRoomsFromDb } from '../firebase/config';
import { verifyPin } from '../utils/crypto';
import { defaultRooms } from '../data/defaultRooms';

export default function DosenPage({ rooms, onUpdateRooms }) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('questions'); // 'questions', 'results', 'settings'

  // Periksa status login di sessionStorage (hanya aktif selama tab terbuka)
  useEffect(() => {
    const isAuth = sessionStorage.getItem('dosen_auth_session') === 'true';
    if (isAuth) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e) => {
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
        sessionStorage.setItem('dosen_auth_session', 'true');
        setIsAuthenticated(true);
        setPinInput('');
      } else {
        setError('Kata sandi salah. Silakan periksa kembali.');
      }
    } catch (err) {
      setError('Terjadi kendala memverifikasi sandi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('dosen_auth_session');
    setIsAuthenticated(false);
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <SkyBackground />

      <div className="wrap" style={{ maxWidth: isAuthenticated ? '1060px' : '520px', transition: 'max-width 0.3s' }}>
        {/* Top Navbar Dosen */}
        <header style={{
          background: 'white',
          borderRadius: 'var(--radius-md)',
          padding: '14px 20px',
          marginBottom: '22px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--purple) 0%, var(--pink) 100%)',
              color: 'white',
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(155, 107, 204, 0.3)'
            }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.15em', color: 'var(--purple-dark)' }}>
                Portal Manajemen Dosen
              </div>
              <div style={{ fontSize: '0.82em', color: 'var(--gray)' }}>
                Escape Room: Dunia Bermain Anak
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link
              to="/"
              className="btn-confirm-no"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                fontSize: '0.88em'
              }}
            >
              <Gamepad2 size={16} />
              <span>Halaman Game</span>
            </Link>

            {isAuthenticated && (
              <button
                type="button"
                className="btn-confirm-no"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  fontSize: '0.88em',
                  color: '#dc2626',
                  borderColor: '#fca5a5'
                }}
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Keluar</span>
              </button>
            )}
          </div>
        </header>

        {/* Konten Halaman: Belum Login vs Sudah Login */}
        {!isAuthenticated ? (
          /* ========================================================= */
          /* FORM LOGIN HALAMAN TERPISAH                               */
          /* ========================================================= */
          <div className="game-card" style={{ padding: 'clamp(20px, 5vw, 36px)' }}>
            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--purple-light)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }}>
                <Lock size={32} color="var(--purple)" />
              </div>
              <h2 style={{ margin: '0 0 6px', color: 'var(--purple-dark)', fontSize: '1.5em' }}>
                Masuk ke Panel Dosen
              </h2>
              <p style={{ margin: 0, color: 'var(--gray)', fontSize: '0.92em', lineHeight: 1.5 }}>
                Silakan masukkan kata sandi dosen untuk mengelola ruangan, mengedit soal, dan mengunduh rekap nilai.
              </p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label" htmlFor="dosen-page-pin">
                  Kata Sandi / PIN Dosen
                </label>
                <input
                  id="dosen-page-pin"
                  type="password"
                  className="form-input"
                  placeholder="Masukkan kata sandi dosen..."
                  value={pinInput}
                  onChange={(e) => { setPinInput(e.target.value); setError(''); }}
                  autoFocus
                />
              </div>

              {error && (
                <div className="feedback-box no" style={{ marginBottom: '16px' }}>
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                fontSize: '0.84em',
                color: 'var(--gray)',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <ShieldCheck size={18} color="var(--green-dark)" style={{ flexShrink: 0 }} />
                <span>
                  <b>Keamanan Terjamin:</b> Password diverifikasi menggunakan kriptografi SHA-256 dengan salt rahasia sehingga tidak dapat dibaca dari Inspect Element.
                </span>
              </div>

              <div className="btnrow" style={{ flexDirection: 'column' }}>
                <button
                  type="submit"
                  className="main-btn"
                  disabled={loading}
                  style={{ background: 'var(--purple)', boxShadow: '0 6px 0 var(--purple-dark)' }}
                >
                  <KeyRound size={18} />
                  {loading ? 'Memverifikasi Sandi...' : 'Buka Dashboard Manajemen'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                  <Link
                    to="/"
                    style={{
                      fontSize: '0.9em',
                      color: 'var(--gray)',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <ArrowLeft size={16} />
                    <span>Kembali ke Halaman Mahasiswa</span>
                  </Link>
                </div>
              </div>
            </form>
          </div>
        ) : (
          /* ========================================================= */
          /* DASHBOARD PENUH HALAMAN TERPISAH                          */
          /* ========================================================= */
          <div className="game-card" style={{ padding: 'clamp(18px, 3.5vw, 32px)' }}>
            {/* Tab Navigasi Halaman */}
            <div className="dosen-tabs" style={{ marginBottom: '24px' }}>
              <button
                type="button"
                className={`dosen-tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
                onClick={() => setActiveTab('questions')}
              >
                <BookOpen size={18} />
                <span>Kelola Ruangan & Soal</span>
              </button>

              <button
                type="button"
                className={`dosen-tab-btn ${activeTab === 'results' ? 'active' : ''}`}
                onClick={() => setActiveTab('results')}
              >
                <Users size={18} />
                <span>Rekap Nilai Mahasiswa</span>
              </button>

              <button
                type="button"
                className={`dosen-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <Settings size={18} />
                <span>Pengaturan PIN & Keamanan</span>
              </button>
            </div>

            {/* Isi Konten Tab */}
            <div>
              {activeTab === 'questions' && (
                <QuestionManager rooms={rooms} onUpdateRooms={onUpdateRooms} />
              )}

              {activeTab === 'results' && (
                <ResultRecap />
              )}

              {activeTab === 'settings' && (
                <SettingsTab />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
