import React, { useState, useEffect } from 'react';
import { Users, Sparkles, Flame, Gamepad2, LogOut, Radio, ShieldCheck, CheckCircle2 } from 'lucide-react';
import {
  subscribeToSessionPlayers,
  subscribeToSessionStatus,
  updatePlayerProgress,
  leaveClassSession
} from '../../utils/sessionSync';

const KART_OPTIONS = [
  { type: 'kart', color: 'blue', label: 'Speed Blue', emoji: '🏎️', border: '#38bdf8', bg: 'rgba(56, 189, 248, 0.25)' },
  { type: 'kart', color: 'red', label: 'Turbo Red', emoji: '🚗', border: '#f87171', bg: 'rgba(239, 68, 68, 0.25)' },
  { type: 'kart', color: 'yellow', label: 'Gold Thunder', emoji: '🚕', border: '#fde047', bg: 'rgba(250, 204, 21, 0.25)' },
  { type: 'kart', color: 'green', label: 'Green Hornet', emoji: '🚙', border: '#4ade80', bg: 'rgba(34, 197, 94, 0.25)' },
  { type: 'kart', color: 'purple', label: 'Hyper Violet', emoji: '🏎️', border: '#c084fc', bg: 'rgba(168, 85, 247, 0.25)' }
];

const RUNNER_OPTIONS = [
  { type: 'runner', color: 'blue', label: 'Peneliti Biru', emoji: '🏃‍♂️', border: '#38bdf8', bg: 'rgba(56, 189, 248, 0.25)' },
  { type: 'runner', color: 'red', label: 'Peneliti Merah', emoji: '🏃‍♀️', border: '#f87171', bg: 'rgba(239, 68, 68, 0.25)' },
  { type: 'runner', color: 'green', label: 'Peneliti Hijau', emoji: '🏃', border: '#4ade80', bg: 'rgba(34, 197, 94, 0.25)' },
  { type: 'runner', color: 'yellow', label: 'Peneliti Emas', emoji: '🧗', border: '#fde047', bg: 'rgba(250, 204, 21, 0.25)' },
  { type: 'runner', color: 'purple', label: 'Peneliti Ungu', emoji: '🧑‍🔬', border: '#c084fc', bg: 'rgba(168, 85, 247, 0.25)' }
];

