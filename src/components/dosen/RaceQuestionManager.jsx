import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Flame,
  Plus,
  Sparkles,
  Edit2,
  Trash2,
  CheckCircle2,
  RotateCcw,
  BookOpen,
  HelpCircle,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { getStoredRaceQuestions, saveStoredRaceQuestions, defaultRaceQuestions } from '../../data/defaultRaceQuestions';
import { getRaceQuestionsFromDb } from '../../supabase/db';
import { exportRaceQuestionsToExcel } from '../../utils/excelQuestions';
import AiGeneratorModal from './AiGeneratorModal';
import Swal from '../../utils/swal';

export default function RaceQuestionManager({ onRaceQuestionsUpdated }) {
  const [questions, setQuestions] = useState(() => getStoredRaceQuestions());
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null); // null | question object (new or edit)
  const [isNewQuestion, setIsNewQuestion] = useState(false);

  // Sinkronkan bank soal balap dari database Supabase saat halaman dibuka
  useEffect(() => {
    let mounted = true;
    getRaceQuestionsFromDb().then((dbQuestions) => {
      if (mounted && Array.isArray(dbQuestions) && dbQuestions.length > 0) {
        setQuestions(dbQuestions);
        if (onRaceQuestionsUpdated) onRaceQuestionsUpdated(dbQuestions);
      }
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  // Form State untuk Tambah/Edit Soal
  const [formStory, setFormStory] = useState('');
  const [formQuestion, setFormQuestion] = useState('');
  const [formOptions, setFormOptions] = useState(['', '', '', '']);
  const [formCorrectOption, setFormCorrectOption] = useState(0);
  const [formExplanation, setFormExplanation] = useState('');

  const updateQuestionsState = (newQuestions) => {
    setQuestions(newQuestions);
    saveStoredRaceQuestions(newQuestions);
    if (onRaceQuestionsUpdated) {
      onRaceQuestionsUpdated(newQuestions);
    }
  };

  const handleOpenAdd = () => {
    setIsNewQuestion(true);
    setFormStory('');
    setFormQuestion('');
    setFormOptions(['', '', '', '']);
    setFormCorrectOption(0);
    setFormExplanation('');
    setEditingQuestion({});
  };

  const handleOpenEdit = (q) => {
    setIsNewQuestion(false);
    setFormStory(q.story || '');
    setFormQuestion(q.question || '');
    setFormOptions(q.options || ['', '', '', '']);
    setFormCorrectOption(q.correctOption ?? 0);
    setFormExplanation(q.explanation || '');
    setEditingQuestion(q);
  };

  const handleSaveQuestion = (e) => {
    e.preventDefault();
    if (!formQuestion.trim()) return;

    const newQ = {
      id: isNewQuestion ? `race_q_${Date.now()}` : editingQuestion.id,
      story: formStory.trim(),
      question: formQuestion.trim(),
      options: formOptions.map((opt, i) => opt.trim() || `Opsi ${String.fromCharCode(65 + i)}`),
      correctOption: Number(formCorrectOption),
      explanation: formExplanation.trim()
    };

    let updated = [];
    if (isNewQuestion) {
      updated = [...questions, newQ];
    } else {
      updated = questions.map(q => q.id === editingQuestion.id ? newQ : q);
    }

    updateQuestionsState(updated);
    setEditingQuestion(null);
  };

  const handleDelete = async (id) => {
    const res = await Swal.fire({
      title: 'Hapus Soal Ini?',
      text: 'Butir soal kuis balap yang dipilih akan dihapus.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });
    if (res.isConfirmed) {
      const updated = questions.filter(q => q.id !== id);
      updateQuestionsState(updated);
      Swal.fire({
        icon: 'success',
        title: 'Terhapus!',
        text: 'Soal telah dihapus.',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  const handleDeleteAll = async () => {
    if (questions.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Bank Soal Kosong',
        text: 'Tidak ada butir soal untuk dihapus.'
      });
      return;
    }

    const res = await Swal.fire({
      title: 'Hapus Semua Soal?',
      html: `Apakah Anda yakin ingin menghapus seluruh <b>${questions.length} butir soal</b> di bank soal balap?<br/><span style="color: #f87171; font-size: 0.9em;">Tindakan ini akan mengosongkan seluruh soal kuis balap!</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus Semua!',
      cancelButtonText: 'Batal'
    });

    if (res.isConfirmed) {
      updateQuestionsState([]);
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Dikosongkan!',
        text: 'Seluruh butir soal balap telah berhasil dihapus.',
        timer: 1800,
        showConfirmButton: false
      });
    }
  };

  const handleResetToDefault = async () => {
    const res = await Swal.fire({
      title: 'Reset ke Soal Default?',
      text: 'Bank soal akan dipulihkan ke 20 butir soal observasi anak standar bawaan sistem.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Pulihkan Default',
      cancelButtonText: 'Batal'
    });
    if (res.isConfirmed) {
      updateQuestionsState(defaultRaceQuestions);
      Swal.fire({
        icon: 'success',
        title: 'Dipulihkan!',
        text: 'Bank soal berhasil dipulihkan ke soal bawaan.',
        timer: 1800,
        showConfirmButton: false
      });
    }
  };

  const handleApplyAiQuestions = (generatedQuestions) => {
    updateQuestionsState(generatedQuestions);
  };

  return (
    <div>
      {/* Modal AI Generator khusus mode balap */}
      <AiGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        initialMode="quiz_race"
        onApplyRaceQuestions={handleApplyAiQuestions}
      />

      {/* Modal Form Tambah / Edit Soal */}
      {editingQuestion && createPortal(
        <div className="modal-backdrop" onClick={() => setEditingQuestion(null)} style={{ zIndex: 9999 }}>
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '640px', width: '95%', padding: '24px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(148, 163, 184, 0.2)', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.2em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flame size={20} color="#f59e0b" />
                <span>{isNewQuestion ? 'Tambah Butir Soal Balap Baru' : 'Edit Butir Soal Balap'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Skenario / Kasus Observasi Ringkas (1-2 Kalimat)</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Contoh: Budi (4 tahun) bermain balok sendiri tanpa memedulikan teman di sebelahnya..."
                  value={formStory}
                  onChange={(e) => setFormStory(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Pertanyaan Analisis</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Tahapan bermain yang ditunjukkan oleh Budi adalah..."
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Pilihan Jawaban (Pilih Lingkaran untuk Kunci Jawaban Benar)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {formOptions.map((opt, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="radio"
                        name="correctOptionRadio"
                        checked={formCorrectOption === idx}
                        onChange={() => setFormCorrectOption(idx)}
                        style={{ accentColor: '#4ade80', width: '18px', height: '18px', cursor: 'pointer' }}
                        title="Jadikan sebagai kunci jawaban benar"
                      />
                      <span style={{ fontWeight: 800, color: formCorrectOption === idx ? '#4ade80' : '#cbd5e1', width: '24px' }}>
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      <input
                        type="text"
                        className="form-input"
                        placeholder={`Teks Opsi ${String.fromCharCode(65 + idx)}`}
                        value={opt}
                        onChange={(e) => {
                          const updated = [...formOptions];
                          updated[idx] = e.target.value;
                          setFormOptions(updated);
                        }}
                        required
                        style={{
                          borderColor: formCorrectOption === idx ? '#4ade80' : 'rgba(148, 163, 184, 0.25)'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Penjelasan / Pembahasan Singkat</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Solitary play ditandai dengan anak asyik sendiri..."
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="secondary-btn"
                  style={{ borderRadius: '10px', padding: '8px 16px' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px 20px',
                    color: 'white',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Simpan Soal
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Top Action Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px',
        marginBottom: '20px'
      }}>
        <div>
          <h3 style={{ margin: '0 0 4px', color: '#fbbf24', fontSize: '1.3em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={24} color="#f59e0b" />
            <span>Bank Soal Game Balap (Quiz Race)</span>
          </h3>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.88em' }}>
            Kumpulan soal murni tanpa ruangan & gembok. Setiap 1 jawaban benar memacu mobil melesat 1 langkah menuju garis finish.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => exportRaceQuestionsToExcel(questions)}
            className="secondary-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85em',
              borderRadius: '10px',
              color: '#4ade80',
              borderColor: 'rgba(34, 197, 94, 0.4)',
              background: 'rgba(34, 197, 94, 0.12)'
            }}
            title="Unduh seluruh soal balap yang telah di-generate / aktif ke file Excel (.xlsx)"
          >
            <FileSpreadsheet size={16} color="#4ade80" />
            <span>Export Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={handleResetToDefault}
            className="secondary-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85em', borderRadius: '10px' }}
            title="Reset ke koleksi soal standar"
          >
            <RotateCcw size={16} />
            <span>Reset Default</span>
          </button>

          <button
            type="button"
            onClick={handleDeleteAll}
            className="secondary-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85em',
              borderRadius: '10px',
              color: '#fca5a5',
              borderColor: 'rgba(239, 68, 68, 0.4)',
              background: 'rgba(239, 68, 68, 0.12)'
            }}
            title="Hapus seluruh butir soal balapan"
          >
            <Trash2 size={16} color="#ef4444" />
            <span>Hapus Semua</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="secondary-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85em', borderRadius: '10px' }}
          >
            <Plus size={16} />
            <span>Tambah Manual</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 18px',
              color: 'white',
              fontWeight: 800,
              fontSize: '0.9em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)'
            }}
          >
            <Sparkles size={18} />
            <span>AI Generate Soal Balap</span>
          </button>
        </div>
      </div>

      {/* Info Total Soal */}
      <div style={{
        background: questions.length === 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
        border: questions.length === 0 ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '14px',
        padding: '12px 18px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        fontSize: '0.9em',
        color: '#f8fafc'
      }}>
        <span>
          {questions.length === 0 ? (
            <span style={{ color: '#fca5a5' }}>
              ⚠️ <b>Bank soal balap sedang kosong (0 butir).</b> Silakan buat soal dengan AI atau tambah manual agar mahasiswa dapat melaju di Sesi Balap.
            </span>
          ) : (
            <span>Tersedia <b>{questions.length} butir soal balapan aktif</b>. Seluruh soal ini akan otomatis dimainkan saat membuka Sesi Balap.</span>
          )}
        </span>
        <span style={{ color: questions.length === 0 ? '#ef4444' : '#fbbf24', fontWeight: 800 }}>
          🏁 {questions.length} Checkpoint Balap
        </span>
      </div>

      {/* List Kartu Soal / Empty State */}
      {questions.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          background: 'rgba(30, 41, 59, 0.55)',
          border: '2px dashed rgba(245, 158, 11, 0.35)',
          borderRadius: '20px',
          color: '#cbd5e1',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            margin: '0 auto 16px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(239, 68, 68, 0.2) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 24px rgba(245, 158, 11, 0.3)'
          }}>
            <Flame size={36} color="#fbbf24" />
          </div>

          <h3 style={{ margin: '0 0 8px', color: '#f8fafc', fontSize: '1.35em', fontWeight: 800 }}>
            Bank Soal Balap Masih Kosong
          </h3>
          <p style={{ margin: '0 auto 24px', maxWidth: '540px', color: '#94a3b8', fontSize: '0.94em', lineHeight: 1.6 }}>
            Belum ada butir soal analisis studi kasus observasi anak yang tersimpan. Anda dapat membuat soal otomatis dengan Gemini AI, menambahkan secara manual, atau memulihkan soal bawaan.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setIsAiModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 22px',
                color: 'white',
                fontWeight: 800,
                fontSize: '0.92em',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 18px rgba(245, 158, 11, 0.45)'
              }}
            >
              <Sparkles size={18} />
              <span>Buat Soal Otomatis dengan AI</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="secondary-btn"
              style={{
                borderRadius: '12px',
                padding: '12px 20px',
                fontSize: '0.92em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid rgba(148, 163, 184, 0.3)'
              }}
            >
              <Plus size={18} />
              <span>Tambah Soal Manual</span>
            </button>

            <button
              type="button"
              onClick={handleResetToDefault}
              className="secondary-btn"
              style={{
                borderRadius: '12px',
                padding: '12px 20px',
                fontSize: '0.92em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid rgba(148, 163, 184, 0.3)'
              }}
            >
              <RotateCcw size={18} />
              <span>Muat Soal Bawaan (Default)</span>
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {questions.map((q, idx) => (
            <div
              key={q.id || idx}
              style={{
                background: 'rgba(30, 41, 59, 0.75)',
                border: '1px solid rgba(148, 163, 184, 0.25)',
                borderRadius: '16px',
                padding: '18px 20px',
                color: '#f8fafc',
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                    color: 'white',
                    fontWeight: 900,
                    fontSize: '0.78em',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    letterSpacing: '1px'
                  }}>
                    POS BALAP #{idx + 1}
                  </span>

                  {q.story && (
                    <span style={{ fontSize: '0.85em', color: '#94a3b8', fontStyle: 'italic' }}>
                      "{q.story}"
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(q)}
                    className="secondary-btn"
                    style={{ padding: '6px 10px', borderRadius: '8px', fontSize: '0.8em', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Edit2 size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(q.id)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#fca5a5',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      fontSize: '0.8em',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Trash2 size={14} />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>

              <h4 style={{ margin: '0 0 14px', fontSize: '1.05em', color: '#f8fafc', lineHeight: 1.5 }}>
                {q.question}
              </h4>

              {/* Opsi Jawaban */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                {(q.options || []).map((opt, oIdx) => {
                  const isCorrect = oIdx === q.correctOption;
                  return (
                    <div
                      key={oIdx}
                      style={{
                        background: isCorrect ? 'rgba(34, 197, 94, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                        border: `1px solid ${isCorrect ? 'rgba(34, 197, 94, 0.6)' : 'rgba(148, 163, 184, 0.2)'}`,
                        borderRadius: '10px',
                        padding: '10px 14px',
                        fontSize: '0.88em',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: isCorrect ? '#4ade80' : '#cbd5e1'
                      }}
                    >
                      <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                      {isCorrect && <CheckCircle2 size={18} color="#4ade80" />}
                    </div>
                  );
                })}
              </div>

              {q.explanation && (
                <div style={{ marginTop: '10px', fontSize: '0.8em', color: '#94a3b8', fontStyle: 'italic' }}>
                  💡 Pembahasan: {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

