import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SkyBackground from '../components/common/SkyBackground';
import Header from '../components/common/Header';
import ProgressBar from '../components/common/ProgressBar';
import StudentForm from '../components/game/StudentForm';
import RoomCard from '../components/game/RoomCard';
import VictoryCard from '../components/game/VictoryCard';
import PhaserCanvas from '../components/game/PhaserCanvas';
import QuestionModal from '../components/game/QuestionModal';
import WaitingLobby from '../components/game/WaitingLobby';
import PodiumModal from '../components/game/PodiumModal';
import {
  joinClassSession,
  leaveClassSession,
  updatePlayerProgress,
  subscribeToSessionStatus,
  subscribeToSessionPlayers
} from '../utils/sessionSync';
import { getStoredRaceQuestions, defaultRaceQuestions } from '../data/defaultRaceQuestions';
import { supabase, isSupabaseConfigured } from '../supabase/client';
import { saveStudentResult } from '../supabase/db';
import { Shield, Sparkles, Gamepad2, Flame, Layout, LogOut, CheckCircle2, AlertCircle, Trophy, Clock } from 'lucide-react';

const STORAGE_GAME_STATE_KEY = 'dunia_bermain_student_gamestate';

function loadSavedGameState() {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_GAME_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export default function GamePage({ rooms, loadingRooms }) {
  // Ambil data yang tersimpan jika pengguna me-refresh halaman
  const savedState = loadSavedGameState();

  // Status Permainan Mahasiswa (dengan resume otomatis saat refresh jika terhubung sesi PIN)
  const [student, setStudent] = useState(() => {
    if (savedState?.student?.sessionPin) return savedState.student;
    return null;
  });
  const [currentRoomIdx, setCurrentRoomIdx] = useState(() => savedState?.currentRoomIdx ?? 0);
  const [isFinished, setIsFinished] = useState(() => savedState?.isFinished ?? false);
  const [collectedKeys, setCollectedKeys] = useState(() => savedState?.collectedKeys ?? []);
  const [totalScore, setTotalScore] = useState(() => savedState?.totalScore ?? 0);
  const [totalCorrect, setTotalCorrect] = useState(() => savedState?.totalCorrect ?? 0);
  const [answersRecord, setAnswersRecord] = useState(() => savedState?.answersRecord ?? []);

  // State untuk 2D Metaverse & Modal Soal
  const [activeModalLockIdx, setActiveModalLockIdx] = useState(null);
  const [solvedLocksMap, setSolvedLocksMap] = useState(() => savedState?.solvedLocksMap ?? {}); // { [roomIdx]: [0, 1] }
  const [viewMode, setViewMode] = useState(() => savedState?.viewMode ?? 'metaverse'); // 'metaverse' | 'card'

  // State Sinkronisasi Sesi Kelas Real-Time
  const [sessionStatus, setSessionStatus] = useState(() => savedState?.sessionStatus || 'in_progress'); // 'waiting' | 'starting' | 'in_progress' | 'finished'
  const [connectedPlayers, setConnectedPlayers] = useState({});
  const [showPodium, setShowPodium] = useState(false);

  // Mode Permainan
  const isRaceMode = student?.sessionMode === 'quiz_race';

  // State Sprint Race Mode
  const [raceQuestionIdx, setRaceQuestionIdx] = useState(() => savedState?.raceQuestionIdx ?? 0);
  const [raceWrongAttempts, setRaceWrongAttempts] = useState(() => savedState?.raceWrongAttempts ?? 0);
  const [raceDisabledOptions, setRaceDisabledOptions] = useState(() => new Set(savedState?.raceDisabledOptions || []));
  const [raceFeedback, setRaceFeedback] = useState(null); // { isCorrect: boolean, message: string }
  const [timeLeft, setTimeLeft] = useState(30);

  // Kumpulan butir soal murni untuk Game Balap (Quiz Sprint Race) tanpa struktur ruangan & gembok
  const raceQuestions = useMemo(() => {
    if (student?.raceQuestions && Array.isArray(student.raceQuestions) && student.raceQuestions.length > 0) {
      return student.raceQuestions;
    }
    const stored = getStoredRaceQuestions();
    if (Array.isArray(stored) && stored.length > 0) {
      return stored;
    }
    return defaultRaceQuestions;
  }, [student?.raceQuestions]);

  const totalRaceQuestions = raceQuestions.length || 1;
  const perRaceQuestionScore = totalRaceQuestions > 0 ? 100 / totalRaceQuestions : 10;
  const activeRaceQ = raceQuestions[raceQuestionIdx] || null;

  // Hitung total gembok dan skor per gembok secara dinamis untuk Escape Room
  const totalLocks = rooms.reduce((acc, r) => acc + (r.locks || []).length, 0);
  const perLockMax = totalLocks > 0 ? 100 / totalLocks : 0;

  // Simpan progres ke sessionStorage setiap kali state berubah agar tahan refresh (F5)
  useEffect(() => {
    if (student) {
      const stateToSave = {
        student,
        currentRoomIdx,
        isFinished,
        collectedKeys,
        totalScore,
        totalCorrect,
        answersRecord,
        solvedLocksMap,
        viewMode,
        sessionStatus,
        raceQuestionIdx,
        raceWrongAttempts,
        raceDisabledOptions: Array.from(raceDisabledOptions)
      };
      try {
        sessionStorage.setItem(STORAGE_GAME_STATE_KEY, JSON.stringify(stateToSave));
      } catch (e) {
        console.warn("Gagal menyimpan sesi ke sessionStorage:", e);
      }
    } else {
      try {
        sessionStorage.removeItem(STORAGE_GAME_STATE_KEY);
      } catch (e) {}
    }
  }, [student, currentRoomIdx, isFinished, collectedKeys, totalScore, totalCorrect, answersRecord, solvedLocksMap, viewMode, sessionStatus, raceQuestionIdx, raceWrongAttempts, raceDisabledOptions]);

  // Tarik butir soal balap langsung dari sesi Dosen di Supabase jika mahasiswa belum memilikinya
  useEffect(() => {
    if (student?.sessionPin && (!student?.raceQuestions || student.raceQuestions.length === 0)) {
      if (isSupabaseConfigured && supabase) {
        supabase
          .from('class_sessions')
          .select('race_questions')
          .eq('pin', student.sessionPin)
          .maybeSingle()
          .then(({ data }) => {
            if (data?.race_questions && Array.isArray(data.race_questions) && data.race_questions.length > 0) {
              setStudent(prev => prev ? { ...prev, raceQuestions: data.race_questions } : prev);
            }
          })
          .catch(() => {});
      }
    }
  }, [student?.sessionPin, student?.raceQuestions]);

  // Sinkronisasi Sesi Kelas saat bergabung atau saat refresh halaman
  useEffect(() => {
    if (!student?.sessionPin || !student?.sessionId) return;

    // Pastikan avatar aktif di sesi kelas dengan progres terkini
    joinClassSession(student.sessionPin, {
      ...student,
      score: totalScore,
      solvedCount: totalCorrect,
      progressIdx: raceQuestionIdx,
      totalQuestions: isRaceMode ? totalRaceQuestions : (totalLocks || 1)
    });

    // Berlangganan status sesi kelas
    const unsubStatus = subscribeToSessionStatus(student.sessionPin, (session) => {
      if (session?.status) {
        setSessionStatus(session.status);
        if (session.status === 'finished') {
          setIsFinished(true);
          setShowPodium(true);
          saveStudentResult({
            nama: student.name,
            name: student.name,
            nim: student.nim || '-',
            score: totalScore,
            correct: totalCorrect,
            totalCorrect: totalCorrect,
            totalLocks: isRaceMode ? totalRaceQuestions : (totalLocks || 20),
            totalQuestions: isRaceMode ? totalRaceQuestions : (totalLocks || 20),
            sessionMode: isRaceMode ? 'quiz_race' : 'escape_room',
            sessionPin: student.sessionPin || null,
            answers: answersRecord || [],
            answersRecord: answersRecord || [],
            timestamp: new Date().toISOString()
          });
        }
      }
    });

    // Berlangganan daftar seluruh pemain untuk podium & monitor
    const unsubPlayers = subscribeToSessionPlayers(student.sessionPin, (players) => {
      setConnectedPlayers(players || {});
    });

    // Heartbeat berkala setiap 3 detik agar posisi dan status mahasiswa selalu aktif di layar Dosen
    const hbInterval = setInterval(() => {
      updatePlayerProgress(student.sessionPin, student.sessionId, {
        name: student.name,
        nim: student.nim,
        characterType: student.characterType || 'kart',
        characterColor: student.characterColor || 'blue',
        score: totalScore,
        solvedCount: totalCorrect,
        checkpointIdx: raceQuestionIdx,
        totalQuestions: isRaceMode ? totalRaceQuestions : (totalLocks || 1),
        isFinished: isFinished,
        lastSeen: Date.now()
      });
    }, 3000);

    const handleBeforeUnload = () => {
      if (student?.sessionPin && student?.sessionId) {
        leaveClassSession(student.sessionPin, student.sessionId);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      clearInterval(hbInterval);
      unsubStatus();
      unsubPlayers();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, [student?.sessionPin, student?.sessionId, student?.name, student?.nim, student?.characterType, student?.characterColor, totalScore, totalCorrect, raceQuestionIdx, totalRaceQuestions, totalLocks, isRaceMode, isFinished]);

  // Handler Mulai Game dari Form Login
  const handleStartGame = (studentData) => {
    setStudent(studentData);
    setCurrentRoomIdx(0);
    setIsFinished(false);
    setCollectedKeys([]);
    setTotalScore(0);
    setTotalCorrect(0);
    setAnswersRecord([]);
    setSolvedLocksMap({});
    setActiveModalLockIdx(null);
    setRaceQuestionIdx(0);
    setRaceWrongAttempts(0);
    setRaceDisabledOptions(new Set());
    setRaceFeedback(null);
    setShowPodium(false);

    // Jika bergabung ke sesi kelas PIN, mulai dari status 'waiting' (Lobby)
    if (studentData.sessionPin) {
      setSessionStatus('waiting');
    } else {
      setSessionStatus('in_progress');
    }
  };

  // Handler saat gembok/soal berhasil dipecahkan pada Escape Room Mode
  const handleLockSolved = (room, lockResult, lockIdx) => {
    const newScore = totalScore + (lockResult.scoreEarned || 0);
    const newCorrect = totalCorrect + 1;

    setTotalScore(newScore);
    setTotalCorrect(newCorrect);

    // Catat gembok yang terselesaikan di ruangan ini
    setSolvedLocksMap(prev => {
      const existing = prev[currentRoomIdx] || [];
      return {
        ...prev,
        [currentRoomIdx]: existing.includes(lockIdx) ? existing : [...existing, lockIdx]
      };
    });

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

    // Update progres ke server / bus jika multiplayer
    if (student?.sessionPin && student?.sessionId) {
      updatePlayerProgress(student.sessionPin, student.sessionId, {
        score: newScore,
        solvedCount: newCorrect
      });
    }
  };

  // Handler Menjawab Soal pada Sprint Race Mode (Answer to Sprint)
  const handleAnswerSprintQuestion = (selectedOption) => {
    if (raceDisabledOptions.has(selectedOption) || raceFeedback?.isCorrect) return;

    const activeQ = raceQuestions[raceQuestionIdx];
    if (!activeQ) return;

    const isCorrect = selectedOption === activeQ.correctOption;

    if (isCorrect) {
      let earned = 0;
      let msg = '';
      if (raceWrongAttempts === 0) {
        earned = perRaceQuestionScore;
        msg = `🎉 Benar di percobaan ke-1! (+${earned.toFixed(1)} Poin - 100%) Mobilmu melesat maju!`;
      } else if (raceWrongAttempts === 1) {
        earned = perRaceQuestionScore * 0.5;
        msg = `🎉 Benar di percobaan ke-2! (+${earned.toFixed(1)} Poin - 50%) Mobilmu melesat maju!`;
      } else if (raceWrongAttempts === 2) {
        earned = perRaceQuestionScore * 0.25;
        msg = `🎉 Benar di percobaan ke-3! (+${earned.toFixed(1)} Poin - 25%) Mobilmu melesat maju!`;
      } else {
        earned = 0;
        msg = `🎉 Terbuka di percobaan ke-4 (0 Poin). Mobilmu tetap maju ke pos berikutnya!`;
      }

      const newScore = totalScore + earned;
      const newCorrect = totalCorrect + 1;
      const nextIdx = raceQuestionIdx + 1;

      setTotalScore(newScore);
      setTotalCorrect(newCorrect);
      setRaceFeedback({ isCorrect: true, message: msg });

      const currentAnswerItem = {
        room: 'Quiz Sprint Race',
        question: activeQ.question,
        correctOptionText: activeQ.options?.[activeQ.correctOption] || 'Jawaban Benar',
        isSolved: true,
        wrongAttempts: raceWrongAttempts,
        scoreEarned: earned
      };
      const updatedAnswersList = [...answersRecord, currentAnswerItem];
      setAnswersRecord(updatedAnswersList);

      const isCompleted = nextIdx >= totalRaceQuestions;

      // Jika balapan telah selesai, otomatis simpan ke database rekap nilai
      if (isCompleted) {
        saveStudentResult({
          nama: student.name,
          name: student.name,
          nim: student.nim || '-',
          score: newScore,
          correct: newCorrect,
          totalCorrect: newCorrect,
          totalLocks: totalRaceQuestions,
          totalQuestions: totalRaceQuestions,
          sessionMode: 'quiz_race',
          sessionPin: student.sessionPin || null,
          answers: updatedAnswersList,
          answersRecord: updatedAnswersList,
          timestamp: new Date().toISOString()
        });
      }

      // Update progres pemain ke jaringan real-time
      if (student?.sessionPin && student?.sessionId) {
        updatePlayerProgress(student.sessionPin, student.sessionId, {
          score: newScore,
          solvedCount: newCorrect,
          progressIdx: nextIdx,
          totalQuestions: totalRaceQuestions,
          isFinished: isCompleted,
          answersRecord: updatedAnswersList
        });
      }

      // Jeda sebelum lanjut ke soal berikutnya agar pemain membaca feedback & melihat animasi
      setTimeout(() => {
        setRaceFeedback(null);
        setRaceWrongAttempts(0);
        setRaceDisabledOptions(new Set());
        if (isCompleted) {
          setIsFinished(true);
          setShowPodium(true);
        } else {
          setRaceQuestionIdx(nextIdx);
        }
      }, 800);

    } else {
      // Jawaban Salah: Percobaan ke-3 masih dapat poin (25%), percobaan ke-4 baru 0 poin
      const nextWrong = raceWrongAttempts + 1;
      setRaceWrongAttempts(nextWrong);
      setRaceDisabledOptions(prev => new Set(prev).add(selectedOption));

      let penaltyMsg = '';
      if (nextWrong === 1) {
        penaltyMsg = `❌ Jawaban belum tepat! Percobaan ke-2 bernilai 50% poin. Coba opsi lain!`;
      } else if (nextWrong === 2) {
        penaltyMsg = `❌ Belum tepat! Percobaan ke-3 masih bernilai 25% poin. Periksa kembali pertanyaannya!`;
      } else {
        penaltyMsg = `❌ Masih salah! Percobaan ke-4 bernilai 0 poin. Pilih jawaban yang tepat agar mobilmu bisa lanjut!`;
      }

      setRaceFeedback({
        isCorrect: false,
        message: penaltyMsg
      });
    }
  };

  // Handler jika waktu pengerjaan suatu pos kuis habis
  const handleTimeExpired = () => {
    if (raceFeedback?.isCorrect || isFinished) return;

    const activeQ = raceQuestions[raceQuestionIdx];
    if (!activeQ) return;

    // Tampilkan peringatan waktu habis & beri penalti
    setRaceFeedback({
      isCorrect: false,
      message: '⏰ Waktu Habis! Kamu kehabisan waktu pada pos ini (0 Poin). Melanjutkan ke pos berikutnya...'
    });

    const nextIdx = raceQuestionIdx + 1;
    const isCompleted = nextIdx >= totalRaceQuestions;

    const timeoutAnswerItem = {
      room: 'Quiz Sprint Race',
      question: activeQ.question,
      correctOptionText: activeQ.options?.[activeQ.correctOption] || 'Jawaban Benar',
      isSolved: false,
      wrongAttempts: raceWrongAttempts + 1,
      scoreEarned: 0
    };
    const updatedTimeoutList = [...answersRecord, timeoutAnswerItem];
    setAnswersRecord(updatedTimeoutList);

    if (isCompleted) {
      saveStudentResult({
        nama: student.name,
        name: student.name,
        nim: student.nim || '-',
        score: totalScore,
        correct: totalCorrect,
        totalCorrect: totalCorrect,
        totalLocks: totalRaceQuestions,
        totalQuestions: totalRaceQuestions,
        sessionMode: 'quiz_race',
        sessionPin: student.sessionPin || null,
        answers: updatedTimeoutList,
        answersRecord: updatedTimeoutList,
        timestamp: new Date().toISOString()
      });
    }

    if (student?.sessionPin && student?.sessionId) {
      updatePlayerProgress(student.sessionPin, student.sessionId, {
        score: totalScore,
        solvedCount: totalCorrect,
        progressIdx: nextIdx,
        totalQuestions: totalRaceQuestions,
        isFinished: isCompleted,
        answersRecord: updatedTimeoutList
      });
    }

    setTimeout(() => {
      setRaceFeedback(null);
      setRaceWrongAttempts(0);
      setRaceDisabledOptions(new Set());
      if (isCompleted) {
        setIsFinished(true);
        setShowPodium(true);
      } else {
        setRaceQuestionIdx(nextIdx);
      }
    }, 1200);
  };

  // Timer Countdown per Pos Soal Balap
  useEffect(() => {
    if (!isRaceMode || isFinished || sessionStatus !== 'in_progress' || !activeRaceQ || raceFeedback?.isCorrect) {
      return;
    }

    const currentLimit = activeRaceQ?.timeLimit || student?.timePerQuestion || 30;
    setTimeLeft(currentLimit);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [raceQuestionIdx, isFinished, sessionStatus, isRaceMode, !!raceFeedback?.isCorrect]);

  // Handler Lanjut Ruangan / Selesai (saat masuk pintu portal di 2D)
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

  // Handler Finish Race (pada Quiz Race Mode)
  const handleFinishRace = () => {
    setIsFinished(true);
    setShowPodium(true);
  };

  // Handler Restart Permainan / Keluar Sesi
  const handleRestart = () => {
    if (student?.sessionPin && student?.sessionId) {
      leaveClassSession(student.sessionPin, student.sessionId);
    }
    try {
      sessionStorage.removeItem(STORAGE_GAME_STATE_KEY);
    } catch (e) {}

    setStudent(null);
    setCurrentRoomIdx(0);
    setIsFinished(false);
    setCollectedKeys([]);
    setTotalScore(0);
    setTotalCorrect(0);
    setAnswersRecord([]);
    setSolvedLocksMap({});
    setActiveModalLockIdx(null);
    setSessionStatus('in_progress');
    setRaceQuestionIdx(0);
    setRaceWrongAttempts(0);
    setRaceDisabledOptions(new Set());
    setRaceFeedback(null);
    setShowPodium(false);
  };

  const activeRoom = rooms[currentRoomIdx];
  const activeSolvedLocks = solvedLocksMap[currentRoomIdx] || [];

  return (
    <div>
      {/* Background SVG dinamis */}
      <SkyBackground />

      {/* Modal Podium Kemenangan */}
      {showPodium && (
        <PodiumModal
          players={connectedPlayers}
          onClose={() => setShowPodium(false)}
        />
      )}

      <div className="wrap">
        {/* Header Edukatif */}
        <Header />

        {/* Indikator Progres */}
        {student && sessionStatus === 'in_progress' && (
          <ProgressBar
            rooms={rooms}
            currentRoomIdx={isRaceMode ? Math.floor((raceQuestionIdx / Math.max(1, totalRaceQuestions)) * rooms.length) : currentRoomIdx}
            isFinished={isFinished}
          />
        )}

        {/* Bar Status Sesi Mahasiswa */}
        {student && sessionStatus === 'in_progress' && !isFinished && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            background: 'rgba(15, 23, 42, 0.82)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '16px',
            padding: '10px 18px',
            marginBottom: '16px',
            border: '1px solid rgba(168, 85, 247, 0.35)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: isRaceMode ? 'rgba(251, 191, 36, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3em'
              }}>
                {student.characterType === 'kart' ? '🏎️' : '🏃'}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.98em', color: '#c084fc' }}>
                  {student.name} ({student.nim})
                </div>
                <div style={{ fontSize: '0.78em', color: '#94a3b8' }}>
                  {student.sessionPin ? `Sesi Kelas PIN: ${student.sessionPin} • ${student.sessionTitle}` : 'Mode Mandiri (Solo Practice)'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                background: 'rgba(168, 85, 247, 0.2)',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                color: '#c084fc',
                padding: '4px 12px',
                borderRadius: '20px',
                fontWeight: 800,
                fontSize: '0.88em'
              }}>
                Skor: {totalScore.toFixed(1)} Poin
              </div>

              {isRaceMode && (
                <div style={{
                  background: 'rgba(56, 189, 248, 0.2)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  color: '#38bdf8',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontWeight: 800,
                  fontSize: '0.88em'
                }}>
                  🏁 Pos {Math.min(totalRaceQuestions, raceQuestionIdx + 1)} / {totalRaceQuestions}
                </div>
              )}

              {/* Tombol Lihat Podium jika sudah ada yang finish */}
              {student.sessionPin && (
                <button
                  type="button"
                  onClick={() => setShowPodium(true)}
                  style={{
                    background: 'rgba(234, 179, 8, 0.15)',
                    border: '1px solid rgba(234, 179, 8, 0.4)',
                    borderRadius: '10px',
                    padding: '4px 10px',
                    fontSize: '0.78em',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#facc15'
                  }}
                  title="Lihat Papan Podium Juara"
                >
                  <Trophy size={14} />
                  <span>Podium</span>
                </button>
              )}

              {/* Toggle Tampilan Cadangan: 2D Metaverse vs Kartu Klasik (hanya untuk Escape Room) */}
              {!isRaceMode && (
                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === 'metaverse' ? 'card' : 'metaverse')}
                  style={{
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    borderRadius: '10px',
                    padding: '4px 10px',
                    fontSize: '0.78em',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#cbd5e1'
                  }}
                >
                  <Layout size={14} />
                  <span>{viewMode === 'metaverse' ? 'Mode Kartu' : 'Mode 2D Metaverse'}</span>
                </button>
              )}

              {/* Tombol Keluar Sesi dengan Konfirmasi */}
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Yakin ingin keluar dari sesi permainan ini? Progres di perangkat ini akan direset.")) {
                    handleRestart();
                  }
                }}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '10px',
                  padding: '4px 10px',
                  fontSize: '0.78em',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#fca5a5'
                }}
                title="Keluar dari sesi dan kembali ke halaman awal"
              >
                <LogOut size={14} />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        )}

        {/* Konten Utama */}
        {loadingRooms ? (
          <div className="game-card" style={{ textAlign: 'center', padding: '50px' }}>
            <Sparkles size={32} color="var(--purple)" style={{ animation: 'spin 1.5s linear infinite' }} />
            <p style={{ marginTop: '12px', fontWeight: 600, color: 'var(--purple-dark)' }}>
              Menyiapkan Arena Edukasi 2D...
            </p>
          </div>
        ) : (!student || !student.sessionPin) ? (
          <StudentForm onStart={handleStartGame} />
        ) : sessionStatus === 'waiting' || sessionStatus === 'starting' ? (
          /* ======================================================== */
          /* LOBBY RUANG TUNGGU & HITUNG MUNDUR SERENTAK              */
          /* ======================================================== */
          <WaitingLobby
            student={student}
            onUpdateStudent={(updatedProps) => {
              setStudent(prev => ({ ...prev, ...updatedProps }));
            }}
            onCountdownComplete={() => setSessionStatus('in_progress')}
            onLeave={handleRestart}
          />
        ) : isFinished ? (
          <div>
            <VictoryCard
              student={student}
              collectedKeys={collectedKeys}
              totalScore={totalScore}
              totalCorrect={totalCorrect}
              totalLocks={isRaceMode ? totalRaceQuestions : totalLocks}
              answersRecord={answersRecord}
              rooms={rooms}
              onRestart={handleRestart}
            />

            {/* Tombol Buka Podium Kemenangan */}
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setShowPodium(true)}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                  border: 'none',
                  color: 'white',
                  borderRadius: '16px',
                  padding: '14px 28px',
                  fontSize: '1.1em',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <Trophy size={22} />
                <span>Lihat Upacara Podium Juara 🏆</span>
              </button>
            </div>
          </div>
        ) : isRaceMode ? (
          /* ======================================================== */
          /* SPRINT RACE MODE (ANSWER TO SPRINT)                      */
          /* ======================================================== */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Visualisasi Lintasan Sprint Multi-Jalur */}
            <PhaserCanvas
              mode="quiz_race"
              rooms={rooms}
              currentRoomIdx={0}
              solvedLocks={[]}
              student={student}
              sessionPin={student.sessionPin}
              totalQuestions={totalRaceQuestions}
            />

            {/* Card Pengerjaan Soal Balapan (Answer to Sprint) */}
            {activeRaceQ && (
              <div style={{
                background: 'rgba(15, 23, 42, 0.88)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                borderRadius: '24px',
                padding: 'clamp(16px, 4vw, 26px)',
                boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
                color: '#f8fafc'
              }}>
                {/* Header Soal */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(56, 189, 248, 0.2)', border: '1px solid rgba(56, 189, 248, 0.4)', padding: '5px 14px', borderRadius: '20px', color: '#38bdf8', fontSize: '0.85em', fontWeight: 800 }}>
                      <Flame size={16} />
                      <span>POS KUIS #{raceQuestionIdx + 1} DARI {totalRaceQuestions}</span>
                      {activeRaceQ.topic && (
                        <>
                          <span>•</span>
                          <span>{activeRaceQ.topic}</span>
                        </>
                      )}
                    </div>

                    {/* Badge Sisa Waktu Countdown */}
                    {activeRaceQ && (activeRaceQ.timeLimit || student?.timePerQuestion || 30) > 0 && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: timeLeft <= 5 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.2)',
                        border: `1px solid ${timeLeft <= 5 ? '#ef4444' : '#f59e0b'}`,
                        color: timeLeft <= 5 ? '#fca5a5' : '#fcd34d',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontWeight: 900,
                        fontSize: '0.85em',
                        transition: 'all 0.3s ease'
                      }}>
                        <Clock size={15} />
                        <span>{timeLeft}s</span>
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: '0.82em', color: '#94a3b8' }}>
                    Jawab benar untuk memacu kendaraanmu melesat maju!
                  </div>
                </div>

                {/* Progress Bar Countdown Waktu */}
                {activeRaceQ && (activeRaceQ.timeLimit || student?.timePerQuestion || 30) > 0 && (() => {
                  const limit = activeRaceQ.timeLimit || student?.timePerQuestion || 30;
                  const pct = Math.max(0, Math.min(100, (timeLeft / limit) * 100));
                  const barColor = pct > 50 ? '#22c55e' : pct > 20 ? '#f59e0b' : '#ef4444';
                  return (
                    <div style={{
                      width: '100%',
                      height: '6px',
                      background: 'rgba(51, 65, 85, 0.5)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      marginBottom: '16px'
                    }}>
                      <div style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: barColor,
                        borderRadius: '8px',
                        transition: 'width 1s linear, background 0.3s ease',
                        boxShadow: pct <= 20 ? '0 0 10px rgba(239, 68, 68, 0.8)' : 'none'
                      }} />
                    </div>
                  );
                })()}

                {/* Teks Cerita / Soal */}
                {activeRaceQ.story && (
                  <div style={{
                    background: 'rgba(30, 41, 59, 0.6)',
                    borderLeft: '4px solid #38bdf8',
                    padding: '12px 16px',
                    borderRadius: '0 12px 12px 0',
                    color: '#cbd5e1',
                    fontSize: '0.92em',
                    lineHeight: 1.6,
                    marginBottom: '16px'
                  }}>
                    {activeRaceQ.story}
                  </div>
                )}

                <h3 style={{ margin: '0 0 20px', fontSize: '1.2em', color: '#f8fafc', lineHeight: 1.5 }}>
                  {activeRaceQ.question}
                </h3>

                {/* Feedback Jawaban */}
                {raceFeedback && (
                  <div style={{
                    background: raceFeedback.isCorrect ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    border: `1px solid ${raceFeedback.isCorrect ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
                    borderRadius: '12px',
                    padding: '12px 16px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: raceFeedback.isCorrect ? '#4ade80' : '#fca5a5',
                    fontSize: '0.92em',
                    fontWeight: 700
                  }}>
                    {raceFeedback.isCorrect ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span>{raceFeedback.message}</span>
                  </div>
                )}

                {/* Opsi Jawaban Pilihan Ganda (Tersusun Vertikal Ke Bawah) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                  {(activeRaceQ.options || []).map((opt, oIdx) => {
                    const letters = ['A', 'B', 'C', 'D', 'E'];
                    const isWrongChosen = raceDisabledOptions.has(oIdx);
                    const isDisabled = isWrongChosen || !!raceFeedback?.isCorrect;

                    return (
                      <button
                        key={oIdx}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => handleAnswerSprintQuestion(oIdx)}
                        style={{
                          width: '100%',
                          background: isWrongChosen ? 'rgba(239, 68, 68, 0.12)' : 'rgba(30, 41, 59, 0.8)',
                          border: isWrongChosen ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(148, 163, 184, 0.25)',
                          borderRadius: '14px',
                          padding: '14px 18px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          color: isWrongChosen ? '#94a3b8' : '#f8fafc',
                          textDecoration: isWrongChosen ? 'line-through' : 'none',
                          opacity: isWrongChosen ? 0.6 : 1,
                          textAlign: 'left',
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          transition: 'all 0.15s ease',
                          fontSize: '0.96em',
                          lineHeight: 1.45,
                          minHeight: '54px',
                          boxSizing: 'border-box'
                        }}
                        onMouseEnter={(e) => {
                          if (isDisabled) return;
                          e.currentTarget.style.borderColor = '#38bdf8';
                          e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)';
                          e.currentTarget.style.transform = 'translateX(6px)';
                        }}
                        onMouseLeave={(e) => {
                          if (isDisabled) return;
                          e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.25)';
                          e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          background: isWrongChosen ? 'rgba(239, 68, 68, 0.25)' : 'rgba(56, 189, 248, 0.2)',
                          color: isWrongChosen ? '#f87171' : '#38bdf8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          fontSize: '0.95em',
                          flexShrink: 0
                        }}>
                          {isWrongChosen ? '✕' : (letters[oIdx] || oIdx + 1)}
                        </div>
                        <span style={{ flex: 1 }}>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : viewMode === 'metaverse' ? (
          /* ======================================================== */
          /* MODE 2D METAVERSE (ESCAPE ROOM EXPLORATION)              */
          /* ======================================================== */
          <div>
            <PhaserCanvas
              mode="escape_room"
              rooms={rooms}
              currentRoomIdx={currentRoomIdx}
              solvedLocks={activeSolvedLocks}
              student={student}
              sessionPin={student.sessionPin}
              onTriggerLock={(lockIdx) => setActiveModalLockIdx(lockIdx)}
              onEnterPortal={handleNextRoom}
              onTriggerCheckpoint={(cpIdx, qData) => setActiveModalLockIdx(cpIdx)}
              onFinishRace={handleFinishRace}
            />

            {/* Modal Soal Interaktif React */}
            <QuestionModal
              isOpen={activeModalLockIdx !== null}
              onClose={() => setActiveModalLockIdx(null)}
              room={activeRoom}
              lockIndex={activeModalLockIdx ?? 0}
              perLockMax={perLockMax}
              onSolved={handleLockSolved}
              isSolvedInitially={activeSolvedLocks.includes(activeModalLockIdx)}
              mode="escape_room"
            />
          </div>
        ) : activeRoom ? (
          /* ======================================================== */
          /* MODE CADANGAN KARTU KLASIK                               */
          /* ======================================================== */
          <RoomCard
            room={activeRoom}
            roomIdx={currentRoomIdx}
            totalRooms={rooms.length}
            solvedLocks={activeSolvedLocks}
            perLockMax={perLockMax}
            onSolved={handleLockSolved}
            onNextRoom={handleNextRoom}
            isFinished={isFinished}
          />
        ) : (
          <div className="game-card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: 'var(--red)', fontWeight: 700 }}>
              Ruangan permainan belum tersedia. Silakan hubungi dosen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
