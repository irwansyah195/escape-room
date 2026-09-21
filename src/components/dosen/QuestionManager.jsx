import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Lock,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Save,
  X,
  AlertCircle,
  HelpCircle,
  FolderPlus,
  Upload,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { saveRoomsToDb, resetRoomsInDb } from '../../firebase/config';
import { defaultRooms } from '../../data/defaultRooms';
import { EmojiPickerGrid, ROOM_ICONS, KEY_REWARDS } from './EmojiPicker';
import { generateQuestionTemplate, exportActiveRoomsToExcel } from '../../utils/excelQuestions';
import UploadExcelModal from './UploadExcelModal';

export default function QuestionManager({ rooms, onUpdateRooms }) {
  // State untuk modal edit ruangan
  const [editingRoom, setEditingRoom] = useState(null); // null atau { isNew: bool, roomData }
  // State untuk modal edit gembok/soal
  const [editingLock, setEditingLock] = useState(null); // null atau { roomIdx, lockIdx, isNew: bool, lockData }
  const [isSaving, setIsSaving] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const notify = (type, text) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const handleApplyFromExcel = async (newRooms) => {
    setIsSaving(true);
    await saveRoomsToDb(newRooms);
    onUpdateRooms(newRooms);
    setIsSaving(false);
    notify('success', `Berhasil menerapkan ${newRooms.length} ruangan dan soal baru dari Excel!`);
  };

  // -------------------------------------------------------------
  // HANDLER RUANGAN (ADD / EDIT / DELETE)
  // -------------------------------------------------------------
  const handleOpenAddRoom = () => {
    setEditingRoom({
      isNew: true,
      roomData: {
        id: `room-${Date.now()}`,
        title: '',
        icon: '🎨',
        decor: '🎨',
        key: '🟨',
        text: '',
        locks: []
      }
    });
  };

  const handleOpenEditRoom = (room, idx) => {
    setEditingRoom({
      isNew: false,
      roomIdx: idx,
      roomData: { ...room }
    });
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    const { isNew, roomIdx, roomData } = editingRoom;

    if (!roomData.title.trim() || !roomData.text.trim()) {
      alert('Judul ruangan dan narasi skenario wajib diisi.');
      return;
    }

    let updatedRooms = [...rooms];
    if (isNew) {
      updatedRooms.push(roomData);
    } else {
      updatedRooms[roomIdx] = { ...updatedRooms[roomIdx], ...roomData };
    }

    setIsSaving(true);
    await saveRoomsToDb(updatedRooms);
    onUpdateRooms(updatedRooms);
    setIsSaving(false);
    setEditingRoom(null);
    notify('success', `Ruangan "${roomData.title}" berhasil disimpan!`);
  };

  const handleDeleteRoom = async (roomIdx) => {
    const targetRoom = rooms[roomIdx];
    const confirmDel = window.confirm(`Apakah Anda yakin ingin menghapus ruangan "${targetRoom.title}" beserta seluruh soal di dalamnya?`);
    if (!confirmDel) return;

    const updatedRooms = rooms.filter((_, idx) => idx !== roomIdx);
    setIsSaving(true);
    await saveRoomsToDb(updatedRooms);
    onUpdateRooms(updatedRooms);
    setIsSaving(false);
    notify('success', `Ruangan "${targetRoom.title}" telah dihapus.`);
  };

  // -------------------------------------------------------------
  // HANDLER GEMBOK / SOAL (ADD / EDIT / DELETE)
  // -------------------------------------------------------------
  const handleOpenAddLock = (roomIdx) => {
    setEditingLock({
      roomIdx,
      isNew: true,
      lockData: {
        id: `lock-${Date.now()}`,
        q: '',
        options: ['', '', ''],
        correct: 0,
        hint: ''
      }
    });
  };

  const handleOpenEditLock = (roomIdx, lock, lockIdx) => {
    setEditingLock({
      roomIdx,
      lockIdx,
      isNew: false,
      lockData: {
        ...lock,
        options: [...(lock.options || ['', ''])]
      }
    });
  };

  const handleSaveLock = async (e) => {
    e.preventDefault();
    const { roomIdx, lockIdx, isNew, lockData } = editingLock;

    if (!lockData.q.trim()) {
      alert('Teks pertanyaan gembok wajib diisi.');
      return;
    }

    // Pastikan setiap opsi terisi
    const filledOptions = lockData.options.map(o => o.trim()).filter(Boolean);
    if (filledOptions.length < 2) {
      alert('Minimal harus ada 2 pilihan ganda yang tidak kosong.');
      return;
    }

    if (lockData.correct >= filledOptions.length) {
      lockData.correct = 0;
    }

    const updatedRooms = [...rooms];
    const roomToUpdate = { ...updatedRooms[roomIdx] };
    const currentLocks = [...(roomToUpdate.locks || [])];

    const cleanLockData = {
      ...lockData,
      options: filledOptions
    };

    if (isNew) {
      currentLocks.push(cleanLockData);
    } else {
      currentLocks[lockIdx] = cleanLockData;
    }

    roomToUpdate.locks = currentLocks;
    updatedRooms[roomIdx] = roomToUpdate;

    setIsSaving(true);
    await saveRoomsToDb(updatedRooms);
    onUpdateRooms(updatedRooms);
    setIsSaving(false);
    setEditingLock(null);
    notify('success', 'Soal gembok berhasil disimpan!');
  };

  const handleDeleteLock = async (roomIdx, lockIdx) => {
    const confirmDel = window.confirm('Hapus gembok / soal ini?');
    if (!confirmDel) return;

    const updatedRooms = [...rooms];
    const roomToUpdate = { ...updatedRooms[roomIdx] };
    roomToUpdate.locks = roomToUpdate.locks.filter((_, idx) => idx !== lockIdx);
    updatedRooms[roomIdx] = roomToUpdate;

    setIsSaving(true);
    await saveRoomsToDb(updatedRooms);
    onUpdateRooms(updatedRooms);
    setIsSaving(false);
    notify('success', 'Soal gembok telah dihapus.');
  };

  // -------------------------------------------------------------
  // RESET KE DEFAULT
  // -------------------------------------------------------------
  const handleResetDefault = async () => {
    const confirmReset = window.confirm('PERINGATAN: Anda akan mereset seluruh soal & ruangan kembali ke soal default bawaan psikologi anak. Lanjutkan?');
    if (!confirmReset) return;

    setIsSaving(true);
    await resetRoomsInDb();
    onUpdateRooms(defaultRooms);
    setIsSaving(false);
    notify('success', 'Soal berhasil direset ke pengaturan default bawaan!');
  };

  return (
    <div>
      {/* Top Action Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--purple-dark)', fontSize: '1.25em' }}>
            Daftar Ruangan & Soal Escape Room
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.88em', color: 'var(--gray)' }}>
            Dosen dapat menambah, mengubah, menyusun narasi studi kasus, dan menentukan kunci jawaban.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-confirm-no"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#15803d', borderColor: '#86efac' }}
            onClick={generateQuestionTemplate}
            title="Unduh file Excel (.xlsx) resmi berisi contoh format isian soal"
          >
            <FileSpreadsheet size={16} />
            <span>Unduh Template Excel</span>
          </button>

          <button
            type="button"
            className="btn-confirm-no"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            onClick={() => exportActiveRoomsToExcel(rooms)}
            title="Ekspor seluruh soal & ruangan saat ini ke Excel untuk cadangan / diedit"
          >
            <Download size={16} />
            <span>Backup Soal ke Excel</span>
          </button>

          <button
            type="button"
            className="btn-confirm-yes"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--green-dark)' }}
            onClick={() => setIsUploadModalOpen(true)}
            title="Unggah soal baru dari file Excel"
          >
            <Upload size={16} />
            <span>Upload Soal Excel</span>
          </button>

          <button
            type="button"
            className="btn-confirm-yes"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            onClick={handleOpenAddRoom}
          >
            <FolderPlus size={16} />
            <span>Tambah Ruangan Baru</span>
          </button>

          <button
            type="button"
            className="btn-confirm-no"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#b45309', borderColor: '#fcd34d' }}
            onClick={handleResetDefault}
            title="Kembalikan ke 3 ruangan default"
          >
            <RotateCcw size={16} />
            <span>Reset ke Soal Bawaan</span>
          </button>
        </div>
      </div>

      {alertMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          borderRadius: 'var(--radius-sm)',
          background: alertMsg.type === 'success' ? 'var(--green-light)' : '#fee2e2',
          color: alertMsg.type === 'success' ? 'var(--green-dark)' : '#b91c1c',
          fontWeight: 600,
          fontSize: '0.92em',
          marginBottom: '16px'
        }}>
          {alertMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* List Ruangan */}
      {rooms.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          background: 'var(--gray-light)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--gray)'
        }}>
          <Lock size={36} style={{ opacity: 0.5, marginBottom: '8px' }} />
          <p style={{ margin: '0 0 12px', fontWeight: 600 }}>Belum ada ruangan soal yang dibuat.</p>
          <button type="button" className="btn-confirm-yes" onClick={handleOpenAddRoom}>
            Buat Ruangan Pertama
          </button>
        </div>
      ) : (
        rooms.map((room, rIdx) => (
          <div
            key={room.id || rIdx}
            style={{
              background: 'white',
              border: '2px solid #e2e8f0',
              borderRadius: 'var(--radius-md)',
              padding: '18px',
              marginBottom: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
          >
            {/* Header Ruangan */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '10px',
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: '14px',
              marginBottom: '14px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.4em' }}>{room.icon || '🧱'}</span>
                  <span style={{ fontWeight: 800, fontSize: '1.18em', color: 'var(--purple-dark)' }}>
                    Ruang {rIdx + 1}: {room.title}
                  </span>
                  <span style={{
                    fontSize: '0.82em',
                    background: 'var(--yellow-light)',
                    color: 'var(--yellow-dark)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 700
                  }}>
                    Kunci: {room.key || '🔑'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  className="btn-confirm-no"
                  style={{ padding: '6px 12px', fontSize: '0.85em', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => handleOpenEditRoom(room, rIdx)}
                >
                  <Edit2 size={14} /> Edit Ruangan
                </button>
                <button
                  type="button"
                  className="btn-confirm-no"
                  style={{ padding: '6px 12px', fontSize: '0.85em', color: '#dc2626', borderColor: '#fca5a5', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => handleDeleteRoom(rIdx)}
                >
                  <Trash2 size={14} /> Hapus
                </button>
              </div>
            </div>

            {/* Narasi Cerita Skenario */}
            <div style={{
              background: '#f8fafc',
              borderLeft: '4px solid var(--yellow)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9em',
              lineHeight: 1.55,
              color: '#334155',
              marginBottom: '16px'
            }}>
              <b>📖 Narasi Skenario:</b> {room.text}
            </div>

            {/* Daftar Gembok dalam Ruangan */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95em', color: 'var(--dark)' }}>
                Daftar Gembok ({ (room.locks || []).length } soal)
              </div>
              <button
                type="button"
                className="btn-confirm-yes"
                style={{ padding: '6px 12px', fontSize: '0.85em', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                onClick={() => handleOpenAddLock(rIdx)}
              >
                <Plus size={14} /> Tambah Gembok
              </button>
            </div>

            {(room.locks || []).length === 0 ? (
              <p style={{ fontSize: '0.88em', color: 'var(--gray)', fontStyle: 'italic', margin: '8px 0' }}>
                Belum ada gembok/soal di ruangan ini. Klik tombol "Tambah Gembok" di atas.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '10px' }}>
                {(room.locks || []).map((lock, lIdx) => (
                  <div
                    key={lock.id || lIdx}
                    style={{
                      background: 'var(--cream)',
                      border: '1px solid #e2e8f0',
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px 14px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.94em', color: 'var(--dark)' }}>
                        🔒 Gembok {lIdx + 1}: {lock.q}
                      </div>
                      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                        <button
                          type="button"
                          className="btn-confirm-no"
                          style={{ padding: '4px 8px', fontSize: '0.8em' }}
                          onClick={() => handleOpenEditLock(rIdx, lock, lIdx)}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          className="btn-confirm-no"
                          style={{ padding: '4px 8px', fontSize: '0.8em', color: '#dc2626', borderColor: '#fca5a5' }}
                          onClick={() => handleDeleteLock(rIdx, lIdx)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Opsi Jawaban */}
                    <div style={{ marginTop: '8px', display: 'grid', gap: '4px' }}>
                      {(lock.options || []).map((opt, oIdx) => {
                        const isCorrect = oIdx === lock.correct;
                        return (
                          <div
                            key={oIdx}
                            style={{
                              fontSize: '0.88em',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              background: isCorrect ? 'var(--green-light)' : 'white',
                              border: isCorrect ? '1px solid var(--green)' : '1px solid #e2e8f0',
                              color: isCorrect ? 'var(--green-dark)' : '#475569',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                          >
                            <span><b>{String.fromCharCode(65 + oIdx)}.</b> {opt}</span>
                            {isCorrect && (
                              <span style={{ fontSize: '0.8em', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <CheckCircle2 size={14} /> Jawaban Benar
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {lock.hint && (
                      <div style={{ fontSize: '0.84em', color: '#855c03', marginTop: '6px', background: 'var(--yellow-light)', padding: '4px 8px', borderRadius: '4px' }}>
                        💡 <b>Petunjuk:</b> {lock.hint}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {/* ============================================================= */}
      {/* MODAL EDIT / TAMBAH RUANGAN */}
      {/* ============================================================= */}
      {editingRoom && (
        <div className="modal-overlay" onClick={() => setEditingRoom(null)}>
          <div className="modal-card" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: 'var(--purple-dark)' }}>
                {editingRoom.isNew ? 'Tambah Ruangan Baru' : 'Edit Ruangan'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingRoom(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray)' }}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSaveRoom}>
              <div className="form-group">
                <label className="form-label">Judul / Nama Ruangan</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Ruang Balok Kayu"
                  value={editingRoom.roomData.title}
                  onChange={(e) => setEditingRoom({
                    ...editingRoom,
                    roomData: { ...editingRoom.roomData, title: e.target.value }
                  })}
                  required
                />
              </div>

              {/* Preview Pilihan Aktif */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--blue-light)',
                border: '1px solid #bfdbfe',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '2.2em', lineHeight: 1 }}>
                  {editingRoom.roomData.icon || '🧱'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--dark)' }}>
                    Ikon Ruang: {editingRoom.roomData.icon || '🧱'} &nbsp;|&nbsp; Kunci Reward: {editingRoom.roomData.key || '🟦'}
                  </div>
                  <div style={{ fontSize: '0.84em', color: 'var(--gray)' }}>
                    Pilih ikon dan kunci hadiah dari daftar visual di bawah (tanpa perlu mengetik teks).
                  </div>
                </div>
              </div>

              {/* Pemilih Visual Ikon Ruangan */}
              <EmojiPickerGrid
                title="Pilih Ikon & Tema Ruangan (Klik untuk memilih)"
                options={ROOM_ICONS}
                selectedValue={editingRoom.roomData.icon || '🧱'}
                onSelect={(selectedEmoji) => setEditingRoom({
                  ...editingRoom,
                  roomData: {
                    ...editingRoom.roomData,
                    icon: selectedEmoji,
                    decor: selectedEmoji
                  }
                })}
              />

              {/* Pemilih Visual Kunci Hadiah */}
              <EmojiPickerGrid
                title="Pilih Emoji Kunci Hadiah Ruangan (Klik untuk memilih)"
                options={KEY_REWARDS}
                selectedValue={editingRoom.roomData.key || '🟦'}
                onSelect={(selectedEmoji) => setEditingRoom({
                  ...editingRoom,
                  roomData: {
                    ...editingRoom.roomData,
                    key: selectedEmoji
                  }
                })}
              />

              <div className="form-group">
                <label className="form-label">Narasi Skenario Observasi Bermain</label>
                <textarea
                  className="form-textarea"
                  rows={6}
                  placeholder="Tuliskan cerita studi kasus observasi anak yang akan dianalisis mahasiswa..."
                  value={editingRoom.roomData.text}
                  onChange={(e) => setEditingRoom({
                    ...editingRoom,
                    roomData: { ...editingRoom.roomData, text: e.target.value }
                  })}
                  required
                />
              </div>

              <div className="btnrow" style={{ justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn-confirm-no" onClick={() => setEditingRoom(null)}>
                  Batal
                </button>
                <button type="submit" className="btn-confirm-yes" disabled={isSaving}>
                  <Save size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  {isSaving ? 'Menyimpan...' : 'Simpan Ruangan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL EDIT / TAMBAH GEMBOK / SOAL */}
      {/* ============================================================= */}
      {editingLock && (
        <div className="modal-overlay" onClick={() => setEditingLock(null)}>
          <div className="modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: 'var(--purple-dark)' }}>
                {editingLock.isNew ? 'Tambah Gembok / Soal' : 'Edit Gembok / Soal'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingLock(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray)' }}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSaveLock}>
              <div className="form-group">
                <label className="form-label">Teks Pertanyaan Gembok</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Contoh: Gembok 1 — Jenis bermain berdasarkan fungsi (Hurlock):"
                  value={editingLock.lockData.q}
                  onChange={(e) => setEditingLock({
                    ...editingLock,
                    lockData: { ...editingLock.lockData, q: e.target.value }
                  })}
                  required
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Pilihan Jawaban (Pilih radio untuk Kunci Jawaban Benar)
                  </label>
                  {editingLock.lockData.options.length < 4 && (
                    <button
                      type="button"
                      className="btn-confirm-no"
                      style={{ padding: '3px 8px', fontSize: '0.8em' }}
                      onClick={() => {
                        setEditingLock({
                          ...editingLock,
                          lockData: {
                            ...editingLock.lockData,
                            options: [...editingLock.lockData.options, '']
                          }
                        });
                      }}
                    >
                      + Tambah Opsi
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gap: '8px' }}>
                  {editingLock.lockData.options.map((opt, oIdx) => (
                    <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="radio"
                        id={`correct-opt-${oIdx}`}
                        name="correctOption"
                        checked={editingLock.lockData.correct === oIdx}
                        onChange={() => setEditingLock({
                          ...editingLock,
                          lockData: { ...editingLock.lockData, correct: oIdx }
                        })}
                        title="Tandai sebagai jawaban benar"
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <label htmlFor={`correct-opt-${oIdx}`} style={{ fontWeight: 700, width: '22px' }}>
                        {String.fromCharCode(65 + oIdx)}.
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder={`Teks pilihan ${String.fromCharCode(65 + oIdx)}`}
                        value={opt}
                        onChange={(e) => {
                          const updatedOpts = [...editingLock.lockData.options];
                          updatedOpts[oIdx] = e.target.value;
                          setEditingLock({
                            ...editingLock,
                            lockData: { ...editingLock.lockData, options: updatedOpts }
                          });
                        }}
                        required
                      />
                      {editingLock.lockData.options.length > 2 && (
                        <button
                          type="button"
                          className="btn-confirm-no"
                          style={{ padding: '6px 8px', color: '#dc2626', borderColor: '#fca5a5' }}
                          onClick={() => {
                            const updatedOpts = editingLock.lockData.options.filter((_, i) => i !== oIdx);
                            let newCorrect = editingLock.lockData.correct;
                            if (newCorrect >= updatedOpts.length) newCorrect = 0;
                            setEditingLock({
                              ...editingLock,
                              lockData: {
                                ...editingLock.lockData,
                                options: updatedOpts,
                                correct: newCorrect
                              }
                            });
                          }}
                          title="Hapus opsi ini"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Petunjuk / Bantuan (Hint)</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Petunjuk yang akan muncul saat mahasiswa mengklik tombol 'Minta Petunjuk'..."
                  value={editingLock.lockData.hint}
                  onChange={(e) => setEditingLock({
                    ...editingLock,
                    lockData: { ...editingLock.lockData, hint: e.target.value }
                  })}
                />
              </div>

              <div className="btnrow" style={{ justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn-confirm-no" onClick={() => setEditingLock(null)}>
                  Batal
                </button>
                <button type="submit" className="btn-confirm-yes" disabled={isSaving}>
                  <Save size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  {isSaving ? 'Menyimpan...' : 'Simpan Gembok'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Upload & Pratinjau Soal Excel */}
      <UploadExcelModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onApplyRooms={handleApplyFromExcel}
      />
    </div>
  );
}
