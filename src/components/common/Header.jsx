import React from 'react';
import { Key } from 'lucide-react';

export default function Header() {
  return (
    <header className="header-card">
      <h1>
        <span style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: '8px' }}>
          <Key size={30} color="#ffd166" />
        </span>
        Escape Room: Dunia Bermain Anak
      </h1>
      <p>
        Bantu anak-anak menemukan kunci dengan menjawab teka-teki observasi bermain secara kritis & tepat!
      </p>
    </header>
  );
}
