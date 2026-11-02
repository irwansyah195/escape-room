import React from 'react';

export default function MetaverseBackground() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: -1,
      overflow: 'hidden',
      pointerEvents: 'none',
      background: 'radial-gradient(ellipse at 50% 0%, #1e1b4b 0%, #0b0f19 65%, #05070d 100%)'
    }}>
      {/* Aurora Ambient Glow */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        left: '20%',
        width: '60vw',
        height: '45vh',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.22) 0%, rgba(6, 182, 212, 0.12) 40%, transparent 70%)',
        filter: 'blur(50px)',
        borderRadius: '50%'
      }} />

      {/* SVG Canvas untuk Cyber Grid & Pixel Stars */}
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: '100%', height: '100%' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Cyber Isometric Grid Gradient */}
          <linearGradient id="gridGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
            <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.45" />
          </linearGradient>

          {/* Animasi Twinkle untuk Bintang Pixel */}
          <style>{`
            @keyframes pulseStar {
              0%, 100% { opacity: 0.2; transform: scale(0.85); }
              50% { opacity: 0.95; transform: scale(1.15); }
            }
            @keyframes floatNebula {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-12px); }
            }
            .star-fast { animation: pulseStar 2.2s infinite ease-in-out; transform-origin: center; }
            .star-slow { animation: pulseStar 3.8s infinite ease-in-out; transform-origin: center; }
            .star-gold { animation: pulseStar 3.1s infinite ease-in-out; transform-origin: center; }
          `}</style>
        </defs>

        {/* 1. Cyber Perspective Floor Grid (Lantai Virtual ZEP) */}
        <g stroke="url(#gridGrad)" strokeWidth="1.2">
          {/* Garis Horizontal Berjarak Perspektif */}
          <line x1="0" y1="560" x2="1440" y2="560" opacity="0.15" />
          <line x1="0" y1="620" x2="1440" y2="620" opacity="0.25" />
          <line x1="0" y1="690" x2="1440" y2="690" opacity="0.4" />
          <line x1="0" y1="770" x2="1440" y2="770" opacity="0.6" />
          <line x1="0" y1="860" x2="1440" y2="860" opacity="0.85" />

          {/* Garis Perspektif Menuju Titik Lenyap (Vanishing Point di x=720, y=520) */}
          <line x1="720" y1="520" x2="-200" y2="900" />
          <line x1="720" y1="520" x2="60" y2="900" />
          <line x1="720" y1="520" x2="300" y2="900" />
          <line x1="720" y1="520" x2="520" y2="900" />
          <line x1="720" y1="520" x2="720" y2="900" />
          <line x1="720" y1="520" x2="920" y2="900" />
          <line x1="720" y1="520" x2="1140" y2="900" />
          <line x1="720" y1="520" x2="1380" y2="900" />
          <line x1="720" y1="520" x2="1640" y2="900" />
        </g>

        {/* 2. Pixel Stars (Bintang 4-Sudut Pixel Art Retro) */}
        <g>
          {/* Bintang Cyan */}
          <g className="star-fast" transform="translate(180, 110)">
            <rect x="-2" y="-6" width="4" height="12" fill="#38bdf8" />
            <rect x="-6" y="-2" width="12" height="4" fill="#38bdf8" />
            <rect x="-1" y="-1" width="2" height="2" fill="#ffffff" />
          </g>
          <g className="star-slow" transform="translate(1260, 160)">
            <rect x="-2" y="-6" width="4" height="12" fill="#38bdf8" />
            <rect x="-6" y="-2" width="12" height="4" fill="#38bdf8" />
            <rect x="-1" y="-1" width="2" height="2" fill="#ffffff" />
          </g>
          <g className="star-fast" transform="translate(70, 360)">
            <rect x="-1.5" y="-5" width="3" height="10" fill="#38bdf8" />
            <rect x="-5" y="-1.5" width="10" height="3" fill="#38bdf8" />
          </g>
          <g className="star-slow" transform="translate(980, 80)">
            <rect x="-2" y="-6" width="4" height="12" fill="#38bdf8" />
            <rect x="-6" y="-2" width="12" height="4" fill="#38bdf8" />
          </g>

          {/* Bintang Violet & Magenta */}
          <g className="star-slow" transform="translate(390, 80)">
            <rect x="-2" y="-7" width="4" height="14" fill="#c084fc" />
            <rect x="-7" y="-2" width="14" height="4" fill="#c084fc" />
            <rect x="-1" y="-1" width="2" height="2" fill="#ffffff" />
          </g>
          <g className="star-fast" transform="translate(1120, 320)">
            <rect x="-2" y="-6" width="4" height="12" fill="#c084fc" />
            <rect x="-6" y="-2" width="12" height="4" fill="#c084fc" />
            <rect x="-1" y="-1" width="2" height="2" fill="#ffffff" />
          </g>
          <g className="star-slow" transform="translate(260, 480)">
            <rect x="-1.5" y="-5" width="3" height="10" fill="#c084fc" />
            <rect x="-5" y="-1.5" width="10" height="3" fill="#c084fc" />
          </g>

          {/* Bintang Emas / Kuning */}
          <g className="star-gold" transform="translate(820, 140)">
            <rect x="-2.5" y="-8" width="5" height="16" fill="#fde047" />
            <rect x="-8" y="-2.5" width="16" height="5" fill="#fde047" />
            <rect x="-1" y="-1" width="2" height="2" fill="#ffffff" />
          </g>
          <g className="star-gold" transform="translate(540, 290)">
            <rect x="-2" y="-6" width="4" height="12" fill="#fde047" />
            <rect x="-6" y="-2" width="12" height="4" fill="#fde047" />
          </g>
          <g className="star-fast" transform="translate(1340, 440)">
            <rect x="-1.5" y="-5" width="3" height="10" fill="#fde047" />
            <rect x="-5" y="-1.5" width="10" height="3" fill="#fde047" />
          </g>

          {/* Bintang Titik Pixel Halus */}
          <rect x="120" y="220" width="3" height="3" fill="#ffffff" opacity="0.6" />
          <rect x="480" y="160" width="3" height="3" fill="#38bdf8" opacity="0.7" />
          <rect x="640" y="90" width="2" height="2" fill="#ffffff" opacity="0.5" />
          <rect x="910" y="240" width="3" height="3" fill="#c084fc" opacity="0.6" />
          <rect x="1040" y="190" width="2" height="2" fill="#ffffff" opacity="0.4" />
          <rect x="1200" y="70" width="3" height="3" fill="#fde047" opacity="0.5" />
          <rect x="310" y="320" width="2" height="2" fill="#38bdf8" opacity="0.5" />
        </g>

        {/* 3. Aksen Balok Pixel Bermain Anak (Playroom Pixel Blocks) */}
        <g opacity="0.25">
          {/* Balok 3D Pixel Kiri */}
          <g transform="translate(90, 180)">
            <polygon points="0,15 20,5 40,15 20,25" fill="#8b5cf6" />
            <polygon points="0,15 20,25 20,45 0,35" fill="#6d28d9" />
            <polygon points="20,25 40,15 40,35 20,45" fill="#581c87" />
          </g>

          {/* Balok 3D Pixel Kanan */}
          <g transform="translate(1310, 240) scale(0.9)">
            <polygon points="0,15 20,5 40,15 20,25" fill="#06b6d4" />
            <polygon points="0,15 20,25 20,45 0,35" fill="#0891b2" />
            <polygon points="20,25 40,15 40,35 20,45" fill="#0e7490" />
          </g>
        </g>
      </svg>
    </div>
  );
}

