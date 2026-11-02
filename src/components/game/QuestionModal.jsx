import React from 'react';
import { X, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
import LockItem from './LockItem';

export default function QuestionModal({
  isOpen,
  onClose,
  room,
  lockIndex,
  perLockMax,
  onSolved,
  isSolvedInitially,
  savedState,
  mode = 'escape_room' // 'escape_room' | 'quiz_race'
}) {
  if (!isOpen || !room) return null;

  const currentLock = (room.locks || [])[lockIndex];
  if (!currentLock) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '680px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px'
        }}
      >
        {/* Header Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8em' }}>{room.icon || '🧩'}</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2em', color: '#c084fc' }}>
                {mode === 'quiz_race' ? `Gerbang Pos Kuis ${lockIndex + 1}` : `Gembok ${lockIndex + 1}: ${room.title}`}
              </h3>
              <span style={{ fontSize: '0.85em', color: '#94a3b8' }}>
                {mode === 'quiz_race' ? 'Jawab benar & cepat untuk mendapatkan Super Nitro Boost!' : 'Pecahkan teka-teki observasi untuk membuka pintu keluar'}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="secondary-btn"
            onClick={onClose}
            style={{ padding: '6px 10px', borderRadius: '50%' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Konten Scrollable */}
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
          {/* Skenario Kasus Observasi */}
          {room.text && (
            <div style={{
              background: 'rgba(30, 41, 59, 0.75)',
              border: '1px solid rgba(148, 163, 184, 0.25)',
              borderLeft: '4px solid var(--purple)',
              borderRadius: '12px',
              padding: '14px',
              fontSize: '0.92em',
              lineHeight: 1.6,
              color: '#e2e8f0',
              marginBottom: '18px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: '#c084fc', marginBottom: '4px' }}>
                <BookOpen size={16} />
                <span>Narasi Skenario Observasi:</span>
              </div>
              <p style={{ margin: 0 }}>{room.text}</p>
            </div>
          )}

          {/* Komponen Soal & Logika Skor */}
          <LockItem
            lock={currentLock}
            lockIndex={lockIndex}
            perLockMax={perLockMax}
            onSolved={(res) => {
              onSolved(room, res, lockIndex);
            }}
            isSolvedInitially={isSolvedInitially}
            savedState={savedState}
          />
        </div>

        {/* Footer */}
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="main-btn"
            onClick={onClose}
            style={{ padding: '10px 20px', fontSize: '0.92em' }}
          >
            <span>{isSolvedInitially ? 'Kembali ke Arena' : 'Tutup Dialog'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

