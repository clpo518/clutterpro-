import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Volume biofeedback hook for vocal projection training.
 * Calibrates baseline volume for 5s, then provides real-time zone feedback.
 */

export type VolumeZone = 'too_quiet' | 'target' | 'strong_projection' | 'too_loud';

interface VolumeZoneInfo {
  zone: VolumeZone;
  label: string;
  emoji: string;
  colorClass: string;
  bgClass: string;
}

interface UseVolumeBiofeedbackReturn {
  /** Current smoothed volume level (0-1) */
  volume: number;
  /** Raw unsmoothed volume (0-1) */
  rawVolume: number;
  /** Current zone classification */
  zoneInfo: VolumeZoneInfo;
  /** Whether calibration is in progress */
  isCalibrating: boolean;
  /** Calibration progress (0-100) */
  calibrationProgress: number;
  /** Time spent in target zone (seconds) */
  timeInTarget: number;
  /** Total active time (seconds) */
  totalTime: number;
  /** Average volume over entire session */
  avgVolume: number;
  /** Max volume recorded */
  maxVolume: number;
  /** Start analyzing a stream */
  start: (stream: MediaStream) => void;
  /** Stop analyzing */
  stop: () => void;
  /** Whether currently active */
  isActive: boolean;
}

// Calibration
const CALIBRATION_DURATION_MS = 5000;
const ANALYSIS_INTERVAL_MS = 50;
// EMA smoothing
const EMA_ALPHA = 0.18;
// Zone thresholds (relative to calibrated baseline)
const QUIET_FACTOR = 0.6;   // below 60% of baseline = too quiet
const TARGET_FACTOR = 1.0;  // 60-150% of baseline = target
const STRONG_FACTOR = 1.5;  // 150-220% = strong projection (good!)
const LOUD_FACTOR = 2.2;    // above 220% = too loud

function getZoneInfo(zone: VolumeZone): VolumeZoneInfo {
  switch (zone) {
    case 'too_quiet':
      return { zone, label: 'Too quiet', emoji: '🤫', colorClass: 'text-blue-500', bgClass: 'bg-blue-100 dark:bg-blue-900/30' };
    case 'target':
      return { zone, label: 'Target zone', emoji: '✅', colorClass: 'text-emerald-600', bgClass: 'bg-emerald-100 dark:bg-emerald-900/30' };
    case 'strong_projection':
      return { zone, label: 'Strong projection', emoji: '📢', colorClass: 'text-amber-600', bgClass: 'bg-amber-100 dark:bg-amber-900/30' };
    case 'too_loud':
      return { zone, label: 'Too loud', emoji: '🔴', colorClass: 'text-red-600', bgClass: 'bg-red-100 dark:bg-red-900/30' };
  }
}

function classifyZone(volume: number, baseline: number): VolumeZone {
  if (baseline <= 0) return 'too_quiet';
  const ratio = volume / baseline;
  if (ratio < QUIET_FACTOR) return 'too_quiet';
  if (ratio < STRONG_FACTOR) return 'target';
  if (ratio < LOUD_FACTOR) return 'strong_projection';
  return 'too_loud';
}

