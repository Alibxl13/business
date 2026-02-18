import { useState, useMemo } from 'react';
import { Search, BookOpen, MapPin, Hash, ChevronRight, Loader2 } from 'lucide-react';
import { useSurahList } from '../hooks/useQuran';

const REVELATION_LABELS = {
  Meccan:  { label: 'Mecquoise', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
  Medinan: { label: 'Médinoise', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
};

export default function SurahList({ onSelect }) {
  const { surahs, loading, error } = useSurahList();
  const [search, setSearch]        = useState('');
  const [filter, setFilter]        = useState('all'); // 'all' | 'Meccan' | 'Medinan'

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return surahs.filter(s => {
      const matchesSearch = !q ||
        s.englishName.toLowerCase().includes(q) ||
        s.name.includes(search) ||
        s.englishNameTranslation.toLowerCase().includes(q) ||
        String(s.number).includes(q);
      const matchesFilter = filter === 'all' || s.revelationType === filter;
      return matchesSearch && matchesFilter;
    });
  }, [surahs, search, filter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={40} className="text-islamic-green animate-spin" />
        <p className="text-gray-500 dark:text-gray-400">Chargement des sourates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-20 text-center px-4">
        <div className="text-red-500 text-lg mb-2">Erreur de chargement</div>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{error}</p>
        <p className="text-gray-400 text-xs mt-2">Vérifiez votre connexion internet.</p>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-arabic text-islamic-green dark:text-emerald-400 mb-2">
          بسم الله الرحمن الرحيم
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux
        </p>
        <div className="mt-4 text-gray-500 dark:text-gray-400 text-sm">
          {surahs.length} Sourates · Tafsir · Récitation IA
        </div>
      </div>

      {/* Search + Filter */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une sourate..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-islamic-green text-sm"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'Meccan', 'Medinan'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  filter === f
                    ? 'bg-islamic-green text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {f === 'all' ? 'Toutes' : f === 'Meccan' ? 'Mecquoises' : 'Médinoises'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      {search && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          {filtered.length} résultat{filtered.length !== 1 ? 's' : ''} pour "{search}"
        </p>
      )}

      {/* Surah grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map(surah => {
          const revInfo = REVELATION_LABELS[surah.revelationType] || REVELATION_LABELS.Meccan;
          return (
            <button
              key={surah.number}
              onClick={() => onSelect(surah.number)}
              className="card p-4 text-left flex items-center gap-4
                         hover:shadow-md hover:border-islamic-green/30 dark:hover:border-emerald-600/30
                         transition-all duration-200 group active:scale-[0.99]"
            >
              {/* Number badge */}
              <div className="w-12 h-12 rounded-full bg-islamic-green/10 dark:bg-emerald-900/30
                              flex items-center justify-center flex-shrink-0
                              group-hover:bg-islamic-green/20 transition-colors">
                <span className="text-islamic-green dark:text-emerald-400 font-bold text-sm">
                  {surah.number}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                      {surah.englishName}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs truncate">
                      {surah.englishNameTranslation}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-arabic text-islamic-green dark:text-emerald-400 text-xl leading-tight">
                      {surah.name}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className={`badge text-[10px] ${revInfo.color}`}>
                    {revInfo.label}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Hash size={10} />
                    {surah.numberOfAyahs} versets
                  </span>
                </div>
              </div>

              <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-islamic-green dark:group-hover:text-emerald-400 transition-colors flex-shrink-0" />
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-400">
          <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
          <p>Aucune sourate trouvée</p>
        </div>
      )}
    </main>
  );
}
