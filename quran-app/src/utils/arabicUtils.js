/**
 * Arabic text utilities for Quran display
 */

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
