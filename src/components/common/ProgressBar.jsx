import React from 'react';

export default function ProgressBar({ rooms, currentRoomIdx, isFinished }) {
  if (!rooms || rooms.length === 0) return null;

  return (
    <div className="progress-wrap" aria-label="Progress Permainan">
      {rooms.map((room, idx) => {
        let cls = 'dot-step';
        if (isFinished || idx < currentRoomIdx) {
          cls += ' done';
        } else if (idx === currentRoomIdx) {
          cls += ' active';
        }

        return (
          <div
            key={room.id || idx}
            className={cls}
            title={`${room.title} (${idx + 1} dari ${rooms.length})`}
          />
        );
      })}
      <div
        className={`dot-step ${isFinished ? 'done' : ''}`}
        title="Pintu Keluar Terakhir"
      />
    </div>
  );
}
