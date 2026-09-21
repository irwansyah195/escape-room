import React, { useState, useEffect, useMemo } from 'react';
import { Lock, Unlock, Lightbulb, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { shuffleOptions } from '../../utils/shuffle';

export default function LockItem({
  lock,
  lockIndex,
  perLockMax,
  onSolved,
  isSolvedInitially = false,
  savedState = null
}) {
  // Acak opsi jawaban saat komponen pertama kali dipasang
  const shuffledOptions = useMemo(() => {
    return shuffleOptions(lock.options || [], lock.correct ?? 0);
  }, [lock.id, lock.q, lock.options, lock.correct]);

  const [solved, setSolved] = useState(isSolvedInitially || (savedState?.isSolved ?? false));
  const [selectedOptIndex, setSelectedOptIndex] = useState(null);
  const [pendingOption, setPendingOption] = useState(null);
  const [disabledOptions, setDisabledOptions] = useState(new Set(savedState?.disabledIndexes || []));
  const [wrongCount, setWrongCount] = useState(savedState?.wrongAttempts || 0);
  const [feedback, setFeedback] = useState(savedState?.feedback || null);
  const [showHint, setShowHint] = useState(false);

  // Tangani klik tombol opsi
  const handleOptionClick = (optObj, index) => {
    if (solved || disabledOptions.has(index)) return;

    // Jika sudah 2x salah (artinya hanya tersisa 1 opsi logis), langsung proses tanpa konfirmasi
    if (wrongCount >= 2) {
      processChoice(optObj, index);
      return;
    }

    setSelectedOptIndex(index);
    setPendingOption({ optObj, index });
  };

  const handleCancelSelection = () => {
    setSelectedOptIndex(null);
    setPendingOption(null);
  };

  const handleConfirmSelection = () => {
    if (!pendingOption) return;
    const { optObj, index } = pendingOption;
    setPendingOption(null);
    processChoice(optObj, index);
  };

  const processChoice = (optObj, index) => {
    if (optObj.isCorrect) {
      // Benar!
      setSolved(true);
      setSelectedOptIndex(index);

      let earned = 0;
      let msg = '';
      if (wrongCount === 0) {
        earned = perLockMax;
        msg = `✅ Benar langsung di percobaan pertama! Skor: ${earned.toFixed(2)} poin.`;
      } else if (wrongCount === 1) {
        earned = perLockMax / 2;
        msg = `✅ Benar di percobaan kedua. Skor: ${earned.toFixed(2)} poin (setengah dari nilai maksimal).`;
      } else {
        earned = 0;
        msg = `✅ Terbuka di kesempatan terakhir. Skor: 0 poin.`;
      }

      setFeedback({ type: 'ok', text: msg });

      onSolved({
        lockId: lock.id || `lock-${lockIndex}`,
        question: lock.q,
        correctOptionText: lock.options[lock.correct] || optObj.text,
        isSolved: true,
        scoreEarned: earned,
        wrongAttempts: wrongCount
      });
    } else {
      // Salah!
      const nextWrong = wrongCount + 1;
      setWrongCount(nextWrong);
      setDisabledOptions(prev => new Set(prev).add(index));
      setSelectedOptIndex(null);

      let msg = '';
      if (nextWrong >= 2) {
        msg = '❌ Belum tepat. Ini percobaan terakhirmu — opsi yang tersisa pasti jawabannya, namun skor soal ini akan 0 poin.';
      } else {
        msg = '❌ Belum tepat, coba periksa kembali bukti perilaku pada narasi skenario. Percobaan berikutnya bernilai setengah skor.';
      }

      setFeedback({ type: 'no', text: msg });
    }
  };

  return (
    <div className="lock-wrapper">
      <div className="lock-title">
        <span className="lock-icon" style={{ color: solved ? 'var(--green-dark)' : 'var(--dark)' }}>
          {solved ? <Unlock size={22} color="var(--green)" /> : <Lock size={22} color="var(--purple)" />}
        </span>
        <span>{lock.q}</span>
      </div>

      <div className="options-grid">
        {shuffledOptions.map((opt, idx) => {
          const isSelected = selectedOptIndex === idx;
          const isWrong = disabledOptions.has(idx);
          const isCorrect = solved && opt.isCorrect;

          let btnClass = 'opt-btn';
          if (isCorrect) btnClass += ' correct';
          else if (isWrong) btnClass += ' wrong';
          else if (isSelected) btnClass += ' selected';

          return (
            <button
              key={idx}
              type="button"
              className={btnClass}
              disabled={solved || isWrong}
              onClick={() => handleOptionClick(opt, idx)}
            >
              <span style={{ fontWeight: 700, minWidth: '24px', opacity: 0.85 }}>
                {String.fromCharCode(65 + idx)}.
              </span>
              <span style={{ flex: 1 }}>{opt.text}</span>
              {isCorrect && <CheckCircle2 size={20} color="var(--green-dark)" />}
              {isWrong && <XCircle size={20} color="#e53e3e" />}
            </button>
          );
        })}
      </div>

      {/* Konfirmasi Pilihan */}
      {pendingOption && !solved && (
        <div className="confirm-box">
          <span>Yakin dengan pilihan ini?</span>
          <div className="confirm-actions">
            <button type="button" className="btn-confirm-yes" onClick={handleConfirmSelection}>
              ✅ Ya, Pilih Ini
            </button>
            <button type="button" className="btn-confirm-no" onClick={handleCancelSelection}>
              ↩️ Ganti Pilihan
            </button>
          </div>
        </div>
      )}

      {/* Pesan Feedback */}
      {feedback && (
        <div className={`feedback-box ${feedback.type}`}>
          {feedback.type === 'ok' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Tombol Hint / Petunjuk */}
      {lock.hint && (
        <div style={{ marginTop: '8px' }}>
          <button
            type="button"
            className="btn-hint"
            onClick={() => setShowHint(!showHint)}
          >
            <Lightbulb size={16} />
            <span>{showHint ? 'Tutup Petunjuk' : 'Minta Petunjuk'}</span>
          </button>
          {showHint && (
            <div className="hint-content">
              💡 <b>Petunjuk:</b> {lock.hint}
            </div>
          )}
        </div>
      )}

      <hr style={{ border: 'none', borderTop: '2px dotted #e2e8f0', margin: '20px 0' }} />
    </div>
  );
}
