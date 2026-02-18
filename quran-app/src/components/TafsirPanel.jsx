import { X, BookOpen, RefreshCw, Loader2, ExternalLink } from 'lucide-react';
import { useTafsir } from '../hooks/useQuran';
import { stripHtml, toArabicNumerals } from '../utils/arabicUtils';
import { TAFSIR_OPTIONS } from '../api/quranApi';

export default function TafsirPanel({ surahNumber, ayah, tafsirId, onChangeTafsir, onClose }) {
  const { tafsir, loading, error, reload } = useTafsir(surahNumber, ayah?.numberInSurah, tafsirId);

  const currentTafsirLabel = TAFSIR_OPTIONS.find(t => t.id === tafsirId)?.label || 'Tafsir';

  return (
    <aside className="fixed inset-y-0 right-0 z-40 w-full sm:w-[420px] bg-white dark:bg-gray-900
                      border-l border-gray-200 dark:border-gray-700 shadow-2xl
                      flex flex-col animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3
                      border-b border-gray-200 dark:border-gray-700 bg-islamic-green dark:bg-emerald-900">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-white" />
          <div>
            <div className="text-white font-semibold text-sm">Tafsir</div>
            {ayah && (
              <div className="text-emerald-200 text-xs">
                Verset {ayah.numberInSurah} · {currentTafsirLabel}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-white hover:bg-emerald-700 transition-colors"
          aria-label="Fermer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Tafsir selector */}
      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Tafsir :</label>
          <select
            value={tafsirId}
            onChange={e => onChangeTafsir(Number(e.target.value))}
            className="flex-1 text-xs rounded-md border border-gray-200 dark:border-gray-600
                       bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200
                       py-1 px-2 focus:outline-none focus:ring-1 focus:ring-islamic-green"
          >
            {TAFSIR_OPTIONS.map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Ayah preview */}
      {ayah && (
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700
                        bg-islamic-parchment dark:bg-gray-800">
          <p className="arabic-text text-xl text-gray-900 dark:text-gray-100 text-right leading-loose" dir="rtl" lang="ar">
            {ayah.arabic}
            {' '}
            <span className="text-islamic-green dark:text-emerald-400">
              ﴿{toArabicNumerals(ayah.numberInSurah)}﴾
            </span>
          </p>
          {ayah.translation && (
            <p className="text-gray-600 dark:text-gray-400 text-xs mt-2 italic leading-relaxed">
              "{ayah.translation}"
            </p>
          )}
        </div>
      )}

      {/* Tafsir content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4">
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 size={28} className="text-islamic-green animate-spin" />
            <p className="text-gray-400 text-sm">Chargement du tafsir...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-8">
            <div className="text-red-400 text-sm mb-2">Impossible de charger le tafsir</div>
            <p className="text-gray-400 text-xs mb-4">{error}</p>
            <button onClick={reload} className="btn-secondary flex items-center gap-2 mx-auto text-sm">
              <RefreshCw size={14} />
              Réessayer
            </button>
          </div>
        )}

        {!loading && !error && tafsir && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed space-y-3">
              {stripHtml(tafsir.text || '').split('\n').filter(Boolean).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                <ExternalLink size={11} />
                Source: {currentTafsirLabel} via quran.com
              </p>
            </div>
          </div>
        )}

        {!loading && !error && !tafsir && (
          <div className="text-center py-12 text-gray-400">
            <BookOpen size={36} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">Sélectionnez un verset pour voir son tafsir</p>
          </div>
        )}
      </div>
    </aside>
  );
}
