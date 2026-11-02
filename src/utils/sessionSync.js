/**
 * sessionSync.js
 * Sinkronisasi sesi kelas multiplayer dan pergerakan avatar real-time
 * Menggunakan LocalStorage + BroadcastChannel (instan 0ms) dengan fallback RTDB bertimeout ketat.
 */

import {
  ref,
  set,
  get,
  update,
  onValue,
  off,
  onDisconnect,
  remove
} from 'firebase/database';
import { rtdb } from '../firebase/config.js';
import { supabase, isSupabaseConfigured } from '../supabase/client.js';

const LOCAL_SESSION_KEY = 'dunia_bermain_active_session_dosen';

// Supabase Realtime Channels cache
const supabaseChannels = new Map();

function getSupabaseChannel(pin) {
  if (!isSupabaseConfigured || !supabase || !pin) return null;
  if (!supabaseChannels.has(pin)) {
    const channel = supabase.channel(`game_session_${pin}`, {
      config: { broadcast: { self: false } }
    });
    supabaseChannels.set(pin, channel);
  }
  return supabaseChannels.get(pin);
}

// Helper timeout agar panggilan jaringan ke RTDB tidak pernah menggantung (hang)
function withTimeout(promise, ms = 600) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('RTDB connection timeout')), ms))
  ]);
}

let isRtdbFailing = false;

// BroadcastChannel untuk komunikasi real-time antar-tab/window di browser yang sama
const localBus = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('dunia_bermain_metaverse_bus')
  : null;

// Local in-memory cache
const localSessionsMap = new Map();
const localPlayersMap = new Map();

/**
 * Helper untuk memuat dan menyimpan data pemain ke localStorage
 */
function getPlayersStorageKey(pin) {
  return `dunia_bermain_session_players_${pin}`;
}

function loadPlayersFromStorage(pin) {
  if (typeof localStorage === 'undefined' || !pin) return new Map();
  try {
    const raw = localStorage.getItem(getPlayersStorageKey(pin));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const map = new Map();
        Object.entries(parsed).forEach(([uid, data]) => {
          map.set(uid, data);
        });
        return map;
      }
    }
  } catch (e) {
    console.warn("Gagal membaca players dari storage:", e);
  }
  return new Map();
}

function savePlayersToStorage(pin, playersMap) {
  if (typeof localStorage === 'undefined' || !pin || !playersMap) return;
  try {
    const obj = {};
    playersMap.forEach((data, uid) => {
      obj[uid] = data;
    });
    localStorage.setItem(getPlayersStorageKey(pin), JSON.stringify(obj));
  } catch (e) {
    console.warn("Gagal menyimpan players ke storage:", e);
  }
}

// Muat sesi tersimpan dari localStorage saat startup
if (typeof localStorage !== 'undefined') {
  try {
    const saved = localStorage.getItem(LOCAL_SESSION_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.pin) {
        localSessionsMap.set(parsed.pin, parsed);
        const savedPlayers = loadPlayersFromStorage(parsed.pin);
        localPlayersMap.set(parsed.pin, savedPlayers);
      }
    }
  } catch (e) {
    // Ignore storage parse error
  }
}

