/**
 * textureGenerator.js
 * Generator tekstur pixel art dinamis untuk Phaser.js
 * Menghasilkan sprite avatar, mobil kart, stasiun gembok, dan sirkuit tanpa aset eksternal.
 */

export function generateAllGameTextures(scene) {
  // 1. Karakter Pelari (Runner) berbagai warna
  const runnerColors = {
    blue: { shirt: 0x3b82f6, pants: 0x1e3a8a, skin: 0xfde047 },
    red: { shirt: 0xef4444, pants: 0x7f1d1d, skin: 0xfde047 },
    green: { shirt: 0x22c55e, pants: 0x14532d, skin: 0xfde047 },
    yellow: { shirt: 0xeab308, pants: 0x713f12, skin: 0xfde047 },
    purple: { shirt: 0xa855f7, pants: 0x581c87, skin: 0xfde047 }
  };

  Object.entries(runnerColors).forEach(([colorName, cols]) => {
    const key = `runner_${colorName}`;
    if (!scene.textures.exists(key)) {
      const g = scene.make.graphics({ x: 0, y: 0, add: false });
      // Bayangan
      g.fillStyle(0x000000, 0.25);
      g.fillEllipse(16, 28, 20, 8);

      // Tubuh / Baju
      g.fillStyle(cols.shirt, 1);
      g.fillRoundedRect(9, 13, 14, 10, 3);

      // Celana
      g.fillStyle(cols.pants, 1);
      g.fillRect(10, 21, 5, 6);
      g.fillRect(17, 21, 5, 6);

      // Sepatu
      g.fillStyle(0xffffff, 1);
      g.fillRect(9, 26, 6, 3);
      g.fillRect(17, 26, 6, 3);

      // Kepala / Wajah
      g.fillStyle(cols.skin, 1);
      g.fillCircle(16, 8, 7);

      // Rambut
      g.fillStyle(0x451a03, 1);
      g.fillCircle(16, 5, 6);

      // Mata
      g.fillStyle(0x0f172a, 1);
      g.fillRect(14, 8, 2, 2);
      g.fillRect(18, 8, 2, 2);

      g.generateTexture(key, 32, 32);
      g.destroy();
    }
  });

  // 2. Mobil Kart Mini berbagai warna
  const kartColors = {
    blue: 0x2563eb,
    red: 0xdc2626,
    green: 0x16a34a,
    yellow: 0xca8a04,
    purple: 0x9333ea
  };

  Object.entries(kartColors).forEach(([colorName, mainColor]) => {
    const key = `kart_${colorName}`;
    if (!scene.textures.exists(key)) {
      const g = scene.make.graphics({ x: 0, y: 0, add: false });
      // Roda 4
      g.fillStyle(0x1e293b, 1);
      g.fillRoundedRect(4, 4, 7, 10, 2);
      g.fillRoundedRect(25, 4, 7, 10, 2);
      g.fillRoundedRect(4, 26, 7, 10, 2);
      g.fillRoundedRect(25, 26, 7, 10, 2);

      // Bodi Kart
      g.fillStyle(mainColor, 1);
      g.fillRoundedRect(8, 6, 20, 28, 5);

      // Kap Mesin / Garis Balap Putih
      g.fillStyle(0xffffff, 0.9);
      g.fillRect(16, 8, 4, 24);

      // Kokpit / Helm Pengemudi
      g.fillStyle(0x0f172a, 1);
      g.fillCircle(18, 20, 5);
      g.fillStyle(0x38bdf8, 1);
      g.fillRect(16, 17, 4, 3);

      g.generateTexture(key, 36, 40);
      g.destroy();
    }
  });

  // 3. Stasiun Gembok / Meja Observasi (Escape Room)
  if (!scene.textures.exists('station_locked')) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    // Meja kayu
    g.fillStyle(0xd97706, 1);
    g.fillRoundedRect(4, 14, 40, 26, 6);
    g.fillStyle(0xb45309, 1);
    g.fillRect(8, 38, 6, 8);
    g.fillRect(34, 38, 6, 8);

    // Kotak Misteri Gembok di atas meja
    g.fillStyle(0x7c3aed, 1);
    g.fillRoundedRect(14, 4, 20, 18, 4);

    // Ikon Gembok Emas
    g.fillStyle(0xfbbf24, 1);
    g.fillCircle(24, 10, 4);
    g.fillRect(21, 12, 6, 6);

    g.generateTexture('station_locked', 48, 48);
    g.destroy();
  }

  // 4. Stasiun Terpecahkan (Unlocked)
  if (!scene.textures.exists('station_unlocked')) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    // Meja kayu
    g.fillStyle(0xd97706, 1);
    g.fillRoundedRect(4, 14, 40, 26, 6);
    g.fillStyle(0xb45309, 1);
    g.fillRect(8, 38, 6, 8);
    g.fillRect(34, 38, 6, 8);

    // Kotak Terbuka Hijau Bercahaya
    g.fillStyle(0x10b981, 1);
    g.fillRoundedRect(14, 4, 20, 18, 4);

    // Centang Hijau / Bintang Emas
    g.fillStyle(0xffffff, 1);
    g.fillCircle(24, 13, 5);

    g.generateTexture('station_unlocked', 48, 48);
    g.destroy();
  }

  // 5. Pintu Keluar / Portal Ruangan
  if (!scene.textures.exists('room_portal')) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    // Kusen Pintu
    g.fillStyle(0x64748b, 1);
    g.fillRoundedRect(4, 2, 56, 60, 10);

    // Lubang Portal Energi Biru/Ungu
    g.fillStyle(0x3b82f6, 1);
    g.fillRoundedRect(10, 8, 44, 54, 6);

    // Efek Bintang/Energi
    g.fillStyle(0x93c5fd, 0.8);
    g.fillCircle(32, 28, 12);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(32, 28, 5);

    g.generateTexture('room_portal', 64, 64);
    g.destroy();
  }

  // 6. Gerbang Pos Kuis Balapan (Race Checkpoint Gate)
  if (!scene.textures.exists('checkpoint_gate')) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    // Tiang Kiri & Kanan
    g.fillStyle(0x334155, 1);
    g.fillRect(2, 4, 8, 56);
    g.fillRect(90, 4, 8, 56);

    // Palang Atas Papan Catur Balap
    g.fillStyle(0xf1f5f9, 1);
    g.fillRect(2, 4, 96, 16);
    for (let i = 0; i < 8; i++) {
      g.fillStyle(i % 2 === 0 ? 0x0f172a : 0xf59e0b, 1);
      g.fillRect(2 + i * 12, 4, 12, 16);
    }

    // Tanda Tanya Kuis di Tengah
    g.fillStyle(0x7c3aed, 1);
    g.fillCircle(50, 12, 8);
    g.fillStyle(0xffffff, 1);
    g.fillRect(48, 8, 4, 5);
    g.fillRect(48, 14, 4, 2);

    g.generateTexture('checkpoint_gate', 100, 64);
    g.destroy();
  }

  // 7. Garis Finish Balapan
  if (!scene.textures.exists('finish_line')) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    for (let x = 0; x < 120; x += 15) {
      for (let y = 0; y < 30; y += 15) {
        g.fillStyle((x / 15 + y / 15) % 2 === 0 ? 0xffffff : 0x0f172a, 1);
        g.fillRect(x, y, 15, 15);
      }
    }
    g.generateTexture('finish_line', 120, 30);
    g.destroy();
  }

  // 8. Partikel Nitro / Api Boost
  if (!scene.textures.exists('nitro_particle')) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x38bdf8, 1);
    g.fillCircle(6, 6, 6);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(6, 6, 3);
    g.generateTexture('nitro_particle', 12, 12);
    g.destroy();
  }
}

