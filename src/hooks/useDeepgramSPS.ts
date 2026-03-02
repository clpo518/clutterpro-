import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { countSyllablesWord } from '@/lib/syllabify';

/**
 * Word with Deepgram timestamps for precise articulation time calculation
 */
interface WordWithTimestamp {
  word: string;
  start: number;
  end: number;
  syllables: number;
  duration: number;
  isFiller: boolean;
  fillerKey?: string;
}

// French single-word fillers
const SINGLE_FILLERS = new Set(['euh', 'heu', 'hum', 'ben', 'bah', 'bon', 'genre', 'alors', 'voilà', 'quoi']);
// French two-word fillers
const TWO_WORD_FILLERS = new Set(['du coup', 'en fait', 'tu vois']);

interface FillerDetails {
  [filler: string]: number;
}

interface UseDeepgramSPSOptions {
  detectFillers?: boolean;
}

/** Callback fired immediately when new words arrive (final or interim) */
type OnWordsCallback = (words: WordWithTimestamp[], isFinal: boolean) => void;

interface UseDeepgramSPSReturn {
  isConnected: boolean;
  isListening: boolean;
  currentSPS: number;
  /** Packet-based SPS: calculated every 5 syllables for stable, low-latency feedback */
  packetSPS: number;
  /** True once the first 5-syllable packet has been completed */
  isCalibrated: boolean;
  spsHistory: number[];
  syllableCount: number;
  wordCount: number;
  fillerCount: number;
  fillerDetails: FillerDetails;
  actualSpeakingTime: number;
  fluencyRatio: number;
  start: (stream: MediaStream, options?: UseDeepgramSPSOptions) => Promise<void>;
  stop: () => void;
  reset: () => void;
  error: string | null;
  getWordTimestamps: () => WordWithTimestamp[];
  /** Add dead time (ms) to exclude from fluency ratio (e.g. countdown pauses) */
  addPauseOffset: (ms: number) => void;
  /** Register a callback fired instantly when words arrive (zero polling latency) */
  setOnWords: (cb: OnWordsCallback | null) => void;
}

const PACKET_SIZE = 5; // syllables per packet
const SPS_WINDOW_SECONDS = 2;
const SPS_UPDATE_INTERVAL_MS = 100;
const AUDIO_BUFFER_SIZE = 1024;
const MAX_RECONNECT_ATTEMPTS = 2;
const RECONNECT_DELAY_MS = 1000;