if (localBus) {
  localBus.onmessage = (event) => {
    const { type, payload } = event.data || {};
    if (type === 'SESSION_CREATED') {
      const session = payload;
      if (session?.pin) {
        localSessionsMap.set(session.pin, session);
      }
    } else if (type === 'SESSION_STARTING') {
      const { pin, countdownStart } = payload || {};
      const s = localSessionsMap.get(pin);
      if (s) {
        s.status = 'starting';
        s.countdownStart = countdownStart || Date.now();
      }
    } else if (type === 'SESSION_IN_PROGRESS') {
      const { pin } = payload || {};
      const s = localSessionsMap.get(pin);
      if (s) {
        s.status = 'in_progress';
      }
    } else if (type === 'SESSION_FINISHED') {
      const { pin } = payload || {};
      const s = localSessionsMap.get(pin);
      if (s) {
        s.status = 'finished';
      }
    } else if (type === 'SESSION_CLOSED') {
      const { pin } = payload;
      if (pin) {
        localSessionsMap.delete(pin);
        localPlayersMap.delete(pin);
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(getPlayersStorageKey(pin));
        }
      }
    } else if (type === 'PLAYER_UPDATE') {
      const { pin, uid, data } = payload;
      let sessionPlayers = localPlayersMap.get(pin);
      if (!sessionPlayers) {
        sessionPlayers = loadPlayersFromStorage(pin);
        localPlayersMap.set(pin, sessionPlayers);
      }
      const existing = sessionPlayers.get(uid) || {};
      const updated = { ...existing, ...data, lastSeen: Date.now() };
      sessionPlayers.set(uid, updated);
      savePlayersToStorage(pin, sessionPlayers);
    } else if (type === 'PLAYER_LEAVE') {
      const { pin, uid } = payload;
      let sessionPlayers = localPlayersMap.get(pin);
      if (!sessionPlayers) {
        sessionPlayers = loadPlayersFromStorage(pin);
        localPlayersMap.set(pin, sessionPlayers);
      }
      if (sessionPlayers) {
        sessionPlayers.delete(uid);
        savePlayersToStorage(pin, sessionPlayers);
      }
    }
  };
}

/**
 * Menghasilkan PIN 6 digit unik
 */
export function generateSessionPin() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Menyimpan data sesi ke localStorage
 */
function saveSessionToStorage(pin, sessionData) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(`dunia_bermain_session_${pin}`, JSON.stringify(sessionData));
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(sessionData));
  } catch (e) {
    console.warn("Gagal menyimpan sesi ke localStorage:", e);
  }
}

/**
 * Mengambil data sesi dari localStorage
 */
function getSessionFromStorage(pin) {
  if (typeof localStorage === 'undefined') return null;
  try {
    const byPin = localStorage.getItem(`dunia_bermain_session_${pin}`);
    if (byPin) return JSON.parse(byPin);

    const active = localStorage.getItem(LOCAL_SESSION_KEY);
    if (active) {
      const parsed = JSON.parse(active);
      if (parsed?.pin === pin) return parsed;
    }
  } catch (e) {
    return null;
  }
  return null;
}

