import Phaser from 'phaser';
import { generateAllGameTextures } from './textureGenerator';
import { subscribeToSessionPlayers } from '../utils/sessionSync';

export default class SprintRaceScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SprintRaceScene' });
  }

  init(data) {
    this.sessionPin = data.sessionPin || null;
    this.student = data.student || null;
    this.totalQuestions = data.totalQuestions || 5;
    this.isSpectator = Boolean(data.isSpectator);

    this.racerEntities = new Map(); // uid -> { container, sprite, nameText, progressText, targetX, currentX }
    this.allPlayers = {};
  }

  create() {
    generateAllGameTextures(this);

    this.trackWidth = this.cameras?.main?.width || 800;
    this.startX = 90;
    this.finishX = this.trackWidth - 110;
    this.sprintDistance = this.finishX - this.startX;

    // Background Cyber Arena
    this.drawTrackEnvironment();

    // Subscribe ke pemain secara real-time
    if (this.sessionPin) {
      this.unsubscribePlayers = subscribeToSessionPlayers(this.sessionPin, (players) => {
        if (!this.sys?.isActive() || !this.cameras?.main) return;
        this.allPlayers = players || {};
        this.renderAllRacers(this.allPlayers);
      });
    } else if (this.student) {
      // Mode Mandiri / Solo
      const soloPlayer = {
        [this.student.sessionId || 'solo']: {
          uid: this.student.sessionId || 'solo',
          name: this.student.name || 'Mahasiswa',
          nim: this.student.nim || '000000',
          characterType: this.student.characterType || 'kart',
          characterColor: this.student.characterColor || 'blue',
          progressIdx: 0,
          totalQuestions: this.totalQuestions,
          score: 0,
          isFinished: false
        }
      };
      this.renderAllRacers(soloPlayer);
    }
  }

  drawTrackEnvironment() {
    if (!this.add || !this.cameras?.main) return;
    const w = this.trackWidth;
    const h = Math.max(this.cameras.main.height, 400);

    const g = this.add.graphics();

    // 1. Aspal Sirkuit Gelap Berkilau (Cyber Asphalt)
    g.fillStyle(0x0f172a, 1);
    g.fillRect(0, 0, w, h);

    // 2. Garis Start (Neon Cyan Line)
    g.fillStyle(0x38bdf8, 0.9);
    g.fillRect(this.startX - 4, 0, 8, h);

    this.add.text(this.startX - 60, 16, 'START 🚦', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#38bdf8'
    });

    // 3. Garis Finish (Papan Catur Kotak-kotak Hitam Putih)
    const squareSize = 12;
    const numRows = Math.ceil(h / squareSize);
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < 2; c++) {
        const isWhite = (r + c) % 2 === 0;
        g.fillStyle(isWhite ? 0xffffff : 0x000000, 1);
        g.fillRect(this.finishX + c * squareSize, r * squareSize, squareSize, squareSize);
      }
    }

    this.add.text(this.finishX + 30, 16, 'FINISH 🏁', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#4ade80'
    });
  }

  renderAllRacers(playersMap) {
    if (!this.sys?.isActive() || !this.cameras?.main || !this.add) return;
    const playerList = Object.values(playersMap || {});
    if (playerList.length === 0) {
      // Jika belum ada pembalap aktif, bersihkan entitas lama agar canvas sinkron
      for (const [uid, entity] of this.racerEntities.entries()) {
        if (entity?.container) entity.container.destroy();
      }
      this.racerEntities.clear();
      return;
    }

    const canvasHeight = this.cameras.main.height;
    const laneHeight = Math.max(54, Math.floor((canvasHeight - 60) / Math.max(1, playerList.length)));

    // Atur ukuran dunia jika banyak pemain
    const totalHeightRequired = Math.max(canvasHeight, playerList.length * laneHeight + 60);
    this.cameras.main.setBounds(0, 0, this.trackWidth, totalHeightRequired);

    playerList.forEach((player, idx) => {
      const uid = player.uid || player.sessionId || `player-${idx}`;
      const laneY = 50 + idx * laneHeight + laneHeight / 2;

      // Hitung posisi X berdasarkan progres soal
      const totalQ = player.totalQuestions || this.totalQuestions || 1;
      const progress = Math.min(1, Math.max(0, (player.progressIdx || player.solvedCount || 0) / totalQ));
      const targetX = this.startX + progress * this.sprintDistance;

      let entity = this.racerEntities.get(uid);

      if (!entity) {
        // Buat entitas pembalap baru di jalurnya
        const container = this.add.container(this.startX, laneY);

        // Garis Pembatas Jalur (Dashed Track Divider)
        const laneLine = this.add.graphics();
        laneLine.lineStyle(1, 0x334155, 0.7);
        laneLine.lineBetween(0, laneHeight / 2 - 2, this.trackWidth, laneHeight / 2 - 2);

        // Tekstur Avatar / Mobil
        const isKart = player.characterType === 'kart';
        const charKey = `${player.characterType || 'kart'}_${player.characterColor || 'blue'}`;

        const sprite = this.add.sprite(0, 0, charKey);
        sprite.setScale(isKart ? 1.05 : 0.95);
        if (isKart) sprite.setAngle(90); // Hadap ke kanan menuju garis finish

        // Label Nama Pemain
        const isMe = this.student && (uid === this.student.sessionId || player.nim === this.student.nim);
        const nameLabel = this.add.text(0, -22, `${isMe ? '⭐ ' : ''}${player.name} (${player.nim})`, {
          fontFamily: 'Nunito, sans-serif',
          fontSize: '11px',
          fontStyle: 'bold',
          color: isMe ? '#fef08a' : '#f8fafc',
          backgroundColor: isMe ? '#a855f7cc' : '#1e293bcc',
          padding: { x: 6, y: 2 }
        }).setOrigin(0.5);

        // Badge Status / Soal ke-x
        const progressBadge = this.add.text(35, 0, 'Soal 1', {
          fontFamily: 'Nunito, sans-serif',
          fontSize: '10px',
          fontStyle: 'bold',
          color: '#cbd5e1',
          backgroundColor: '#0f172acc',
          padding: { x: 4, y: 2 }
        }).setOrigin(0, 0.5);

        container.add([sprite, nameLabel, progressBadge]);

        entity = {
          container,
          sprite,
          nameLabel,
          progressBadge,
          targetX,
          currentX: this.startX,
          lastProgressIdx: player.progressIdx || 0
        };

        this.racerEntities.set(uid, entity);
      }

      // Update posisi target & teks progres
      entity.targetX = targetX;

      // Update Teks Progres
      if (player.isFinished) {
        entity.progressBadge.setText(`🏁 FINISH #${player.finishRank || '1'}`);
        entity.progressBadge.setColor('#4ade80');
      } else {
        const currentQ = Math.min(totalQ, (player.progressIdx || 0) + 1);
        entity.progressBadge.setText(`Soal ${currentQ}/${totalQ}`);
        entity.progressBadge.setColor('#38bdf8');
      }

      // Animasi lompatan Nitro jika pemain baru saja berhasil menjawab
      if ((player.progressIdx || 0) > entity.lastProgressIdx) {
        this.triggerNitroEffect(entity.container.x, laneY);
        entity.lastProgressIdx = player.progressIdx;
      }
    });

    // Hapus entitas pemain yang sudah keluar
    for (const [uid, entity] of this.racerEntities.entries()) {
      if (!playersMap[uid]) {
        entity.container.destroy();
        this.racerEntities.delete(uid);
      }
    }
  }

  triggerNitroEffect(x, y) {
    const particles = this.add.particles(x - 25, y, 'nitro_flame', {
      speed: { min: 80, max: 180 },
      angle: { min: 160, max: 200 },
      scale: { start: 1.2, end: 0 },
      lifespan: 500,
      quantity: 8,
      blendMode: 'ADD'
    });

    this.time.delayedCall(400, () => {
      particles.destroy();
    });
  }

  update() {
    if (!this.racerEntities) return;
    // Smooth lerp pergerakan mobil menuju targetX masing-masing
    this.racerEntities.forEach((entity) => {
      if (!entity?.container?.active) return;
      const diff = entity.targetX - entity.container.x;
      if (Math.abs(diff) > 0.5) {
        entity.container.x += diff * 0.12;
      } else {
        entity.container.x = entity.targetX;
      }
    });
  }

  destroy() {
    if (this.unsubscribePlayers) {
      this.unsubscribePlayers();
    }
  }
}