export function useDeepgramSPS(): UseDeepgramSPSReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentSPS, setCurrentSPS] = useState(0);
  const [spsHistory, setSpsHistory] = useState<number[]>([]);
  const [syllableCount, setSyllableCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [fillerCount, setFillerCount] = useState(0);
  const [fillerDetails, setFillerDetails] = useState<FillerDetails>({});
  const [actualSpeakingTime, setActualSpeakingTime] = useState(0);
  const [fluencyRatio, setFluencyRatio] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [packetSPS, setPacketSPS] = useState(0);
  const [isCalibrated, setIsCalibrated] = useState(false);
  const packetSPSRef = useRef(0);
  // Packet tracking: accumulate syllables until PACKET_SIZE, then compute SPS
  const packetSyllCountRef = useRef(0);
  const packetFirstStartRef = useRef<number | null>(null);
  const packetLastEndRef = useRef<number | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const wordTimestampsRef = useRef<WordWithTimestamp[]>([]);
  const interimWordsRef = useRef<WordWithTimestamp[]>([]);
  const totalSyllablesRef = useRef(0);
  const totalWordsRef = useRef(0);
  const totalArticulationTimeRef = useRef(0);
  const startTimeRef = useRef(0);
  const spsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const detectFillersRef = useRef(false);
  const fillerCountRef = useRef(0);
  const fillerDetailsRef = useRef<FillerDetails>({});
  // Pause offset: total dead time (ms) to exclude from elapsed time (e.g. rebus countdown)
  const pauseOffsetMsRef = useRef(0);
  // Reconnect state
  const reconnectAttemptsRef = useRef(0);
  const apiKeyRef = useRef<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sendAudioChunkRef = useRef<((data: Float32Array) => void) | null>(null);
  const isStoppingRef = useRef(false);
  const onWordsCallbackRef = useRef<OnWordsCallback | null>(null);
  /**
   * Check if a word is a filler (returns the matched filler key or null)
   */
  const isFiller = useCallback((word: string, previousWord?: string): string | null => {
    const normalized = word.toLowerCase().trim().replace(/[.,!?;:]/g, '');
    if (SINGLE_FILLERS.has(normalized)) return normalized;
    if (previousWord) {
      const twoWord = `${previousWord.toLowerCase().trim().replace(/[.,!?;:]/g, '')} ${normalized}`;
      if (TWO_WORD_FILLERS.has(twoWord)) return twoWord;
    }
    return null;
  }, []);

  /**
   * Calculate SPS using word timestamps (Articulation Rate)
   * EXCLUDES filler words from syllable count for clinical accuracy
   */
  const calculateSPS = useCallback(() => {
    const allWords = [...wordTimestampsRef.current, ...interimWordsRef.current];
    if (allWords.length === 0) {
      setCurrentSPS(0);
      return 0;
    }

    // Use Deepgram timestamps directly for window (not wall clock) to avoid drift
    const latestEnd = allWords[allWords.length - 1].end;
    const windowStart = latestEnd - SPS_WINDOW_SECONDS;

    const recentWords = allWords.filter(w => w.end >= windowStart);

    if (recentWords.length === 0) {
      setCurrentSPS(0);
      return 0;
    }

    // Exclude fillers from syllable count for SPS calculation
    const syllablesInWindow = recentWords
      .filter(w => !w.isFiller)
      .reduce((sum, w) => sum + w.syllables, 0);

    const articulationTimeInWindow = recentWords.reduce((sum, w) => {
      const effectiveStart = Math.max(w.start, windowStart);
      const effectiveEnd = Math.min(w.end, latestEnd);
      return sum + Math.max(0, effectiveEnd - effectiveStart);
    }, 0);

    const rawSps = articulationTimeInWindow > 0.3
      ? syllablesInWindow / articulationTimeInWindow
      : 0;
    const sps = Math.round(Math.min(rawSps, 12) * 10) / 10;

    setCurrentSPS(sps);

    // Fluency ratio uses wall clock elapsed
    const rawElapsed = (Date.now() - startTimeRef.current) / 1000;
    const elapsedSeconds = rawElapsed - (pauseOffsetMsRef.current / 1000);
    setActualSpeakingTime(totalArticulationTimeRef.current);
    const ratio = elapsedSeconds > 0
      ? Math.min(1, Math.round((totalArticulationTimeRef.current / elapsedSeconds) * 100) / 100)
      : 0;
    setFluencyRatio(ratio);

    if (sps > 0 || totalSyllablesRef.current > 0) {
      setSpsHistory(prev => [...prev, sps].slice(-120));
    }

    return sps;
  }, []);

  /**
   * Connect WebSocket to Deepgram (used for initial connect + reconnect)
   */
  const connectWebSocket = useCallback((apiKey: string) => {
    const fillerParam = detectFillersRef.current ? '&filler_words=true' : '';
    const wsUrl = `wss://api.deepgram.com/v1/listen?model=nova-2&language=fr&punctuate=true&interim_results=true&encoding=linear16&sample_rate=16000${fillerParam}`;

    const socket = new WebSocket(wsUrl, ['token', apiKey]);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('[DeepgramSPS] WebSocket connected');
      setIsConnected(true);
      setIsListening(true);
      setError(null);
      reconnectAttemptsRef.current = 0;

      if (!spsIntervalRef.current) {
        startTimeRef.current = Date.now();
        spsIntervalRef.current = setInterval(calculateSPS, SPS_UPDATE_INTERVAL_MS);
      }
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'Results' && data.channel?.alternatives?.[0]) {
          const alternative = data.channel.alternatives[0];
          const words: Array<{ word: string; start: number; end: number }> = alternative.words || [];

          if (data.is_final && words.length > 0) {
            interimWordsRef.current = [];

            let segmentSyllables = 0;
            let segmentArticulationTime = 0;
            let prevWord: string | undefined;

            for (const w of words) {
              const syllables = countSyllablesWord(w.word);
              const duration = w.end - w.start;
              const validDuration = duration > 0 && duration < 5 ? duration : 0;

              // Check filler status
              const fillerKey = isFiller(w.word, prevWord);
              const wordIsFiller = fillerKey !== null;

              if (wordIsFiller) {
                fillerCountRef.current += 1;
                fillerDetailsRef.current[fillerKey!] = (fillerDetailsRef.current[fillerKey!] || 0) + 1;
                setFillerCount(fillerCountRef.current);
                setFillerDetails({ ...fillerDetailsRef.current });

                // For two-word fillers, also mark the previous word with the same fillerKey
                if (fillerKey && fillerKey.includes(' ') && wordTimestampsRef.current.length > 0) {
                  const prevEntry = wordTimestampsRef.current[wordTimestampsRef.current.length - 1];
                  prevEntry.isFiller = true;
                  prevEntry.fillerKey = fillerKey;
                }
              }

              wordTimestampsRef.current.push({
                word: w.word,
                start: w.start,
                end: w.end,
                syllables,
                duration: validDuration,
                isFiller: wordIsFiller,
                fillerKey: wordIsFiller ? fillerKey! : undefined
              });

              // Only count non-filler syllables for SPS
              if (!wordIsFiller) {
                segmentSyllables += syllables;
              }
              segmentArticulationTime += validDuration;

              prevWord = w.word;
            }

            totalSyllablesRef.current += segmentSyllables;
            totalWordsRef.current += words.length;
            totalArticulationTimeRef.current += segmentArticulationTime;

            setSyllableCount(totalSyllablesRef.current);
            setWordCount(totalWordsRef.current);
            setActualSpeakingTime(totalArticulationTimeRef.current);

            calculateSPS();

            // Packet-based SPS: use processed words from wordTimestampsRef
            {
              const processed = wordTimestampsRef.current;
              // Only process the words we just added (last `words.length` entries)
              const newEntries = processed.slice(-words.length);
              for (const w of newEntries) {
                if (w.isFiller) continue;
                
                if (packetFirstStartRef.current === null) {
                  packetFirstStartRef.current = w.start;
                }
                packetSyllCountRef.current += w.syllables;
                packetLastEndRef.current = w.end;
                
                if (packetSyllCountRef.current >= PACKET_SIZE) {
                  const packetDuration = packetLastEndRef.current! - packetFirstStartRef.current!;
                  if (packetDuration > 0.1) {
                    const sps = Math.round(Math.min(packetSyllCountRef.current / packetDuration, 12) * 10) / 10;
                    packetSPSRef.current = sps;
                    setPacketSPS(sps);
                    if (!isCalibrated) setIsCalibrated(true);
                  }
                  // Reset packet
                  packetSyllCountRef.current = 0;
                  packetFirstStartRef.current = null;
                  packetLastEndRef.current = null;
                }
              }
            }

            // Fire instant callback for zero-latency consumers
            if (onWordsCallbackRef.current) {
              onWordsCallbackRef.current(wordTimestampsRef.current.slice(-words.length), true);
            }

          } else if (!data.is_final && words.length > 0) {
            // Interim: mark fillers but don't count them yet
            let prevW: string | undefined;
            interimWordsRef.current = words.map(w => {
              const duration = w.end - w.start;
              const fillerKey = isFiller(w.word, prevW);
              prevW = w.word;
              return {
                word: w.word,
                start: w.start,
                end: w.end,
                syllables: countSyllablesWord(w.word),
                duration: duration > 0 && duration < 5 ? duration : 0,
                isFiller: fillerKey !== null
              };
            });

            calculateSPS();

            // Low-latency packet preview: check if interim syllables would complete current packet
            {
              const interimNonFiller = interimWordsRef.current.filter(w => !w.isFiller);
              let previewSyllCount = packetSyllCountRef.current;
              let previewFirstStart = packetFirstStartRef.current;
              let previewLastEnd = packetLastEndRef.current;

              for (const w of interimNonFiller) {
                if (previewFirstStart === null) previewFirstStart = w.start;
                previewSyllCount += w.syllables;
                previewLastEnd = w.end;

                if (previewSyllCount >= PACKET_SIZE && previewFirstStart !== null && previewLastEnd !== null) {
                  const dur = previewLastEnd - previewFirstStart;
                  if (dur > 0.1) {
                    const sps = Math.round(Math.min(previewSyllCount / dur, 12) * 10) / 10;
                    packetSPSRef.current = sps;
                    setPacketSPS(sps);
                    if (!isCalibrated) setIsCalibrated(true);
                  }
                  break; // Only preview one packet ahead
                }
              }
            }

            // Fire instant callback for interim words too
            if (onWordsCallbackRef.current) {
              onWordsCallbackRef.current(interimWordsRef.current, false);
            }
          }
        }
      } catch (e) {
        console.error('Error parsing Deepgram message:', e);
      }
    };

    socket.onerror = (e) => {
      console.error('[DeepgramSPS] WebSocket error:', e);
      setError('Connection error');
    };

    socket.onclose = (event: CloseEvent) => {
      console.log(`[DeepgramSPS] WebSocket closed - code: ${event.code}, reason: "${event.reason}", wasClean: ${event.wasClean}`);
      setIsConnected(false);

      // Auto-reconnect on abnormal closure (not user-initiated stop)
      if (!isStoppingRef.current && event.code !== 1000 && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS && apiKeyRef.current) {
        reconnectAttemptsRef.current += 1;
        const attempt = reconnectAttemptsRef.current;
        console.log(`[DeepgramSPS] Reconnecting... attempt ${attempt}/${MAX_RECONNECT_ATTEMPTS}`);
        setError(`Reconnexion (${attempt}/${MAX_RECONNECT_ATTEMPTS})...`);

        setTimeout(() => {
          if (!isStoppingRef.current && apiKeyRef.current) {
            connectWebSocket(apiKeyRef.current);
          }
        }, RECONNECT_DELAY_MS * attempt);
      } else if (!isStoppingRef.current && event.code !== 1000) {
        setError(`Connexion perdue (code ${event.code})`);
        setIsListening(false);
      } else {
        setIsListening(false);
      }
    };

    return socket;
  }, [calculateSPS, isFiller]);

  const start = useCallback(async (stream: MediaStream, options?: UseDeepgramSPSOptions) => {
    setError(null);
    isStoppingRef.current = false;
    reconnectAttemptsRef.current = 0;
    detectFillersRef.current = options?.detectFillers ?? false;
    streamRef.current = stream;

    try {
      const { data, error: fnError } = await supabase.functions.invoke('get-deepgram-token');

      if (fnError || !data?.apiKey) {
        throw new Error(fnError?.message || 'Failed to get Deepgram token');
      }

      apiKeyRef.current = data.apiKey;

      const socket = connectWebSocket(data.apiKey);

      // Audio capture setup with resampling (Safari-compatible)
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioCtx();
      await audioContext.resume();

      const nativeSampleRate = audioContext.sampleRate;
      const targetSampleRate = 16000;
      const source = audioContext.createMediaStreamSource(stream);

      console.log(`[DeepgramSPS] Audio: ${nativeSampleRate}Hz -> ${targetSampleRate}Hz | state: ${audioContext.state}`);

      const downsample = (buffer: Float32Array, inputRate: number, outputRate: number): Float32Array => {
        if (inputRate === outputRate) return buffer;
        const ratio = inputRate / outputRate;
        const newLength = Math.round(buffer.length / ratio);
        const result = new Float32Array(newLength);
        for (let i = 0; i < newLength; i++) {
          result[i] = buffer[Math.round(i * ratio)];
        }
        return result;
      };

      const sendAudioChunk = (inputData: Float32Array) => {
        const currentSocket = socketRef.current;
        if (!currentSocket || currentSocket.readyState !== WebSocket.OPEN) return;
        const resampledData = downsample(inputData, nativeSampleRate, targetSampleRate);
        const int16Data = new Int16Array(resampledData.length);
        for (let i = 0; i < resampledData.length; i++) {
          const s = Math.max(-1, Math.min(1, resampledData[i]));
          int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        currentSocket.send(int16Data.buffer);
      };

      sendAudioChunkRef.current = sendAudioChunk;

      let cleanupAudio: () => void;

      try {
        await audioContext.audioWorklet.addModule('/audio-processor.js');
        const workletNode = new AudioWorkletNode(audioContext, 'audio-processor');
        source.connect(workletNode);
        workletNode.connect(audioContext.destination);
        workletNode.port.onmessage = (e: MessageEvent<Float32Array>) => {
          sendAudioChunk(e.data);
        };
        console.log('[DeepgramSPS] Using AudioWorklet');
        cleanupAudio = () => {
          workletNode.disconnect();
          source.disconnect();
          audioContext.close();
        };
      } catch {
        console.warn('[DeepgramSPS] Falling back to ScriptProcessor');
        const processor = audioContext.createScriptProcessor(AUDIO_BUFFER_SIZE, 1, 1);
        processor.onaudioprocess = (e) => {
          sendAudioChunk(e.inputBuffer.getChannelData(0));
        };
        source.connect(processor);
        processor.connect(audioContext.destination);
        cleanupAudio = () => {
          processor.disconnect();
          source.disconnect();
          audioContext.close();
        };
      }

      mediaRecorderRef.current = {
        stop: () => cleanupAudio()
      } as unknown as MediaRecorder;

    } catch (e) {
      console.error('Failed to start Deepgram:', e);
      const msg = e instanceof Error ? e.message : 'Failed to connect';
      setError(msg);
      throw new Error(msg);
    }
  }, [connectWebSocket]);

  const stop = useCallback(() => {
    isStoppingRef.current = true;

    if (spsIntervalRef.current) {
      clearInterval(spsIntervalRef.current);
      spsIntervalRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    apiKeyRef.current = null;
    streamRef.current = null;
    sendAudioChunkRef.current = null;
    setIsListening(false);
    setIsConnected(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    setCurrentSPS(0);
    setSpsHistory([]);
    setSyllableCount(0);
    setWordCount(0);
    setFillerCount(0);
    setFillerDetails({});
    setActualSpeakingTime(0);
    setFluencyRatio(0);
    setError(null);
    wordTimestampsRef.current = [];
    interimWordsRef.current = [];
    totalSyllablesRef.current = 0;
    totalWordsRef.current = 0;
    totalArticulationTimeRef.current = 0;
    startTimeRef.current = 0;
    pauseOffsetMsRef.current = 0;
    fillerCountRef.current = 0;
    fillerDetailsRef.current = {};
    detectFillersRef.current = false;
    reconnectAttemptsRef.current = 0;
    packetSPSRef.current = 0;
    packetSyllCountRef.current = 0;
    packetFirstStartRef.current = null;
    packetLastEndRef.current = null;
    setPacketSPS(0);
    setIsCalibrated(false);
  }, [stop]);

  useEffect(() => {
    return () => { stop(); };
  }, [stop]);

  const getWordTimestamps = useCallback(() => {
    return [...wordTimestampsRef.current];
  }, []);

  const addPauseOffset = useCallback((ms: number) => {
    pauseOffsetMsRef.current += ms;
  }, []);

  const setOnWords = useCallback((cb: OnWordsCallback | null) => {
    onWordsCallbackRef.current = cb;
  }, []);

  return {
    isConnected,
    isListening,
    currentSPS,
    packetSPS,
    isCalibrated,
    spsHistory,
    syllableCount,
    wordCount,
    fillerCount,
    fillerDetails,
    actualSpeakingTime,
    fluencyRatio,
    start,
    stop,
    reset,
    error,
    getWordTimestamps,
    addPauseOffset,
    setOnWords
  };
}