// Helper untuk memanggil API server internal (Vite Dev Server Plugin)
async function apiFetch(endpoint, options = {}) {
  try {
    const res = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Dosen: Membuat sesi kelas multiplayer baru
 */
export async function createClassSession({ pin, mode = 'escape_room', title = 'Sesi Kelas Bermain Anak', raceQuestions = null, timePerQuestion = 30 }) {
  const sessionData = {
    pin,
    mode,
    title,
    timePerQuestion,
    raceQuestions,
    status: 'waiting', // Mulai di ruang tunggu (Lobby)
    createdAt: Date.now(),
    updatedAt: Date.now(),
    countdownStart: null,
    startedAt: null,
    finishedAt: null
  };

  // Simpan secara instan ke memori dan localStorage
  localSessionsMap.set(pin, sessionData);
  saveSessionToStorage(pin, sessionData);

  // Broadcast ke seluruh tab browser aktif
  if (localBus) {
    localBus.postMessage({
      type: 'SESSION_CREATED',
      payload: sessionData
    });
  }

  // Sinkronisasi ke Supabase (Sumber Utama Cloud Multi-Device & Multi-Browser)
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('class_sessions').upsert({
        pin,
        mode,
        title,
        status: 'waiting',
        race_questions: raceQuestions,
        countdown_start: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn("Gagal menyimpan sesi ke Supabase:", err.message);
    }
  }

  // Sinkronisasi ke server API (agar Incognito, browser lain, & perangkat LAN terhubung langsung)
  apiFetch('/api/sessions', {
    method: 'POST',
    body: JSON.stringify(sessionData)
  }).catch(() => {});

  // Sinkronisasi ke RTDB di latar belakang jika tersedia
  if (rtdb && !isRtdbFailing) {
    try {
      const sessionRef = ref(rtdb, `sessions/${pin}`);
      await withTimeout(set(sessionRef, sessionData), 800);
    } catch (err) {
      console.warn("RTDB tidak merespons, beralih ke mode sinkronisasi lokal cepat:", err.message);
      isRtdbFailing = true;
    }
  }

  return sessionData;
}

/**
 * Dosen: Memulai sesi kelas secara serentak (Countdown 3-2-1 GO!)
 */
export async function startClassSession(pin) {
  const session = localSessionsMap.get(pin) || getSessionFromStorage(pin);
  const countdownStart = Date.now();
  const updatedData = {
    ...(session || {}),
    pin,
    status: 'starting',
    countdownStart,
    updatedAt: Date.now()
  };

  localSessionsMap.set(pin, updatedData);
  saveSessionToStorage(pin, updatedData);

  if (localBus) {
    localBus.postMessage({
      type: 'SESSION_STARTING',
      payload: { pin, countdownStart }
    });
  }

  // Sinkronisasi ke Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('class_sessions').update({
        status: 'starting',
        countdown_start: countdownStart,
        updated_at: new Date().toISOString()
      }).eq('pin', pin);
    } catch (err) {}
  }

  const sbChannel = getSupabaseChannel(pin);
  if (sbChannel) {
    sbChannel.send({
      type: 'broadcast',
      event: 'SESSION_STATUS',
      payload: { pin, session: updatedData }
    }).catch(() => {});
  }

  apiFetch(`/api/sessions/${pin}/start`, { method: 'POST' }).catch(() => {});

  // Auto transisi ke in_progress setelah 3.5 detik di sisi lokal & Supabase
  setTimeout(async () => {
    const s = localSessionsMap.get(pin);
    if (s && s.status === 'starting') {
      s.status = 'in_progress';
      s.startedAt = Date.now();
      saveSessionToStorage(pin, s);
      if (localBus) {
        localBus.postMessage({ type: 'SESSION_IN_PROGRESS', payload: { pin } });
      }
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('class_sessions').update({
            status: 'in_progress',
            started_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }).eq('pin', pin);
        } catch (err) {}
      }
    }
  }, 3500);

  return updatedData;
}

/**
 * Dosen: Menyelesaikan sesi kelas & menampilkan podium
 */
export async function finishClassSession(pin) {
  const session = localSessionsMap.get(pin) || getSessionFromStorage(pin);
  const updatedData = {
    ...(session || {}),
    pin,
    status: 'finished',
    finishedAt: Date.now(),
    updatedAt: Date.now()
  };

  localSessionsMap.set(pin, updatedData);
  saveSessionToStorage(pin, updatedData);

  if (localBus) {
    localBus.postMessage({
      type: 'SESSION_FINISHED',
      payload: { pin }
    });
  }

  // Sinkronisasi ke Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('class_sessions').update({
        status: 'finished',
        finished_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }).eq('pin', pin);
    } catch (err) {}
  }

  apiFetch(`/api/sessions/${pin}/finish`, { method: 'POST' }).catch(() => {});

  return updatedData;
}

/**
 * Dosen: Menutup sesi kelas
 */
export async function closeClassSession(pin) {
  localSessionsMap.delete(pin);
  localPlayersMap.delete(pin);

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(`dunia_bermain_session_${pin}`);
      localStorage.removeItem(LOCAL_SESSION_KEY);
      localStorage.removeItem(getPlayersStorageKey(pin));
    } catch (e) {}
  }

  if (localBus) {
    localBus.postMessage({
      type: 'SESSION_CLOSED',
      payload: { pin }
    });
  }

  // Sinkronisasi ke Supabase: update status ke closed & hapus session_players
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('class_sessions').update({
        status: 'closed',
        updated_at: new Date().toISOString()
      }).eq('pin', pin);
      await supabase.from('session_players').delete().eq('session_pin', pin);
    } catch (err) {}
  }

  apiFetch(`/api/sessions/${pin}`, { method: 'DELETE' }).catch(() => {});

  if (rtdb && !isRtdbFailing) {
    try {
      const sessionRef = ref(rtdb, `sessions/${pin}`);
      withTimeout(update(sessionRef, { status: 'closed', closedAt: Date.now() }), 800).catch(() => {});
    } catch {}
  }
}

