/**
 * sessionPlugin.js - Vite Dev Server Middleware untuk Multiplayer Real-time
 * Mendukung Lobby Ruang Tunggu, Countdown 3-2-1 GO!, Sprint Race, dan Podium
 */

export function sessionServerPlugin() {
  // In-memory store di level proses Node Vite dev server
  const sessions = new Map();

  return {
    name: 'vite-plugin-session-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const pathname = url.pathname;

        // Hanya tangani request /api/sessions
        if (!pathname.startsWith('/api/sessions')) {
          return next();
        }

        // Helper untuk parse JSON body
        const parseJsonBody = () => {
          return new Promise((resolve) => {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                resolve(body ? JSON.parse(body) : {});
              } catch {
                resolve({});
              }
            });
          });
        };

        const sendJson = (statusCode, data) => {
          res.statusCode = statusCode;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.end(JSON.stringify(data));
        };

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          return res.end();
        }

        const parts = pathname.replace(/^\/api\/sessions\/?/, '').split('/').filter(Boolean);
        const pin = parts[0];
        const sub = parts[1];
        const subId = parts[2];

        // 1. POST /api/sessions -> Buat atau perbarui sesi baru
        if (req.method === 'POST' && (!pin || pin === '')) {
          parseJsonBody().then(payload => {
            const sessionPin = payload.pin || Math.floor(100000 + Math.random() * 900000).toString();
            const sessionData = {
              pin: sessionPin,
              mode: payload.mode || 'escape_room',
              title: payload.title || 'Sesi Kelas Edukatif',
              raceQuestions: payload.raceQuestions || null,
              status: payload.status || 'waiting', // 'waiting' | 'starting' | 'in_progress' | 'finished' | 'closed'
              createdAt: Date.now(),
              updatedAt: Date.now(),
              countdownStart: null,
              startedAt: null,
              finishedAt: null,
              players: {}
            };
            sessions.set(sessionPin, sessionData);
            sendJson(200, { success: true, session: sessionData });
          });
          return;
        }

        if (!pin) {
          return sendJson(400, { error: 'PIN tidak diberikan' });
        }

        // 2. GET /api/sessions/:pin -> Verifikasi status sesi & ambil data
        if (req.method === 'GET' && !sub) {
          const session = sessions.get(pin);
          if (session && session.status !== 'closed') {
            // Cek jika sedang 'starting' dan waktu countdown 3.5 detik sudah lewat -> otomatis 'in_progress'
            if (session.status === 'starting' && session.countdownStart) {
              const elapsed = Date.now() - session.countdownStart;
              if (elapsed >= 3500) {
                session.status = 'in_progress';
                session.startedAt = session.startedAt || Date.now();
                session.updatedAt = Date.now();
              }
            }
            return sendJson(200, { success: true, session });
          }
          return sendJson(404, { success: false, error: 'Sesi tidak ditemukan atau sudah ditutup' });
        }

        // 3. POST /api/sessions/:pin/start -> Dosen memulai pertandingan serentak (3-2-1 GO!)
        if (req.method === 'POST' && sub === 'start') {
          const session = sessions.get(pin);
          if (!session) {
            return sendJson(404, { success: false, error: 'Sesi tidak ditemukan' });
          }

          session.status = 'starting';
          session.countdownStart = Date.now();
          session.updatedAt = Date.now();

          // Auto-transisi ke in_progress setelah 3.5 detik di server
          setTimeout(() => {
            if (session.status === 'starting') {
              session.status = 'in_progress';
              session.startedAt = Date.now();
              session.updatedAt = Date.now();
            }
          }, 3500);

          return sendJson(200, { success: true, session });
        }

        // 4. POST /api/sessions/:pin/finish -> Sesi selesai / Dosen menutup pertandingan
        if (req.method === 'POST' && sub === 'finish') {
          const session = sessions.get(pin);
          if (!session) {
            return sendJson(404, { success: false, error: 'Sesi tidak ditemukan' });
          }

          session.status = 'finished';
          session.finishedAt = Date.now();
          session.updatedAt = Date.now();
          return sendJson(200, { success: true, session });
        }

        // 5. DELETE /api/sessions/:pin -> Hapus / Tutup sesi kelas
        if (req.method === 'DELETE' && !sub) {
          const session = sessions.get(pin);
          if (session) {
            session.status = 'closed';
            session.closedAt = Date.now();
            sessions.delete(pin);
          }
          return sendJson(200, { success: true, message: 'Sesi ditutup' });
        }

        // 6. POST /api/sessions/:pin/join -> Mahasiswa bergabung ke lobi sesi
        if (req.method === 'POST' && sub === 'join') {
          parseJsonBody().then(payload => {
            let session = sessions.get(pin);
            if (!session) {
              session = {
                pin,
                mode: payload.sessionMode || 'escape_room',
                title: payload.sessionTitle || 'Sesi Kelas',
                status: 'waiting',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                players: {}
              };
              sessions.set(pin, session);
            }

            const uid = payload.sessionId || payload.uid || `player-${Date.now()}`;
            const existing = session.players[uid] || {};
            const playerData = {
              uid,
              name: payload.name || 'Mahasiswa',
              nim: payload.nim || '000000',
              characterType: payload.characterType || 'runner',
              characterColor: payload.characterColor || 'blue',
              x: existing.x ?? 60,
              y: existing.y ?? 200,
              anim: existing.anim || 'idle',
              flipX: Boolean(existing.flipX),
              score: existing.score ?? (payload.score || 0),
              checkpointIdx: existing.checkpointIdx ?? (payload.checkpointIdx || 0),
              progressIdx: existing.progressIdx ?? (payload.progressIdx || 0),
              totalQuestions: payload.totalQuestions || existing.totalQuestions || 0,
              solvedCount: existing.solvedCount ?? (payload.solvedCount || 0),
              isFinished: existing.isFinished || false,
              finishRank: existing.finishRank || null,
              finishTime: existing.finishTime || null,
              nitroUntil: existing.nitroUntil || 0,
              emote: null,
              emoteTime: 0,
              joinedAt: existing.joinedAt || Date.now(),
              lastSeen: Date.now()
            };

            session.players[uid] = playerData;
            session.updatedAt = Date.now();
            sendJson(200, { success: true, player: playerData, session });
          });
          return;
        }

        // 7. GET /api/sessions/:pin/players -> Ambil seluruh pemain di sesi
        if (req.method === 'GET' && sub === 'players') {
          const session = sessions.get(pin);
          const players = session?.players || {};
          return sendJson(200, { success: true, players, sessionStatus: session?.status || 'waiting' });
        }

        // 8. POST /api/sessions/:pin/players/:uid -> Update posisi & progres pemain
        if (req.method === 'POST' && sub === 'players' && subId) {
          parseJsonBody().then(payload => {
            const session = sessions.get(pin);
            if (session && session.players[subId]) {
              const current = session.players[subId];

              // Hitung ranking finish otomatis jika pemain baru saja menyelesaikan seluruh soal
              let finishRank = current.finishRank;
              let finishTime = current.finishTime;

              if (payload.isFinished && !current.isFinished) {
                const alreadyFinished = Object.values(session.players).filter(p => p.isFinished).length;
                finishRank = alreadyFinished + 1;
                finishTime = Date.now();
              }

              session.players[subId] = {
                ...current,
                ...payload,
                finishRank: finishRank || payload.finishRank || current.finishRank,
                finishTime: finishTime || payload.finishTime || current.finishTime,
                lastSeen: Date.now()
              };

              session.updatedAt = Date.now();
              return sendJson(200, { success: true, player: session.players[subId] });
            }
            sendJson(200, { success: false, error: 'Player tidak ditemukan' });
          });
          return;
        }

        // 9. DELETE /api/sessions/:pin/players/:uid -> Pemain keluar sesi
        if (req.method === 'DELETE' && sub === 'players' && subId) {
          const session = sessions.get(pin);
          if (session && session.players[subId]) {
            delete session.players[subId];
            session.updatedAt = Date.now();
          }
          return sendJson(200, { success: true });
        }

        next();
      });
    }
  };
}
