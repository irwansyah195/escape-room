import React from 'react';

export default function SkyBackground() {
  return (
    <svg id="skyDecor" viewBox="0 0 1200 1600" preserveAspectRatio="xMidYMin slice" xmlns="http://www.w3.org/2000/svg">
      {/* Awan-awan */}
      <g fill="#ffffff" opacity="0.75">
        <g transform="translate(60,90)">
          <ellipse cx="0" cy="30" rx="55" ry="32"/>
          <ellipse cx="45" cy="15" rx="45" ry="30"/>
          <ellipse cx="95" cy="32" rx="55" ry="28"/>
          <ellipse cx="45" cy="42" rx="70" ry="26"/>
        </g>
        <g transform="translate(830,60) scale(0.8)">
          <ellipse cx="0" cy="30" rx="55" ry="32"/>
          <ellipse cx="45" cy="15" rx="45" ry="30"/>
          <ellipse cx="95" cy="32" rx="55" ry="28"/>
          <ellipse cx="45" cy="42" rx="70" ry="26"/>
        </g>
        <g transform="translate(920,340) scale(0.55)">
          <ellipse cx="0" cy="30" rx="55" ry="32"/>
          <ellipse cx="45" cy="15" rx="45" ry="30"/>
          <ellipse cx="95" cy="32" rx="55" ry="28"/>
          <ellipse cx="45" cy="42" rx="70" ry="26"/>
        </g>
        <g transform="translate(-40,470) scale(0.7)">
          <ellipse cx="0" cy="30" rx="55" ry="32"/>
          <ellipse cx="45" cy="15" rx="45" ry="30"/>
          <ellipse cx="95" cy="32" rx="55" ry="28"/>
          <ellipse cx="45" cy="42" rx="70" ry="26"/>
        </g>
        <g transform="translate(870,780) scale(0.65)">
          <ellipse cx="0" cy="30" rx="55" ry="32"/>
          <ellipse cx="45" cy="15" rx="45" ry="30"/>
          <ellipse cx="95" cy="32" rx="55" ry="28"/>
          <ellipse cx="45" cy="42" rx="70" ry="26"/>
        </g>
        <g transform="translate(90,1000) scale(0.6)">
          <ellipse cx="0" cy="30" rx="55" ry="32"/>
          <ellipse cx="45" cy="15" rx="45" ry="30"/>
          <ellipse cx="95" cy="32" rx="55" ry="28"/>
          <ellipse cx="45" cy="42" rx="70" ry="26"/>
        </g>
        <g transform="translate(950,1250) scale(0.5)">
          <ellipse cx="0" cy="30" rx="55" ry="32"/>
          <ellipse cx="45" cy="15" rx="45" ry="30"/>
          <ellipse cx="95" cy="32" rx="55" ry="28"/>
          <ellipse cx="45" cy="42" rx="70" ry="26"/>
        </g>
        <g transform="translate(0,1420) scale(0.6)">
          <ellipse cx="0" cy="30" rx="55" ry="32"/>
          <ellipse cx="45" cy="15" rx="45" ry="30"/>
          <ellipse cx="95" cy="32" rx="55" ry="28"/>
          <ellipse cx="45" cy="42" rx="70" ry="26"/>
        </g>
      </g>

      {/* Balon Udara & Hiasan */}
      <g opacity="0.55">
        <g transform="translate(60,260)">
          <line x1="0" y1="38" x2="-4" y2="90" stroke="#c9a2e0" strokeWidth="2"/>
          <ellipse cx="0" cy="0" rx="26" ry="34" fill="#ffb3c6"/>
          <ellipse cx="-8" cy="-12" rx="7" ry="10" fill="#ffffff" opacity="0.5"/>
        </g>
        <g transform="translate(1080,180)">
          <line x1="0" y1="38" x2="6" y2="95" stroke="#9fd8c0" strokeWidth="2"/>
          <ellipse cx="0" cy="0" rx="24" ry="31" fill="#ffe08a"/>
          <ellipse cx="-7" cy="-11" rx="6" ry="9" fill="#ffffff" opacity="0.5"/>
        </g>
        <g transform="translate(1000,600)">
          <line x1="0" y1="34" x2="-5" y2="85" stroke="#f6b8c9" strokeWidth="2"/>
          <ellipse cx="0" cy="0" rx="22" ry="29" fill="#a8d8f0"/>
          <ellipse cx="-7" cy="-10" rx="6" ry="8" fill="#ffffff" opacity="0.5"/>
        </g>
        <g transform="translate(40,720)">
          <line x1="0" y1="36" x2="4" y2="88" stroke="#f4c88a" strokeWidth="2"/>
          <ellipse cx="0" cy="0" rx="23" ry="30" fill="#c3b6ec"/>
          <ellipse cx="-7" cy="-11" rx="6" ry="9" fill="#ffffff" opacity="0.5"/>
        </g>
        <g transform="translate(1090,930)">
          <line x1="0" y1="34" x2="-4" y2="82" stroke="#9fd8c0" strokeWidth="2"/>
          <ellipse cx="0" cy="0" rx="21" ry="27" fill="#ffb3c6"/>
          <ellipse cx="-6" cy="-10" rx="5" ry="8" fill="#ffffff" opacity="0.5"/>
        </g>
      </g>

      {/* Matahari ceria */}
      <g transform="translate(1130,55)" opacity="0.7">
        <circle r="30" fill="#ffe08a"/>
        <g stroke="#ffe08a" strokeWidth="5" strokeLinecap="round">
          <line x1="0" y1="-44" x2="0" y2="-54"/>
          <line x1="0" y1="44" x2="0" y2="54"/>
          <line x1="-44" y1="0" x2="-54" y2="0"/>
          <line x1="44" y1="0" x2="54" y2="0"/>
          <line x1="-31" y1="-31" x2="-38" y2="-38"/>
          <line x1="31" y1="31" x2="38" y2="38"/>
          <line x1="-31" y1="31" x2="-38" y2="38"/>
          <line x1="31" y1="-31" x2="38" y2="-38"/>
        </g>
      </g>

      {/* Karikatur Anak */}
      <g transform="translate(85,430)" opacity="0.9">
        <ellipse cx="0" cy="118" rx="34" ry="8" fill="#2b2d42" opacity="0.08"/>
        <path d="M -22 60 Q 0 30 22 60 L 26 108 Q 0 118 -26 108 Z" fill="#ffb3c6"/>
        <rect x="-9" y="55" width="18" height="14" fill="#f3c9a6"/>
        <circle cx="0" cy="34" r="24" fill="#f3c9a6"/>
        <path d="M -24 26 Q -26 -6 0 -8 Q 26 -6 24 26 Q 24 6 0 8 Q -24 6 -24 26 Z" fill="#7a4a2b"/>
        <circle cx="-24" cy="30" r="8" fill="#7a4a2b"/>
        <circle cx="24" cy="30" r="8" fill="#7a4a2b"/>
        <circle cx="-8" cy="36" r="2.4" fill="#2b2d42"/>
        <circle cx="8" cy="36" r="2.4" fill="#2b2d42"/>
        <path d="M -7 45 Q 0 50 7 45" stroke="#c0392b" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <circle cx="-15" cy="42" r="4" fill="#ff9eb0" opacity="0.6"/>
        <circle cx="15" cy="42" r="4" fill="#ff9eb0" opacity="0.6"/>
        <line x1="-22" y1="72" x2="-38" y2="96" stroke="#f3c9a6" strokeWidth="7" strokeLinecap="round"/>
        <line x1="22" y1="72" x2="38" y2="90" stroke="#f3c9a6" strokeWidth="7" strokeLinecap="round"/>
        <line x1="-13" y1="112" x2="-16" y2="150" stroke="#f3c9a6" strokeWidth="8" strokeLinecap="round"/>
        <line x1="13" y1="112" x2="16" y2="150" stroke="#f3c9a6" strokeWidth="8" strokeLinecap="round"/>
        <ellipse cx="-17" cy="153" rx="9" ry="5" fill="#9b6bcc"/>
        <ellipse cx="17" cy="153" rx="9" ry="5" fill="#9b6bcc"/>
      </g>

      {/* Karikatur Anak Laki-laki */}
      <g transform="translate(1110,760)" opacity="0.9">
        <ellipse cx="0" cy="118" rx="34" ry="8" fill="#2b2d42" opacity="0.08"/>
        <rect x="-25" y="58" width="50" height="52" rx="14" fill="#a8d8f0"/>
        <rect x="-9" y="55" width="18" height="12" fill="#e2b58a"/>
        <circle cx="0" cy="32" r="23" fill="#e2b58a"/>
        <path d="M -24 24 Q -26 -6 0 -10 Q 26 -6 24 24 Q 22 6 0 4 Q -22 6 -24 24 Z" fill="#3b2a20"/>
        <circle cx="-8" cy="34" r="2.4" fill="#2b2d42"/>
        <circle cx="8" cy="34" r="2.4" fill="#2b2d42"/>
        <path d="M -7 43 Q 0 47 7 43" stroke="#a0402c" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <line x1="-25" y1="72" x2="-42" y2="60" stroke="#a8d8f0" strokeWidth="9" strokeLinecap="round"/>
        <line x1="25" y1="72" x2="42" y2="60" stroke="#a8d8f0" strokeWidth="9" strokeLinecap="round"/>
        <circle cx="-44" cy="58" r="7" fill="#e2b58a"/>
        <circle cx="44" cy="58" r="7" fill="#e2b58a"/>
        <rect x="-22" y="104" width="18" height="26" rx="6" fill="#4d9de0"/>
        <rect x="4" y="104" width="18" height="26" rx="6" fill="#4d9de0"/>
        <ellipse cx="-13" cy="132" rx="10" ry="5" fill="#ffd166"/>
        <ellipse cx="13" cy="132" rx="10" ry="5" fill="#ffd166"/>
      </g>
    </svg>
  );
}
