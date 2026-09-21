import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  X,
  Lock,
  Layers,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { parseQuestionsExcel } from '../../utils/excelQuestions';

export default function UploadExcelModal({ isOpen, onClose, onApplyRooms }) {
  const [file, setFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsParsing(true);
    setParseResult(null);

    const result = await parseQuestionsExcel(selectedFile);
    setParseResult(result);
    setIsParsing(false);
  };

  const handleReset = () => {
    setFile(null);
    setParseResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleApply = () => {
    if (parseResult && parseResult.rooms && parseResult.rooms.length > 0) {
      onApplyRooms(parseResult.rooms);
      handleReset();
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: '780px', width: '95%' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'var(--green-light)',
              color: 'var(--green-dark)',
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: 'var(--purple-dark)', fontSize: '1.25em' }}>
                Upload Soal & Kunci Jawaban dari Excel
              </h3>
              <p style={{ margin: 0, fontSize: '0.84em', color: 'var(--gray)' }}>
                Unggah file spreadsheet (.xlsx) untuk memperbarui ruangan & soal secara massal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray)', padding: '4px' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Area Pilih File */}
        {!parseResult?.success && (
          <div style={{
            border: '2px dashed #cbd5e1',
            borderRadius: 'var(--radius-md)',
            padding: '30px 20px',
            textAlign: 'center',
            background: '#f8fafc',
            cursor: 'pointer',
            marginBottom: '16px',
            transition: 'border-color 0.2s'
          }}
          onClick={() => fileInputRef.current?.click()}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--blue)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            <Upload size={36} color="var(--blue)" style={{ margin: '0 auto 10px' }} />
            <div style={{ fontWeight: 700, fontSize: '1.05em', color: 'var(--dark)' }}>
              {file ? file.name : "Klik untuk Memilih File Excel (.xlsx)"}
            </div>
            <p style={{ margin: '6px 0 0', fontSize: '0.86em', color: 'var(--gray)' }}>
              Pastikan format kolom mengikuti template resmi yang telah diunduh
            </p>
          </div>
        )}

        {isParsing && (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--gray)' }}>
            <p>Sedang membaca dan memvalidasi file Excel...</p>
          </div>
        )}

        {/* Notifikasi Error jika validasi gagal */}
        {parseResult && !parseResult.success && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-sm)',
            padding: '14px 16px',
            marginBottom: '16px',
            color: '#b91c1c'
          }}>
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <AlertTriangle size={18} />
              <span>Ditemukan kendala pada file Excel:</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.88em', lineHeight: 1.5 }}>
              {parseResult.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
            <div style={{ marginTop: '12px' }}>
              <button type="button" className="btn-confirm-no" onClick={handleReset} style={{ fontSize: '0.85em' }}>
                Pilih File Lain
              </button>
            </div>
          </div>
        )}

        {/* Pratinjau Jika Berhasil Di-parse */}
        {parseResult?.success && (
          <div>
            <div style={{
              background: 'var(--green-light)',
              border: '1px solid #bbf7d0',
              borderRadius: 'var(--radius-md)',
              padding: '14px 18px',
              marginBottom: '16px',
              color: 'var(--green-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={22} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.05em' }}>
                    Validasi Berhasil! Terdeteksi {parseResult.summary.totalRooms} Ruangan & {parseResult.summary.totalLocks} Soal Gembok
                  </div>
                  <div style={{ fontSize: '0.85em', opacity: 0.9 }}>
                    File: <b>{file?.name}</b>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn-confirm-no"
                style={{ padding: '5px 10px', fontSize: '0.82em' }}
                onClick={handleReset}
              >
                Ganti File
              </button>
            </div>

            {/* Peringatan Penimpaan */}
            <div style={{
              background: '#fffbeb',
              border: '1px solid #fef3c7',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              fontSize: '0.86em',
              color: '#92400e',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <span>
                <b>Konfirmasi Penggantian:</b> Menerapkan file ini akan <u>menimpa seluruh soal lama</u> dengan data baru dari file Excel ini.
              </span>
            </div>

            {/* List Pratinjau Ruangan yang Terbaca */}
            <div style={{ maxHeight: '280px', overflowY: 'auto', paddingRight: '4px', marginBottom: '18px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.92em', marginBottom: '8px', color: 'var(--dark)' }}>
                Ringkasan Ruangan & Soal yang akan Diterapkan:
              </div>
              <div style={{ display: 'grid', gap: '8px' }}>
                {parseResult.rooms.map((rm, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '10px 14px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--purple-dark)' }}>
                        <span style={{ fontSize: '1.2em' }}>{rm.icon}</span>
                        <span>Ruang {idx + 1}: {rm.title}</span>
                        <span style={{ fontSize: '0.8em', background: 'var(--yellow-light)', color: 'var(--yellow-dark)', padding: '2px 6px', borderRadius: '4px' }}>
                          Kunci: {rm.key}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.82em', fontWeight: 600, color: 'var(--gray)' }}>
                        {rm.locks.length} Gembok Soal
                      </span>
                    </div>

                    <div style={{ fontSize: '0.84em', color: '#64748b', marginTop: '4px', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {rm.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tombol Aksi Final */}
            <div className="btnrow" style={{ justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <button type="button" className="btn-confirm-no" onClick={onClose}>
                Batal
              </button>
              <button
                type="button"
                className="btn-confirm-yes"
                style={{ background: 'var(--green-dark)' }}
                onClick={handleApply}
              >
                <CheckCircle2 size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                Terapkan Soal Baru ke Sistem
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
