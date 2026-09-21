import React from 'react';
import { Check } from 'lucide-react';

export const ROOM_ICONS = [
  { emoji: '🧱', label: 'Balok Susun' },
  { emoji: '🩺', label: 'Dokter-dokteran' },
  { emoji: '🎲', label: 'Congklak / Dadu' },
  { emoji: '🎨', label: 'Melukis & Seni' },
  { emoji: '🧩', label: 'Puzzle Kognitif' },
  { emoji: '📚', label: 'Buku & Literasi' },
  { emoji: '🧸', label: 'Boneka & Peran' },
  { emoji: '🎪', label: 'Sirkus & Karnaval' },
  { emoji: '🔬', label: 'Eksplorasi Sains' },
  { emoji: '🎵', label: 'Musik & Gerak' },
  { emoji: '🚀', label: 'Luar Angkasa' },
  { emoji: '🚂', label: 'Kereta & Kendaraan' },
  { emoji: '🏖️', label: 'Pasir & Alam' },
  { emoji: '🎭', label: 'Teater & Drama' },
  { emoji: '⚽', label: 'Gerak & Olahraga' },
  { emoji: '🏰', label: 'Istana & Bangunan' },
  { emoji: '🍳', label: 'Masak-masakan' },
  { emoji: '🔤', label: 'Balok Huruf / Angka' }
];

export const KEY_REWARDS = [
  { emoji: '🟦', label: 'Kunci Biru' },
  { emoji: '🟥', label: 'Kunci Merah' },
  { emoji: '🟩', label: 'Kunci Hijau' },
  { emoji: '🟨', label: 'Kunci Kuning' },
  { emoji: '🟪', label: 'Kunci Ungu' },
  { emoji: '🟧', label: 'Kunci Oranye' },
  { emoji: '🔑', label: 'Kunci Emas' },
  { emoji: '🗝️', label: 'Kunci Antik' },
  { emoji: '💎', label: 'Permata Berlian' },
  { emoji: '👑', label: 'Mahkota Juara' },
  { emoji: '🌟', label: 'Bintang Emas' },
  { emoji: '🏆', label: 'Piala Kemenangan' }
];

export function EmojiPickerGrid({ options, selectedValue, onSelect, title }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      {title && (
        <label className="form-label" style={{ marginBottom: '8px' }}>
          {title}
        </label>
      )}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: '8px',
        maxHeight: '210px',
        overflowY: 'auto',
        padding: '6px',
        background: '#f8fafc',
        border: '2px solid #e2e8f0',
        borderRadius: 'var(--radius-sm)'
      }}>
        {options.map((item) => {
          const isSelected = selectedValue === item.emoji;
          return (
            <button
              key={item.emoji}
              type="button"
              onClick={() => onSelect(item.emoji)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                borderRadius: '8px',
                border: isSelected ? '2px solid var(--purple)' : '1px solid #cbd5e1',
                background: isSelected ? 'var(--purple-light)' : 'white',
                color: isSelected ? 'var(--purple-dark)' : 'var(--dark)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                fontFamily: 'inherit',
                fontSize: '0.85em',
                fontWeight: isSelected ? 700 : 500,
                boxShadow: isSelected ? '0 0 0 2px rgba(155, 107, 204, 0.25)' : 'none'
              }}
            >
              <span style={{ fontSize: '1.4em', lineHeight: 1 }}>{item.emoji}</span>
              <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.label}
              </span>
              {isSelected && <Check size={14} color="var(--purple-dark)" style={{ flexShrink: 0 }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
