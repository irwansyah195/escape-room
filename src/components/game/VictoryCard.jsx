import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, BookOpen } from 'lucide-react';
import { saveStudentResult } from '../../firebase/config';

export default function VictoryCard({
  student,
  collectedKeys,
  totalScore,
  totalCorrect,
  totalLocks,
  answersRecord,
  rooms,
  onRestart
}) {
  const [saveStatus, setSaveStatus] = useState({ loading: true, success: false, msg: 'Menyimpan hasil ke database...' });
  const hasSubmittedRef = useRef(false);

  const scoreRounded = Math.min(100, Math.round(totalScore * 100) / 100);

  useEffect(() => {
    // Jalankan efek selebrasi confetti
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 400);
    } catch (e) {
      console.log('Confetti not available:', e);
    }

    // Simpan hasil pengerjaan ke database Firestore (hanya 1 kali per sesi pengerjaan)
    const submitResult = async () => {
      if (hasSubmittedRef.current) return;
      hasSubmittedRef.current = true;

      try {
        const studentName = student.name || student.nama || 'Mahasiswa';
        const studentNim = student.nim || '-';
        const uniqueSessionId = student.sessionId || `session_${studentNim}_${Date.now()}`;

        const record = {
          nama: studentName,
          name: studentName,
          nim: studentNim,
          score: scoreRounded,
          correct: totalCorrect,
          totalCorrect: totalCorrect,
          totalLocks: totalLocks,
          totalQuestions: totalLocks,
          totalRooms: rooms ? rooms.length : 3,
          sessionMode: student.sessionMode || 'quiz_race',
          sessionPin: student.sessionPin || null,
          answers: answersRecord || [],
          answersRecord: answersRecord || [],
          sessionId: uniqueSessionId,
          timestamp: new Date().toISOString(),
          submittedAt: new Date().toISOString()
        };

        const res = await saveStudentResult(record);
        if (res.success) {
          setSaveStatus({ loading: false, success: true, msg: '✅ Hasil berhasil tersimpan ke sistem database.' });
        } else {
          setSaveStatus({ loading: false, success: false, msg: `⚠️ Data tersimpan di cache lokal (${res.error || 'Firestore offline'}).` });
        }
      } catch (err) {
        setSaveStatus({ loading: false, success: false, msg: '⚠️ Gagal menyimpan ke cloud. Harap screenshot skor kamu.' });
      }
    };

    submitResult();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="game-card final-card">
      <div className="final-emoji">🏆</div>
      <h2 style={{ color: '#c084fc', margin: '0 0 4px', fontSize: '1.8em' }}>
        Selamat, {student.name}!
      </h2>
      <p style={{ color: '#94a3b8', margin: '0 0 16px', fontWeight: 600 }}>
        NIM: {student.nim}
      </p>

      <div className="keychain" title="Koleksi Kunci Ruangan">
        {collectedKeys.map((key, i) => (
          <span key={i} style={{ animation: 'bounceIn 0.5s ease', display: 'inline-block' }}>
            {key}
          </span>
        ))}
      </div>

      <div className="score-badge-box">
        🌟 Total Skor Kamu: {scoreRounded} / 100
      </div>

      <p style={{ fontSize: '1.05em', margin: '14px 0', color: '#e2e8f0' }}>
        Kamu menjawab benar <b>{totalCorrect} dari {totalLocks}</b> {student?.sessionMode === 'quiz_race' ? 'soal' : 'gembok'} (skor dipengaruhi jumlah percobaan tiap soal).
      </p>

      {/* Ringkasan Pembelajaran */}
      <div className="summary-edu-box">
        <div style={{ fontWeight: 700, color: '#c084fc', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <BookOpen size={18} />
          <span>Refleksi Teori Bermain Anak:</span>
        </div>
        <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 1.6, color: '#cbd5e1' }}>
          <li><b>Parallel & Constructive Play</b>: Anak bermain mandiri berdampingan dan menyusun media menjadi struktur.</li>
          <li><b>Cooperative & Sociodramatic Play</b>: Pembagian peran terkoordinasi dan alur cerita yang disepakati bersama.</li>
          <li><b>Games with Rules</b>: Puncak kematangan sosial (Parten & Piaget) dengan kepatuhan giliran dan regulasi diri.</li>
        </ul>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '20px' }}>
        <button
          type="button"
          className="main-btn"
          style={{
            maxWidth: '320px',
            width: '100%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            margin: '0 auto',
            textAlign: 'center'
          }}
          onClick={onRestart}
        >
          <RotateCcw size={18} />
          <span>Main Lagi</span>
        </button>
      </div>
    </div>
  );
}
