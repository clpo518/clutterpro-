import { useState, useRef, useCallback, useEffect } from "react";

interface VolumeAnalyzerResult {
  volumeLevel: number; // 0-1
  isSpeaking: boolean;
  startAnalyzing: (stream: MediaStream) => void;
  stopAnalyzing: () => void;
}

const VOLUME_THRESHOLD = 0.25; // Threshold to consider "speaking" (raised to ignore breathing/ambient)
const ANALYSIS_INTERVAL = 50; // Analyze every 50ms for ultra-responsiveness
const SPEAK_CONFIRM_MS = 250; // Volume must stay above threshold for 250ms to count as speaking

export const useVolumeAnalyzer = (): VolumeAnalyzerResult => {
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  // Track speaking state with hysteresis to avoid flickering
  const speakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeakingRef = useRef(false);
  // Temporal confirmation: track when volume first went above threshold
  const aboveThresholdSinceRef = useRef<number | null>(null);

  const analyzeVolume = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return;
    
    analyserRef.current.getByteFrequencyData(dataArrayRef.current as Uint8Array<ArrayBuffer>);
    
    // Calculate RMS (root mean square) for accurate volume level
    let sum = 0;
    for (let i = 0; i < dataArrayRef.current.length; i++) {
      const normalized = dataArrayRef.current[i] / 255;
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / dataArrayRef.current.length);
    
    // Apply some smoothing and scaling
    const scaledVolume = Math.min(1, rms * 2.5);
    setVolumeLevel(scaledVolume);
    
    // Determine if speaking with temporal confirmation + hysteresis
    const aboveThreshold = scaledVolume > VOLUME_THRESHOLD;

    if (aboveThreshold) {
      // Track how long we've been above threshold
      if (aboveThresholdSinceRef.current === null) {
        aboveThresholdSinceRef.current = Date.now();
      }

      const aboveDuration = Date.now() - aboveThresholdSinceRef.current;

      // Only confirm speaking after sustained volume for SPEAK_CONFIRM_MS
      if (aboveDuration >= SPEAK_CONFIRM_MS) {
        if (speakingTimeoutRef.current) {
          clearTimeout(speakingTimeoutRef.current);
          speakingTimeoutRef.current = null;
        }
        if (!lastSpeakingRef.current) {
          setIsSpeaking(true);
          lastSpeakingRef.current = true;
        }
      }
    } else {
      // Reset temporal confirmation
      aboveThresholdSinceRef.current = null;

      // Wait 300ms before declaring "not speaking" to avoid flickering
      if (lastSpeakingRef.current && !speakingTimeoutRef.current) {
        speakingTimeoutRef.current = setTimeout(() => {
          setIsSpeaking(false);
          lastSpeakingRef.current = false;
          speakingTimeoutRef.current = null;
        }, 300);
      }
    }
  }, []);

  const startAnalyzing = useCallback((stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioCtx();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.3; // Fast response
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
      
      // Start analyzing at high frequency (every 50ms)
      intervalRef.current = setInterval(analyzeVolume, ANALYSIS_INTERVAL);
    } catch (error) {
      console.error("Failed to start volume analyzer:", error);
    }
  }, [analyzeVolume]);

  const stopAnalyzing = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (speakingTimeoutRef.current) {
      clearTimeout(speakingTimeoutRef.current);
      speakingTimeoutRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    dataArrayRef.current = null;
    setVolumeLevel(0);
    setIsSpeaking(false);
    lastSpeakingRef.current = false;
    aboveThresholdSinceRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAnalyzing();
    };
  }, [stopAnalyzing]);

  return {
    volumeLevel,
    isSpeaking,
    startAnalyzing,
    stopAnalyzing,
  };
};
