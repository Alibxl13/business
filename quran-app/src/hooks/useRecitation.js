import { useState, useRef, useCallback, useEffect } from 'react';
import { arabicSimilarity, compareWordByWord } from '../utils/arabicUtils';

/**
 * Hook for AI-powered Quran recitation detection
 * Uses Web Speech API for Arabic speech recognition
 * and compares result to the expected ayah text
 */
export function useRecitation() {
  const [isRecording, setIsRecording]         = useState(false);
  const [isSupported, setIsSupported]         = useState(false);
  const [transcript,  setTranscript]          = useState('');
  const [interimText, setInterimText]         = useState('');
  const [score,       setScore]               = useState(null);
  const [wordAnalysis, setWordAnalysis]       = useState([]);
  const [error,       setError]               = useState(null);
  const [audioLevel,  setAudioLevel]          = useState(0);

  const recognitionRef  = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef     = useRef(null);
  const sourceRef       = useRef(null);
  const streamRef       = useRef(null);
  const animFrameRef    = useRef(null);
  const expectedRef     = useRef('');

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
    return () => stopRecording();
  }, []);

  /**
   * Set up audio level analyser for visualisation
   */
  async function setupAudioAnalyser() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ctx     = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      const source  = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = ctx;
      analyserRef.current     = analyser;
      sourceRef.current       = source;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setAudioLevel(Math.min(100, avg * 2));
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access.');
    }
  }

  function teardownAudioAnalyser() {
    cancelAnimationFrame(animFrameRef.current);
    if (sourceRef.current)       { sourceRef.current.disconnect(); }
    if (audioContextRef.current) { audioContextRef.current.close(); }
    if (streamRef.current)       { streamRef.current.getTracks().forEach(t => t.stop()); }
    audioContextRef.current = null;
    analyserRef.current     = null;
    sourceRef.current       = null;
    streamRef.current       = null;
    setAudioLevel(0);
  }

  const startRecording = useCallback(async (expectedArabicText) => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser. Use Chrome or Edge.');
      return;
    }

    setError(null);
    setTranscript('');
    setInterimText('');
    setScore(null);
    setWordAnalysis([]);
    expectedRef.current = expectedArabicText;

    await setupAudioAnalyser();

    const recognition           = new SpeechRecognition();
    recognition.lang            = 'ar-SA';
    recognition.continuous      = true;
    recognition.interimResults  = true;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => setIsRecording(true);

    recognition.onresult = (event) => {
      let interim = '';
      let final   = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text   = result[0].transcript;
        if (result.isFinal) {
          final += text + ' ';
        } else {
          interim += text;
        }
      }

      if (final) setTranscript(prev => (prev + ' ' + final).trim());
      setInterimText(interim);
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') return; // ignore
      setError(`Erreur de reconnaissance: ${event.error}`);
    };

    recognition.onend = () => {
      // Auto-evaluate when recognition ends
      setIsRecording(false);
      teardownAudioAnalyser();
      // Score is computed in stopRecording
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    teardownAudioAnalyser();
    setIsRecording(false);
    setInterimText('');

    // Compute score with current transcript
    setTranscript(prev => {
      const finalTranscript = prev.trim();
      if (finalTranscript && expectedRef.current) {
        const s = arabicSimilarity(expectedRef.current, finalTranscript);
        const w = compareWordByWord(expectedRef.current, finalTranscript);
        setScore(s);
        setWordAnalysis(w);
      }
      return finalTranscript;
    });
  }, []);

  const reset = useCallback(() => {
    stopRecording();
    setTranscript('');
    setInterimText('');
    setScore(null);
    setWordAnalysis([]);
    setError(null);
    setAudioLevel(0);
  }, [stopRecording]);

  return {
    isRecording,
    isSupported,
    transcript,
    interimText,
    score,
    wordAnalysis,
    error,
    audioLevel,
    startRecording,
    stopRecording,
    reset,
  };
}
