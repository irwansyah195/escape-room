import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  X,
  FileText,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen,
  ArrowRight,
  Eye,
  KeyRound,
  RotateCcw,
  Upload,
  Flame,
  Gamepad2
} from 'lucide-react';
import {
  generateRoomsWithAI,
  generateRaceQuestionsWithAI,
  DIFFICULTY_LEVELS,
  getStoredGeminiKey,
  saveStoredGeminiKey
} from '../../utils/aiQuestionGenerator';

export default function AiGeneratorModal({
  isOpen,
  onClose,
  onApplyRooms,
  onApplyRaceQuestions,
  initialMode = 'quiz_race'
}) {
  const [generatorMode, setGeneratorMode] = useState(initialMode); // 'escape_room' | 'quiz_race'
  const [topic, setTopic] = useState('Observasi Perkembangan Bermain Anak Usia Dini');
  const [materialText, setMaterialText] = useState('');
  const [difficulty, setDifficulty] = useState('sedang');

  // Input khusus Escape Room
  const [roomCount, setRoomCount] = useState(3);
  const [locksPerRoom, setLocksPerRoom] = useState(2);

  // Input khusus Game Balap (Murni Butir Soal)
  const [questionCount, setQuestionCount] = useState(10);

  const [apiKey, setApiKey] = useState(() => getStoredGeminiKey());
  const [showApiKeyInput, setShowApiKeyInput] = useState(!getStoredGeminiKey());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewRooms, setPreviewRooms] = useState(null);
  const [previewRaceQuestions, setPreviewRaceQuestions] = useState(null);

  if (!isOpen) return null;

  const handleSaveApiKey = () => {
    saveStoredGeminiKey(apiKey);
    setShowApiKeyInput(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setMaterialText(prev => prev ? `${prev}\n\n${text}` : text);
      }
    };
    reader.readAsText(file);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (generatorMode === 'quiz_race') {
        const questions = await generateRaceQuestionsWithAI({
          topic,
          materialText,
          difficulty,
          questionCount: Number(questionCount),
          apiKey
        });
        setPreviewRaceQuestions(questions);
        setPreviewRooms(null);
      } else {
        const rooms = await generateRoomsWithAI({
          topic,
          materialText,
          difficulty,
          roomCount: Number(roomCount),
          locksPerRoom: Number(locksPerRoom),
          apiKey
        });
        setPreviewRooms(rooms);
        setPreviewRaceQuestions(null);
      }
    } catch (err) {
      setError(err.message || 'Gagal menghasilkan soal dengan AI.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmApply = () => {
    if (generatorMode === 'quiz_race' && previewRaceQuestions) {
      if (onApplyRaceQuestions) onApplyRaceQuestions(previewRaceQuestions);
      onClose();
    } else if (previewRooms && previewRooms.length > 0) {
      if (onApplyRooms) onApplyRooms(previewRooms);
      onClose();
    }
  };

  const isRace = generatorMode === 'quiz_race';

  return createPortal(
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: (previewRooms || previewRaceQuestions) ? '900px' : '680px',
          width: '95%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px'
        }}
      >
        {/* Header Modal */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
          paddingBottom: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: isRace
                ? 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)'
                : 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Sparkles size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.25em' }}>
                AI Generator Pembelajaran
              </h3>
              <span style={{ fontSize: '0.82em', color: '#94a3b8' }}>
                Buat skenario dan bank soal otomatis berbasis Google Gemini AI
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="secondary-btn"
            style={{ padding: '6px', borderRadius: '50%', color: '#94a3b8' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* TAB PILIHAN MODE: ESCAPE ROOM VS GAME BALAP */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          marginBottom: '20px',
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '4px',
          borderRadius: '14px',
          border: '1px solid rgba(148, 163, 184, 0.2)'
        }}>
          {/* Tab 1: Game Balap (Murni Butir Soal) */}
          <button
            type="button"
            onClick={() => {
              setGeneratorMode('quiz_race');
              setPreviewRooms(null);
              setPreviewRaceQuestions(null);
            }}
            style={{
              background: isRace ? 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' : 'transparent',
              color: isRace ? 'white' : '#cbd5e1',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 14px',
              fontWeight: 800,
              fontSize: '0.9em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <Flame size={18} />
            <span>🏎️ Mode Game Balap (Murni Butir Soal)</span>
          </button>

          {/* Tab 2: Escape Room (Ruangan & Gembok) */}
          <button
            type="button"
            onClick={() => {
              setGeneratorMode('escape_room');
              setPreviewRooms(null);
              setPreviewRaceQuestions(null);
            }}
            style={{
              background: !isRace ? 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' : 'transparent',
              color: !isRace ? 'white' : '#cbd5e1',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 14px',
              fontWeight: 800,
              fontSize: '0.9em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <Gamepad2 size={18} />
            <span>🎮 Mode Escape Room (Ruangan & Gembok)</span>
          </button>
        </div>

        {/* Konten Scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              padding: '10px 14px',
              borderRadius: '10px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.9em'
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {!previewRooms && !previewRaceQuestions ? (
            /* ======================================================== */
            /* FORM INPUT GENERATOR                                     */
            /* ======================================================== */
            <form onSubmit={handleGenerate}>
              {/* Tema / Topik Pembelajaran */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BookOpen size={16} color="var(--purple)" />
                  <span>Tema Pembelajaran / Topik Observasi Anak</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Observasi Tahapan Bermain Parten & Piaget"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                />
              </div>

              {/* Upload Dokumen Rangkuman Materi */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={16} color="var(--purple)" />
                    <span>Rangkuman Materi / Silabus (Opsional)</span>
                  </label>
                  <label style={{
                    fontSize: '0.82em',
                    color: '#c084fc',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Upload size={14} />
                    <span>Upload File (.txt, .md)</span>
                    <input
                      type="file"
                      accept=".txt,.md,.json,.csv"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Paste rangkuman modul, konsep teori bermain, atau studi kasus nyata di sini sebagai bahan rujukan AI..."
                  value={materialText}
                  onChange={(e) => setMaterialText(e.target.value)}
                  style={{ resize: 'vertical', fontSize: '0.88em' }}
                />
              </div>

              {/* Pemilihan Tingkat Kesulitan */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Sliders size={16} color="var(--purple)" />
                  <span>Tingkat Kesulitan Soal</span>
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {Object.entries(DIFFICULTY_LEVELS).map(([lvlKey, lvl]) => {
                    const isSelected = difficulty === lvlKey;
                    return (
                      <div
                        key={lvlKey}
                        onClick={() => setDifficulty(lvlKey)}
                        style={{
                          background: isSelected ? 'rgba(168, 85, 247, 0.25)' : 'rgba(30, 41, 59, 0.5)',
                          border: `2px solid ${isSelected ? 'var(--purple)' : 'rgba(148, 163, 184, 0.2)'}`,
                          borderRadius: '12px',
                          padding: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ fontWeight: 800, fontSize: '0.88em', color: isSelected ? '#e9d5ff' : '#f8fafc', marginBottom: '4px' }}>
                          {lvl.label.split(' ')[0]} {lvl.label.split(' ')[1]}
                        </div>
                        <div style={{ fontSize: '0.72em', color: '#94a3b8', lineHeight: 1.3 }}>
                          {lvl.description.slice(0, 60)}...
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* INPUT SPESIFIK BERDASARKAN MODE */}
              {isRace ? (
                /* Mode Game Balap: MURNI JUMLAH SOAL */
                <div style={{
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  borderRadius: '14px',
                  padding: '16px 18px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="form-label" style={{ margin: 0, color: '#fbbf24', fontWeight: 800 }}>
                      🏁 Jumlah Butir Soal Balapan
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="number"
                        min={3}
                        max={35}
                        value={questionCount}
                        onChange={(e) => {
                          const val = Math.max(3, Math.min(35, Number(e.target.value) || 3));
                          setQuestionCount(val);
                        }}
                        className="form-input"
                        style={{ width: '70px', padding: '4px 8px', textAlign: 'center', fontWeight: 900, color: '#fbbf24', fontSize: '1.1em' }}
                      />
                      <span style={{ fontSize: '0.95em', fontWeight: 800, color: '#fbbf24' }}>
                        Soal (Maks: 35)
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={35}
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75em', color: '#94a3b8', marginTop: '4px' }}>
                    <span>Sprint Pendek (3 Soal)</span>
                    <span>Standar (15 Soal)</span>
                    <span>Panjang (25 Soal)</span>
                    <span>Maksimal (35 Soal)</span>
                  </div>

                  {/* Preset Pilihan Cepat */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
                    {[5, 10, 15, 20, 25, 30, 35].map(cnt => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setQuestionCount(cnt)}
                        style={{
                          background: questionCount === cnt ? '#f59e0b' : 'rgba(245, 158, 11, 0.15)',
                          color: questionCount === cnt ? '#1e1b4b' : '#fcd34d',
                          border: `1px solid ${questionCount === cnt ? '#f59e0b' : 'rgba(245, 158, 11, 0.4)'}`,
                          borderRadius: '8px',
                          padding: '4px 10px',
                          fontSize: '0.8em',
                          fontWeight: 800,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {cnt} Soal
                      </button>
                    ))}
                  </div>

                  {/* Info Skor Dinamis */}
                  <div style={{
                    marginTop: '12px',
                    fontSize: '0.82em',
                    color: '#fde68a',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px dashed rgba(245, 158, 11, 0.35)',
                    padding: '8px 12px',
                    borderRadius: '10px'
                  }}>
                    💡 <b>Skor Dinamis:</b> Setiap soal bernilai <b>{(100 / (questionCount || 1)).toFixed(2)} Poin</b> (Total akumulasi jika semua benar = <b>100 Poin Maksimal</b>).
                  </div>
                </div>
              ) : (
                /* Mode Escape Room: RUANGAN & GEMBOK */
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '14px',
                  background: 'rgba(168, 85, 247, 0.12)',
                  border: '1px solid rgba(168, 85, 247, 0.35)',
                  borderRadius: '14px',
                  padding: '16px 18px',
                  marginBottom: '20px'
                }}>
                  <div>
                    <label className="form-label" style={{ color: '#c084fc', marginBottom: '6px' }}>
                      Jumlah Ruangan Tematik
                    </label>
                    <select
                      className="form-input"
                      value={roomCount}
                      onChange={(e) => setRoomCount(Number(e.target.value))}
                    >
                      <option value={1}>1 Ruangan</option>
                      <option value={2}>2 Ruangan</option>
                      <option value={3}>3 Ruangan (Standar)</option>
                      <option value={4}>4 Ruangan</option>
                      <option value={5}>5 Ruangan</option>
                      <option value={6}>6 Ruangan</option>
                      <option value={7}>7 Ruangan (Maksimal)</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label" style={{ color: '#c084fc', marginBottom: '6px' }}>
                      Gembok Soal per Ruangan
                    </label>
                    <select
                      className="form-input"
                      value={locksPerRoom}
                      onChange={(e) => setLocksPerRoom(Number(e.target.value))}
                    >
                      <option value={1}>1 Gembok Soal</option>
                      <option value={2}>2 Gembok Soal (Standar)</option>
                      <option value={3}>3 Gembok Soal</option>
                      <option value={4}>4 Gembok Soal</option>
                      <option value={5}>5 Gembok Soal (Maksimal)</option>
                    </select>
                  </div>

                  <div style={{
                    gridColumn: '1 / -1',
                    fontSize: '0.82em',
                    color: '#e9d5ff',
                    background: 'rgba(168, 85, 247, 0.1)',
                    border: '1px dashed rgba(168, 85, 247, 0.35)',
                    padding: '8px 12px',
                    borderRadius: '10px'
                  }}>
                    💡 <b>Skor Dinamis:</b> Total {roomCount * locksPerRoom} gembok soal (masing-masing bernilai <b>{(100 / (roomCount * locksPerRoom || 1)).toFixed(2)} Poin</b> untuk total <b>100 Poin Maksimal</b>).
                  </div>
                </div>
              )}

              {/* Pengaturan API Key Gemini */}
              <div style={{ marginBottom: '20px' }}>
                {showApiKeyInput ? (
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px dashed rgba(148, 163, 184, 0.3)',
                    borderRadius: '10px',
                    padding: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.82em', fontWeight: 700, color: '#cbd5e1' }}>Google Gemini API Key</span>
                      <button
                        type="button"
                        onClick={handleSaveApiKey}
                        style={{ fontSize: '0.78em', color: '#c084fc', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                      >
                        Simpan Kunci
                      </button>
                    </div>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Masukkan Gemini API Key..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      style={{ fontSize: '0.82em' }}
                    />
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8em', color: '#94a3b8' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={14} color="#4ade80" />
                      <span>Gemini API Key Aktif</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowApiKeyInput(true)}
                      style={{ color: '#c084fc', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1em' }}
                    >
                      Ubah Kunci
                    </button>
                  </div>
                )}
              </div>

              {/* Tombol Eksekusi Generate */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="secondary-btn"
                  style={{ borderRadius: '12px', padding: '10px 20px' }}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: isRace
                      ? 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)'
                      : 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '10px 24px',
                    color: 'white',
                    fontWeight: 800,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: isRace ? '0 4px 15px rgba(245, 158, 11, 0.4)' : '0 4px 15px rgba(168, 85, 247, 0.4)'
                  }}
                >
                  <Sparkles size={18} />
                  <span>{loading ? 'AI Sedang Merancang Soal...' : isRace ? `🏎️ Generate ${questionCount} Soal Balap` : `🎮 Generate ${roomCount} Ruangan`}</span>
                </button>
              </div>
            </form>
          ) : previewRaceQuestions ? (
            /* ======================================================== */
            /* PREVIEW SOAL GAME BALAP                                  */
            /* ======================================================== */
            <div>
              <div style={{
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: '14px',
                padding: '14px 18px',
                marginBottom: '18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div>
                  <div style={{ fontWeight: 800, color: '#fbbf24', fontSize: '1.05em' }}>
                    🏁 Hasil Generate: {previewRaceQuestions.length} Butir Soal Balapan
                  </div>
                  <div style={{ fontSize: '0.82em', color: '#cbd5e1' }}>
                    Soal siap diterapkan ke Bank Soal Balap untuk dimainkan pada Sesi Kelas Quiz Race.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewRaceQuestions(null)}
                  className="secondary-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85em', borderRadius: '10px' }}
                >
                  <RotateCcw size={14} />
                  <span>Generate Ulang</span>
                </button>
              </div>

              {/* List Kartu Soal Balap */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                {previewRaceQuestions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    style={{
                      background: 'rgba(15, 23, 42, 0.75)',
                      border: '1px solid rgba(148, 163, 184, 0.25)',
                      borderRadius: '14px',
                      padding: '16px',
                      color: '#f8fafc'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{
                        background: '#f59e0b',
                        color: '#713f12',
                        fontWeight: 900,
                        fontSize: '0.78em',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        SOAL #{idx + 1}
                      </span>
                      {q.story && (
                        <span style={{ fontSize: '0.85em', color: '#94a3b8', fontStyle: 'italic' }}>
                          "{q.story}"
                        </span>
                      )}
                    </div>

                    <h4 style={{ margin: '0 0 12px', fontSize: '1em', color: '#f8fafc', lineHeight: 1.4 }}>
                      {q.question}
                    </h4>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {(q.options || []).map((opt, oIdx) => {
                        const isCorrect = oIdx === q.correctOption;
                        return (
                          <div
                            key={oIdx}
                            style={{
                              background: isCorrect ? 'rgba(34, 197, 94, 0.2)' : 'rgba(30, 41, 59, 0.6)',
                              border: `1px solid ${isCorrect ? 'rgba(34, 197, 94, 0.6)' : 'rgba(148, 163, 184, 0.2)'}`,
                              borderRadius: '8px',
                              padding: '8px 12px',
                              fontSize: '0.85em',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              color: isCorrect ? '#4ade80' : '#cbd5e1'
                            }}
                          >
                            <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                            {isCorrect && <CheckCircle2 size={16} color="#4ade80" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tombol Terapkan */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setPreviewRaceQuestions(null)}
                  className="secondary-btn"
                  style={{ borderRadius: '12px', padding: '10px 20px' }}
                >
                  Kembali
                </button>

                <button
                  type="button"
                  onClick={handleConfirmApply}
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 28px',
                    color: 'white',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)'
                  }}
                >
                  <CheckCircle2 size={18} />
                  <span>Terapkan {previewRaceQuestions.length} Soal ke Bank Soal Balap</span>
                </button>
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* PREVIEW RUANGAN ESCAPE ROOM                              */
            /* ======================================================== */
            <div>
              <div style={{
                background: 'rgba(168, 85, 247, 0.15)',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                borderRadius: '14px',
                padding: '14px 18px',
                marginBottom: '18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div>
                  <div style={{ fontWeight: 800, color: '#c084fc', fontSize: '1.05em' }}>
                    🎮 Hasil Generate: {previewRooms.length} Ruangan Escape Room
                  </div>
                  <div style={{ fontSize: '0.82em', color: '#cbd5e1' }}>
                    Ruangan tematik dan stasiun gembok siap diterapkan ke materi Escape Room.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewRooms(null)}
                  className="secondary-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85em', borderRadius: '10px' }}
                >
                  <RotateCcw size={14} />
                  <span>Generate Ulang</span>
                </button>
              </div>

              {/* List Kartu Ruangan Preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                {previewRooms.map((room, idx) => (
                  <div
                    key={room.id || idx}
                    style={{
                      background: 'rgba(15, 23, 42, 0.75)',
                      border: '1px solid rgba(148, 163, 184, 0.25)',
                      borderRadius: '14px',
                      padding: '16px',
                      color: '#f8fafc'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '1.4em' }}>{room.icon}</span>
                      <h4 style={{ margin: 0, fontSize: '1.05em', color: '#f8fafc' }}>{room.title}</h4>
                      <span style={{ marginLeft: 'auto', fontSize: '0.8em', color: '#c084fc', background: 'rgba(168, 85, 247, 0.2)', padding: '2px 8px', borderRadius: '10px' }}>
                        Kunci: {room.key} • {room.locks?.length || 0} Gembok
                      </span>
                    </div>

                    <p style={{ margin: '0 0 10px', fontSize: '0.85em', color: '#94a3b8', lineHeight: 1.5 }}>
                      {room.text?.slice(0, 150)}...
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {(room.locks || []).map((lock, lIdx) => (
                        <div
                          key={lIdx}
                          style={{
                            background: 'rgba(30, 41, 59, 0.5)',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            fontSize: '0.82em',
                            color: '#cbd5e1'
                          }}
                        >
                          🔒 <b>Gembok {lIdx + 1}:</b> {lock.question}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tombol Terapkan */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setPreviewRooms(null)}
                  className="secondary-btn"
                  style={{ borderRadius: '12px', padding: '10px 20px' }}
                >
                  Kembali
                </button>

                <button
                  type="button"
                  onClick={handleConfirmApply}
                  style={{
                    background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 28px',
                    color: 'white',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)'
                  }}
                >
                  <CheckCircle2 size={18} />
                  <span>Terapkan {previewRooms.length} Ruangan ke Escape Room</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
