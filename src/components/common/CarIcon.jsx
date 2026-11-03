import React from 'react';

export const CAR_COLORS = {
  blue: '#2563eb',
  red: '#dc2626',
  green: '#16a34a',
  yellow: '#ca8a04',
  purple: '#9333ea'
};

/**
 * Ikon mobil balap SVG (menghadap kanan) yang identik dengan sprite di lintasan.
 * Untuk karakter non-kart (runner) menampilkan emoji.
 */
export default function CarIcon({ characterType, characterColor, size = 40 }) {
  if (characterType && characterType !== 'kart') {
    return <span style={{ fontSize: `${size * 0.8}px`, lineHeight: 1 }}>🏃</span>;
  }
  const main = CAR_COLORS[characterColor] || CAR_COLORS.blue;
  return (
    <svg width={size * 1.5} height={size} viewBox="0 0 56 36" style={{ display: 'block' }} aria-label="mobil">
      <g fill="#1e293b">
        <rect x="8" y="1" width="12" height="6" rx="2" />
        <rect x="30" y="1" width="12" height="6" rx="2" />
        <rect x="8" y="29" width="12" height="6" rx="2" />
        <rect x="30" y="29" width="12" height="6" rx="2" />
      </g>
      <rect x="1" y="6" width="5" height="24" fill="#0f172a" />
      <rect x="4" y="8" width="40" height="20" rx="6" fill={main} />
      <polygon points="40,8 40,28 54,18" fill={main} />
      <rect x="8" y="16" width="38" height="4" fill="#fff" opacity="0.9" />
      <rect x="20" y="11" width="14" height="14" rx="4" fill="#0f172a" />
      <rect x="28" y="13" width="4" height="10" fill="#38bdf8" />
      <circle cx="50" cy="15" r="2" fill="#fef08a" />
      <circle cx="50" cy="21" r="2" fill="#fef08a" />
    </svg>
  );
}

