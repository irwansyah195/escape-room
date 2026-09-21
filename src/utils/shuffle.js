/**
 * Utility untuk mengacak susunan opsi jawaban secara acak
 * sambil tetap melacak originalIndex untuk pengecekan jawaban benar.
 */
export function shuffleOptions(options, correctIndex) {
  const mapped = options.map((opt, idx) => ({
    text: opt,
    isCorrect: idx === correctIndex,
    originalIndex: idx
  }));

  // Fisher-Yates shuffle
  for (let i = mapped.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [mapped[i], mapped[j]] = [mapped[j], mapped[i]];
  }

  return mapped;
}
