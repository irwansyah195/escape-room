import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SkyBackground from '../components/common/SkyBackground';
import Header from '../components/common/Header';
import ProgressBar from '../components/common/ProgressBar';
import StudentForm from '../components/game/StudentForm';
import RoomCard from '../components/game/RoomCard';
import VictoryCard from '../components/game/VictoryCard';
import { Shield, Sparkles } from 'lucide-react';

export default function GamePage({ rooms, loadingRooms }) {
  // Status Permainan Mahasiswa
  const [student, setStudent] = useState(null);
  const [currentRoomIdx, setCurrentRoomIdx] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [collectedKeys, setCollectedKeys] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [answersRecord, setAnswersRecord] = useState([]);

  // Hitung total gembok dan skor per gembok secara dinamis
  const totalLocks = rooms.reduce((acc, r) => acc + (r.locks || []).length, 0);
  const perLockMax = totalLocks > 0 ? 100 / totalLocks : 0;

  // Handler Mulai Game
  const handleStartGame = (studentData) => {
    setStudent(studentData);
    setCurrentRoomIdx(0);
    setIsFinished(false);
    setCollectedKeys([]);
    setTotalScore(0);
    setTotalCorrect(0);
    setAnswersRecord([]);
  };

  // Handler saat gembok berhasil dipecahkan
  const handleLockSolved = (room, lockResult) => {
    setTotalScore(prev => prev + (lockResult.scoreEarned || 0));
    setTotalCorrect(prev => prev + 1);

    setAnswersRecord(prev => [
      ...prev,
      {
        room: room.title,
        question: lockResult.question,
        correctOptionText: lockResult.correctOptionText,
        isSolved: lockResult.isSolved,
        wrongAttempts: lockResult.wrongAttempts,
        scoreEarned: lockResult.scoreEarned
      }
    ]);
  };

  // Handler Lanjut Ruangan / Selesai
  const handleNextRoom = () => {
    const activeRoom = rooms[currentRoomIdx];
    if (activeRoom && activeRoom.key) {
      setCollectedKeys(prev => [...prev, activeRoom.key]);
    }

    if (currentRoomIdx >= rooms.length - 1) {
      setIsFinished(true);
    } else {
      setCurrentRoomIdx(prev => prev + 1);
    }
  };

  // Handler Restart Permainan
  const handleRestart = () => {
    setStudent(null);
    setCurrentRoomIdx(0);
    setIsFinished(false);
    setCollectedKeys([]);
    setTotalScore(0);
    setTotalCorrect(0);
    setAnswersRecord([]);
  };

  return (
    <div>
      {/* Background SVG dinamis */}
      <SkyBackground />

      <div className="wrap">
        {/* Header Edukatif */}
        <Header />

        {/* Indikator Progres */}
        {student && (
          <ProgressBar
            rooms={rooms}
            currentRoomIdx={currentRoomIdx}
            isFinished={isFinished}
          />
        )}

        {/* Konten Utama */}
        {loadingRooms ? (
          <div className="game-card" style={{ textAlign: 'center', padding: '50px' }}>
            <Sparkles size={32} color="var(--purple)" style={{ animation: 'spin 1.5s linear infinite' }} />
            <p style={{ marginTop: '12px', fontWeight: 600, color: 'var(--purple-dark)' }}>
              Menyiapkan Ruangan Escape Room...
            </p>
          </div>
        ) : !student ? (
          <StudentForm onStart={handleStartGame} />
        ) : isFinished ? (
          <VictoryCard
            student={student}
            collectedKeys={collectedKeys}
            totalScore={totalScore}
            totalCorrect={totalCorrect}
            totalLocks={totalLocks}
            answersRecord={answersRecord}
            rooms={rooms}
            onRestart={handleRestart}
          />
        ) : rooms[currentRoomIdx] ? (
          <RoomCard
            key={rooms[currentRoomIdx].id || currentRoomIdx}
            room={rooms[currentRoomIdx]}
            roomIndex={currentRoomIdx}
            totalRooms={rooms.length}
            student={student}
            perLockMax={perLockMax}
            onLockSolved={handleLockSolved}
            onNextRoom={handleNextRoom}
            isLastRoom={currentRoomIdx === rooms.length - 1}
          />
        ) : (
          <div className="game-card" style={{ textAlign: 'center' }}>
            <p>Tidak ada ruangan yang tersedia. Hubungi dosen pengampu.</p>
            <button type="button" className="main-btn" onClick={handleRestart}>Kembali</button>
          </div>
        )}

        {/* Footer Link ke Halaman Terpisah Manajemen Dosen */}
        <footer style={{ textAlign: 'center', marginTop: '28px', paddingBottom: '20px' }}>
          <Link
            to="/dosen"
            style={{
              textDecoration: 'none',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(4px)',
              border: '1px solid #cbd5e1',
              borderRadius: 'var(--radius-full)',
              padding: '8px 18px',
              fontSize: '0.86em',
              color: '#475569',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
              fontWeight: 600,
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--purple)'; e.currentTarget.style.color = 'var(--purple-dark)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#475569'; }}
          >
            <Shield size={16} color="var(--purple)" />
            <span>🔐 Akses Manajemen Dosen (Halaman Khusus)</span>
          </Link>
        </footer>
      </div>
    </div>
  );
}