/**
 * Mengambil data sesi kelas aktif yang tersimpan
 */
export function getSavedClassSession() {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Mahasiswa: Mengecek ketersediaan dan status sesi kelas berdasarkan PIN
 * Mendukung status 'waiting' (ruang tunggu), 'starting', 'in_progress', dan 'active'
 */
export async function verifyClassSession(pin) {
  const cleanPin = (pin || '').trim();
  if (!cleanPin) return null;

  const isValidStatus = (st) => ['waiting', 'starting', 'in_progress', 'active'].includes(st);

  // 1. Cek di Supabase lebih dulu (sumber kebenaran cloud multi-perangkat / incognito)
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('class_sessions')
        .select('*')
        .eq('pin', cleanPin)
        .maybeSingle();

      if (data && isValidStatus(data.status)) {
        const sObj = {
          pin: data.pin,
          mode: data.mode,
          title: data.title,
          status: data.status,
          raceQuestions: data.race_questions,
          countdownStart: data.countdown_start
        };
        localSessionsMap.set(cleanPin, sObj);
        saveSessionToStorage(cleanPin, sObj);
        return sObj;
      }
    } catch (err) {
      console.warn("Gagal verifikasi PIN via Supabase:", err.message);
    }
  }

  // 2. Cek di memori lokal (respons seketika 0ms jika di browser yang sama)
  if (localSessionsMap.has(cleanPin)) {
    const s = localSessionsMap.get(cleanPin);
    if (isValidStatus(s?.status)) return s;
  }

  // 3. Cek di localStorage
  const fromStorage = getSessionFromStorage(cleanPin);
  if (fromStorage && isValidStatus(fromStorage.status)) {
    localSessionsMap.set(cleanPin, fromStorage);
    return fromStorage;
  }

  // 4. Cek ke Server API Internal (Krusial untuk Incognito, beda browser, & perangkat LAN)
  try {
    const apiRes = await apiFetch(`/api/sessions/${cleanPin}`);
    if (apiRes?.success && apiRes?.session && isValidStatus(apiRes.session.status)) {
      localSessionsMap.set(cleanPin, apiRes.session);
      saveSessionToStorage(cleanPin, apiRes.session);
      return apiRes.session;
    }
  } catch {}

  // 5. Cek ke RTDB jika belum ada di lokal
  if (rtdb && !isRtdbFailing) {
    try {
      const sessionRef = ref(rtdb, `sessions/${cleanPin}`);
      const snap = await withTimeout(get(sessionRef), 800);
      if (snap && snap.exists()) {
        const data = snap.val ? snap.val() : (snap.data ? snap.data() : null);
        if (data && isValidStatus(data.status)) {
          localSessionsMap.set(cleanPin, data);
          saveSessionToStorage(cleanPin, data);
          return data;
        }
      }
    } catch (err) {
      console.warn("RTDB timeout saat verifikasi PIN, fallback ke lokal:", err.message);
      isRtdbFailing = true;
    }
  }

  return null;
}

/**
 * Mahasiswa: Masuk ke sesi kelas (Join Game)
 */
