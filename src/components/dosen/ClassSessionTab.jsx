import React, { useState, useEffect } from 'react';
import {
  Radio,
  Gamepad2,
  Trophy,
  Users,
  Copy,
  CheckCircle2,
  Sparkles,
  Zap,
  Play,
  Square,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Flame,
  Award,
  Medal,
  Clock,
  Maximize2,
  Minimize2,
  X,
  UserMinus
} from 'lucide-react';
import {
  generateSessionPin,
  createClassSession,
  closeClassSession,
  getSavedClassSession,
  subscribeToSessionPlayers,
  subscribeToSessionStatus,
  startClassSession,
  finishClassSession,
  kickPlayer
} from '../../utils/sessionSync';
import { getStoredRaceQuestions, defaultRaceQuestions } from '../../data/defaultRaceQuestions';
import { saveStudentResult } from '../../supabase/db';
import PhaserCanvas from '../game/PhaserCanvas';
import PodiumModal from '../game/PodiumModal';

export default function ClassSessionTab({ rooms }) {
  const [activeSession, setActiveSession] = useState(() => getSavedClassSession());
  const [selectedMode, setSelectedMode] = useState('quiz_race'); // Default ke Quiz Race sesuai permintaan pengguna
  const [sessionTitle, setSessionTitle] = useState('Sesi Perkuliahan Observasi Anak');
  const [copied, setCopied] = useState(false);
  const [connectedPlayers, setConnectedPlayers] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [showPodium, setShowPodium] = useState(false);
  const [timePerQuestion, setTimePerQuestion] = useState(30);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Pantau status fullscreen browser
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn("Gagal mengaktifkan mode fullscreen:", err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Subscribe ke data mahasiswa real-time saat sesi aktif
  useEffect(() => {
    if (!activeSession || activeSession.status === 'closed') {
      setConnectedPlayers({});
      return;
    }

    const unsubPlayers = subscribeToSessionPlayers(activeSession.pin, (players) => {
      setConnectedPlayers(players || {});
    });

    const unsubStatus = subscribeToSessionStatus(activeSession.pin, (session) => {
      if (session) {
        setActiveSession(session);
        if (session.status === 'finished') {
          setShowPodium(true);
        }
      }
    });

    return () => {
      unsubPlayers();
      unsubStatus();
    };
  }, [activeSession?.pin]);

  const handleStartSession = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const pin = generateSessionPin();
      let raceQs = selectedMode === 'quiz_race' ? getStoredRaceQuestions() : null;
      if (selectedMode === 'quiz_race' && (!raceQs || raceQs.length === 0)) {
        raceQs = defaultRaceQuestions;
      }
      if (Array.isArray(raceQs)) {
        raceQs = raceQs.map(q => ({ ...q, timeLimit: timePerQuestion }));
      }
      const session = await createClassSession({
        pin,
        mode: selectedMode,
        title: sessionTitle,
        timePerQuestion,
        raceQuestions: raceQs
      });

      setActiveSession(session);
    } catch (err) {
      console.error("Gagal membuat sesi:", err);
      alert("Gagal membuat sesi: " + (err.message || err));
    } finally {
      setIsCreating(false);
    }
  };

  // Dosen menekan tombol "Mulai Pertandingan" untuk trigger 3-2-1 GO! serentak
  const handleLaunchGame = async () => {
    if (!activeSession) return;
    setIsStarting(true);
    try {
      await startClassSession(activeSession.pin);
      setActiveSession(prev => ({ ...prev, status: 'starting' }));
    } catch (err) {
      console.error("Gagal memulai pertandingan:", err);
      alert("Gagal memulai pertandingan: " + err.message);
    } finally {
      setIsStarting(false);
    }
  };

  // Otomatis simpan rekap nilai seluruh pemain yang ikut sesi ini ke database
  const archiveSessionResults = async (pin, playersObj) => {
    try {
      const playersList = Object.values(playersObj || {});
      for (const p of playersList) {
        if (!p.name && !p.nim) continue;
        await saveStudentResult({
          nama: p.name,
          name: p.name,
          nim: p.nim || '-',
          score: typeof p.score === 'number' ? p.score : 0,
          correct: typeof p.solvedCount === 'number' ? p.solvedCount : 0,
          totalCorrect: typeof p.solvedCount === 'number' ? p.solvedCount : 0,
          totalLocks: p.totalQuestions || 20,
          totalQuestions: p.totalQuestions || 20,
          sessionMode: activeSession?.mode || 'quiz_race',
          sessionPin: pin,
          answers: p.answersRecord || [],
          answersRecord: p.answersRecord || [],
          timestamp: new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn("Gagal mengarsipkan hasil sesi ke rekap nilai:", e);
    }
  };

  // Dosen mengakhiri balapan dan menampilkan podium
  const handleFinishRaceGame = async () => {
    if (!activeSession) return;
    if (window.confirm("Akhiri pertandingan sekarang dan tampilkan Podium Juara?")) {
      await finishClassSession(activeSession.pin);
      await archiveSessionResults(activeSession.pin, connectedPlayers);
      setActiveSession(prev => ({ ...prev, status: 'finished' }));
      setShowPodium(true);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;
    if (window.confirm("Yakin ingin menutup sesi kelas ini? Sesi akan diarsipkan dan koneksi pemain dihentikan.")) {
      await archiveSessionResults(activeSession.pin, connectedPlayers);
      await closeClassSession(activeSession.pin);
      setActiveSession(null);
      setConnectedPlayers({});
    }
  };

  const handleKickPlayer = async (uid, name) => {
    if (!activeSession?.pin || !uid) return;
    if (window.confirm(`Keluarkan mahasiswa "${name || 'ini'}" dari ruang tunggu?`)) {
      await kickPlayer(activeSession.pin, uid);
      setConnectedPlayers(prev => {
        const next = { ...prev };
        delete next[uid];
        return next;
      });
    }
  };

  const handleCopyPin = () => {
    if (!activeSession) return;
    navigator.clipboard.writeText(activeSession.pin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const playersList = Object.values(connectedPlayers);

  // Urutkan peringkat live untuk leaderboard
  const sortedLeaderboard = [...playersList].sort((a, b) => {
    if (a.isFinished && b.isFinished) {
      return (a.finishRank || 99) - (b.finishRank || 99);
    }
    if (a.isFinished) return -1;
    if (b.isFinished) return 1;
    const progressA = a.progressIdx || a.solvedCount || 0;
    const progressB = b.progressIdx || b.solvedCount || 0;
    if (progressB !== progressA) {
      return progressB - progressA;
    }
    return (b.score || 0) - (a.score || 0);
  });

  const isRaceMode = activeSession?.mode === 'quiz_race';
  const totalQuestions = isRaceMode
    ? (activeSession?.raceQuestions?.length || getStoredRaceQuestions().length || 5)
    : (rooms.reduce((acc, r) => acc + (r.locks || []).length, 0) || 5);
  const isWaiting = activeSession?.status === 'waiting';
  const isLive = activeSession?.status === 'starting' || activeSession?.status === 'in_progress';

  return (
    <div>
      {/* Modal Podium Juara */}
      {showPodium && (
        <PodiumModal
          players={connectedPlayers}
          onClose={() => setShowPodium(false)}
          isDosen={true}
        />
      )}

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 6px', color: '#c084fc', fontSize: '1.35em', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Radio size={24} color="var(--purple)" />
          <span>Sesi Kelas Real-Time & Live Sprint Race</span>
        </h3>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.92em', lineHeight: 1.5 }}>
          Buka ruang kelas bersama ala ZEP Quiz Race. Mahasiswa berkumpul di lobi ruang tunggu, lalu Dosen memulai pertandingan serentak (3-2-1 GO!) dengan pemantauan visual live di layar proyektor.
        </p>
      </div>

      {!activeSession || activeSession.status === 'closed' ? (
        /* ======================================================== */
        /* FORM MEMBUAT SESI BARU                                   */
        /* ======================================================== */
        <div style={{
          background: 'rgba(30, 41, 59, 0.75)',
          border: '1px solid rgba(148, 163, 184, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }}>
          <h4 style={{ margin: '0 0 16px', color: '#f8fafc', fontSize: '1.15em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="var(--purple)" />
            <span>Konfigurasi Sesi Kelas Baru</span>
          </h4>

          <form onSubmit={handleStartSession}>
            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label className="form-label">Judul Sesi / Mata Kuliah</label>
              <input
                type="text"
                className="form-input"
                placeholder="Contoh: Kelas B - Praktikum Observasi Anak Usia Dini"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                required
              />
            </div>

            {/* Pemilihan Mode Game */}
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ marginBottom: '10px' }}>
                Pilih Mode Permainan
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {/* Mode 1: Quiz Race (Rekomendasi Utama) */}
                <div
                  onClick={() => setSelectedMode('quiz_race')}
                  style={{
                    border: `2px solid ${selectedMode === 'quiz_race' ? '#f59e0b' : 'rgba(148, 163, 184, 0.25)'}`,
                    background: selectedMode === 'quiz_race' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                    borderRadius: '16px',
                    padding: '18px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      <Flame size={24} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.05em', color: '#fbbf24' }}>
                        Mode 1: Quiz Sprint Race (Rekomendasi)
                      </div>
                      <div style={{ fontSize: '0.8em', color: '#94a3b8' }}>
                        Start Serentak • Answer to Sprint • Live Spectator
                      </div>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85em', color: '#cbd5e1', lineHeight: 1.5 }}>
                    Mahasiswa berkumpul di lobi, mulai serentak dengan hitung mundur 3-2-1 GO!. Menjawab benar memacu mobil melesat ke garis finish. Dosen memantau posisi live di proyektor kelas!
                  </p>
                  {selectedMode === 'quiz_race' && (
                    <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                      <CheckCircle2 size={20} color="#f59e0b" />
                    </div>
                  )}
                </div>

                {/* Mode 2: Escape Room 2D */}
                <div
                  onClick={() => setSelectedMode('escape_room')}
                  style={{
                    border: `2px solid ${selectedMode === 'escape_room' ? 'var(--purple)' : 'rgba(148, 163, 184, 0.25)'}`,
                    background: selectedMode === 'escape_room' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                    borderRadius: '16px',
                    padding: '18px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'var(--purple)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      <Gamepad2 size={24} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.05em', color: '#c084fc' }}>
                        Mode 2: Escape Room 2D
                      </div>
                      <div style={{ fontSize: '0.8em', color: '#94a3b8' }}>
                        Eksplorasi Ruangan & Stasiun Gembok
                      </div>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85em', color: '#cbd5e1', lineHeight: 1.5 }}>
                    Mahasiswa mengontrol avatar 2D menjelajahi ruangan tematik, mencari stasiun gembok, dan memecahkan teka-teki studi kasus observasi.
                  </p>
                  {selectedMode === 'escape_room' && (
                    <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                      <CheckCircle2 size={20} color="var(--purple)" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pengaturan Timer per Soal (Khusus Quiz Sprint Race) */}
            {selectedMode === 'quiz_race' && (
              <div className="form-group" style={{
                marginBottom: '24px',
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '16px',
                padding: '16px 20px'
              }}>
                <label className="form-label" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '10px',
                  color: '#fbbf24',
                  fontWeight: 700,
                  fontSize: '1em'
                }}>
                  <Clock size={20} color="#f59e0b" />
                  <span>Durasi Waktu Per Soal (Timer)</span>
                </label>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      min="5"
                      max="300"
                      value={timePerQuestion}
                      onChange={(e) => setTimePerQuestion(Math.max(5, parseInt(e.target.value) || 0))}
                      className="form-input"
                      style={{
                        width: '110px',
                        fontWeight: 900,
                        textAlign: 'center',
                        fontSize: '1.2em',
                        color: '#fbbf24',
                        borderColor: 'rgba(245, 158, 11, 0.5)',
                        background: 'rgba(15, 23, 42, 0.8)'
                      }}
                    />
                    <span style={{ color: '#cbd5e1', fontWeight: 600 }}>detik / soal</span>
                  </div>

                  {/* Preset Pilihan Cepat */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.82em', color: '#94a3b8' }}>Preset cepat:</span>
                    {[15, 30, 45, 60].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setTimePerQuestion(sec)}
                        style={{
                          background: timePerQuestion === sec ? '#f59e0b' : 'rgba(30, 41, 59, 0.8)',
                          color: timePerQuestion === sec ? '#0f172a' : '#cbd5e1',
                          border: `1px solid ${timePerQuestion === sec ? '#f59e0b' : 'rgba(148, 163, 184, 0.25)'}`,
                          borderRadius: '10px',
                          padding: '6px 14px',
                          fontSize: '0.88em',
                          fontWeight: 800,
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ fontSize: '0.82em', color: '#94a3b8', marginTop: '10px', lineHeight: 1.4 }}>
                  ℹ️ Tiap pos soal memiliki waktu mundur animasi. Jika waktu habis sebelum mahasiswa menjawab benar, sistem memberikan penalti dan otomatis melanjutkan mahasiswa ke pos berikutnya.
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={isCreating}
                style={{
                  background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '12px 28px',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '1em',
                  cursor: isCreating ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)'
                }}
              >
                <Play size={20} />
                <span>{isCreating ? 'Mempersiapkan Sesi...' : '🚀 Buka Sesi Kelas & Buat PIN'}</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ======================================================== */
        /* MONITORING SESI AKTIF                                    */
        /* ======================================================== */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Card PIN Sesi Utama (Otomatis disembunyikan saat mode proyektor fullscreen agar fokus penuh ke sirkuit & papan peringkat) */}
          {!(isFullscreen && isLive) && (
            <div style={{
              background: isRaceMode
                ? 'linear-gradient(135deg, #b45309 0%, #d97706 40%, #7c3aed 100%)'
                : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)',
              borderRadius: '24px',
              padding: '24px 28px',
              color: 'white',
              boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.82em', fontWeight: 800, marginBottom: '8px' }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: isWaiting ? '#facc15' : '#4ade80',
                    display: 'inline-block',
                    animation: 'pulse 1.5s infinite'
                  }} />
                  <span>STATUS: {isWaiting ? 'LOBBY RUANG TUNGGU' : '🏁 PERTANDINGAN BERLANGSUNG'}</span>
                  <span>•</span>
                  <span>{isRaceMode ? '🏎️ Quiz Sprint Race' : '🎮 Escape Room 2D'}</span>
                </div>
                <h2 style={{ margin: '0 0 4px', fontSize: '1.45em' }}>{activeSession.title}</h2>
                <div style={{ fontSize: '0.9em', opacity: 0.9 }}>
                  Bagikan kode PIN di bawah ini kepada seluruh mahasiswa untuk masuk ke ruang tunggu.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <div style={{
                  background: 'white',
                  color: '#1e1b4b',
                  padding: '10px 22px',
                  borderRadius: '16px',
                  fontSize: '2em',
                  fontWeight: 900,
                  letterSpacing: '4px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                }}>
                  {activeSession.pin}
                </div>

                <button
                  type="button"
                  onClick={handleCopyPin}
                  style={{
                    background: 'rgba(255,255,255,0.25)',
                    border: '1px solid rgba(255,255,255,0.4)',
                    color: 'white',
                    borderRadius: '12px',
                    padding: '12px 18px',
                    fontWeight: 700,
                    fontSize: '0.9em',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {copied ? <CheckCircle2 size={18} color="#4ade80" /> : <Copy size={18} />}
                  <span>{copied ? 'Tersalin!' : 'Salin PIN'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleEndSession}
                  style={{
                    background: 'rgba(239, 68, 68, 0.85)',
                    border: 'none',
                    color: 'white',
                    borderRadius: '12px',
                    padding: '12px 18px',
                    fontWeight: 700,
                    fontSize: '0.9em',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Square size={16} />
                  <span>Tutup Sesi</span>
                </button>
              </div>
            </div>
          )}

          {/* BANNER KONTROL START PERTANDINGAN (Saat Status Waiting / Lobi) */}
          {isWaiting && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(239, 68, 68, 0.25) 100%)',
              border: '2px solid rgba(245, 158, 11, 0.5)',
              borderRadius: '20px',
              padding: '24px 28px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px',
              boxShadow: '0 8px 30px rgba(245, 158, 11, 0.25)'
            }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#fbbf24', fontWeight: 800, fontSize: '0.95em', marginBottom: '6px' }}>
                  <Users size={20} />
                  <span>{playersList.length} Mahasiswa Sudah Masuk di Ruang Tunggu</span>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.35em', color: '#f8fafc' }}>
                  Semua mahasiswa sudah berkumpul di lobi?
                </h3>
                <p style={{ margin: '4px 0 0', color: '#cbd5e1', fontSize: '0.9em' }}>
                  Tekan tombol di sebelah kanan untuk memulai hitung mundur <b>3... 2... 1... GO!</b> serentak di layar seluruh mahasiswa!
                </p>
              </div>

              <button
                type="button"
                onClick={handleLaunchGame}
                disabled={isStarting}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                  border: 'none',
                  color: 'white',
                  borderRadius: '16px',
                  padding: '16px 36px',
                  fontSize: '1.2em',
                  fontWeight: 900,
                  cursor: isStarting ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 8px 30px rgba(239, 68, 68, 0.5)',
                  transform: 'scale(1.02)',
                  transition: 'transform 0.2s'
                }}
              >
                <Flame size={26} />
                <span>{isStarting ? 'Memulai Hitung Mundur...' : '🚀 MULAI PERTANDINGAN (GO!)'}</span>
              </button>
            </div>
          )}

          {/* DUAL VIEW KETIKA PERTANDINGAN LIVE (SPECTATOR TRACK + LEADERBOARD) */}
          {isLive && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Bar Navigasi & Aksi Balapan Live */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                background: 'rgba(15, 23, 42, 0.85)',
                padding: '14px 20px',
                borderRadius: '16px',
                border: '1px solid rgba(56, 189, 248, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Flame size={22} color="#38bdf8" />
                    <span style={{ fontWeight: 800, color: '#f8fafc', fontSize: '1.05em' }}>
                      📺 Layar Spektator Proyektor Kelas Live
                    </span>
                  </div>
                  <span style={{
                    background: 'rgba(56, 189, 248, 0.2)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    color: '#38bdf8',
                    padding: '3px 10px',
                    borderRadius: '8px',
                    fontWeight: 900,
                    letterSpacing: '2px',
                    fontSize: '0.9em'
                  }}>
                    PIN: {activeSession.pin}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    style={{
                      background: isFullscreen ? 'rgba(56, 189, 248, 0.35)' : 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(56, 189, 248, 0.5)',
                      color: '#38bdf8',
                      padding: '8px 16px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: 800,
                      fontSize: '0.88em',
                      boxShadow: isFullscreen ? '0 0 12px rgba(56, 189, 248, 0.4)' : undefined
                    }}
                    title="Fokus Layar Penuh Proyektor"
                  >
                    {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    <span>{isFullscreen ? 'Keluar Fullscreen' : '🖥️ Layar Penuh (Fullscreen)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPodium(true)}
                    style={{
                      background: 'rgba(234, 179, 8, 0.2)',
                      border: '1px solid rgba(234, 179, 8, 0.4)',
                      color: '#facc15',
                      padding: '8px 16px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: 800,
                      fontSize: '0.88em'
                    }}
                  >
                    <Trophy size={16} />
                    <span>Lihat Podium Juara 🏆</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFinishRaceGame}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: 'none',
                      color: 'white',
                      padding: '8px 18px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: 800,
                      fontSize: '0.88em'
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>🏁 Akhiri Balapan & Kunci Nilai</span>
                  </button>
                </div>
              </div>

              {/* 1. VISUAL CANVAS SPEKTATOR SPRINT TRACK */}
              {isRaceMode && (
                <div style={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
                }}>
                  <PhaserCanvas
                    mode="quiz_race"
                    rooms={rooms}
                    currentRoomIdx={0}
                    solvedLocks={[]}
                    isSpectator={true}
                    sessionPin={activeSession.pin}
                    totalQuestions={totalQuestions}
                  />
                </div>
              )}

              {/* 2. TABEL LIVE LEADERBOARD RANKING */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.85)',
                border: '1px solid rgba(148, 163, 184, 0.25)',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Trophy size={20} color="#facc15" />
                    <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '1.15em' }}>
                      Papan Peringkat Real-Time ({playersList.length} Pembalap)
                    </h4>
                  </div>
                  <div style={{ fontSize: '0.82em', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', animation: 'pulse 1s infinite' }} />
                    <span>Live Updates (Auto-Rank)</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {sortedLeaderboard.map((player, idx) => {
                    const isTop1 = idx === 0 && (player.progressIdx || 0) > 0;
                    const progressCount = player.progressIdx || player.solvedCount || 0;
                    const progressPercent = Math.min(100, Math.round((progressCount / totalQuestions) * 100));

                    return (
                      <div
                        key={player.uid || idx}
                        style={{
                          background: isTop1
                            ? 'linear-gradient(90deg, rgba(234, 179, 8, 0.2) 0%, rgba(30, 41, 59, 0.7) 100%)'
                            : 'rgba(15, 23, 42, 0.7)',
                          border: `1px solid ${isTop1 ? 'rgba(234, 179, 8, 0.5)' : 'rgba(148, 163, 184, 0.2)'}`,
                          borderRadius: '14px',
                          padding: '14px 18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '16px',
                          flexWrap: 'wrap'
                        }}
                      >
                        {/* Peringkat & Identitas */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '220px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: idx === 0 ? '#facc15' : idx === 1 ? '#94a3b8' : idx === 2 ? '#d97706' : 'rgba(255,255,255,0.1)',
                            color: idx === 0 ? '#713f12' : idx < 3 ? 'white' : '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 900,
                            fontSize: '0.9em'
                          }}>
                            {idx + 1}
                          </div>

                          <div style={{ fontSize: '1.6em' }}>
                            {player.characterType === 'kart' ? '🏎️' : '🏃'}
                          </div>

                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.95em', color: '#f8fafc' }}>
                              {player.name}
                            </div>
                            <div style={{ fontSize: '0.78em', color: '#94a3b8' }}>
                              NIM: {player.nim}
                            </div>
                          </div>
                        </div>

                        {/* Bar Progres Soal */}
                        <div style={{ flex: 1, minWidth: '180px', maxWidth: '300px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78em', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                            <span>Pos Soal: {progressCount} / {totalQuestions}</span>
                            <span>{progressPercent}%</span>
                          </div>
                          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${progressPercent}%`,
                              height: '100%',
                              background: player.isFinished
                                ? 'linear-gradient(90deg, #10b981 0%, #4ade80 100%)'
                                : 'linear-gradient(90deg, #38bdf8 0%, #a855f7 100%)',
                              borderRadius: '4px',
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                        </div>

                        {/* Skor & Status Finish */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 900, color: '#c084fc', fontSize: '1.05em' }}>
                              {Math.round(player.score || 0)} Poin
                            </div>
                          </div>

                          <div style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '0.78em',
                            fontWeight: 800,
                            background: player.isFinished ? 'rgba(34, 197, 94, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                            border: `1px solid ${player.isFinished ? 'rgba(34, 197, 94, 0.4)' : 'rgba(56, 189, 248, 0.4)'}`,
                            color: player.isFinished ? '#4ade80' : '#38bdf8'
                          }}>
                            {player.isFinished ? `🏁 FINISH #${player.finishRank || '1'}` : '🏎️ RACING'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* DAFTAR MAHASISWA KETIKA STATUS WAITING (RUANG TUNGGU) */}
          {isWaiting && (
            <div style={{
              background: 'rgba(30, 41, 59, 0.75)',
              border: '1px solid rgba(148, 163, 184, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={20} color="var(--purple)" />
                  <h4 style={{ margin: 0, color: '#c084fc', fontSize: '1.1em' }}>
                    Mahasiswa di Ruang Tunggu ({playersList.length} orang)
                  </h4>
                </div>
                <div style={{ fontSize: '0.85em', color: '#94a3b8' }}>
                  Sinkronisasi otomatis real-time
                </div>
              </div>

              {playersList.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px dashed rgba(148, 163, 184, 0.25)',
                  borderRadius: '12px',
                  color: '#94a3b8'
                }}>
                  <Sparkles size={32} color="var(--purple)" style={{ marginBottom: '8px', opacity: 0.8 }} />
                  <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#f8fafc' }}>Menunggu Mahasiswa Masuk ke Ruang Tunggu...</p>
                  <span style={{ fontSize: '0.85em' }}>
                    Minta mahasiswa memasukkan kode PIN <b>{activeSession.pin}</b> di halaman depan permainan.
                  </span>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                  {playersList.map((player, idx) => (
                    <div
                      key={player.uid || player.sessionId || player.nim || idx}
                      style={{
                        background: 'rgba(15, 23, 42, 0.65)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: player.characterType === 'kart' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.4em'
                      }}>
                        {player.characterType === 'kart' ? '🏎️' : '🏃'}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.92em', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {player.name}
                        </div>
                        <div style={{ fontSize: '0.78em', color: '#94a3b8' }}>
                          NIM: {player.nim}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '0.78em', fontWeight: 700, color: '#4ade80' }}>
                          <span>✅ Siap di Garis Start</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleKickPlayer(player.uid || player.sessionId, player.name)}
                        title="Keluarkan mahasiswa ini dari ruang tunggu"
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.35)',
                          color: '#fca5a5',
                          borderRadius: '8px',
                          padding: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'all 0.2s'
                        }}
                      >
                        <UserMinus size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
