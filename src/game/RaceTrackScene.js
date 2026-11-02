import Phaser from 'phaser';
import { generateAllGameTextures } from './textureGenerator';
import { updatePlayerPosition, subscribeToSessionPlayers } from '../utils/sessionSync';

export default class RaceTrackScene extends Phaser.Scene {
  constructor() {
    super({ key: 'RaceTrackScene' });
  }

  init(data) {
    this.rooms = data.rooms || [];
    this.student = data.student || { name: 'Mahasiswa', characterType: 'kart', characterColor: 'blue' };
    this.sessionPin = data.sessionPin || null;

    // Kumpulkan seluruh pertanyaan dari seluruh ruangan menjadi checkpoint balapan
    this.allQuestions = [];
    this.rooms.forEach((r, rIdx) => {
      (r.locks || []).forEach((lock, lIdx) => {
        this.allQuestions.push({
          roomTitle: r.title,
          lock,
          cpIndex: this.allQuestions.length
        });
      });
    });

    this.solvedCheckpoints = data.solvedCheckpoints || [];
    this.currentCheckpointIdx = this.solvedCheckpoints.length;
    this.nitroUntil = 0;
    this.remoteRacers = new Map();
    this.isRaceFinished = false;
  }

  create() {
    generateAllGameTextures(this);

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 1. Gambar Sirkuit Balapan Bermain Ceria
    this.drawCircuitTrack(width, height);

    // 2. Pasang Gerbang Checkpoint Kuis
    this.spawnCheckpoints(width, height);

    // 3. Garis Finish
    this.finishSprite = this.physics.add.staticSprite(width / 2, height - 70, 'finish_line');

    // 4. Spawn Karakter / Kendaraan Pemain
    const isKart = this.student.characterType === 'kart';
    const charKey = `${this.student.characterType || 'kart'}_${this.student.characterColor || 'blue'}`;

    this.player = this.physics.add.sprite(width / 2 - 30, height - 70, charKey);
    this.player.setCollideWorldBounds(true);
    this.player.setScale(1.2);

    this.playerNameTag = this.add.text(this.player.x, this.player.y - 30, this.student.name || 'Pembalap', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#1e293b',
      backgroundColor: '#ffffffdd',
      padding: { x: 6, y: 2 }
    }).setOrigin(0.5);

