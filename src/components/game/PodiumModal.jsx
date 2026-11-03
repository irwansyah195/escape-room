import React from 'react';
import { Trophy, Medal, Award, Sparkles, X, CheckCircle2, RotateCcw } from 'lucide-react';

export default function PodiumModal({ players, onClose, isDosen = false }) {
  const playersList = Object.values(players || {});

  // Urutkan berdasarkan:
  // 1. Yang sudah finish dengan finishRank terkecil
  // 2. Jika belum finish, berdasarkan soal terbanyak & skor tertinggi
  const sortedRacers = [...playersList].sort((a, b) => {
    if (a.isFinished && b.isFinished) {
      return (a.finishRank || 99) - (b.finishRank || 99);
    }
    if (a.isFinished) return -1;
    if (b.isFinished) return 1;
    if ((b.solvedCount || 0) !== (a.solvedCount || 0)) {
      return (b.solvedCount || 0) - (a.solvedCount || 0);
    }
    return (b.score || 0) - (a.score || 0);
  });

  const firstPlace = sortedRacers[0] || null;
  const secondPlace = sortedRacers[1] || null;
  const thirdPlace = sortedRacers[2] || null;
  const remaining = sortedRacers.slice(3);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 8, 22, 0.88)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div style={{
        background: 'linear-gradient(180deg, rgba(30, 27, 75, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '2px solid rgba(234, 179, 8, 0.5)',
        borderRadius: '28px',
        padding: '36px 30px',
        maxWidth: '720px',
        width: '100%',
        boxShadow: '0 0 80px rgba(234, 179, 8, 0.25)',
        position: 'relative',
        color: '#f8fafc',
        textAlign: 'center'
      }}>
        {/* Tombol Tutup */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#cbd5e1',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {/* Header Kemenangan */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#facc15', fontSize: '1.2em', fontWeight: 900, marginBottom: '8px' }}>
          <Sparkles size={24} />
          <span>PODIUM JUARA</span>
          <Sparkles size={24} />
        </div>
        <h2 style={{ margin: '0 0 10px', fontSize: '1.8em', color: '#f8fafc', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
          🏁 Hasil Pertandingan Selesai!
        </h2>
        <p style={{ margin: '0 0 28px', color: '#94a3b8', fontSize: '0.92em' }}>
          Selamat kepada para pemenang yang berhasil memecahkan soal kuis dengan paling cepat dan tepat!
        </p>

        {/* PODIUM 3 BESAR (1, 2, 3) */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: '14px',
          marginBottom: '32px',
          minHeight: '220px'
        }}>
          {/* JUARA 2 (PERAK) */}
          <div style={{ flex: 1, maxWidth: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {secondPlace && (
              <>
                <div style={{ fontSize: '2em', marginBottom: '4px' }}>
                  {secondPlace.characterType === 'kart' ? '🏎️' : '🏃'}
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.9em', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                  {secondPlace.name}
                </div>
                <div style={{ fontSize: '0.75em', color: '#94a3b8', marginBottom: '8px' }}>
                  Skor: {Math.round(secondPlace.score || 0)} Poin
                </div>
              </>
            )}
            <div style={{
              width: '100%',
              height: '110px',
              background: 'linear-gradient(180deg, #94a3b8 0%, #475569 100%)',
              borderRadius: '16px 16px 0 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(148, 163, 184, 0.3)'
            }}>
              <span style={{ fontSize: '2em', fontWeight: 900, color: 'white' }}>2</span>
              <span style={{ fontSize: '0.78em', fontWeight: 700, color: '#e2e8f0' }}>🥈 PERAK</span>
            </div>
          </div>

          {/* JUARA 1 (EMAS) - TERTINGGI */}
          <div style={{ flex: 1, maxWidth: '210px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {firstPlace && (
              <>
                <div style={{ position: 'relative', marginBottom: '4px' }}>
                  <Trophy size={36} color="#facc15" style={{ filter: 'drop-shadow(0 0 12px rgba(250, 204, 21, 0.8))' }} />
                  <div style={{ fontSize: '2.4em', marginTop: '-10px' }}>
                    {firstPlace.characterType === 'kart' ? '🏎️' : '🏃'}
                  </div>
                </div>
                <div style={{ fontWeight: 900, fontSize: '1.05em', color: '#fef08a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '190px' }}>
                  {firstPlace.name}
                </div>
                <div style={{ fontSize: '0.8em', color: '#fde047', fontWeight: 700, marginBottom: '8px' }}>
                  Skor: {Math.round(firstPlace.score || 0)} Poin
                </div>
              </>
            )}
            <div style={{
              width: '100%',
              height: '150px',
              background: 'linear-gradient(180deg, #facc15 0%, #ca8a04 100%)',
              borderRadius: '20px 20px 0 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 35px rgba(250, 204, 21, 0.45)',
              position: 'relative'
            }}>
              <span style={{ fontSize: '2.8em', fontWeight: 900, color: '#713f12' }}>1</span>
              <span style={{ fontSize: '0.85em', fontWeight: 900, color: '#713f12' }}>🥇 EMAS (JUARA 1)</span>
            </div>
          </div>

          {/* JUARA 3 (PERUNGGU) */}
          <div style={{ flex: 1, maxWidth: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {thirdPlace && (
              <>
                <div style={{ fontSize: '2em', marginBottom: '4px' }}>
                  {thirdPlace.characterType === 'kart' ? '🏎️' : '🏃'}
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.9em', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                  {thirdPlace.name}
                </div>
                <div style={{ fontSize: '0.75em', color: '#94a3b8', marginBottom: '8px' }}>
                  Skor: {Math.round(thirdPlace.score || 0)} Poin
                </div>
              </>
            )}
            <div style={{
              width: '100%',
              height: '85px',
              background: 'linear-gradient(180deg, #d97706 0%, #78350f 100%)',
              borderRadius: '16px 16px 0 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(217, 119, 6, 0.3)'
            }}>
              <span style={{ fontSize: '1.8em', fontWeight: 900, color: 'white' }}>3</span>
              <span style={{ fontSize: '0.75em', fontWeight: 700, color: '#fed7aa' }}>🥉 PERUNGGU</span>
            </div>
          </div>
        </div>

        {/* DAFTAR PERINGKAT LAINNYA */}
        {remaining.length > 0 && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.65)',
            borderRadius: '16px',
            padding: '16px',
            maxHeight: '180px',
            overflowY: 'auto',
            marginBottom: '24px',
            border: '1px solid rgba(148, 163, 184, 0.2)'
          }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '0.92em', color: '#94a3b8', textAlign: 'left' }}>
              Peringkat Lainnya
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {remaining.map((p, idx) => (
                <div
                  key={p.uid || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(30, 41, 59, 0.5)',
                    fontSize: '0.88em'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 800, color: '#94a3b8', width: '24px' }}>#{idx + 4}</span>
                    <span>{p.name} ({p.nim})</span>
                  </div>
                  <div style={{ color: '#c084fc', fontWeight: 700 }}>
                    {Math.round(p.score || 0)} Poin
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tombol Aksi */}
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
            border: 'none',
            color: 'white',
            borderRadius: '14px',
            padding: '12px 32px',
            fontSize: '1em',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 18px rgba(168, 85, 247, 0.4)'
          }}
        >
          {isDosen ? 'Selesai & Rekap Nilai' : 'Tutup & Kembali ke Beranda'}
        </button>
      </div>
    </div>
  );
}

