/**
 * DAF (Delayed Auditory Feedback) Hook
 * 
 * Clinical tool used in speech therapy for cluttering treatment.
 * The user hears their own voice with a slight delay (50-200ms),
 * which forces the brain to slow down speech automatically.
 * 
 * Based on clinical research: "l'écoute de la parole avec un feedback 
 * auditif décalé" helps reduce speech rate mechanically.
 */

import { useState, useRef, useCallback, useEffect } from 'react';

interface DAFState {
  isEnabled: boolean;
  delayMs: number;
  isActive: boolean;
}

interface UseDAFReturn {
  isDAFEnabled: boolean;
  isDAFActive: boolean;
  delayMs: number;
  toggleDAF: () => void;
  setDelayMs: (ms: number) => void;
  startDAF: (stream: MediaStream) => Promise<void>;
  stopDAF: () => void;
}

export function useDAF(defaultDelay: number = 100): UseDAFReturn {
  const [state, setState] = useState<DAFState>({
    isEnabled: false,
    delayMs: defaultDelay,
    isActive: false
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const toggleDAF = useCallback(() => {
    setState(prev => ({ ...prev, isEnabled: !prev.isEnabled }));
  }, []);

  const setDelayMs = useCallback((ms: number) => {
    const clampedMs = Math.max(50, Math.min(300, ms));
    setState(prev => ({ ...prev, delayMs: clampedMs }));
    
    // Update delay node in real-time if active
    if (delayNodeRef.current) {
      delayNodeRef.current.delayTime.value = clampedMs / 1000;
    }
  }, []);

  const startDAF = useCallback(async (stream: MediaStream) => {
    if (!state.isEnabled) return;

    try {
      // Create audio context
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioCtx();
      audioContextRef.current = audioContext;

      // Create source from microphone stream
      const source = audioContext.createMediaStreamSource(stream);
      sourceNodeRef.current = source;

      // Create delay node (DAF effect)
      const delayNode = audioContext.createDelay(0.5); // Max 500ms delay
      delayNode.delayTime.value = state.delayMs / 1000;
      delayNodeRef.current = delayNode;

      // Create gain node to control volume
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0.8; // Slightly reduced to avoid feedback
      gainNodeRef.current = gainNode;

      // Connect: Source -> Delay -> Gain -> Output
      source.connect(delayNode);
      delayNode.connect(gainNode);
      gainNode.connect(audioContext.destination);

      setState(prev => ({ ...prev, isActive: true }));
    } catch (error) {
      console.error('Failed to start DAF:', error);
    }
  }, [state.isEnabled, state.delayMs]);

  const stopDAF = useCallback(() => {
    // Disconnect all nodes
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect();
      } catch {}
      sourceNodeRef.current = null;
    }

    if (delayNodeRef.current) {
      try {
        delayNodeRef.current.disconnect();
      } catch {}
      delayNodeRef.current = null;
    }

    if (gainNodeRef.current) {
      try {
        gainNodeRef.current.disconnect();
      } catch {}
      gainNodeRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }

    setState(prev => ({ ...prev, isActive: false }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDAF();
    };
  }, [stopDAF]);

  return {
    isDAFEnabled: state.isEnabled,
    isDAFActive: state.isActive,
    delayMs: state.delayMs,
    toggleDAF,
    setDelayMs,
    startDAF,
    stopDAF
  };
}
