import { useState, useEffect } from 'react';
import Header from './components/Header';
import SurahList from './components/SurahList';
import SurahReader from './components/SurahReader';
import { getAllSurahs } from './api/quranApi';

export default function App() {
  const [selectedSurahNumber, setSelectedSurahNumber] = useState(null);
  const [selectedSurahMeta,   setSelectedSurahMeta]   = useState(null);
  const [darkMode,             setDarkMode]             = useState(
    () => window.matchMedia?.('(prefers-color-scheme: dark)').matches
  );

  // Apply dark mode class to html element
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Fetch surah meta for breadcrumb when a surah is selected
  const handleSelectSurah = async (number) => {
    setSelectedSurahNumber(number);
    // Update page title
    document.title = `Sourate ${number} · القرآن الكريم`;
    // Try to get meta from cache (getAllSurahs caches internally)
    try {
      const surahs = await getAllSurahs();
      const meta = surahs.find(s => s.number === number);
      setSelectedSurahMeta(meta || null);
    } catch {
      setSelectedSurahMeta(null);
    }
  };

  const handleHome = () => {
    setSelectedSurahNumber(null);
    setSelectedSurahMeta(null);
    document.title = 'القرآن الكريم · Quran App';
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-islamic-cream dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
        <Header
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode(d => !d)}
          onHome={handleHome}
          currentSurah={selectedSurahMeta}
        />

        {selectedSurahNumber ? (
          <SurahReader
            key={selectedSurahNumber}
            surahNumber={selectedSurahNumber}
            onBack={handleHome}
          />
        ) : (
          <SurahList onSelect={handleSelectSurah} />
        )}
      </div>
    </div>
  );
}
