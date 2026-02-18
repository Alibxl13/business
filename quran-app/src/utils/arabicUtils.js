/**
 * Arabic text utilities for Quran recitation comparison
 */

/**
 * Remove Arabic diacritics (tashkeel) for text comparison
 */
export function removeDiacritics(text) {
  // Arabic diacritical marks (harakat + shadda + sukun + tatweel)
  return text
    .replace(/[\u064B-\u065F]/g, '') // harakat: fatha, kasra, damma, tanwin, shadda, sukun, etc.
    .replace(/\u0640/g, '')           // tatweel (ـ)
    .trim();
}

/**
 * Normalize Arabic alef variants to bare alef
 */
export function normalizeAlef(text) {
  return text
    .replace(/[\u0622\u0623\u0625]/g, '\u0627') // آ أ إ → ا
    .replace(/\u0671/g, '\u0627');               // ٱ → ا
}

/**
 * Normalize Arabic text for comparison:
 * - Remove diacritics
 * - Normalize alef variants
 * - Normalize hamza forms
 * - Collapse whitespace
 */
export function normalizeArabic(text) {
  if (!text) return '';
  let normalized = text;
  normalized = removeDiacritics(normalized);
  normalized = normalizeAlef(normalized);
  // Normalize hamza forms
  normalized = normalized
    .replace(/[\u0624\u0626]/g, '\u0621') // ؤ ئ → ء
    .replace(/\u0629/g, '\u0647')          // ة → ه (optional, for lenient matching)
    .replace(/\s+/g, ' ')
    .trim();
  return normalized;
}

/**
 * Levenshtein distance between two strings
 */
export function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i][j - 1], dp[i - 1][j]);
      }
    }
  }
  return dp[m][n];
}

/**
 * Calculate similarity percentage between two Arabic strings
 * Returns a value between 0 and 100
 */
export function arabicSimilarity(expected, recited) {
  const a = normalizeArabic(expected);
  const b = normalizeArabic(recited);
  if (!a && !b) return 100;
  if (!a || !b) return 0;
  const maxLen = Math.max(a.length, b.length);
  const dist = levenshtein(a, b);
  return Math.max(0, Math.round((1 - dist / maxLen) * 100));
}

/**
 * Word-level comparison: returns array of { word, correct } objects
 */
export function compareWordByWord(expected, recited) {
  const expWords = normalizeArabic(expected).split(' ').filter(Boolean);
  const recWords = normalizeArabic(recited).split(' ').filter(Boolean);

  return expWords.map((expWord, i) => {
    const recWord = recWords[i] || '';
    const sim = arabicSimilarity(expWord, recWord);
    return {
      word:    expWord,
      recited: recWord,
      correct: sim >= 70,
      score:   sim,
    };
  });
}

/**
 * Get score label and color based on percentage
 */
export function getScoreInfo(score) {
  if (score >= 95) return { label: 'Excellent',    color: 'text-emerald-600', bg: 'bg-emerald-50',  ring: 'ring-emerald-500' };
  if (score >= 80) return { label: 'Très bien',    color: 'text-blue-600',    bg: 'bg-blue-50',     ring: 'ring-blue-500' };
  if (score >= 65) return { label: 'Bien',          color: 'text-amber-600',   bg: 'bg-amber-50',    ring: 'ring-amber-500' };
  if (score >= 50) return { label: 'Passable',      color: 'text-orange-600',  bg: 'bg-orange-50',   ring: 'ring-orange-500' };
  return                  { label: 'À améliorer',   color: 'text-red-600',     bg: 'bg-red-50',      ring: 'ring-red-500' };
}

/**
 * Format surah/ayah reference in Arabic numerals
 */
export function toArabicNumerals(num) {
  const arabicDigits = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  return String(num).split('').map(d => arabicDigits[parseInt(d)] || d).join('');
}

/**
 * Clean HTML tags from tafsir text
 */
export function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}
