/**
 * Quran API Service
 * Uses AlQuran Cloud API (api.alquran.cloud) + Quran.com API (api.quran.com)
 */

const ALQURAN_BASE = 'https://api.alquran.cloud/v1';
const QURANCOM_BASE = 'https://api.quran.com/api/v4';

// Simple in-memory cache to avoid redundant requests
const cache = new Map();

async function fetchWithCache(url, options = {}) {
  if (cache.has(url)) return cache.get(url);
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const data = await res.json();
  cache.set(url, data);
  return data;
}

/**
 * Get metadata for all 114 surahs
 */
export async function getAllSurahs() {
  const data = await fetchWithCache(`${ALQURAN_BASE}/surah`);
  return data.data;
}

/**
 * Get complete surah with Arabic text (Uthmani script)
 */
export async function getSurahArabic(surahNumber) {
  const data = await fetchWithCache(`${ALQURAN_BASE}/surah/${surahNumber}/quran-uthmani`);
  return data.data;
}

/**
 * Get surah translation
 * @param {number} surahNumber
 * @param {string} edition - e.g. 'en.sahih', 'fr.hamidullah', 'ar.muyassar'
 */
export async function getSurahTranslation(surahNumber, edition = 'en.sahih') {
  const data = await fetchWithCache(`${ALQURAN_BASE}/surah/${surahNumber}/${edition}`);
  return data.data;
}

/**
 * Get surah audio (returns array of ayahs with audio URLs)
 * @param {number} surahNumber
 * @param {string} reciter - e.g. 'ar.alafasy', 'ar.abdurrahmaansudais'
 */
export async function getSurahAudio(surahNumber, reciter = 'ar.alafasy') {
  const data = await fetchWithCache(`${ALQURAN_BASE}/surah/${surahNumber}/${reciter}`);
  return data.data;
}

/**
 * Get a combined surah object with Arabic + translation + audio in one pass
 */
export async function getSurahFull(surahNumber, translationEdition = 'en.sahih', reciter = 'ar.alafasy') {
  const [arabicData, translationData, audioData] = await Promise.all([
    getSurahArabic(surahNumber),
    getSurahTranslation(surahNumber, translationEdition),
    getSurahAudio(surahNumber, reciter),
  ]);

  // Merge into unified ayah objects
  const ayahs = arabicData.ayahs.map((ayah, idx) => ({
    number:      ayah.number,
    numberInSurah: ayah.numberInSurah,
    arabic:      ayah.text,
    translation: translationData.ayahs[idx]?.text || '',
    audioUrl:    audioData.ayahs[idx]?.audio || null,
    juz:         ayah.juz,
    page:        ayah.page,
    sajda:       ayah.sajda,
  }));

  return {
    number:           arabicData.number,
    name:             arabicData.name,
    englishName:      arabicData.englishName,
    englishNameTranslation: arabicData.englishNameTranslation,
    revelationType:   arabicData.revelationType,
    numberOfAyahs:    arabicData.numberOfAyahs,
    ayahs,
  };
}

/**
 * Get tafsir for a specific ayah using Quran.com API
 * Tafsir IDs: 169 = Ibn Kathir (English), 93 = al-Jalalayn (English)
 */
export async function getAyahTafsir(surahNumber, ayahNumber, tafsirId = 169) {
  const verseKey = `${surahNumber}:${ayahNumber}`;
  try {
    const data = await fetchWithCache(
      `${QURANCOM_BASE}/tafsirs/${tafsirId}/by_ayah/${verseKey}`
    );
    return data.tafsir || null;
  } catch {
    // Fallback: try fetching verse with tafsir fields
    try {
      const data = await fetchWithCache(
        `${QURANCOM_BASE}/verses/by_key/${verseKey}?tafsirs=${tafsirId}&fields=text_uthmani`
      );
      const verse = data.verse;
      if (verse?.tafsirs?.[0]) return { text: verse.tafsirs[0].text };
      return null;
    } catch {
      return null;
    }
  }
}

/**
 * Get list of available tafsirs from Quran.com
 */
export async function getAvailableTafsirs() {
  try {
    const data = await fetchWithCache(`${QURANCOM_BASE}/resources/tafsirs?language=en`);
    return data.tafsirs || [];
  } catch {
    return [
      { id: 169, name: 'Ibn Kathir', language_name: 'english' },
      { id: 93,  name: 'Al-Jalalayn', language_name: 'english' },
    ];
  }
}

/**
 * Available translation editions
 */
export const TRANSLATION_EDITIONS = [
  { id: 'en.sahih',        label: 'English – Saheeh International' },
  { id: 'en.asad',         label: 'English – Muhammad Asad' },
  { id: 'en.pickthall',    label: 'English – Pickthall' },
  { id: 'fr.hamidullah',   label: 'Français – Hamidullah' },
  { id: 'fr.montada',      label: 'Français – Montada' },
  { id: 'ar.muyassar',     label: 'العربية – تفسير ميسر' },
];

/**
 * Available reciters
 */
export const RECITERS = [
  { id: 'ar.alafasy',              label: 'Mishary Al-Afasy' },
  { id: 'ar.abdurrahmaansudais',   label: 'Abdurrahman Al-Sudais' },
  { id: 'ar.husary',               label: 'Mahmoud Al-Husary' },
  { id: 'ar.minshawi',             label: 'Mohamed Siddiq Al-Minshawi' },
];

/**
 * Available tafsirs
 */
export const TAFSIR_OPTIONS = [
  { id: 169, label: 'Ibn Kathir (English)' },
  { id: 93,  label: 'Al-Jalalayn (English)' },
];
