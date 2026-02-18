import { Moon, Sun, BookOpen, Home } from 'lucide-react';

export default function Header({ darkMode, toggleDarkMode, onHome, currentSurah }) {
  return (
    <header className="sticky top-0 z-50 glass dark:glass-dark border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo + Title */}
        <button
          onClick={onHome}
          className="flex items-center gap-3 group"
          aria-label="Accueil"
        >
          <div className="w-10 h-10 rounded-full bg-islamic-green flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <span className="text-white font-arabic text-lg leading-none">ق</span>
          </div>
          <div className="hidden sm:block">
            <div className="text-lg font-bold text-islamic-green dark:text-emerald-400 leading-tight font-arabic">
              القرآن الكريم
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-sans leading-tight">
              Quran · Tafsir · Récitation IA
            </div>
          </div>
        </button>

        {/* Current surah breadcrumb */}
        {currentSurah && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <button
              onClick={onHome}
              className="flex items-center gap-1 hover:text-islamic-green dark:hover:text-emerald-400 transition-colors"
            >
              <Home size={14} />
              <span className="hidden sm:inline">Sourates</span>
            </button>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <span className="flex items-center gap-1 text-islamic-green dark:text-emerald-400 font-medium">
              <BookOpen size={14} />
              <span>{currentSurah.number}. {currentSurah.englishName}</span>
            </span>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode
              ? <Sun  size={20} className="text-amber-400" />
              : <Moon size={20} className="text-gray-600" />
            }
          </button>
        </div>
      </div>
    </header>
  );
}