export function useVolumeBiofeedback(): UseVolumeBiofeedbackReturn {
  const [volume, setVolume] = useState(0);
  const [rawVolume, setRawVolume] = useState(0);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [timeInTarget, setTimeInTarget] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [avgVolume, setAvgVolume] = useState(0);
  const [maxVolume, setMaxVolume] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [currentZone, setCurrentZone] = useState<VolumeZone>('too_quiet');

  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const baselineRef = useRef(0);
  const smoothedVolumeRef = useRef(0);
  const calibrationSamplesRef = useRef<number[]>([]);
  const calibrationStartRef = useRef(0);
  const sessionStartRef = useRef(0);
  const volumeSumRef = useRef(0);
  const volumeCountRef = useRef(0);
  const maxVolumeRef = useRef(0);
  const targetTimeRef = useRef(0);
  const lastZoneRef = useRef<VolumeZone>('too_quiet');
  const zoneChangeTimeRef = useRef(0);

  // Debounce zone changes (800ms)
  const ZONE_DEBOUNCE_MS = 800;

  const computeRMS = useCallback((): number => {
    if (!analyserRef.current) return 0;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const normalized = dataArray[i] / 255;
      sum += normalized * normalized;
    }
    return Math.min(1, Math.sqrt(sum / dataArray.length) * 2.5);
  }, []);

  const startAnalysis = useCallback(() => {
    intervalRef.current = setInterval(() => {
      const raw = computeRMS();
      setRawVolume(raw);

      // EMA smoothing
      smoothedVolumeRef.current = smoothedVolumeRef.current * (1 - EMA_ALPHA) + raw * EMA_ALPHA;
      const smoothed = smoothedVolumeRef.current;
      setVolume(smoothed);

      // During calibration: collect samples
      if (calibrationStartRef.current > 0) {
        const elapsed = Date.now() - calibrationStartRef.current;
        setCalibrationProgress(Math.min(100, Math.round((elapsed / CALIBRATION_DURATION_MS) * 100)));
        calibrationSamplesRef.current.push(raw);

        if (elapsed >= CALIBRATION_DURATION_MS) {
          // Compute baseline as average of calibration samples
          const samples = calibrationSamplesRef.current;
          const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
          baselineRef.current = Math.max(avg, 0.02); // floor to avoid division issues
          calibrationStartRef.current = 0;
          setIsCalibrating(false);
          setCalibrationProgress(100);
          sessionStartRef.current = Date.now();
          console.log(`[VolumeBiofeedback] Calibrated baseline: ${baselineRef.current.toFixed(3)}`);
        }
        return;
      }

      // Post-calibration: zone classification
      if (baselineRef.current > 0) {
        const zone = classifyZone(smoothed, baselineRef.current);

        // Zone debounce
        const now = Date.now();
        if (zone !== lastZoneRef.current) {
          if (now - zoneChangeTimeRef.current > ZONE_DEBOUNCE_MS) {
            lastZoneRef.current = zone;
            setCurrentZone(zone);
            zoneChangeTimeRef.current = now;
          }
        }

        // Track stats
        volumeSumRef.current += smoothed;
        volumeCountRef.current += 1;
        if (smoothed > maxVolumeRef.current) {
          maxVolumeRef.current = smoothed;
          setMaxVolume(smoothed);
        }
        setAvgVolume(volumeSumRef.current / volumeCountRef.current);

        // Track time in target zone
        if (zone === 'target' || zone === 'strong_projection') {
          targetTimeRef.current += ANALYSIS_INTERVAL_MS / 1000;
          setTimeInTarget(Math.round(targetTimeRef.current * 10) / 10);
        }

        // Total time
        if (sessionStartRef.current > 0) {
          setTotalTime(Math.round((Date.now() - sessionStartRef.current) / 1000));
        }
      }
    }, ANALYSIS_INTERVAL_MS);
  }, [computeRMS]);

  const start = useCallback((stream: MediaStream) => {
    // Setup audio context + analyser
    const AudioCtx = window.AudioContext || (window as (typeof window & { webkitAudioContext: typeof AudioContext })).webkitAudioContext;
    const ctx = new AudioCtx();
    audioContextRef.current = ctx;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.3;
    analyserRef.current = analyser;

    const source = ctx.createMediaStreamSource(stream);
    source.connect(analyser);

    // Reset state
    smoothedVolumeRef.current = 0;
    calibrationSamplesRef.current = [];
    baselineRef.current = 0;
    volumeSumRef.current = 0;
    volumeCountRef.current = 0;
    maxVolumeRef.current = 0;
    targetTimeRef.current = 0;
    lastZoneRef.current = 'too_quiet';
    zoneChangeTimeRef.current = Date.now();

    setVolume(0);
    setRawVolume(0);
    setTimeInTarget(0);
    setTotalTime(0);
    setAvgVolume(0);
    setMaxVolume(0);
    setCurrentZone('too_quiet');
    setCalibrationProgress(0);

    // Start calibration phase
    setIsCalibrating(true);
    calibrationStartRef.current = Date.now();
    setIsActive(true);

    startAnalysis();
  }, [startAnalysis]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setIsActive(false);
    setIsCalibrating(false);
  }, []);

  useEffect(() => {
    return () => { stop(); };
  }, [stop]);

  return {
    volume,
    rawVolume,
    zoneInfo: getZoneInfo(currentZone),
    isCalibrating,
    calibrationProgress,
    timeInTarget,
    totalTime,
    avgVolume,
    maxVolume,
    start,
    stop,
    isActive,
  };
}
