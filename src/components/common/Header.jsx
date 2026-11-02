import React from 'react';
import { Gamepad2, Sparkles, KeyRound } from 'lucide-react';

export default function Header() {
  return (
    <header className="header-card" style={{ textAlign: 'center', marginBottom: '22px' }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 14px',
        borderRadius: '9999px',
        background: 'rgba(139, 92, 246, 0.18)',
        border: '1px solid rgba(139, 92, 246, 0.4)',
        color: '#c084fc',
        fontSize: '0.82em',
        fontWeight: 800,
        letterSpacing: '1px',
        marginBottom: '10px',
        boxShadow: '0 0 16px rgba(139, 92, 246, 0.2)'
      }}>
        <Sparkles size={14} color="#fde047" />
        <span>2D METAVERSE QUIZ & OBSERVASI</span>
      </div>

      <h1 style={{
        margin: '0 0 8px',
        fontSize: 'clamp(1.6em, 4vw, 2.3em)',
        fontWeight: 900,
        background: 'linear-gradient(135deg, #ffffff 0%, #c4b5fd 50%, #38bdf8 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px'
      }}>
        <span style={{ WebkitTextFillColor: 'initial', fontSize: '0.95em' }}>🔑</span>
        <span>Dunia Bermain Anak</span>
      </h1>

      <p style={{
        margin: 0,
        color: '#94a3b8',
        fontSize: '0.94em',
        maxWidth: '560px',
        marginInline: 'auto',
        lineHeight: 1.5
      }}>
        Jelajahi arena 2D, temukan stasiun observasi bermain anak, dan pecahkan teka-teki studi kasus bersama teman sekelasmu!
      </p>
    </header>
  );
}
