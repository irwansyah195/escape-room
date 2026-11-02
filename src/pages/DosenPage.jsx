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
  Gamepad2,
  Radio,
  Flame
} from 'lucide-react';
import QuestionManager from '../components/dosen/QuestionManager';
import RaceQuestionManager from '../components/dosen/RaceQuestionManager';
import ResultRecap from '../components/dosen/ResultRecap';
import SettingsTab from '../components/dosen/SettingsTab';
import ClassSessionTab from '../components/dosen/ClassSessionTab';
import SkyBackground from '../components/common/SkyBackground';
import { getDosenPinHash, getRoomsFromDb } from '../firebase/config';
import { verifyPin } from '../utils/crypto';
import { defaultRooms } from '../data/defaultRooms';
import {
  getPinLockoutStatus,
  recordFailedPinAttempt,
  resetPinRateLimit
} from '../utils/securityLimiter';

export default function DosenPage({ rooms, onUpdateRooms }) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('sessions'); // Default ke Sesi Kelas Multiplayer
  const [lockout, setLockout] = useState(() => getPinLockoutStatus());
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Pantau status fullscreen browser agar bisa fokus murni ke proyektor
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Periksa status login di sessionStorage (hanya aktif selama tab terbuka)
  useEffect(() => {
    const isAuth = sessionStorage.getItem('dosen_auth_session') === 'true';
    if (isAuth) {
      setIsAuthenticated(true);
    }
  }, []);

  // Timer countdown jika sedang lockout
  useEffect(() => {
    if (!lockout.isLocked) return;

    const timer = setInterval(() => {
      const current = getPinLockoutStatus();
      setLockout(current);
      if (!current.isLocked) {
        setError('');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lockout.isLocked]);

  const handleLogin = async (e) => {
    e.preventDefault();

    // 1. Cek apakah sedang dalam kondisi lockout
    const status = getPinLockoutStatus();
    if (status.isLocked) {
      setLockout(status);
      setError(`Akses terkunci sementara. Silakan tunggu ${Math.ceil(status.remainingSeconds / 60)} menit lagi.`);
      return;
    }

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
        resetPinRateLimit();
        setLockout(getPinLockoutStatus());
        sessionStorage.setItem('dosen_auth_session', 'true');
        setIsAuthenticated(true);
        setPinInput('');
      } else {
        const updatedStatus = recordFailedPinAttempt();
        setLockout(updatedStatus);
        if (updatedStatus.isLocked) {
          setError('Terlalu banyak percobaan salah! Akses terkunci selama 3 menit demi keamanan.');
        } else {
          setError(`Kata sandi salah. Sisa kesempatan: ${updatedStatus.attemptsLeft} kali sebelum terkunci.`);
        }
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

      <div
        className="wrap"
        style={{
          maxWidth: isAuthenticated ? '100%' : '520px',
          width: '100%',
          padding: isFullscreen ? '6px 12px' : (isAuthenticated ? '16px 28px' : '24px 16px'),
          boxSizing: 'border-box',
          transition: 'all 0.3s'
        }}
      >
        {/* Top Navbar Dosen (Sembunyikan saat mode proyektor fullscreen aktif) */}
        <header style={{
          display: isFullscreen ? 'none' : 'flex',
          background: 'rgba(15, 23, 42, 0.82)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 20px',
          marginBottom: '22px',
          border: '1px solid rgba(168, 85, 247, 0.35)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
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
              <div style={{ fontWeight: 800, fontSize: '1.15em', color: '#c084fc' }}>
                Portal Manajemen Dosen
              </div>
              <div style={{ fontSize: '0.82em', color: '#94a3b8' }}>
                Dunia Belajar Anak: Observasi Perkembangan
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
              <h2 style={{ margin: '0 0 6px', color: '#c084fc', fontSize: '1.5em' }}>
                Masuk ke Panel Dosen
              </h2>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.92em', lineHeight: 1.5 }}>
                Silakan masukkan kata sandi dosen untuk mengelola ruangan, mengedit soal, dan mengunduh rekap nilai.
              </p>
            </div>

            <form onSubmit={handleLogin}>
              {/* Alert jika terkunci (Lockout Brute Force) */}
              {lockout.isLocked ? (
                <div style={{
                  background: 'rgba(127, 29, 29, 0.75)',
                  border: '1px solid #ef4444',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px',
                  marginBottom: '18px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <AlertCircle size={24} color="#fca5a5" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 800, color: '#fecaca', fontSize: '1.02em', marginBottom: '4px' }}>
                      Akses Terkunci Sementara (Anti Brute-Force)
                    </div>
                    <div style={{ fontSize: '0.88em', color: '#fca5a5', lineHeight: 1.5 }}>
                      Terlalu banyak percobaan sandi yang salah. Untuk melindungi data dosen & database, sistem dikunci selama:
                    </div>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '8px',
                      background: 'rgba(15, 23, 42, 0.85)',
                      border: '1px solid #ef4444',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '1.15em',
                      color: '#fca5a5'
                    }}>
                      ⏱️ {Math.floor(lockout.remainingSeconds / 60)}:{(lockout.remainingSeconds % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="form-group">
                <label className="form-label" htmlFor="dosen-page-pin">
                  Kata Sandi / PIN Dosen
                </label>
                <input
                  id="dosen-page-pin"
                  type="password"
                  className="form-input"
                  placeholder={lockout.isLocked ? "Terkunci sementara..." : "Masukkan kata sandi dosen..."}
                  value={pinInput}
                  onChange={(e) => { setPinInput(e.target.value); setError(''); }}
                  disabled={loading || lockout.isLocked}
                  autoFocus={!lockout.isLocked}
                />
              </div>

              {error && !lockout.isLocked && (
                <div className="feedback-box no" style={{ marginBottom: '16px' }}>
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <div style={{
                background: 'rgba(30, 41, 59, 0.65)',
                border: '1px solid rgba(148, 163, 184, 0.25)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                fontSize: '0.84em',
                color: '#cbd5e1',
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} color="var(--green)" style={{ flexShrink: 0 }} />
                  <span>
                    <b>Proteksi Kriptografi:</b> Sandi diverifikasi via salted SHA-256 (kebal Inspect Element).
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lock size={16} color="var(--purple)" style={{ flexShrink: 0 }} />
                  <span>
                    <b>Proteksi Brute-Force:</b> Maksimal 5x percobaan salah. Jika melebihi batas, akses terkunci otomatis selama 3 menit.
                  </span>
                </div>
              </div>

              <div className="btnrow" style={{ flexDirection: 'column' }}>
                <button
                  type="submit"
                  className="main-btn"
                  disabled={loading || lockout.isLocked}
                  style={{
                    background: lockout.isLocked ? '#94a3b8' : 'var(--purple)',
                    boxShadow: lockout.isLocked ? 'none' : '0 6px 0 var(--purple-dark)',
                    cursor: lockout.isLocked ? 'not-allowed' : 'pointer'
                  }}
                >
                  <KeyRound size={18} />
                  {loading
                    ? 'Memverifikasi Sandi...'
                    : lockout.isLocked
                    ? `Akses Terkunci (${Math.floor(lockout.remainingSeconds / 60)}:${(lockout.remainingSeconds % 60).toString().padStart(2, '0')})`
                    : 'Buka Dashboard Manajemen'}
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
          <div
            className="game-card"
            style={{
              padding: isFullscreen ? '0' : 'clamp(18px, 3.5vw, 32px)',
              minHeight: isFullscreen ? '100vh' : '75vh',
              overflow: 'visible',
              background: isFullscreen ? 'transparent' : undefined,
              border: isFullscreen ? 'none' : undefined,
              boxShadow: isFullscreen ? 'none' : undefined
            }}
          >
            {/* Tab Navigasi Halaman (Sembunyikan saat mode proyektor fullscreen aktif) */}
            <div className="dosen-tabs" style={{ display: isFullscreen ? 'none' : 'flex', marginBottom: '24px' }}>
              <button
                type="button"
                className={`dosen-tab-btn ${activeTab === 'sessions' ? 'active' : ''}`}
                onClick={() => setActiveTab('sessions')}
                style={{
                  background: activeTab === 'sessions' ? 'var(--purple)' : undefined,
                  color: activeTab === 'sessions' ? 'white' : undefined
                }}
              >
                <Radio size={18} />
                <span>Sesi Kelas Multiplayer</span>
              </button>

              <button
                type="button"
                className={`dosen-tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
                onClick={() => setActiveTab('questions')}
              >
                <BookOpen size={18} />
                <span>Kelola Ruangan Eksplorasi</span>
              </button>

              <button
                type="button"
                className={`dosen-tab-btn ${activeTab === 'race_questions' ? 'active' : ''}`}
                onClick={() => setActiveTab('race_questions')}
                style={{
                  background: activeTab === 'race_questions' ? 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' : undefined,
                  color: activeTab === 'race_questions' ? 'white' : undefined
                }}
              >
                <Flame size={18} />
                <span>Bank Soal Balap (Quiz Race)</span>
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
              {activeTab === 'sessions' && (
                <ClassSessionTab rooms={rooms} />
              )}

              {activeTab === 'questions' && (
                <QuestionManager rooms={rooms} onUpdateRooms={onUpdateRooms} />
              )}

              {activeTab === 'race_questions' && (
                <RaceQuestionManager />
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
