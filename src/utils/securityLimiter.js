/**
 * Modul Proteksi Keamanan & Rate Limiting
 * Membatasi percobaan brute-force login dosen dan mencegah spam submission hasil mahasiswa.
 */

const MAX_PIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 3 * 60 * 1000; // 3 menit (180 detik)
const STORAGE_KEY_ATTEMPTS = 'dunia_bermain_pin_attempts';
const STORAGE_KEY_LOCKOUT = 'dunia_bermain_pin_lockout';
const STORAGE_KEY_SUBMITTED_SESSIONS = 'dunia_bermain_submitted_sessions';

/**
 * Memeriksa status pembatasan (lockout) login dosen saat ini.
 * @returns {{ isLocked: boolean, remainingSeconds: number, attemptsLeft: number }}
 */
export function getPinLockoutStatus() {
  try {
    const lockoutUntil = parseInt(localStorage.getItem(STORAGE_KEY_LOCKOUT) || '0', 10);
    const now = Date.now();

    if (lockoutUntil > now) {
      const remainingSeconds = Math.ceil((lockoutUntil - now) / 1000);
      return {
        isLocked: true,
        remainingSeconds,
        attemptsLeft: 0
      };
    }

    // Jika waktu lockout sudah berlalu, bersihkan state lockout
    if (lockoutUntil !== 0) {
      localStorage.removeItem(STORAGE_KEY_LOCKOUT);
      localStorage.removeItem(STORAGE_KEY_ATTEMPTS);
    }

    const currentAttempts = parseInt(localStorage.getItem(STORAGE_KEY_ATTEMPTS) || '0', 10);
    const attemptsLeft = Math.max(0, MAX_PIN_ATTEMPTS - currentAttempts);

    return {
      isLocked: false,
      remainingSeconds: 0,
      attemptsLeft
    };
  } catch {
    return { isLocked: false, remainingSeconds: 0, attemptsLeft: MAX_PIN_ATTEMPTS };
  }
}

/**
 * Mencatat percobaan kata sandi salah.
 * Mengunci login jika batas maksimal percobaan tercapai.
 * @returns {{ isLocked: boolean, remainingSeconds: number, attemptsLeft: number }}
 */
export function recordFailedPinAttempt() {
  try {
    const current = parseInt(localStorage.getItem(STORAGE_KEY_ATTEMPTS) || '0', 10) + 1;
    localStorage.setItem(STORAGE_KEY_ATTEMPTS, current.toString());

    if (current >= MAX_PIN_ATTEMPTS) {
      const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
      localStorage.setItem(STORAGE_KEY_LOCKOUT, lockoutUntil.toString());
      return {
        isLocked: true,
        remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000),
        attemptsLeft: 0
      };
    }

    return {
      isLocked: false,
      remainingSeconds: 0,
      attemptsLeft: MAX_PIN_ATTEMPTS - current
    };
  } catch {
    return { isLocked: false, remainingSeconds: 0, attemptsLeft: 0 };
  }
}

/**
 * Mengatur ulang batas percobaan saat login berhasil.
 */
export function resetPinRateLimit() {
  try {
    localStorage.removeItem(STORAGE_KEY_ATTEMPTS);
    localStorage.removeItem(STORAGE_KEY_LOCKOUT);
  } catch (err) {
    console.error("Gagal reset rate limit:", err);
  }
}

/**
 * Memeriksa apakah token sesi pengerjaan mahasiswa sudah pernah dikirim ke database.
 * Mencegah replay attack & double-click spamming.
 */
export function isSessionAlreadySubmitted(sessionId) {
  if (!sessionId) return false;
  try {
    const submitted = JSON.parse(sessionStorage.getItem(STORAGE_KEY_SUBMITTED_SESSIONS) || '[]');
    return submitted.includes(sessionId);
  } catch {
    return false;
  }
}

/**
 * Menandai sesi pengerjaan sebagai selesai terkirim.
 */
export function markSessionSubmitted(sessionId) {
  if (!sessionId) return;
  try {
    const submitted = JSON.parse(sessionStorage.getItem(STORAGE_KEY_SUBMITTED_SESSIONS) || '[]');
    if (!submitted.includes(sessionId)) {
      submitted.push(sessionId);
      sessionStorage.setItem(STORAGE_KEY_SUBMITTED_SESSIONS, JSON.stringify(submitted));
    }
  } catch (err) {
    console.error("Gagal menyimpan tanda sesi pengerjaan:", err);
  }
}

/**
 * Validasi integritas payload data hasil mahasiswa sebelum dikirim ke Firestore.
 * @param {Object} record
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateStudentPayload(record) {
  if (!record || typeof record !== 'object') {
    return { valid: false, error: 'Format data pengerjaan tidak valid.' };
  }

  const nama = String(record.nama || record.name || '').trim();
  const nim = String(record.nim || '').trim();
  const score = Number(record.score);

  if (nama.length < 2 || nama.length > 60) {
    return { valid: false, error: 'Nama mahasiswa harus antara 2 hingga 60 karakter.' };
  }

  if (nim.length < 4 || nim.length > 30) {
    return { valid: false, error: 'NIM harus antara 4 hingga 30 karakter.' };
  }

  if (isNaN(score) || score < 0 || score > 100) {
    return { valid: false, error: 'Nilai harus berupa angka antara 0 hingga 100.' };
  }

  return { valid: true };
}
