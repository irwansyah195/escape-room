/**
 * Utilitas Kriptografi untuk Keamanan Akses Dosen
 * Menggunakan Web Cryptography API (SHA-256) dengan Salt Rahasia.
 * Password tidak pernah disimpan dalam bentuk teks polos (plaintext).
 */

const SALT = "dunia_bermain_anak_salt_2026_";

// Hash SHA-256 bawaan untuk default PIN ("dosen123")
export const DEFAULT_PIN_HASH = "305a508e6203b3b7c0a70537cb57109c24a847459d19b7591b710119d239c1b3";

/**
 * Menghasilkan hash SHA-256 satu arah (one-way hash) dari PIN + Salt.
 */
export async function hashPin(plainPin) {
  const encoder = new TextEncoder();
  const data = encoder.encode(SALT + plainPin);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Memverifikasi apakah input PIN cocok dengan hash yang tersimpan.
 */
export async function verifyPin(plainInput, storedHash) {
  const inputHash = await hashPin(plainInput);
  return inputHash === (storedHash || DEFAULT_PIN_HASH);
}