    // Nitro HUD Icon
    this.nitroText = this.add.text(20, 20, '', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: '#f59e0b',
      padding: { x: 10, y: 5 }
    }).setAlpha(0);

    // 5. Input Controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    };

    // 6. Multiplayer Sync
    if (this.sessionPin) {
      this.unsubscribeRacers = subscribeToSessionPlayers(this.sessionPin, (players) => {
        this.syncRemoteRacers(players);
      });
    }
  }

  drawCircuitTrack(width, height) {
    const g = this.add.graphics();

    // Lapangan Rumput Hijau Taman Bermain
    g.fillStyle(0x4ade80, 1);
    g.fillRect(0, 0, width, height);

    // Sirkuit Aspal Oval Luar
    g.fillStyle(0x334155, 1);
    g.fillRoundedRect(50, 40, width - 100, height - 80, 80);

    // Pulau Rumput Tengah (Inner Island)
    g.fillStyle(0x22c55e, 1);
    g.fillRoundedRect(160, 130, width - 320, height - 260, 60);

    // Garis Putih Putus-Putus Tengah Lintasan
    g.lineStyle(2, 0xffffff, 0.7);
    g.strokeRoundedRect(105, 85, width - 210, height - 170, 70);

    // Kolam Pasir & Dekorasi Taman di Tengah
    g.fillStyle(0xfde047, 0.6);
    g.fillCircle(width / 2, height / 2, 45);
    this.add.text(width / 2, height / 2, '🏖️', { fontSize: '28px' }).setOrigin(0.5);
  }

  spawnCheckpoints(width, height) {
    // Jalur oval: Bawah -> Kanan -> Atas -> Kiri
    const trackPoints = [
      { x: width - 100, y: height / 2, angle: 90 },       // Kanan
      { x: width / 2, y: 85, angle: 0 },                  // Atas
      { x: 105, y: height / 2, angle: -90 },              // Kiri
      { x: width / 2 + 100, y: height - 70, angle: 0 }    // Bawah
    ];

    this.checkpoints = this.allQuestions.map((q, idx) => {
      const pt = trackPoints[idx % trackPoints.length];
      const isSolved = this.solvedCheckpoints.includes(idx);

      const sprite = this.physics.add.staticSprite(pt.x, pt.y, 'checkpoint_gate');
      sprite.setScale(0.85);

      const label = this.add.text(pt.x, pt.y - 34, isSolved ? `Pos ${idx + 1}: ✨ Lolos` : `Pos ${idx + 1}: 🏁 Kuis`, {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: isSolved ? '#065f46' : '#ffffff',
        backgroundColor: isSolved ? '#d1fae5' : '#7c3aed',
        padding: { x: 6, y: 3 }
      }).setOrigin(0.5);

      return { cpIdx: idx, sprite, label, isSolved, questionData: q };
    });
  }

  update() {
    if (!this.player || this.isRaceFinished) return;

    const now = Date.now();
    const isNitro = now < this.nitroUntil;
    const baseSpeed = this.student.characterType === 'kart' ? 200 : 180;
    const currentSpeed = isNitro ? baseSpeed * 1.85 : baseSpeed;

    // Tampilkan Nitro HUD
    if (isNitro) {
      const remainingSec = Math.ceil((this.nitroUntil - now) / 1000);
      this.nitroText.setText(`🚀 SUPER NITRO BOOST: ${remainingSec}s`);
      this.nitroText.setAlpha(1);

      // Partikel Nitro di belakang
      if (Math.random() < 0.4) {
        const p = this.add.sprite(this.player.x, this.player.y, 'nitro_particle');
        p.setScale(0.8);
        this.tweens.add({
          targets: p,
          alpha: 0,
          scale: 0.2,
          duration: 350,
          onComplete: () => p.destroy()
        });
      }
    } else {
      this.nitroText.setAlpha(0);
    }

    // 1. Kontrol Pergerakan
    let vx = 0;
    let vy = 0;

    const left = this.cursors.left.isDown || this.wasd.left.isDown || this.virtualLeft;
    const right = this.cursors.right.isDown || this.wasd.right.isDown || this.virtualRight;
    const up = this.cursors.up.isDown || this.wasd.up.isDown || this.virtualUp;
    const down = this.cursors.down.isDown || this.wasd.down.isDown || this.virtualDown;

    if (this.student.characterType === 'kart') {
      // Mekanik Mengemudi Kart
      if (up) {
        vx = Math.cos(this.player.rotation - Math.PI / 2) * currentSpeed;
        vy = Math.sin(this.player.rotation - Math.PI / 2) * currentSpeed;
      } else if (down) {
        vx = -Math.cos(this.player.rotation - Math.PI / 2) * (currentSpeed * 0.5);
        vy = -Math.sin(this.player.rotation - Math.PI / 2) * (currentSpeed * 0.5);
      }

      if (left) {
        this.player.rotation -= 0.055;
      } else if (right) {
        this.player.rotation += 0.055;
      }
    } else {
      // Mekanik Pelari Bebas
      if (left) vx = -currentSpeed;
      if (right) vx = currentSpeed;
      if (up) vy = -currentSpeed;
      if (down) vy = currentSpeed;

      if (vx !== 0 && vy !== 0) {
        vx *= 0.7071;
        vy *= 0.7071;
      }

      if (left) this.player.setFlipX(true);
      if (right) this.player.setFlipX(false);
    }

    this.player.setVelocity(vx, vy);
    this.playerNameTag.setPosition(this.player.x, this.player.y - 30);

    // 2. Broadcast posisi ke RTDB
    if (this.sessionPin && this.student.sessionId) {
      updatePlayerPosition(this.sessionPin, this.student.sessionId, {
        x: this.player.x,
        y: this.player.y,
        angle: this.player.rotation,
        nitro: isNitro,
        checkpointIdx: this.currentCheckpointIdx
      });
    }

    // 3. Deteksi Gerbang Checkpoint
    this.checkCheckpointOverlap();

    // 4. Deteksi Garis Finish
    this.checkFinishLine();
  }

  checkCheckpointOverlap() {
    if (this.currentCheckpointIdx >= this.checkpoints.length) return;

    const nextCp = this.checkpoints[this.currentCheckpointIdx];
    if (!nextCp || nextCp.isSolved) return;

    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, nextCp.sprite.x, nextCp.sprite.y);

    if (dist < 48) {
      // Hentikan sejenak untuk menjawab soal
      this.player.setVelocity(0, 0);
      if (this.game.reactBridge?.onTriggerCheckpoint) {
        this.game.reactBridge.onTriggerCheckpoint(this.currentCheckpointIdx, nextCp.questionData);
      }
    }
  }

  checkFinishLine() {
    const allPassed = this.solvedCheckpoints.length >= this.allQuestions.length;
    if (!allPassed || this.isRaceFinished) return;

    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.finishSprite.x, this.finishSprite.y);
    if (dist < 45) {
      this.isRaceFinished = true;
      this.player.setVelocity(0, 0);

      if (this.game.reactBridge?.onFinishRace) {
        this.game.reactBridge.onFinishRace();
      }
    }
  }

  applyCheckpointSuccess(cpIdx, wasCorrect) {
    if (!this.solvedCheckpoints.includes(cpIdx)) {
      this.solvedCheckpoints.push(cpIdx);
    }
    this.currentCheckpointIdx = cpIdx + 1;

    // Perbarui visual gerbang
    const cp = this.checkpoints[cpIdx];
    if (cp) {
      cp.isSolved = true;
      cp.label.setText(`Pos ${cpIdx + 1}: ✨ Lolos`);
      cp.label.setStyle({ backgroundColor: '#d1fae5', color: '#065f46' });
    }

    // Jika benar, aktifkan Super Nitro Boost selama 5 detik!
    if (wasCorrect) {
      this.nitroUntil = Date.now() + 5000;
      this.cameras.main.shake(200, 0.005);
    }
  }

  syncRemoteRacers(playersMap) {
    if (!playersMap) return;
    const currentUid = this.student.sessionId;

    Object.entries(playersMap).forEach(([uid, data]) => {
      if (uid === currentUid) return;

      let remote = this.remoteRacers.get(uid);

      if (!remote) {
        const charKey = `${data.characterType || 'kart'}_${data.characterColor || 'red'}`;
        const sprite = this.physics.add.sprite(data.x || 300, data.y || 400, charKey);
        sprite.setScale(1.1);

        const nameTag = this.add.text(sprite.x, sprite.y - 28, data.name || 'Pembalap', {
          fontFamily: 'Nunito, sans-serif',
          fontSize: '10px',
          fontStyle: 'bold',
          color: '#334155',
          backgroundColor: '#ffffffcc',
          padding: { x: 5, y: 2 }
        }).setOrigin(0.5);

        remote = { sprite, nameTag };
        this.remoteRacers.set(uid, remote);
      } else {
        this.tweens.add({
          targets: remote.sprite,
          x: data.x,
          y: data.y,
          duration: 70,
          ease: 'Linear'
        });

        if (data.angle !== undefined) {
          remote.sprite.rotation = data.angle;
        }

        remote.nameTag.setPosition(data.x, data.y - 28);
      }
    });

    this.remoteRacers.forEach((remote, uid) => {
      if (!playersMap[uid]) {
        remote.sprite.destroy();
        remote.nameTag.destroy();
        this.remoteRacers.delete(uid);
      }
    });
  }

  shutdown() {
    if (this.unsubscribeRacers) {
      this.unsubscribeRacers();
    }
  }
}

