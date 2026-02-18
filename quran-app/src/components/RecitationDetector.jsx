import { useState, useRef, useEffect } from 'react';
import {
  Mic, MicOff, Square, RotateCcw, CheckCircle,
  AlertCircle, Info, Volume2, Loader2
} from 'lucide-react';
import { useRecitation } from '../hooks/useRecitation';
import { getScoreInfo, toArabicNumerals } from '../utils/arabicUtils';

/**
 * Audio waveform visualizer
 */
function AudioVisualizer({ audioLevel, isRecording }) {
  const bars = 24;
  return (
    <div className="flex items-center justify-center gap-0.5 h-12 py-1">
      {Array.from({ length: bars }).map((_, i) => {
        const center = Math.abs(i - bars / 2) / (bars / 2);
        const baseH  = isRecording
          ? Math.max(4, audioLevel * (0.3 + Math.random() * 0.7) * (1 - center * 0.5))
          : 4;
        return (
          <div
            key={i}
            className={`waveform-bar ${isRecording ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'}`}
            style={{ height: `${baseH}%`, minHeight: '3px', maxHeight: '100%' }}
          />
        );
      })}
    </div>
  );
}

/**
 * Word-by-word comparison display
 */
function WordAnalysis({ wordAnalysis }) {
  if (!wordAnalysis.length) return null;
  return (
    <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Analyse mot par mot :</p>
      <div className="flex flex-wrap gap-2 justify-end" dir="rtl">
        {wordAnalysis.map((item, i) => (
          <span
            key={i}
            className={`inline-block px-2 py-1 rounded text-sm font-arabic ${
              item.correct
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
            }`}
            title={item.recited ? `Récité : ${item.recited}` : 'Non récité'}
          >
            {item.word}
          </span>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center">
        {wordAnalysis.filter(w => w.correct).length}/{wordAnalysis.length} mots corrects
      </p>
    </div>
  );
}

export default function RecitationDetector({ ayah, surahNumber, onClose }) {
  const {
    isRecording, isSupported, transcript, interimText,
    score, wordAnalysis, error, audioLevel,
    startRecording, stopRecording, reset,
  } = useRecitation();

  const [phase, setPhase] = useState('idle'); // 'idle' | 'countdown' | 'recording' | 'result'
  const [countdown, setCountdown] = useState(3);
  const countdownRef = useRef(null);

  // Start countdown then recording
  const handleStart = () => {
    reset();
    setPhase('countdown');
    setCountdown(3);
    let c = 3;
    countdownRef.current = setInterval(() => {
      c -= 1;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(countdownRef.current);
        setPhase('recording');
        startRecording(ayah.arabic);
      }
    }, 1000);
  };

  const handleStop = () => {
    clearInterval(countdownRef.current);
    stopRecording();
    setPhase('result');
  };

  const handleReset = () => {
    clearInterval(countdownRef.current);
    reset();
    setPhase('idle');
  };

  // Auto stop after 30 seconds
  useEffect(() => {
    if (!isRecording) return;
    const timeout = setTimeout(handleStop, 30000);
    return () => clearTimeout(timeout);
  }, [isRecording]);

  // When recording stops externally (speech API timeout), move to result
  useEffect(() => {
    if (phase === 'recording' && !isRecording) {
      setPhase('result');
    }
  }, [isRecording, phase]);

  const scoreInfo = score !== null ? getScoreInfo(score) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
         role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={phase === 'idle' || phase === 'result' ? onClose : undefined}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900
                      rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-islamic-green to-emerald-600 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic size={18} className="text-white" />
              <span className="text-white font-semibold">Détection de Récitation IA</span>
            </div>
            <button
              onClick={onClose}
              className="text-emerald-200 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-emerald-100 text-xs mt-1">
            Verset {surahNumber}:{ayah.numberInSurah}
          </p>
        </div>

        <div className="p-5 space-y-4">
          {/* Target ayah */}
          <div className="p-3 rounded-xl bg-islamic-parchment dark:bg-gray-800
                          border border-gray-200 dark:border-gray-700">
            <p className="arabic-text text-2xl text-gray-900 dark:text-gray-100 text-right leading-loose" dir="rtl" lang="ar">
              {ayah.arabic}
            </p>
            {ayah.translation && (
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 italic">
                {ayah.translation}
              </p>
            )}
          </div>

          {/* Not supported warning */}
          {!isSupported && (
            <div className="flex gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700">
              <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-700 dark:text-amber-300 text-sm font-medium">
                  Navigateur non supporté
                </p>
                <p className="text-amber-600 dark:text-amber-400 text-xs mt-0.5">
                  La reconnaissance vocale requiert Chrome ou Edge. Utilisez Chrome pour cette fonctionnalité.
                </p>
              </div>
            </div>
          )}

          {/* Countdown */}
          {phase === 'countdown' && (
            <div className="flex flex-col items-center py-4 gap-2">
              <div className="text-6xl font-bold text-islamic-green dark:text-emerald-400 animate-pulse-slow">
                {countdown}
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Préparez-vous à réciter...
              </p>
            </div>
          )}

          {/* Recording */}
          {phase === 'recording' && (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-500 font-medium text-sm">Enregistrement en cours...</span>
              </div>
              <AudioVisualizer audioLevel={audioLevel} isRecording={true} />
              {interimText && (
                <p className="arabic-text text-right text-gray-500 dark:text-gray-400 text-lg p-2
                               bg-gray-50 dark:bg-gray-800 rounded-lg" dir="rtl">
                  {interimText}
                </p>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Result */}
          {phase === 'result' && score !== null && scoreInfo && (
            <div className="space-y-3 animate-fade-in">
              {/* Score display */}
              <div className={`flex items-center gap-4 p-4 rounded-xl ${scoreInfo.bg} border border-current/10`}>
                <div className={`score-circle ${scoreInfo.color}`}>
                  {score}%
                </div>
                <div>
                  <div className={`text-xl font-bold ${scoreInfo.color}`}>{scoreInfo.label}</div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                    Score de similarité avec le verset
                  </div>
                  {score >= 95 && (
                    <div className="flex items-center gap-1 text-emerald-600 text-xs mt-1">
                      <CheckCircle size={12} />
                      Récitation maîtrisée !
                    </div>
                  )}
                </div>
              </div>

              {/* Transcript */}
              {transcript && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                    <Volume2 size={11} />
                    Texte reconnu :
                  </p>
                  <p className="arabic-text text-right text-lg text-gray-700 dark:text-gray-300
                                 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg" dir="rtl">
                    {transcript}
                  </p>
                </div>
              )}

              {/* Word analysis */}
              <WordAnalysis wordAnalysis={wordAnalysis} />

              {/* Tips */}
              {score < 80 && (
                <div className="flex gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                  <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-blue-600 dark:text-blue-300 text-xs">
                    {score < 50
                      ? "Écoutez d'abord la récitation, puis réessayez lentement mot par mot."
                      : "Bonne progression ! Concentrez-vous sur les mots en rouge ci-dessus."}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Result with no score (empty transcript) */}
          {phase === 'result' && score === null && !error && (
            <div className="text-center py-4 text-gray-400">
              <MicOff size={28} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune parole détectée. Réessayez.</p>
            </div>
          )}

          {/* Idle info */}
          {phase === 'idle' && (
            <div className="flex gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
              <Info size={14} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-emerald-700 dark:text-emerald-300 text-xs">
                L'IA analyse votre récitation en arabe et la compare au verset original.
                Un compte à rebours de 3 secondes vous préparera avant l'enregistrement.
              </p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="px-5 pb-5 flex gap-3">
          {(phase === 'idle' || phase === 'result') && (
            <>
              {phase === 'result' && (
                <button onClick={handleReset} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                  <RotateCcw size={15} />
                  Réessayer
                </button>
              )}
              <button
                onClick={phase === 'idle' ? handleStart : handleReset}
                disabled={!isSupported}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Mic size={15} />
                {phase === 'idle' ? 'Commencer la récitation' : 'Nouvelle tentative'}
              </button>
            </>
          )}

          {phase === 'countdown' && (
            <button onClick={handleReset} className="btn-secondary flex-1 flex items-center justify-center gap-2">
              Annuler
            </button>
          )}

          {phase === 'recording' && (
            <>
              <button onClick={handleReset} className="btn-secondary flex items-center justify-center gap-2 px-4">
                <RotateCcw size={15} />
              </button>
              <button
                onClick={handleStop}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                           bg-red-500 hover:bg-red-600 text-white font-medium transition-colors active:scale-95"
              >
                <Square size={15} />
                Terminer
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