export async function joinClassSession(pin, student) {
  const playerUid = student.sessionId || student.uid || `player-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  // Simpan ke local map & persistensi localStorage
  let sessionPlayers = localPlayersMap.get(pin);
  if (!sessionPlayers) {
    sessionPlayers = loadPlayersFromStorage(pin);
    localPlayersMap.set(pin, sessionPlayers);
  }

  // Jika pemain sudah ada sebelumnya (misal refresh halaman), pertahankan progresnya
  const existingPlayer = sessionPlayers.get(playerUid);
  const now = Date.now();
  const playerData = {
    uid: playerUid,
    name: student.name || 'Mahasiswa',
    nim: student.nim || '000000',
    characterType: student.characterType || 'runner',
    characterColor: student.characterColor || 'blue',
    x: existingPlayer?.x ?? 200,
    y: existingPlayer?.y ?? 200,
    anim: existingPlayer?.anim || 'idle',
    flipX: Boolean(existingPlayer?.flipX),
    score: existingPlayer?.score ?? (student.score || 0),
    checkpointIdx: existingPlayer?.checkpointIdx ?? (student.checkpointIdx || 0),
    solvedCount: existingPlayer?.solvedCount ?? (student.solvedCount || 0),
    nitroUntil: existingPlayer?.nitroUntil || 0,
    emote: null,
    emoteTime: 0,
    joinedAt: existingPlayer?.joinedAt || now,
    lastSeen: now
  };

  sessionPlayers.set(playerUid, playerData);
  savePlayersToStorage(pin, sessionPlayers);

  if (localBus) {
    localBus.postMessage({
      type: 'PLAYER_UPDATE',
      payload: { pin, uid: playerUid, data: playerData }
    });
  }

  // Simpan ke Supabase (Cloud Database)
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('session_players').upsert({
        id: `${pin}_${playerUid}`,
        session_pin: pin,
        uid: playerUid,
        name: playerData.name,
        nim: playerData.nim,
        character_type: playerData.characterType,
        character_color: playerData.characterColor,
        score: playerData.score,
        solved_count: playerData.solvedCount,
        progress_idx: playerData.checkpointIdx,
        total_questions: student.totalQuestions || 5,
        last_seen: now,
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn("Gagal simpan player ke Supabase:", err.message);
    }
  }

  // Sync ke server API internal
  apiFetch(`/api/sessions/${pin}/join`, {
    method: 'POST',
    body: JSON.stringify({
      ...playerData,
      sessionMode: student.sessionMode,
      sessionTitle: student.sessionTitle
    })
  }).catch(() => {});

  if (rtdb && !isRtdbFailing) {
    try {
      const playerRef = ref(rtdb, `sessions/${pin}/players/${playerUid}`);
      withTimeout(set(playerRef, playerData), 800).catch(() => {});
      const disconnectRef = onDisconnect(playerRef);
      disconnectRef.remove();
    } catch {}
  }

  return { playerUid, playerData };
}

/**
 * Mengirim pembaruan posisi avatar secara throttled
 */
let lastSendTime = 0;
const SEND_INTERVAL_MS = 60;

export function updatePlayerPosition(pin, uid, data) {
  const now = Date.now();
  if (now - lastSendTime < SEND_INTERVAL_MS) return;
  lastSendTime = now;

  let sessionPlayers = localPlayersMap.get(pin);
  if (!sessionPlayers) {
    sessionPlayers = loadPlayersFromStorage(pin);
    localPlayersMap.set(pin, sessionPlayers);
  }

  if (sessionPlayers) {
    const existing = sessionPlayers.get(uid);
    if (existing) {
      sessionPlayers.set(uid, { ...existing, ...data, lastSeen: now });
    }
  }

  if (localBus) {
    localBus.postMessage({
      type: 'PLAYER_UPDATE',
      payload: { pin, uid, data }
    });
  }

  // Kirim ke server API secara throttled
  apiFetch(`/api/sessions/${pin}/players/${uid}`, {
    method: 'POST',
    body: JSON.stringify({
      x: Math.round(data.x),
      y: Math.round(data.y),
      anim: data.anim || 'idle',
      flipX: Boolean(data.flipX)
    })
  }).catch(() => {});

  if (rtdb && !isRtdbFailing) {
    try {
      const playerRef = ref(rtdb, `sessions/${pin}/players/${uid}`);
      update(playerRef, {
        x: Math.round(data.x),
        y: Math.round(data.y),
        anim: data.anim || 'idle',
        flipX: Boolean(data.flipX),
        lastSeen: now
      });
    } catch {}
  }
}

/**
 * Mengirim emote/reaksi singkat di atas kepala avatar
 */
export async function triggerPlayerEmote(pin, uid, emoji) {
  const updateData = {
    emote: emoji,
    emoteTime: Date.now()
  };

  let sessionPlayers = localPlayersMap.get(pin);
  if (!sessionPlayers) {
    sessionPlayers = loadPlayersFromStorage(pin);
    localPlayersMap.set(pin, sessionPlayers);
  }

  if (sessionPlayers && sessionPlayers.has(uid)) {
    sessionPlayers.set(uid, { ...sessionPlayers.get(uid), ...updateData });
  }

  if (localBus) {
    localBus.postMessage({
      type: 'PLAYER_UPDATE',
      payload: { pin, uid, data: updateData }
    });
  }

  apiFetch(`/api/sessions/${pin}/players/${uid}`, {
    method: 'POST',
    body: JSON.stringify(updateData)
  }).catch(() => {});

  if (rtdb && !isRtdbFailing) {
    try {
      const playerRef = ref(rtdb, `sessions/${pin}/players/${uid}`);
      update(playerRef, updateData);
    } catch {}
  }
}

/**
 * Memperbarui progres permainan & Heartbeat aktif
 */
export async function updatePlayerProgress(pin, uid, progress) {
  const now = Date.now();
  let sessionPlayers = localPlayersMap.get(pin);
  if (!sessionPlayers) {
    sessionPlayers = loadPlayersFromStorage(pin);
    localPlayersMap.set(pin, sessionPlayers);
  }

  if (sessionPlayers && sessionPlayers.has(uid)) {
    const updated = { ...sessionPlayers.get(uid), ...progress, lastSeen: now };
    sessionPlayers.set(uid, updated);
    savePlayersToStorage(pin, sessionPlayers);
  }

  if (localBus) {
    localBus.postMessage({
      type: 'PLAYER_UPDATE',
      payload: { pin, uid, data: { ...progress, lastSeen: now } }
    });
  }

  // Update ke Supabase
  if (isSupabaseConfigured && supabase && pin && uid) {
    try {
      const sbData = {
        last_seen: now,
        updated_at: new Date().toISOString()
      };
      if (progress.score !== undefined) sbData.score = progress.score;
      if (progress.solvedCount !== undefined) sbData.solved_count = progress.solvedCount;
      if (progress.checkpointIdx !== undefined) sbData.progress_idx = progress.checkpointIdx;
      if (progress.characterType !== undefined) sbData.character_type = progress.characterType;
      if (progress.characterColor !== undefined) sbData.character_color = progress.characterColor;
      if (progress.isFinished !== undefined) sbData.is_finished = progress.isFinished;
      if (progress.finishRank !== undefined) sbData.finish_rank = progress.finishRank;

      await supabase.from('session_players').update(sbData).eq('id', `${pin}_${uid}`);
    } catch (err) {}
  }

  const sbChannel = getSupabaseChannel(pin);
  if (sbChannel) {
    sbChannel.send({
      type: 'broadcast',
      event: 'PLAYER_UPDATE',
      payload: { pin, uid, data: progress }
    }).catch(() => {});
  }

  apiFetch(`/api/sessions/${pin}/players/${uid}`, {
    method: 'POST',
    body: JSON.stringify(progress)
  }).catch(() => {});

  if (rtdb && !isRtdbFailing) {
    try {
      const playerRef = ref(rtdb, `sessions/${pin}/players/${uid}`);
      update(playerRef, { ...progress, lastSeen: now });
    } catch {}
  }
}

/**
 * Mahasiswa/Dosen: Berlangganan data seluruh pemain di dalam sesi kelas
 */
export function subscribeToSessionPlayers(pin, callback) {
  if (!pin) return () => {};

  if (!localPlayersMap.has(pin)) {
    localPlayersMap.set(pin, loadPlayersFromStorage(pin));
  }

  const STALE_TIMEOUT_MS = 60000; // Toleransi 60 detik (kebal lag jaringan dan jeda membaca soal)

  // Panggil callback segera dengan pemain lokal yang masih fresh
  const deliverLocalPlayers = () => {
    let sessionPlayers = localPlayersMap.get(pin);
    const stored = loadPlayersFromStorage(pin);
    const now = Date.now();

    if (stored.size > 0) {
      if (!sessionPlayers) {
        sessionPlayers = stored;
        localPlayersMap.set(pin, sessionPlayers);
      } else {
        stored.forEach((val, key) => {
          const current = sessionPlayers.get(key);
          if (!current || (val.lastSeen || 0) >= (current.lastSeen || 0)) {
            sessionPlayers.set(key, val);
          }
        });
      }
    }

    // Tarik pembaruan pemain dari Supabase (Cloud Database)
    if (isSupabaseConfigured && supabase) {
      supabase
        .from('session_players')
        .select('*')
        .eq('session_pin', pin)
        .then(({ data, error }) => {
          if (!error && Array.isArray(data)) {
            let changed = false;
            data.forEach(row => {
              const rowLastSeen = Number(row.last_seen || 0);
              // Hanya terima pemain yang aktif dalam 60 detik terakhir
              if (!rowLastSeen || (now - rowLastSeen <= STALE_TIMEOUT_MS)) {
                const existing = sessionPlayers?.get(row.uid);
                if (!existing || rowLastSeen >= (existing.lastSeen || 0)) {
                  sessionPlayers?.set(row.uid, {
                    uid: row.uid,
                    name: row.name,
                    nim: row.nim,
                    characterType: row.character_type,
                    characterColor: row.character_color,
                    score: row.score,
                    solvedCount: row.solved_count,
                    progressIdx: row.progress_idx,
                    totalQuestions: row.total_questions,
                    isFinished: row.is_finished,
                    finishRank: row.finish_rank,
                    lastSeen: rowLastSeen || now
                  });
                  changed = true;
                }
              }
            });
            if (changed && sessionPlayers) {
              savePlayersToStorage(pin, sessionPlayers);
            }
          }
        }).catch(() => {});
    }

    // Tarik pembaruan pemain dari Server API internal
    apiFetch(`/api/sessions/${pin}/players`).then(res => {
      if (res?.players && typeof res.players === 'object') {
        let changed = false;
        Object.entries(res.players).forEach(([k, p]) => {
          if (!p.lastSeen || (now - p.lastSeen <= STALE_TIMEOUT_MS)) {
            const current = sessionPlayers?.get(k);
            if (!current || (p.lastSeen || 0) >= (current.lastSeen || 0)) {
              sessionPlayers?.set(k, p);
              changed = true;
            }
          }
        });
        if (changed && sessionPlayers) {
          savePlayersToStorage(pin, sessionPlayers);
        }
      }
    }).catch(() => {});

    const obj = {};
    if (sessionPlayers) {
      sessionPlayers.forEach((p, k) => {
        if (!p.lastSeen || (now - p.lastSeen <= STALE_TIMEOUT_MS)) {
          obj[k] = p;
        }
      });
    }
    callback(obj);
  };

  deliverLocalPlayers();

  let rtdbListener = null;
  if (rtdb && !isRtdbFailing) {
    try {
      const playersRef = ref(rtdb, `sessions/${pin}/players`);
      rtdbListener = onValue(playersRef, (snapshot) => {
        const val = snapshot.val();
        if (val) {
          callback(val);
        } else {
          deliverLocalPlayers();
        }
      });
    } catch {}
  }

  // Interval polling lokal & Supabase setiap 1 detik
  const localInterval = setInterval(deliverLocalPlayers, 1000);

  return () => {
    clearInterval(localInterval);
    if (rtdb && rtdbListener) {
      try {
        const playersRef = ref(rtdb, `sessions/${pin}/players`);
        off(playersRef);
      } catch {}
    }
  };
}

/**
 * Mahasiswa/Dosen: Berlangganan status sesi kelas (waiting -> starting -> in_progress -> finished)
 */
export function subscribeToSessionStatus(pin, callback) {
  if (!pin) return () => {};

  let currentStatus = null;

  const checkStatus = () => {
    // 1. Cek dari memori lokal
    const session = localSessionsMap.get(pin) || getSessionFromStorage(pin);
    if (session) {
      if (session.status !== currentStatus || session.status === 'starting') {
        currentStatus = session.status;
        callback(session);
      }
    }

    // 2. Cek dari Supabase Cloud
    if (isSupabaseConfigured && supabase) {
      supabase
        .from('class_sessions')
        .select('*')
        .eq('pin', pin)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            const sObj = {
              pin: data.pin,
              mode: data.mode,
              title: data.title,
              status: data.status,
              raceQuestions: data.race_questions,
              countdownStart: data.countdown_start
            };
            localSessionsMap.set(pin, sObj);
            saveSessionToStorage(pin, sObj);
            if (sObj.status !== currentStatus || sObj.status === 'starting') {
              currentStatus = sObj.status;
              callback(sObj);
            }
          }
        }).catch(() => {});
    }

    // 3. Cek dari API internal
    apiFetch(`/api/sessions/${pin}`).then(res => {
      if (res?.session) {
        localSessionsMap.set(pin, res.session);
        saveSessionToStorage(pin, res.session);
        if (res.session.status !== currentStatus || res.session.status === 'starting') {
          currentStatus = res.session.status;
          callback(res.session);
        }
      }
    }).catch(() => {});
  };

  checkStatus();
  const interval = setInterval(checkStatus, 800);

  const sbChannel = getSupabaseChannel(pin);
  if (sbChannel) {
    sbChannel.on('broadcast', { event: 'SESSION_STATUS' }, ({ payload }) => {
      if (payload?.pin === pin && payload.session) {
        localSessionsMap.set(pin, payload.session);
        saveSessionToStorage(pin, payload.session);
        currentStatus = payload.session.status;
        callback(payload.session);
      }
    }).subscribe();
  }

  return () => {
    clearInterval(interval);
  };
}

/**
 * Keluar dari sesi kelas (Saat mahasiswa menutup browser, logout, atau meninggalkan lobi)
 */
export async function leaveClassSession(pin, uid) {
  if (!pin || !uid) return;

  let sessionPlayers = localPlayersMap.get(pin);
  if (!sessionPlayers) {
    sessionPlayers = loadPlayersFromStorage(pin);
    localPlayersMap.set(pin, sessionPlayers);
  }

  if (sessionPlayers) {
    sessionPlayers.delete(uid);
    savePlayersToStorage(pin, sessionPlayers);
  }

  if (localBus) {
    localBus.postMessage({
      type: 'PLAYER_LEAVE',
      payload: { pin, uid }
    });
  }

  // Hapus dari Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('session_players').delete().eq('id', `${pin}_${uid}`);
    } catch (err) {}
  }

  apiFetch(`/api/sessions/${pin}/players/${uid}`, { method: 'DELETE' }).catch(() => {});

  if (rtdb && uid && !isRtdbFailing) {
    try {
      const playerRef = ref(rtdb, `sessions/${pin}/players/${uid}`);
      remove(playerRef);
    } catch {}
  }
}

/**
 * Dosen: Menendang / Mengeluarkan mahasiswa secara manual dari sesi
 */
export async function kickPlayer(pin, uid) {
  return leaveClassSession(pin, uid);
}
