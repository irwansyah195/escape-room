import Phaser from 'phaser';
import { generateAllGameTextures } from './textureGenerator';
import { updatePlayerPosition, subscribeToSessionPlayers } from '../utils/sessionSync';

export default class EscapeRoomScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EscapeRoomScene' });
  }

  init(data) {
    this.roomData = data.roomData || {};
    this.roomIdx = data.roomIdx || 0;
    this.totalRooms = data.totalRooms || 3;
    this.solvedLocks = data.solvedLocks || [];
    this.student = data.student || { name: 'Mahasiswa', characterType: 'runner', characterColor: 'blue' };
    this.sessionPin = data.sessionPin || null;

    this.remotePlayers = new Map();
    this.lockStations = [];
    this.nearestLockIdx = null;
  }

  create() {
    // 1. Generate procedural pixel-art textures
    generateAllGameTextures(this);

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 2. Buat arena ruangan observasi anak (Lantai Matras Warna-Warni)
    this.drawRoomBackground(width, height);

    // 3. Pasang Pintu Portal Ruangan (di dinding atas tengah)
    this.portalDoor = this.physics.add.staticSprite(width / 2, 54, 'room_portal');
    this.portalDoor.setScale(1.2);

    this.portalText = this.add.text(width / 2, 100, '🔒 Pintu Terkunci', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: '#334155',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5);

    // 4. Pasang Stasiun Gembok (Meja Observasi)
    this.spawnLockStations(width, height);

    // 5. Spawn Pemain Lokal
    const charKey = `${this.student.characterType || 'runner'}_${this.student.characterColor || 'blue'}`;
    this.player = this.physics.add.sprite(width / 2, height - 70, charKey);
    this.player.setCollideWorldBounds(true);
    this.player.setScale(1.3);

    // Label Nama Pemain di atas kepala
    this.playerNameTag = this.add.text(this.player.x, this.player.y - 28, this.student.name || 'Mahasiswa', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#1e293b',
      backgroundColor: '#ffffffcc',
      padding: { x: 6, y: 2 }
    }).setOrigin(0.5);

    // Balon Emote Pemain
    this.playerEmoteText = this.add.text(this.player.x, this.player.y - 48, '', {
      fontSize: '22px'
    }).setOrigin(0.5);

    // Prompt Aksi Interaksi Mengambang
    this.actionPrompt = this.add.text(width / 2, height - 30, '', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: '#7c3aed',
      padding: { x: 12, y: 6 }
    }).setOrigin(0.5).setAlpha(0);

    // 6. Input Keyboard
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    };

    // 7. Multiplayer Listener
    if (this.sessionPin) {
      this.unsubscribePlayers = subscribeToSessionPlayers(this.sessionPin, (players) => {
        this.syncRemotePlayers(players);
      });
    }

    // Perbarui status pintu portal
    this.checkPortalStatus();
  }

  drawRoomBackground(width, height) {
    const bgGraphics = this.add.graphics();

    // Dinding Atas
    bgGraphics.fillStyle(0x475569, 1);
    bgGraphics.fillRect(0, 0, width, 80);

    // Lantai Matras Bermain (Grid Kotak-Kotak Pastel Lembut)
    const tileSize = 40;
    const colors = [0xf1f5f9, 0xe2e8f0, 0xf8fafc, 0xede9fe];

    for (let x = 0; x < width; x += tileSize) {
      for (let y = 80; y < height; y += tileSize) {
        const cIdx = (Math.floor(x / tileSize) + Math.floor(y / tileSize)) % colors.length;
        bgGraphics.fillStyle(colors[cIdx], 1);
        bgGraphics.fillRect(x, y, tileSize, tileSize);
      }
    }

    // Karpet Lingkaran Observasi Anak di Tengah
    bgGraphics.fillStyle(0xddd6fe, 0.4);
    bgGraphics.fillCircle(width / 2, height / 2 + 30, 110);
    bgGraphics.lineStyle(2, 0xa78bfa, 0.6);
    bgGraphics.strokeCircle(width / 2, height / 2 + 30, 110);
  }

  spawnLockStations(width, height) {
    const locks = this.roomData.locks || [];
    const positions = [
      { x: width * 0.25, y: height * 0.48 },
      { x: width * 0.75, y: height * 0.48 },
      { x: width * 0.50, y: height * 0.70 },
      { x: width * 0.50, y: height * 0.32 }
    ];

    this.lockStations = locks.map((lock, idx) => {
      const pos = positions[idx % positions.length];
      const isSolved = this.solvedLocks.includes(idx);
      const texture = isSolved ? 'station_unlocked' : 'station_locked';

      const sprite = this.physics.add.staticSprite(pos.x, pos.y, texture);
      sprite.setInteractive({ useHandCursor: true });
      sprite.on('pointerdown', () => {
        this.triggerLockQuestion(idx);
      });

      const label = this.add.text(pos.x, pos.y - 32, isSolved ? `Gembok ${idx + 1}: ✨ Selesai` : `Gembok ${idx + 1}: 🔒`, {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: isSolved ? '#065f46' : '#7c3aed',
        backgroundColor: isSolved ? '#d1fae5' : '#ede9fe',
        padding: { x: 6, y: 3 }
      }).setOrigin(0.5);

      return { lockIdx: idx, sprite, label, isSolved };
    });
  }

  update() {
    if (!this.player) return;

    // 1. Kontrol Pergerakan Pemain
    const speed = 180;
    let vx = 0;
    let vy = 0;

    const left = this.cursors.left.isDown || this.wasd.left.isDown || this.virtualLeft;
    const right = this.cursors.right.isDown || this.wasd.right.isDown || this.virtualRight;
    const up = this.cursors.up.isDown || this.wasd.up.isDown || this.virtualUp;
    const down = this.cursors.down.isDown || this.wasd.down.isDown || this.virtualDown;

    if (left) {
      vx = -speed;
      this.player.setFlipX(true);
    } else if (right) {
      vx = speed;
      this.player.setFlipX(false);
    }

    if (up) {
      vy = -speed;
    } else if (down) {
      vy = speed;
    }

    // Normalisasi kecepatan diagonal
    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    this.player.setVelocity(vx, vy);

    // Sinkronkan posisi label nama & emote di atas kepala
    this.playerNameTag.setPosition(this.player.x, this.player.y - 28);
    this.playerEmoteText.setPosition(this.player.x, this.player.y - 48);

    // 2. Broadcast posisi ke Firebase RTDB jika multiplayer
    if (this.sessionPin && this.student.sessionId) {
      updatePlayerPosition(this.sessionPin, this.student.sessionId, {
        x: this.player.x,
        y: this.player.y,
        anim: vx !== 0 || vy !== 0 ? 'walk' : 'idle',
        flipX: this.player.flipX
      });
    }

    // 3. Deteksi Kedekatan dengan Stasiun Gembok
    this.checkLockProximity();

    // 4. Deteksi Masuk Pintu Portal
    this.checkPortalProximity();

    // 5. Trigger Soal via Tombol Spasi
    if (Phaser.Input.Keyboard.JustDown(this.wasd.space)) {
      if (this.nearestLockIdx !== null) {
        this.triggerLockQuestion(this.nearestLockIdx);
      }
    }
  }

  checkLockProximity() {
    let nearestIdx = null;
    let minDistance = 60; // radius interaksi 60px

    this.lockStations.forEach((station) => {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, station.sprite.x, station.sprite.y);
      if (dist < minDistance) {
        nearestIdx = station.lockIdx;
      }
    });

    this.nearestLockIdx = nearestIdx;

    if (nearestIdx !== null) {
      const station = this.lockStations[nearestIdx];
      if (!station.isSolved) {
        this.actionPrompt.setText(`💡 Tekan [SPASI] atau Klik Meja untuk Memecahkan Gembok ${nearestIdx + 1}!`);
        this.actionPrompt.setAlpha(1);
      } else {
        this.actionPrompt.setText(`✨ Gembok ${nearestIdx + 1} sudah terpecahkan!`);
        this.actionPrompt.setAlpha(0.85);
      }
    } else {
      this.actionPrompt.setAlpha(0);
    }
  }

  checkPortalProximity() {
    const allSolved = (this.roomData.locks || []).length > 0 &&
      this.solvedLocks.length >= (this.roomData.locks || []).length;

    if (!allSolved) return;

    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.portalDoor.x, this.portalDoor.y);
    if (dist < 45) {
      if (this.game.reactBridge?.onEnterPortal) {
        this.game.reactBridge.onEnterPortal();
      }
    }
  }

  checkPortalStatus() {
    const total = (this.roomData.locks || []).length;
    const solved = this.solvedLocks.length;
    const allSolved = total > 0 && solved >= total;

    if (allSolved) {
      this.portalText.setText('✨ PINTU TERBUKA! Masuk ke Portal ✨');
      this.portalText.setStyle({
        backgroundColor: '#059669',
        color: '#ffffff'
      });

      // Animasi berdenyut emas untuk pintu portal
      this.tweens.add({
        targets: this.portalDoor,
        scale: 1.35,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    } else {
      this.portalText.setText(`🔒 Pintu Terkunci (${solved}/${total} Gembok)`);
    }
  }

  triggerLockQuestion(lockIdx) {
    if (this.game.reactBridge?.onTriggerLock) {
      this.game.reactBridge.onTriggerLock(lockIdx);
    }
  }

  updateSolvedLocks(newSolvedLocks) {
    this.solvedLocks = newSolvedLocks;

    // Perbarui tekstur stasiun yang sudah selesai
    this.lockStations.forEach((station) => {
      const isSolved = this.solvedLocks.includes(station.lockIdx);
      station.isSolved = isSolved;
      station.sprite.setTexture(isSolved ? 'station_unlocked' : 'station_locked');
      station.label.setText(isSolved ? `Gembok ${station.lockIdx + 1}: ✨ Selesai` : `Gembok ${station.lockIdx + 1}: 🔒`);
      station.label.setStyle({
        color: isSolved ? '#065f46' : '#7c3aed',
        backgroundColor: isSolved ? '#d1fae5' : '#ede9fe'
      });
    });

    this.checkPortalStatus();
  }

  showPlayerEmote(emoji) {
    this.playerEmoteText.setText(emoji);
    this.tweens.add({
      targets: this.playerEmoteText,
      scale: 1.4,
      duration: 200,
      yoyo: true,
      onComplete: () => {
        this.time.delayedCall(2500, () => {
          this.playerEmoteText.setText('');
        });
      }
    });
  }

  syncRemotePlayers(playersMap) {
    if (!playersMap) return;
    const currentUid = this.student.sessionId;

    Object.entries(playersMap).forEach(([uid, data]) => {
      if (uid === currentUid) return;

      let remote = this.remotePlayers.get(uid);

      if (!remote) {
        // Buat avatar teman baru
        const charKey = `${data.characterType || 'runner'}_${data.characterColor || 'red'}`;
        const sprite = this.physics.add.sprite(data.x || 200, data.y || 200, charKey);
        sprite.setScale(1.2);

        const nameTag = this.add.text(sprite.x, sprite.y - 26, data.name || 'Teman', {
          fontFamily: 'Nunito, sans-serif',
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#334155',
          backgroundColor: '#ffffffdd',
          padding: { x: 5, y: 2 }
        }).setOrigin(0.5);

        const emoteTag = this.add.text(sprite.x, sprite.y - 44, data.emote || '', {
          fontSize: '20px'
        }).setOrigin(0.5);

        remote = { sprite, nameTag, emoteTag, targetX: data.x, targetY: data.y };
        this.remotePlayers.set(uid, remote);
      } else {
        // Interpolasi pergerakan halus
        remote.targetX = data.x;
        remote.targetY = data.y;

        this.tweens.add({
          targets: remote.sprite,
          x: data.x,
          y: data.y,
          duration: 70,
          ease: 'Linear'
        });

        remote.sprite.setFlipX(Boolean(data.flipX));
        remote.nameTag.setPosition(data.x, data.y - 26);
        remote.emoteTag.setPosition(data.x, data.y - 44);

        if (data.emote && Date.now() - (data.emoteTime || 0) < 3000) {
          remote.emoteTag.setText(data.emote);
        } else {
          remote.emoteTag.setText('');
        }
      }
    });

    // Hapus remote player yang sudah keluar
    this.remotePlayers.forEach((remote, uid) => {
      if (!playersMap[uid]) {
        remote.sprite.destroy();
        remote.nameTag.destroy();
        remote.emoteTag.destroy();
        this.remotePlayers.delete(uid);
      }
    });
  }

  shutdown() {
    if (this.unsubscribePlayers) {
      this.unsubscribePlayers();
    }
  }
}

