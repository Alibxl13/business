import { Play, Pause, BookOpen } from 'lucide-react';
import { toArabicNumerals } from '../utils/arabicUtils';
import { useRef, useState } from 'react';

export default function AyahCard({
  ayah,
  surahNumber,
  isActive,
  showTranslation,
  fontSize,
  onClick,
  onOpenTafsir,
}) {
  const audioRef  = useRef(null);
  const [playing, setPlaying] = useState(false);

  const toggleAudio = async (e) => {
    e.stopPropagation();
    if (!ayah.audioUrl) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(ayah.audioUrl);
      audioRef.current.onended = () => setPlaying(false);
      audioRef.current.onerror = () => setPlaying(false);
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      await audioRef.current.play().catch(() => setPlaying(false));
      setPlaying(true);
    }
  };

  const fontSizeClass = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
    xl: 'text-5xl',
  }[fontSize] || 'text-3xl';

  return (
    <article
      onClick={onClick}
      className={`ayah-card ${isActive ? 'active' : ''} group`}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
      aria-label={`Verset ${ayah.numberInSurah}`}
    >
      {/* Top bar: ayah number + actions */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Ayah number in decorative circle */}
          <div className="relative w-9 h-9 flex-shrink-0">
            <svg viewBox="0 0 40 40" className="w-full h-full text-islamic-green dark:text-emerald-600 opacity-80">
              <polygon
                points="20,2 38,11 38,29 20,38 2,29 2,11"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-islamic-green dark:text-emerald-400">
              {ayah.numberInSurah}
            </span>
          </div>
          {ayah.sajda && (
            <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 text-[10px]">
              Sajda
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {ayah.audioUrl && (
            <button
              onClick={toggleAudio}
              className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30
                         text-islamic-green dark:text-emerald-400 transition-colors"
              title={playing ? 'Pause' : 'Écouter'}
            >
              {playing ? <Pause size={15} /> : <Play size={15} />}
            </button>
          )}
          <button
            onClick={e => { e.stopPropagation(); onOpenTafsir?.(); }}
            className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30
                       text-blue-600 dark:text-blue-400 transition-colors"
            title="Voir le Tafsir"
          >
            <BookOpen size={15} />
          </button>
        </div>
      </div>

      {/* Arabic text */}
      <p
        className={`arabic-text ${fontSizeClass} text-gray-900 dark:text-gray-100 leading-loose text-right mb-3`}
        lang="ar"
        dir="rtl"
      >
        {ayah.arabic}
        {' '}
        <span className="text-islamic-green dark:text-emerald-500 text-2xl">
          ﴿{toArabicNumerals(ayah.numberInSurah)}﴾
        </span>
      </p>

      {/* Translation */}
      {showTranslation && ayah.translation && (
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-3 font-sans">
          {ayah.translation}
        </p>
      )}

      {/* Juz / Page info */}
      <div className="flex gap-3 mt-2">
        {ayah.juz && (
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            Juz {ayah.juz}
          </span>
        )}
        {ayah.page && (
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            Page {ayah.page}
          </span>
        )}
      </div>
    </article>
  );
}
