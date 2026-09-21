import React, { useState, useEffect } from 'react';
import { ArrowRight, Trophy, Sparkles, UserCheck } from 'lucide-react';
import LockItem from './LockItem';

export default function RoomCard({
  room,
  roomIndex,
  totalRooms,
  student,
  perLockMax,
  onLockSolved,
  onNextRoom,
  isLastRoom
}) {
  const [solvedLocks, setSolvedLocks] = useState({});

  useEffect(() => {
    // Reset status gembok saat berpindah ruangan
    setSolvedLocks({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [roomIndex, room.id]);

  const handleLockSolved = (lockResult) => {
    setSolvedLocks(prev => {
      const updated = { ...prev, [lockResult.lockId]: true };
      return updated;
    });

    onLockSolved(room, lockResult);
  };

  const allLocksSolved = (room.locks || []).length > 0 &&
    (room.locks || []).every((l, li) => solvedLocks[l.id || `lock-${li}`]);

  return (
    <div className="game-card">
      <div className="card-decor-bg">{room.decor || room.icon || '🔑'}</div>

      <div className="room-badge">
        <span>Ruangan {roomIndex + 1} dari {totalRooms}</span>
      </div>

      <div className="student-tag">
        <UserCheck size={16} color="var(--purple)" />
        <span>{student.name} — NIM: {student.nim}</span>
      </div>

      <div className="scenario-title">
        {room.icon} Skenario: "{room.title}"
      </div>

      <div className="scenario-box">
        {room.text}
      </div>

      <div className="locks-container">
        {(room.locks || []).map((lock, li) => (
          <LockItem
            key={lock.id || `lock-${roomIndex}-${li}`}
            lock={lock}
            lockIndex={li}
            perLockMax={perLockMax}
            onSolved={handleLockSolved}
            isSolvedInitially={!!solvedLocks[lock.id || `lock-${li}`]}
          />
        ))}
      </div>

      {allLocksSolved && (
        <div className="key-reward">
          🎉 Hebat! Semua gembok terbuka! Kamu mengantongi kunci {room.key || '🔑'}
        </div>
      )}

      <div className="btnrow" style={{ marginTop: '24px' }}>
        <button
          type="button"
          className="main-btn"
          disabled={!allLocksSolved}
          onClick={onNextRoom}
        >
          {isLastRoom ? (
            <>
              <Trophy size={20} />
              Buka Pintu Terakhir 🎉
            </>
          ) : (
            <>
              Lanjut ke Ruangan Berikutnya
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
