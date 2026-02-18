import { useState, useRef, useCallback } from 'react';
import {
  ArrowLeft, Settings, BookOpen, Mic, ChevronUp,
  Loader2, AlertTriangle, X, Volume2, Globe
} from 'lucide-react';
import { useSurah } from '../hooks/useQuran';
import { TRANSLATION_EDITIONS, RECITERS, TAFSIR_OPTIONS } from '../api/quranApi';
import AyahCard from './AyahCard';
import TafsirPanel from './TafsirPanel';
import RecitationDetector from './RecitationDetector';

const FONT_SIZES = ['sm', 'md', 'lg', 'xl'];
const FONT_SIZE_LABELS = { sm: 'S', md: 'M', lg: 'L', xl: 'XL' };

export default function SurahReader({ surahNumber, onBack }) {
  const [translationEdition, setTranslationEdition] = useState('en.sahih');
  const [reciter,            setReciter]            = useState('ar.alafasy');
  const [fontSize,           setFontSize]           = useState('md');
  const [showTranslation,    setShowTranslation]    = useState(true);
  const [showSettings,       setShowSettings]       = useState(false);
  const [activeAyah,         setActiveAyah]         = useState(null);
  const [tafsirOpen,         setTafsirOpen]         = useState(false);
  const [tafsirId,           setTafsirId]           = useState(169);
  const [practiceAyah,       setPracticeAyah]       = useState(null);

  const { surah, loading, error } = useSurah(surahNumber, translationEdition, reciter);

  const scrollTopRef = useRef(null);

  const handleOpenTafsir = useCallback((ayah) => {
    setActiveAyah(ayah);
    setTafsirOpen(true);
  }, []);

  const handlePractice = useCallback((ayah) => {
    setPracticeAyah(ayah);
  }, []);

  const scrollToTop = () => {
    scrollTopRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={40} className="text-islamic-green animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">Chargement de la sourate...</p>
      </div>
    );
  }

  /* ---- Error ---- */
  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-20 text-center px-4">
        <AlertTriangle size={40} className="mx-auto text-amber-500 mb-3" />
        <div className="text-red-500 text-lg mb-2">Erreur de chargement</div>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{error}</p>
        <button onClick={onBack} className="btn-secondary mt-4 flex items-center gap-2 mx-auto">
          <ArrowLeft size={14} /> Retour
        </button>
      </div>
    );
  }

  if (!surah) return null;

  const isMakki = surah.revelationType === 'Meccan';

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-fade-in" ref={scrollTopRef}>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="btn-secondary flex items-center gap-2 text-sm">
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Retour</span>
        </button>

        <div className="text-center">
          <div className="font-arabic text-2xl text-islamic-green dark:text-emerald-400">
            {surah.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {surah.englishName} · {surah.numberOfAyahs} versets
          </div>
        </div>

        <button
          onClick={() => setShowSettings(s => !s)}
          className={`p-2 rounded-lg transition-colors ${
            showSettings
              ? 'bg-islamic-green text-white'
              : 'btn-secondary'
          }`}
          aria-label="Paramètres"
        >
          <Settings size={16} />
        </button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="card p-4 mb-5 animate-fade-in space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Paramètres</h3>
            <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Translation */}
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                <Globe size={11} /> Traduction
              </label>
              <select
                value={translationEdition}
                onChange={e => setTranslationEdition(e.target.value)}
                className="w-full text-xs rounded-md border border-gray-200 dark:border-gray-600
                           bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200
                           py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-islamic-green"
              >
                {TRANSLATION_EDITIONS.map(e => (
                  <option key={e.id} value={e.id}>{e.label}</option>
                ))}
              </select>
            </div>

            {/* Reciter */}
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                <Volume2 size={11} /> Récitateur
              </label>
              <select
                value={reciter}
                onChange={e => setReciter(e.target.value)}
                className="w-full text-xs rounded-md border border-gray-200 dark:border-gray-600
                           bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200
                           py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-islamic-green"
              >
                {RECITERS.map(r => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* Tafsir */}
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                <BookOpen size={11} /> Tafsir par défaut
              </label>
              <select
                value={tafsirId}
                onChange={e => setTafsirId(Number(e.target.value))}
                className="w-full text-xs rounded-md border border-gray-200 dark:border-gray-600
                           bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200
                           py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-islamic-green"
              >
                {TAFSIR_OPTIONS.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Font size */}
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                Taille du texte arabe
              </label>
              <div className="flex gap-1">
                {FONT_SIZES.map(s => (
                  <button
                    key={s}
                    onClick={() => setFontSize(s)}
                    className={`flex-1 py-1 rounded text-xs font-medium transition-colors ${
                      fontSize === s
                        ? 'bg-islamic-green text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {FONT_SIZE_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-300">Afficher la traduction</span>
            <button
              onClick={() => setShowTranslation(v => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showTranslation ? 'bg-islamic-green' : 'bg-gray-300 dark:bg-gray-600'
              }`}
              role="switch"
              aria-checked={showTranslation}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  showTranslation ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      )}

      {/* Surah header card */}
      <div className="card overflow-hidden mb-5">
        <div className="bg-gradient-to-br from-islamic-green to-emerald-700 p-6 text-center text-white">
          <div className="font-arabic text-5xl mb-2">{surah.name}</div>
          <div className="text-emerald-100 text-lg font-amiri">{surah.englishName}</div>
          <div className="text-emerald-200 text-sm mt-1 italic">"{surah.englishNameTranslation}"</div>
          <div className="flex items-center justify-center gap-4 mt-3">
            <span className={`badge ${isMakki ? 'bg-amber-200 text-amber-900' : 'bg-blue-200 text-blue-900'} text-xs`}>
              {isMakki ? 'Mecquoise' : 'Médinoise'}
            </span>
            <span className="text-emerald-100 text-xs">{surah.numberOfAyahs} versets</span>
            <span className="text-emerald-100 text-xs">Sourate {surah.number}</span>
          </div>
        </div>

        {/* Bismillah (not for Al-Fatiha and At-Tawbah) */}
        {surah.number !== 1 && surah.number !== 9 && (
          <div className="bismillah border-t border-gray-100 dark:border-gray-700">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => {
            if (surah.ayahs[0]) handleOpenTafsir(surah.ayahs[0]);
          }}
          className="btn-secondary text-xs flex items-center gap-1.5 flex-1"
        >
          <BookOpen size={13} />
          Tafsir
        </button>
        <button
          onClick={() => {
            if (surah.ayahs[0]) handlePractice(surah.ayahs[0]);
          }}
          className="btn-secondary text-xs flex items-center gap-1.5 flex-1"
        >
          <Mic size={13} />
          Récitation IA
        </button>
      </div>

      {/* Ayah list */}
      <div className="space-y-0">
        {surah.ayahs.map((ayah) => (
          <AyahCard
            key={ayah.numberInSurah}
            ayah={ayah}
            surahNumber={surahNumber}
            isActive={activeAyah?.numberInSurah === ayah.numberInSurah && tafsirOpen}
            showTranslation={showTranslation}
            fontSize={fontSize}
            onClick={() => setActiveAyah(ayah)}
            onOpenTafsir={() => handleOpenTafsir(ayah)}
            onPractice={() => handlePractice(ayah)}
          />
        ))}
      </div>

      {/* Scroll to top */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 w-10 h-10 rounded-full bg-islamic-green text-white
                   shadow-lg flex items-center justify-center hover:bg-emerald-700 transition-colors z-30"
        aria-label="Retour en haut"
      >
        <ChevronUp size={18} />
      </button>

      {/* Tafsir panel */}
      {tafsirOpen && activeAyah && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/30"
            onClick={() => setTafsirOpen(false)}
          />
          <TafsirPanel
            surahNumber={surahNumber}
            ayah={activeAyah}
            tafsirId={tafsirId}
            onChangeTafsir={setTafsirId}
            onClose={() => setTafsirOpen(false)}
          />
        </>
      )}

      {/* Recitation detector modal */}
      {practiceAyah && (
        <RecitationDetector
          ayah={practiceAyah}
          surahNumber={surahNumber}
          onClose={() => setPracticeAyah(null)}
        />
      )}
    </div>
  );
}
