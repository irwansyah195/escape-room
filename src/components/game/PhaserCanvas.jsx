import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import EscapeRoomScene from '../../game/EscapeRoomScene';
import SprintRaceScene from '../../game/SprintRaceScene';
import { triggerPlayerEmote } from '../../utils/sessionSync';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Zap,
  Smile,
  Compass
} from 'lucide-react';

const EMOTES = ['👋', '👍', '🤔', '🏆', '🎉', '❤️'];

export default function PhaserCanvas({
  mode = 'escape_room', // 'escape_room' | 'quiz_race'
  rooms = [],
  currentRoomIdx = 0,
  solvedLocks = [],
  totalQuestions,
  student,
  sessionPin,
  isSpectator = false,
  onTriggerLock,
  onEnterPortal,
  onTriggerCheckpoint,
  onFinishRace
}) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const [showEmotes, setShowEmotes] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Bersihkan game lama jika ada
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }

    const currentRoom = rooms[currentRoomIdx] || {};

    const config = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: isSpectator ? 1200 : 800,
      height: mode === 'quiz_race' ? (isSpectator ? 500 : 320) : 520,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      backgroundColor: '#0f172a'
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Jembatan komunikasi dari Phaser ke React State
    game.reactBridge = {
      onTriggerLock: (lockIdx) => {
        if (onTriggerLock) onTriggerLock(lockIdx);
      },
      onEnterPortal: () => {
        if (onEnterPortal) onEnterPortal();
      },
      onTriggerCheckpoint: (cpIdx, qData) => {
        if (onTriggerCheckpoint) onTriggerCheckpoint(cpIdx, qData);
      },
      onFinishRace: () => {
        if (onFinishRace) onFinishRace();
      }
    };

    if (mode === 'quiz_race') {
      const fallbackTotal = rooms.reduce((acc, r) => acc + (r.locks || []).length, 0) || 5;
      const totalQ = totalQuestions || student?.raceQuestions?.length || fallbackTotal;
      game.scene.add('SprintRaceScene', SprintRaceScene, true, {
        sessionPin,
        student,
        totalQuestions: totalQ,
        isSpectator: Boolean(isSpectator)
      });
    } else {
      game.scene.add('EscapeRoomScene', EscapeRoomScene, true, {
        roomData: currentRoom,
        roomIdx: currentRoomIdx,
        totalRooms: rooms.length,
        solvedLocks,
        student,
        sessionPin
      });
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [mode, currentRoomIdx, sessionPin, isSpectator, totalQuestions]);

  // Update data gembok yang terselesaikan ke scene aktif
  useEffect(() => {
    if (!gameRef.current) return;
    const scene = gameRef.current.scene.getScene(mode === 'quiz_race' ? 'RaceTrackScene' : 'EscapeRoomScene');
    if (scene) {
      if (mode === 'escape_room' && scene.updateSolvedLocks) {
        scene.updateSolvedLocks(solvedLocks);
      }
    }
  }, [solvedLocks, mode]);

  // Handler kirim emote
  const handleSendEmote = (emoji) => {
    setShowEmotes(false);
    if (!student?.sessionId) return;

    if (sessionPin) {
      triggerPlayerEmote(sessionPin, student.sessionId, emoji);
    }

    // Tampilkan di scene lokal
    const scene = gameRef.current?.scene.getScene('EscapeRoomScene');
    if (scene?.showPlayerEmote) {
      scene.showPlayerEmote(emoji);
    }
  };

  // Virtual Directional Controls untuk sentuhan/mobile
  const handleVirtualDir = (dir, isDown) => {
    if (!gameRef.current) return;
    const scene = gameRef.current.scene.getScene(mode === 'quiz_race' ? 'RaceTrackScene' : 'EscapeRoomScene');
    if (!scene) return;

    if (dir === 'left') scene.virtualLeft = isDown;
    if (dir === 'right') scene.virtualRight = isDown;
    if (dir === 'up') scene.virtualUp = isDown;
    if (dir === 'down') scene.virtualDown = isDown;
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: isSpectator ? '100%' : '840px', margin: '0 auto' }}>
      {/* Container Kanvas Phaser */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          aspectRatio: mode === 'quiz_race' ? (isSpectator ? '1200 / 500' : '800 / 320') : '800 / 520',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
          border: mode === 'quiz_race' ? '2px solid rgba(56, 189, 248, 0.4)' : '3px solid var(--purple-dark)',
          background: '#1e293b'
        }}
      />

      {/* Bar HUD Bawah: Info Kontrol & Emote Bar (Hanya tampil untuk Pemain pada Mode Escape Room) */}
      {!isSpectator && mode !== 'quiz_race' && (
        <div style={{
          marginTop: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          padding: '8px 12px',
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          backdropFilter: 'blur(8px)'
        }}>
          {/* Info Kontrol Keyboard */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85em', color: '#475569' }}>
            <Compass size={16} color="var(--purple)" />
            <span>
              <b>Kontrol:</b> Gunakan Tombol Panah / WASD untuk bergerak. Dekati objek dan tekan [SPASI]!
            </span>
          </div>

          {/* Tombol Reaksi Emote */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowEmotes(!showEmotes)}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '20px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '0.86em',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--purple-dark)'
              }}
            >
              <Smile size={16} />
              <span>Kirim Emote</span>
            </button>

            {showEmotes && (
              <div style={{
                position: 'absolute',
                bottom: '40px',
                right: 0,
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '8px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                display: 'flex',
                gap: '6px',
                zIndex: 100
              }}>
                {EMOTES.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleSendEmote(emoji)}
                    style={{
                      background: '#f8fafc',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1.4em',
                      padding: '6px 8px',
                      cursor: 'pointer',
                      transition: 'transform 0.1s'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* On-Screen Touch D-Pad (Khusus Mode Escape Room pada Mobile) */}
      {mode !== 'quiz_race' && !isSpectator && (
        <div className="mobile-dpad" style={{
          marginTop: '10px',
          display: 'flex',
          justifyContent: 'center',
          gap: '6px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 44px)', gridTemplateRows: 'repeat(2, 44px)', gap: '6px' }}>
            <div />
            <button
              type="button"
              className="secondary-btn"
              style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseDown={() => handleVirtualDir('up', true)}
              onMouseUp={() => handleVirtualDir('up', false)}
              onTouchStart={() => handleVirtualDir('up', true)}
              onTouchEnd={() => handleVirtualDir('up', false)}
            >
              <ArrowUp size={20} />
            </button>
            <div />

            <button
              type="button"
              className="secondary-btn"
              style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseDown={() => handleVirtualDir('left', true)}
              onMouseUp={() => handleVirtualDir('left', false)}
              onTouchStart={() => handleVirtualDir('left', true)}
              onTouchEnd={() => handleVirtualDir('left', false)}
            >
              <ArrowLeft size={20} />
            </button>
            <button
              type="button"
              className="secondary-btn"
              style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseDown={() => handleVirtualDir('down', true)}
              onMouseUp={() => handleVirtualDir('down', false)}
              onTouchStart={() => handleVirtualDir('down', true)}
              onTouchEnd={() => handleVirtualDir('down', false)}
            >
              <ArrowDown size={20} />
            </button>
            <button
              type="button"
              className="secondary-btn"
              style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseDown={() => handleVirtualDir('right', true)}
              onMouseUp={() => handleVirtualDir('right', false)}
              onTouchStart={() => handleVirtualDir('right', true)}
              onTouchEnd={() => handleVirtualDir('right', false)}
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

