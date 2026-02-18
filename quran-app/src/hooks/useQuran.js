import { useState, useEffect, useCallback } from 'react';
import {
  getAllSurahs,
  getSurahFull,
  getAyahTafsir,
} from '../api/quranApi';

/**
 * Hook for loading all surah metadata (for the list page)
 */
export function useSurahList() {
  const [surahs,  setSurahs]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    getAllSurahs()
      .then(setSurahs)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { surahs, loading, error };
}

/**
 * Hook for loading a full surah (Arabic + translation + audio)
 */
export function useSurah(surahNumber, translationEdition, reciter) {
  const [surah,   setSurah]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!surahNumber) return;
    setLoading(true);
    setError(null);
    setSurah(null);

    getSurahFull(surahNumber, translationEdition, reciter)
      .then(setSurah)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [surahNumber, translationEdition, reciter]);

  return { surah, loading, error };
}

/**
 * Hook for loading tafsir for a specific ayah
 */
export function useTafsir(surahNumber, ayahNumber, tafsirId) {
  const [tafsir,  setTafsir]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const load = useCallback(() => {
    if (!surahNumber || !ayahNumber || !tafsirId) return;
    setLoading(true);
    setError(null);
    setTafsir(null);

    getAyahTafsir(surahNumber, ayahNumber, tafsirId)
      .then(setTafsir)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [surahNumber, ayahNumber, tafsirId]);

  useEffect(() => { load(); }, [load]);

  return { tafsir, loading, error, reload: load };
}