export default function WaitingLobby({ student, onUpdateStudent, onCountdownComplete, onLeave }) {
  const [players, setPlayers] = useState({});
  const [countdown, setCountdown] = useState(null); // null | 3 | 2 | 1 | 'GO!'
  const [sessionInfo, setSessionInfo] = useState(null);

  const pin = student?.sessionPin;
  const isRaceMode = student?.sessionMode === 'quiz_race';

  // State lokal reaktif untuk kendaraan/karakter agar respons seketika
  const [selectedType, setSelectedType] = useState(() => student?.characterType || (isRaceMode ? 'kart' : 'runner'));
  const [selectedColor, setSelectedColor] = useState(() => student?.characterColor || 'blue');

  const optionsList = isRaceMode ? KART_OPTIONS : RUNNER_OPTIONS;
  const currentOption = optionsList.find(
    o => o.color === selectedColor && o.type === selectedType
  ) || optionsList[0];

  const handleSelectCharacter = (opt) => {
    setSelectedType(opt.type);
    setSelectedColor(opt.color);
    if (onUpdateStudent) {
      onUpdateStudent({ characterType: opt.type, characterColor: opt.color });
    }
    if (pin && student?.sessionId) {
      updatePlayerProgress(pin, student.sessionId, {
        characterType: opt.type,
        characterColor: opt.color
      });
    }
  };

  // Berlangganan data pemain yang masuk ke lobi
  useEffect(() => {
    if (!pin) return;

    const unsubPlayers = subscribeToSessionPlayers(pin, (allPlayers) => {
      setPlayers(allPlayers || {});
    });

    const unsubStatus = subscribeToSessionStatus(pin, (session) => {
      setSessionInfo(session);

      if (session?.status === 'starting' && countdown === null) {
        startLocalCountdown(session.countdownStart);
      } else if (session?.status === 'in_progress') {
        if (onCountdownComplete) onCountdownComplete();
      }
    });

    return () => {
      unsubPlayers();
      unsubStatus();
    };
  }, [pin, countdown]);

  // Efek Heartbeat berkala & Pembersihan saat browser / tab ditutup
  useEffect(() => {
    if (!pin || !student?.sessionId) return;

    // Heartbeat berkala setiap 3 detik agar Dosen tahu mahasiswa masih aktif di lobi
    const heartbeatTimer = setInterval(() => {
      updatePlayerProgress(pin, student.sessionId, {
        name: student.name,
        nim: student.nim,
        characterType: selectedType,
        characterColor: selectedColor,
        lastSeen: Date.now()
      });
    }, 3000);

    const handleBeforeUnload = () => {
      leaveClassSession(pin, student.sessionId);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      clearInterval(heartbeatTimer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, [pin, student?.sessionId, student?.name, student?.nim, selectedType, selectedColor]);

  // Efek Countdown 3-2-1 GO!
  const startLocalCountdown = (serverStartTime) => {
    const totalDuration = 3200;
    const elapsed = Date.now() - (serverStartTime || Date.now());
    const remaining = Math.max(0, totalDuration - elapsed);

    setCountdown(3);

    const t2 = setTimeout(() => setCountdown(2), Math.max(100, remaining - 2200));
    const t1 = setTimeout(() => setCountdown(1), Math.max(200, remaining - 1200));
    const tGo = setTimeout(() => setCountdown('GO!'), Math.max(300, remaining - 200));
    const tFinish = setTimeout(() => {
      setCountdown(null);
      if (onCountdownComplete) onCountdownComplete();
    }, remaining + 300);

    return () => {
      clearTimeout(t2);
      clearTimeout(t1);
      clearTimeout(tGo);
      clearTimeout(tFinish);
    };
  };

  const playersList = Object.values(players);

  return (
    <div style={{
      maxWidth: '920px',
      margin: '0 auto',
      position: 'relative'
    }}>
      {/* OVERLAY COUNTDOWN 3-2-1 GO! */}
      {countdown !== null && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 8, 22, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            fontSize: countdown === 'GO!' ? '6.5em' : '8em',
            fontWeight: 900,
            letterSpacing: '4px',
            color: countdown === 'GO!' ? '#22c55e' : countdown === 1 ? '#38bdf8' : countdown === 2 ? '#facc15' : '#f43f5e',
            textShadow: '0 0 40px currentColor, 0 0 80px currentColor',
            transform: 'scale(1.1)',
            animation: 'pulse 0.5s infinite alternate'
          }}>
            {countdown}
          </div>
          <div style={{
            fontSize: '1.4em',
            fontWeight: 800,
            color: '#f8fafc',
            marginTop: '20px',
            letterSpacing: '2px',
            textTransform: 'uppercase'
          }}>
            {countdown === 'GO!' ? '🏁 PERTANDINGAN DIMULAI! 🏁' : 'Bersiap di Garis Start...'}
          </div>
        </div>
      )}

      {/* CARD UTAMA RUANG TUNGGU */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(168, 85, 247, 0.35)',
        borderRadius: '24px',
        padding: '30px',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)',
        color: '#f8fafc'
      }}>
        {/* Header Lobi */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
          paddingBottom: '20px',
          marginBottom: '24px'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: isRaceMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(168, 85, 247, 0.2)',
              border: `1px solid ${isRaceMode ? 'rgba(245, 158, 11, 0.4)' : 'rgba(168, 85, 247, 0.4)'}`,
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.85em',
              fontWeight: 800,
              color: isRaceMode ? '#fbbf24' : '#c084fc',
              marginBottom: '8px'
            }}>
              {isRaceMode ? <Flame size={16} /> : <Gamepad2 size={16} />}
              <span>{isRaceMode ? 'QUIZ SPRINT RACE (BALAP KUIS)' : 'ESCAPE ROOM 2D'}</span>
              <span>•</span>
              <span style={{ color: '#4ade80' }}>LOBBY RUANG TUNGGU</span>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.5em', color: '#f8fafc' }}>
              {student.sessionTitle || 'Sesi Kelas Bermain Anak'}
            </h2>
            <div style={{ fontSize: '0.88em', color: '#94a3b8', marginTop: '4px' }}>
              Kode PIN Sesi: <b style={{ color: '#c084fc', letterSpacing: '2px', fontSize: '1.1em' }}>{pin}</b>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (pin && student?.sessionId) {
                leaveClassSession(pin, student.sessionId);
              }
              if (onLeave) onLeave();
            }}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#fca5a5',
              padding: '8px 16px',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85em',
              fontWeight: 700
            }}
          >
            <LogOut size={16} />
            <span>Keluar / Ganti Akun</span>
          </button>
        </div>

        {/* Status Menunggu Dosen */}
        <div style={{
          background: 'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.2) 0%, rgba(15, 23, 42, 0.4) 100%)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          borderRadius: '18px',
          padding: '24px',
          textAlign: 'center',
          marginBottom: '28px'
        }}>
          <div style={{
            width: '76px',
            height: '76px',
            margin: '0 auto 10px',
            borderRadius: '50%',
            background: currentOption.bg,
            border: `3px solid ${currentOption.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5em',
            boxShadow: `0 0 30px ${currentOption.border}88`,
            transition: 'all 0.25s ease'
          }}>
            {currentOption.emoji}
          </div>
          <div style={{
            display: 'inline-block',
            fontSize: '0.82em',
            fontWeight: 800,
            color: currentOption.border,
            background: 'rgba(15, 23, 42, 0.75)',
            border: `1px solid ${currentOption.border}88`,
            padding: '4px 14px',
            borderRadius: '16px',
            marginBottom: '10px'
          }}>
            {currentOption.label}
          </div>
          <h3 style={{ margin: '0 0 6px', fontSize: '1.3em', color: '#f8fafc' }}>
            Kamu Siap Bertanding, <span style={{ color: '#c084fc' }}>{student.name}</span>!
          </h3>
          <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.92em' }}>
            Menunggu <b>Dosen</b> menekan tombol <b>"Mulai Pertandingan"</b> di portal dosen...
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '14px',
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.35)',
            padding: '4px 14px',
            borderRadius: '20px',
            color: '#4ade80',
            fontSize: '0.82em',
            fontWeight: 700
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', animation: 'pulse 1.5s infinite' }} />
            <span>Terhubung ke Sesi Kelas Real-Time</span>
          </div>
        </div>

        {/* Pilih Desain & Warna Mobil Balap / Avatar */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.65)',
          border: '1px solid rgba(148, 163, 184, 0.25)',
          borderRadius: '18px',
          padding: '20px',
          marginBottom: '28px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#f8fafc', fontSize: '1.05em' }}>
              <span>{isRaceMode ? '🏎️' : '🏃'}</span>
              <span>{isRaceMode ? 'Pilih Mobil Balap & Warna Sirkuitmu' : 'Pilih Warna Avatar Penjelajahmu'}</span>
            </div>
            <span style={{ fontSize: '0.8em', color: '#94a3b8' }}>
              Warna kendaraan akan langsung tampil di lintasan & layar proyektor Dosen!
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
            {(isRaceMode ? KART_OPTIONS : RUNNER_OPTIONS).map((opt, oIdx) => {
              const isSelected = selectedColor === opt.color && selectedType === opt.type;
              return (
                <div
                  key={oIdx}
                  onClick={() => handleSelectCharacter(opt)}
                  style={{
                    background: isSelected ? opt.bg : 'rgba(15, 23, 42, 0.6)',
                    border: `2px solid ${isSelected ? opt.border : 'rgba(148, 163, 184, 0.25)'}`,
                    borderRadius: '14px',
                    padding: '12px 10px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative'
                  }}
                >
                  <div style={{ fontSize: '2em', marginBottom: '4px' }}>{opt.emoji}</div>
                  <div style={{ fontWeight: 800, fontSize: '0.85em', color: isSelected ? opt.border : '#cbd5e1' }}>
                    {opt.label}
                  </div>
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      background: opt.border,
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0f172a'
                    }}>
                      <CheckCircle2 size={14} color="#0f172a" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Grid Teman Sekelas yang Sudah Join */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h4 style={{ margin: 0, color: '#c084fc', fontSize: '1.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} />
              <span>Teman Sekelas di Ruang Tunggu ({playersList.length})</span>
            </h4>
            <span style={{ fontSize: '0.8em', color: '#94a3b8' }}>
              Semua peserta akan mulai serentak
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '12px'
          }}>
            {playersList.map((p, idx) => {
              const isMe = p.uid === student.sessionId || p.nim === student.nim;
              const pType = isMe ? selectedType : (p.characterType || (isRaceMode ? 'kart' : 'runner'));
              const pColor = isMe ? selectedColor : (p.characterColor || 'blue');
              const pOpt = (pType === 'kart' ? KART_OPTIONS : RUNNER_OPTIONS).find(
                o => o.color === pColor && o.type === pType
              ) || (pType === 'kart' ? KART_OPTIONS[0] : RUNNER_OPTIONS[0]);

              return (
                <div
                  key={p.uid || idx}
                  style={{
                    background: isMe ? 'rgba(168, 85, 247, 0.25)' : 'rgba(30, 41, 59, 0.7)',
                    border: `1px solid ${isMe ? 'rgba(168, 85, 247, 0.6)' : 'rgba(148, 163, 184, 0.2)'}`,
                    borderRadius: '14px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: isMe ? '0 0 16px rgba(168, 85, 247, 0.3)' : 'none'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: pOpt.bg,
                    border: `1.5px solid ${pOpt.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4em',
                    flexShrink: 0
                  }}>
                    {pOpt.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 800,
                      fontSize: '0.9em',
                      color: isMe ? '#e9d5ff' : '#f8fafc',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {p.name} {isMe && '(Kamu)'}
                    </div>
                    <div style={{ fontSize: '0.75em', color: '#94a3b8' }}>
                      NIM: {p.nim}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '0.72em',
                    fontWeight: 700,
                    color: '#4ade80',
                    background: 'rgba(34, 197, 94, 0.2)',
                    padding: '2px 8px',
                    borderRadius: '10px'
                  }}>
                    Siap
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

