import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, ArrowLeft, Pause, Play, Shuffle, Lightbulb, Target, Mic, Repeat, Volume2, Timer, Gauge, ChevronLeft, ChevronRight, ChevronDown, Lock, Info, AlertTriangle, X, FlaskConical, Map, Settings2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { JOURNEY_STEPS } from "@/data/journeyPath";
import { toast } from "sonner";
import { exerciseCategories, getRandomExercise, getCategoryById, Exercise, ExerciseType } from "@/data/exercises";
import RebusPlayer from "@/components/practice/RebusPlayer";
import RetellingPlayer from "@/components/practice/RetellingPlayer";
import ExerciseIntroModal from "@/components/practice/ExerciseIntroModal";

import { practiceTexts } from "@/data/practiceTexts";
import RecordButton from "@/components/practice/RecordButton";
import DAFToggle from "@/components/practice/DAFToggle";
import BiofeedbackBar from "@/components/practice/BiofeedbackBar";
import SessionResultModal from "@/components/practice/SessionResultModal";
import FillerPill from "@/components/practice/FillerPill";
import { useLimitCheck } from "@/hooks/useLimitCheck";
import { useDAF } from "@/hooks/useDAF";
import { useDeepgramSPS } from "@/hooks/useDeepgramSPS";
import { useGamification } from "@/hooks/useGamification";
import { syllabifySentence, SyllabifiedWord, countSyllablesWord } from "@/lib/syllabify";
import { calculateSafeMaxSPS, spsToWpm } from "@/lib/spsUtils";
import { getNormSPS, getAgeGroupLabel, isAboveSafeThreshold, getAboveNormWarning } from "@/lib/ageNormsUtils";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";


interface SpsDataPoint {
  timestamp: number;
  sps: number;
}

// Target speed presets (SPS = Syllables Per Second) - 6 clinical levels
type TargetSPS = 1.0 | 2.0 | 3.0 | 4.0 | 5.0 | 6.0;

// Function to generate dynamic SPS levels based on user's age norm
const generateExtendedSPSLevels = (userNormSPS: number | null) => {
  const levels = [
    { level: 1, sps: 1.0, label: "Ultra-slow", description: "For phonetic work and extreme articulation. Ideal for rehabilitation.", emoji: "🐌", shortDesc: "Articulation" },
    { level: 2, sps: 2.0, label: "Very slow", description: "Highly controlled pace, like a dictation. Perfect for working on precision.", emoji: "🐢", shortDesc: "Dictation" },
    { level: 3, sps: 3.0, label: "Slow", description: "Relaxed and comfortable pace. Good for starting out.", emoji: "🎯", shortDesc: "Relaxed" },
    { level: 4, sps: 4.0, label: "Moderate", description: "Natural conversational speed. This is the everyday pace.", emoji: "💬", shortDesc: "Conversational" },
    { level: 5, sps: 5.0, label: "Fast", description: "Sustained pace, like a dynamic presentation. More challenging.", emoji: "⚡", shortDesc: "Dynamic" },
    { level: 6, sps: 6.0, label: "Challenge", description: "High speed to test your limits. Reserved for the most experienced.", emoji: "🏃", shortDesc: "Expert" },
  ];
  
  // Mark the level closest to user's norm as recommended
  return levels.map(level => ({
    ...level,
    recommended: userNormSPS ? Math.abs(level.sps - userNormSPS) < 0.5 : level.sps === 4.0,
    isUserNorm: userNormSPS ? Math.abs(level.sps - userNormSPS) < 0.5 : false
  }));
};

const Practice = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("category");
  const journeyStepParam = searchParams.get("journey_step");
  const journeyStep = journeyStepParam !== null ? parseInt(journeyStepParam, 10) : null;
  const assignmentId = searchParams.get("assignment");
  const { isPremium, isTherapist, linkedTherapistValid } = useLimitCheck();
  const [dismissedTestBanner, setDismissedTestBanner] = useState(false);
  // Patient has full access if premium OR therapist OR linked to valid therapist
  const effectivePremium = isPremium || isTherapist || linkedTherapistValid;
  const { isDAFEnabled, isDAFActive, delayMs, toggleDAF, setDelayMs, startDAF, stopDAF } = useDAF(100);
  
  // Deepgram real-time SPS
  const deepgram = useDeepgramSPS();
  
  // Gamification hook for streak/goal tracking
  const gamification = useGamification();
  
  // User's birth year for age-based calibration
  const [userBirthYear, setUserBirthYear] = useState<number | null>(null);
  const userNormSPS = getNormSPS(userBirthYear);
  const userAgeGroup = getAgeGroupLabel(userBirthYear);
  
  // Dynamic SPS levels based on user's age norm
  const EXTENDED_SPS_LEVELS = generateExtendedSPSLevels(userBirthYear ? userNormSPS : null);
  
  const [targetSPS, setTargetSPS] = useState<TargetSPS>(4.0);
  const [showAllLevels, setShowAllLevels] = useState(false);
  
  // Advanced settings collapsed by default for beginners
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Filler word detection toggle
  const [detectFillers, setDetectFillers] = useState(true);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [saving, setSaving] = useState(false);
  const [sessionSpsHistory, setSessionSpsHistory] = useState<number[]>([]);
  const [showTip, setShowTip] = useState(false);
  
  // Chain mode state (for warmup & articulation categories)
  const [chainMode, setChainMode] = useState(false);
  const [chainItemCount, setChainItemCount] = useState(0);
  const [chainCountdown, setChainCountdown] = useState<number | null>(null);
  const chainCountdownRef = useRef<NodeJS.Timeout | null>(null);
  
  // Result modal state
  const [showResultModal, setShowResultModal] = useState(false);
  const [sessionResults, setSessionResults] = useState<{
    avgSps: number;
    maxSps: number;
    duration: number;
    syllableCount: number;
    wordCount: number;
    sessionId: string;
    fillerCount: number;
    fillerDetails: Record<string, number>;
    actualSpeakingTime: number;
    totalSessionTime: number;
    streakIncremented?: boolean;
    goalJustCompleted?: boolean;
    wasRebus?: boolean;
    frozenTargetSps: number;
  } | null>(null);
  
  
  // Exercise state
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentCategory, setCurrentCategory] = useState(getCategoryById(categoryId || ""));
  const [fallbackTextIndex, setFallbackTextIndex] = useState(0);
  
  
  // Guided mode (Karaoke) state
  type PacingMode = 'libre' | 'guided' | 'syllabic';
  const [pacingMode, setPacingMode] = useState<PacingMode>('guided');
  const [highlightedWordIndex, setHighlightedWordIndex] = useState(-1);
  const [highlightedSyllableIndex, setHighlightedSyllableIndex] = useState(-1);
  const [isPausingBreath, setIsPausingBreath] = useState(false);
  const [rebusCountdown, setRebusCountdown] = useState<number | null>(null);
  const [syllabifiedText, setSyllabifiedText] = useState<SyllabifiedWord[]>([]);
  const karaokeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const karaokeAbortRef = useRef(false);
  const pendingPauseTimeouts = useRef<NodeJS.Timeout[]>([]);
  const targetSPSRef = useRef(targetSPS);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const wpmSamplerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch user's birth year for calibration
  useEffect(() => {
    const fetchBirthYear = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("profiles")
        .select("birth_year")
        .eq("id", user.id)
        .maybeSingle();
      
      if (data?.birth_year) {
        setUserBirthYear(data.birth_year);
        // Set initial target SPS to closest level to user's norm
        const norm = getNormSPS(data.birth_year);
        const closestLevel = [1, 2, 3, 4, 5, 6].reduce((prev, curr) => 
          Math.abs(curr - norm) < Math.abs(prev - norm) ? curr : prev
        );
        setTargetSPS(closestLevel as TargetSPS);
      }
    };
    
    fetchBirthYear();
  }, [user]);

  // Initialize exercise based on category + optional exercise param
  useEffect(() => {
    if (categoryId) {
      const category = getCategoryById(categoryId);
      setCurrentCategory(category);
      if (category && category.exercises.length > 0) {
        const exerciseParam = searchParams.get("exercise");
        const targetExercise = exerciseParam
          ? category.exercises.find((e) => e.id === exerciseParam)
          : null;
        const targetIndex = targetExercise
          ? category.exercises.indexOf(targetExercise)
          : 0;
        setCurrentExercise(category.exercises[targetIndex]);
        setCurrentExerciseIndex(targetIndex);
      }
    }
  }, [categoryId]);

  // Navigation functions for exercises
  const goToPreviousExercise = () => {
    if (!currentCategory || isRecording) return;
    let newIndex = currentExerciseIndex > 0 
      ? currentExerciseIndex - 1 
      : currentCategory.exercises.length - 1;
    
    
    setCurrentExerciseIndex(newIndex);
    setCurrentExercise(currentCategory.exercises[newIndex]);
    toast.success(`Exercise ${newIndex + 1}/${currentCategory.exercises.length}`);
  };

  const goToNextExercise = () => {
    if (!currentCategory) return;
    // Allow navigation during recording only in chain mode
    if (isRecording && !chainMode) return;
    if (!isRecording && isRecording) return; // safety
    
    const newIndex = currentExerciseIndex < currentCategory.exercises.length - 1 
      ? currentExerciseIndex + 1 
      : 0;
    
    setCurrentExerciseIndex(newIndex);
    setCurrentExercise(currentCategory.exercises[newIndex]);
    
    if (isRecording && chainMode) {
      setChainItemCount(prev => prev + 1);
      toast.success(`Item ${newIndex + 1}/${currentCategory.exercises.length}`, { duration: 1500 });
    } else {
      toast.success(`Exercise ${newIndex + 1}/${currentCategory.exercises.length}`);
    }
  };

  // Chain mode: advance to next item with optional auto-advance countdown
  const chainNextItem = useCallback(() => {
    if (!currentCategory || !isRecording || !chainMode) return;
    
    const isLastItem = currentExerciseIndex >= currentCategory.exercises.length - 1;
    if (isLastItem) {
      // Last item reached — stop recording
      toast.success("Last item — end of sequence!", { duration: 2000 });
      stopRecording();
      return;
    }
    
    // Start 3s countdown then auto-advance
    setChainCountdown(3);
    let count = 3;
    chainCountdownRef.current = setInterval(() => {
      count--;
      if (count <= 0) {
        if (chainCountdownRef.current) clearInterval(chainCountdownRef.current);
        setChainCountdown(null);
        deepgram.addPauseOffset(3000); // Exclude countdown from SPS calculation
        goToNextExercise();
      } else {
        setChainCountdown(count);
      }
    }, 1000);
  }, [currentCategory, isRecording, chainMode, currentExerciseIndex]);

  // Skip countdown and advance immediately
  const chainSkipCountdown = useCallback(() => {
    if (chainCountdownRef.current) clearInterval(chainCountdownRef.current);
    setChainCountdown(null);
    goToNextExercise();
  }, []);

  // Syllabify text when exercise changes
  useEffect(() => {
    const text = getCurrentText().replace(/\[pause\]/gi, '');
    setSyllabifiedText(syllabifySentence(text));
  }, [currentExercise, fallbackTextIndex]);

  // Get current text and tip
  const getCurrentText = () => {
    if (currentExercise) {
      return currentExercise.text;
    }
    return practiceTexts[fallbackTextIndex]?.text || "No text available.";
  };

  const getCurrentTip = () => {
    if (currentExercise) {
      return currentExercise.tip;
    }
    return "Breathe deeply and speak calmly.";
  };

  // Get exercise type
  const getExerciseType = (): ExerciseType => {
    if (currentExercise?.type) return currentExercise.type;
    if (currentCategory?.type) return currentCategory.type;
    return 'reading';
  };

  const exerciseType = getExerciseType();
  const isImprovisation = exerciseType === 'improvisation';
  const isRepetition = exerciseType === 'repetition';
  const isWarmup = exerciseType === 'warmup';
  const isProprioception = exerciseType === 'proprioception';
  const isRetelling = exerciseType === 'retelling';
  const isRebus = currentExercise?.content_type === 'rebus' && !!currentExercise?.rebusContent;

  // No more manual smoothing — deepgram.packetSPS handles it natively

  const showProTip = () => {
    setShowTip(true);
    setTimeout(() => setShowTip(false), 4000);
  };

  // Keep targetSPS ref in sync
  useEffect(() => {
    targetSPSRef.current = targetSPS;
  }, [targetSPS]);

  // Articulation difficulty factor: slows syllabic pacing for tongue twisters
  const ARTICULATION_DIFFICULTY_FACTOR = 1.4;
  
  // Comfort factor: slows karaoke pacing to match measured articulation rate
  // (SPS = articulation rate excluding pauses, so karaoke must pace slower to compensate)
  const getComfortFactor = useCallback((sps: number) => {
    if (sps >= 6) return 1.08;
    if (sps >= 5) return 1.12;
    if (sps <= 3) return 1.30;
    // Linear interpolation between 3 and 5 SPS
    return 1.30 - ((sps - 3) / 2) * 0.18;
  }, []);

  // Calculate interval for a specific word based on its syllable count
  const getWordInterval = useCallback((word?: string) => {
    const sps = targetSPSRef.current;
    const comfort = getComfortFactor(sps);
    const baseIntervalPerSyllable = Math.round((1000 / sps) * comfort);
    if (!word) {
      return Math.round(baseIntervalPerSyllable * 1.8);
    }
    const syllableCount = countSyllablesWord(word.replace(/[,;:.!?…⏸️]/g, ''));
    return baseIntervalPerSyllable * Math.max(1, syllableCount);
  }, [getComfortFactor]);

  const getSyllableInterval = useCallback(() => {
    const sps = targetSPSRef.current;
    let interval = Math.round((1000 / sps) * getComfortFactor(sps));
    // Apply articulation difficulty factor for virelangues (syllabic mode only)
    if (categoryId === 'articulation') {
      interval = Math.round(interval * ARTICULATION_DIFFICULTY_FACTOR);
    }
    return interval;
  }, [getComfortFactor, categoryId]);

  // Sample SPS every second for history
  const packetSPSRef = useRef(deepgram.packetSPS);
  packetSPSRef.current = deepgram.packetSPS;

  useEffect(() => {
    if (isRecording && !isPaused) {
      wpmSamplerRef.current = setInterval(() => {
        if (packetSPSRef.current > 0) {
          setSessionSpsHistory(prev => [...prev, packetSPSRef.current]);
        }
      }, 1000);
    } else {
      if (wpmSamplerRef.current) {
        clearInterval(wpmSamplerRef.current);
        wpmSamplerRef.current = null;
      }
    }
    
    return () => {
      if (wpmSamplerRef.current) {
        clearInterval(wpmSamplerRef.current);
      }
    };
  }, [isRecording, isPaused]);

  const startRecording = async () => {
    showProTip();
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioCtx();
      await audioContext.resume(); // Critical for Safari
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      
      // Start Deepgram real-time transcription (non-blocking: recording works even if Deepgram fails)
      try {
        await deepgram.start(stream, { detectFillers });
      } catch (deepgramError) {
        console.warn('Deepgram unavailable, recording without real-time analysis:', deepgramError);
        toast.info("Recording without real-time analysis — the exercise works normally.", { duration: 4000 });
      }
      
      // Start DAF if enabled (silently, no toast)
      if (isDAFEnabled) {
        try {
          await startDAF(stream);
        } catch (dafError) {
          console.warn('DAF unavailable:', dafError);
        }
      }
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.start(1000);
      
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setElapsedTime(elapsed);
        }
      }, 1000);
      
      setIsRecording(true);
      setIsPaused(false);
      setSessionSpsHistory([]);
      if (chainMode) setChainItemCount(1); // First item
    } catch (error) {
      // Only mic permission errors should fully block recording
      try {
        streamRef.current?.getTracks().forEach((track) => track.stop());
      } catch {
        // ignore
      }
      streamRef.current = null;

      const msg = error instanceof Error ? error.message : "Unable to access the microphone";
      toast.error(msg);
    }
  };

  const pausedElapsedRef = useRef(0);
  
  const togglePause = () => {
    if (isPaused) {
      // Resume: restart timer from where we left off
      mediaRecorderRef.current?.resume();
      startTimeRef.current = Date.now() - pausedElapsedRef.current * 1000;
      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setElapsedTime(elapsed);
        }
      }, 1000);
      setIsPaused(false);
    } else {
      // Pause: freeze the timer
      mediaRecorderRef.current?.pause();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      pausedElapsedRef.current = elapsedTime;
      setIsPaused(true);
    }
  };

  const stopRecording = async () => {
    setSaving(true);
    
    // Stop all timers
    if (timerRef.current) clearInterval(timerRef.current);
    if (wpmSamplerRef.current) clearInterval(wpmSamplerRef.current);
    
    // Stop Deepgram
    deepgram.stop();
    
    // Stop chain countdown if running
    if (chainCountdownRef.current) {
      clearInterval(chainCountdownRef.current);
      chainCountdownRef.current = null;
    }
    setChainCountdown(null);
    
    // Stop DAF
    stopDAF();
    
    mediaRecorderRef.current?.stop();
    
    await new Promise(resolve => setTimeout(resolve, 500));
    streamRef.current?.getTracks().forEach(track => track.stop());
    
    // Calculate real stats with spike protection (in SPS)
    const realAvgSps = sessionSpsHistory.length > 0
      ? Math.round((sessionSpsHistory.reduce((a, b) => a + b, 0) / sessionSpsHistory.length) * 10) / 10
      : 0;
    const realMaxSps = calculateSafeMaxSPS(sessionSpsHistory);
    
    // Convert to WPM for database compatibility
    const avgWpmForDB = spsToWpm(realAvgSps);
    const maxWpmForDB = spsToWpm(realMaxSps);
    const targetWpmForDB = spsToWpm(targetSPS);
    
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      
      let fileName: string | null = null;
      
      if (audioBlob.size > 0) {
        fileName = `${user?.id}/${Date.now()}.webm`;
        const { error: uploadError } = await supabase.storage.from("recordings").upload(fileName, audioBlob);
        if (uploadError) {
          console.error("Audio upload error:", uploadError);
          fileName = null;
        }
      }
      
      // Convert SPS history to WPM for database format (backward compatibility)
      const wpmData = sessionSpsHistory.map((sps, index) => ({
        timestamp: index,
        wpm: spsToWpm(sps)
      }));
      
      // Build notes for chain mode
      const chainNotes = chainMode && chainItemCount > 1
        ? `Chain: ${chainItemCount} items`
        : null;
      
      const { data: session, error: dbError } = await supabase
        .from("sessions")
        .insert([{ 
          user_id: user?.id as string, 
          duration_seconds: elapsedTime, 
          avg_wpm: avgWpmForDB,
          max_wpm: maxWpmForDB, 
          target_wpm: targetWpmForDB,
          recording_url: fileName, 
          wpm_data: wpmData as unknown as ReturnType<typeof JSON.parse>,
          exercise_type: isImprovisation ? 'improvisation' : isRepetition ? 'repetition' : isWarmup ? 'warmup' : 'reading',
          word_timestamps: deepgram.getWordTimestamps() as unknown as ReturnType<typeof JSON.parse>,
          notes: chainNotes,
        }])
        .select()
        .single();
      
      if (dbError) throw dbError;
      
      // Mark assignment as completed if this was a homework exercise
      if (assignmentId) {
        await supabase
          .from("assignments")
          .update({ 
            status: "completed", 
            completed_at: new Date().toISOString(),
            completed_session_id: session.id 
          })
          .eq("id", assignmentId);
        
        toast.success("Assignment completed! 🎉");
      }
      
      // Save filler data to localStorage
      if (detectFillers && deepgram.fillerCount > 0) {
        localStorage.setItem(`session_fillers_${session.id}`, JSON.stringify({
          fillerCount: deepgram.fillerCount,
          fillerDetails: deepgram.fillerDetails
        }));
      }
      
      // Update gamification (streak + daily goal)
      const gamificationResult = await gamification.updateAfterSession(elapsedTime);
      
      // Check if this is the user's first session ever and send "First Win" email
      const { count: sessionCount } = await supabase
        .from("sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id);
      
      if (sessionCount === 1) {
        // Fire and forget - don't block the UI
        supabase.functions.invoke('notify-first-win', {
          body: {
            userId: user?.id,
            sessionCount: 1,
          },
        }).then((result) => {
          if (result.error) {
            console.error('Failed to send first win email:', result.error);
          } else {
            console.log('First win email triggered');
          }
        }).catch((err) => {
          console.error('Error calling notify-first-win:', err);
        });
      }
      
      // Set results and show modal (in SPS)
      setSessionResults({
        avgSps: realAvgSps,
        maxSps: realMaxSps,
        duration: elapsedTime,
        syllableCount: deepgram.syllableCount,
        wordCount: deepgram.wordCount,
        sessionId: session.id,
        fillerCount: deepgram.fillerCount,
        fillerDetails: deepgram.fillerDetails,
        actualSpeakingTime: deepgram.actualSpeakingTime,
        totalSessionTime: elapsedTime,
        streakIncremented: gamificationResult.streakIncremented,
        goalJustCompleted: gamificationResult.goalJustCompleted,
        wasRebus: isRebus,
        frozenTargetSps: targetSPS,
      });
      
      setShowResultModal(true);
      setIsRecording(false);
      setSaving(false);
      
    } catch (error) {
      toast.error("Error saving session");
      setSaving(false);
    }
  };

  const handleRetry = () => {
    setShowResultModal(false);
    setSessionResults(null);
    setElapsedTime(0);
    deepgram.reset();
    setSessionSpsHistory([]);
  };

  const handleContinue = () => {
    setShowResultModal(false);
    if (sessionResults?.sessionId) {
      navigate(`/session/${sessionResults.sessionId}`);
    } else {
      navigate("/dashboard");
    }
  };

  const shuffleText = () => {
    if (categoryId && currentCategory) {
      const newExercise = getRandomExercise(categoryId);
      setCurrentExercise(newExercise);
      toast.success("New text loaded!");
    } else {
      setFallbackTextIndex((prev) => (prev + 1) % practiceTexts.length);
      toast.success("New text loaded!");
    }
  };

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

  // Start pacing mode (karaoke or syllabic)
  const startPacingMode = useCallback(() => {
    if (pacingMode === 'libre') return;
    
    // Reset abort flag
    karaokeAbortRef.current = false;
    
    if (pacingMode === 'guided') {
      setHighlightedWordIndex(0);
      setHighlightedSyllableIndex(-1);
      
      // Rebus mode: pace through segments
      if (isRebus && currentExercise?.rebusContent) {
        const segments = currentExercise.rebusContent;
        let currentIndex = 0;
        
        const scheduleNextSegment = () => {
          if (karaokeAbortRef.current) return;
          const segmentInterval = getWordInterval() * 2;
          const seg = segments[currentIndex];
          
          const tid = setTimeout(() => {
            if (karaokeAbortRef.current) return;
            if (seg?.pause_after && currentIndex < segments.length - 1) {
              setHighlightedWordIndex(-1);
              const pid = setTimeout(() => {
                if (karaokeAbortRef.current) return;
                currentIndex++;
            if (currentIndex >= segments.length) {
                  // End of sequence: countdown 3…2…1 then restart
                  setHighlightedWordIndex(-1);
                  setRebusCountdown(3);
                  const c2 = setTimeout(() => { if (!karaokeAbortRef.current) setRebusCountdown(2); }, 1000);
                  const c1 = setTimeout(() => { if (!karaokeAbortRef.current) setRebusCountdown(1); }, 2000);
                  const restartPid = setTimeout(() => {
                    if (karaokeAbortRef.current) return;
                    setRebusCountdown(null);
                    deepgram.addPauseOffset(3000); // Exclude countdown from SPS calculation
                    currentIndex = 0;
                    setHighlightedWordIndex(currentIndex);
                    scheduleNextSegment();
                  }, 3000);
                  pendingPauseTimeouts.current.push(c2 as unknown as NodeJS.Timeout, c1 as unknown as NodeJS.Timeout, restartPid as unknown as NodeJS.Timeout);
                  return;
                }
                setHighlightedWordIndex(currentIndex);
                scheduleNextSegment();
              }, 600);
              pendingPauseTimeouts.current.push(pid as unknown as NodeJS.Timeout);
            } else {
              currentIndex++;
              if (currentIndex >= segments.length) {
                // End of sequence: countdown 3…2…1 then restart
                setHighlightedWordIndex(-1);
                setRebusCountdown(3);
                const c2 = setTimeout(() => { if (!karaokeAbortRef.current) setRebusCountdown(2); }, 1000);
                const c1 = setTimeout(() => { if (!karaokeAbortRef.current) setRebusCountdown(1); }, 2000);
                const restartPid = setTimeout(() => {
                  if (karaokeAbortRef.current) return;
                  setRebusCountdown(null);
                  deepgram.addPauseOffset(3000); // Exclude countdown from SPS calculation
                  currentIndex = 0;
                  setHighlightedWordIndex(currentIndex);
                  scheduleNextSegment();
                }, 3000);
                pendingPauseTimeouts.current.push(c2 as unknown as NodeJS.Timeout, c1 as unknown as NodeJS.Timeout, restartPid as unknown as NodeJS.Timeout);
                return;
              }
              setHighlightedWordIndex(currentIndex);
              scheduleNextSegment();
            }
          }, segmentInterval) as unknown as NodeJS.Timeout;
          karaokeIntervalRef.current = tid;
        };
        
        scheduleNextSegment();
        return;
      }
      
      // Text mode: pace through words with variable timing per syllable count
      const words = getCurrentText().replace(/\[pause\]/gi, '').split(/\s+/).filter(w => w.length > 0);
      let currentIndex = 0;
      // Counter for breath-group pauses at slow speeds (no punctuation needed)
      let wordsSinceLastPause = 0;
      
      // Adaptive pause scaling: longer pauses at slower speeds
      const getPauseScaleFactor = (sps: number) => {
        if (sps <= 1.5) return 2.0;
        if (sps <= 2.0) return 1.7;
        if (sps <= 2.5) return 1.4;
        if (sps <= 3.0) return 1.2;
        return 1.0;
      };
      
      // Breath-group interval: inject pauses every N words at slow speeds
      const getBreathGroupSize = (sps: number) => {
        if (sps <= 1.5) return 3;
        if (sps <= 2.0) return 4;
        if (sps <= 2.5) return 5;
        if (sps <= 3.0) return 6;
        return 0; // No auto-pauses above 3 SPS
      };
      
      const scheduleNextWord = () => {
        if (karaokeAbortRef.current) return;
        const currentWord = words[currentIndex];
        if (!currentWord) return;
        const sps = targetSPSRef.current;
        const pauseScale = getPauseScaleFactor(sps);
        const breathGroupSize = getBreathGroupSize(sps);
        
        const hasShortPause = /[,;⏸️]/.test(currentWord);
        const hasLongPause = /[.!?…]/.test(currentWord);
        const hasPunctPause = hasShortPause || hasLongPause;
        
        // Check if we should insert an automatic breath-group pause
        wordsSinceLastPause++;
        const needsBreathPause = !hasPunctPause && breathGroupSize > 0 && wordsSinceLastPause >= breathGroupSize;
        
        const hasPause = hasPunctPause || needsBreathPause;
        const wordDuration = getWordInterval(currentWord);
        
        // Clinical pause durations scaled by speed factor
        // Breath-group pauses are shorter than punctuation pauses (400ms base)
        const basePauseDuration = hasLongPause ? 900 : hasShortPause ? 600 : needsBreathPause ? 400 : 0;
        const pauseDuration = Math.round(basePauseDuration * pauseScale);
        
        if (hasPause) wordsSinceLastPause = 0;
        
        const tid = setTimeout(() => {
          if (karaokeAbortRef.current) return;
          if (hasPause) {
            // Keep word highlighted + show breathing state during pause
            setIsPausingBreath(true);
            const pid = setTimeout(() => {
              if (karaokeAbortRef.current) return;
              setIsPausingBreath(false);
              currentIndex++;
              if (currentIndex >= words.length) currentIndex = 0;
              setHighlightedWordIndex(currentIndex);
              scheduleNextWord();
            }, pauseDuration);
            pendingPauseTimeouts.current.push(pid as unknown as NodeJS.Timeout);
          } else {
            currentIndex++;
            if (currentIndex >= words.length) currentIndex = 0;
            setHighlightedWordIndex(currentIndex);
            scheduleNextWord();
          }
        }, wordDuration) as unknown as NodeJS.Timeout;
        karaokeIntervalRef.current = tid;
      };
      
      scheduleNextWord();
      return;
    }
    
    if (pacingMode === 'syllabic') {
      setHighlightedWordIndex(0);
      setHighlightedSyllableIndex(0);
      
      let currentWordIdx = 0;
      let currentSylIdx = 0;
      
      const words = syllabifiedText.filter(w => !w.isPunctuation);
      if (words.length === 0) return;
      
      const scheduleNextSyllable = () => {
        if (karaokeAbortRef.current) return;
        if (words.length === 0) return;
        
        const currentWord = words[currentWordIdx];
        if (!currentWord) return;
        
        // Calculate dynamic interval based on real syllable count vs visual segments
        const realCount = countSyllablesWord(currentWord.original);
        const visualCount = currentWord.syllables.length;
        let totalWordTime = realCount * (1000 / targetSPSRef.current) * getComfortFactor(targetSPSRef.current);
        // Apply articulation difficulty factor for virelangues in syllabic mode
        if (categoryId === 'articulation') {
          totalWordTime *= ARTICULATION_DIFFICULTY_FACTOR;
        }
        const perVisualSyllable = Math.round(totalWordTime / visualCount);
        
        const isLastSyllable = currentSylIdx === currentWord.syllables.length - 1;
        const lastSyl = currentWord.syllables[currentWord.syllables.length - 1];
        const hasPause = isLastSyllable && /[,;:.!?…⏸️]/.test(lastSyl);
        
        const advanceToNext = () => {
          if (karaokeAbortRef.current) return;
          currentSylIdx++;
          if (currentSylIdx >= currentWord.syllables.length) {
            currentSylIdx = 0;
            currentWordIdx++;
            if (currentWordIdx >= words.length) {
              currentWordIdx = 0;
            }
          }
          setHighlightedWordIndex(currentWordIdx);
          setHighlightedSyllableIndex(currentSylIdx);
          scheduleNextSyllable();
        };
        
        if (hasPause) {
          // Add clinical pause scaled by speed
          const sps = targetSPSRef.current;
          const pauseScale = sps <= 1.5 ? 2.0 : sps <= 2.0 ? 1.7 : sps <= 2.5 ? 1.4 : sps <= 3.0 ? 1.2 : 1.0;
          const scaledPause = Math.round(500 * pauseScale);
          const tid = setTimeout(() => {
            advanceToNext();
          }, perVisualSyllable + scaledPause) as unknown as NodeJS.Timeout;
          pendingPauseTimeouts.current.push(tid);
        } else {
          const tid = setTimeout(() => {
            advanceToNext();
          }, perVisualSyllable) as unknown as NodeJS.Timeout;
          karaokeIntervalRef.current = tid;
        }
      };
      
      scheduleNextSyllable();
    }
  }, [pacingMode, syllabifiedText, currentExercise, fallbackTextIndex, getWordInterval, getSyllableInterval]);

  const stopPacingMode = useCallback(() => {
    karaokeAbortRef.current = true;
    if (karaokeIntervalRef.current) {
      clearTimeout(karaokeIntervalRef.current);
      clearInterval(karaokeIntervalRef.current);
      karaokeIntervalRef.current = null;
    }
    // Clear all pending pause timeouts
    pendingPauseTimeouts.current.forEach(tid => clearTimeout(tid));
    pendingPauseTimeouts.current = [];
    setHighlightedWordIndex(-1);
    setHighlightedSyllableIndex(-1);
    setIsPausingBreath(false);
  }, []);

  // Effect to manage pacing mode with recording state
  useEffect(() => {
    if (isRecording && !isPaused && pacingMode !== 'libre') {
      stopPacingMode();
      startPacingMode();
    } else {
      stopPacingMode();
    }
    return () => stopPacingMode();
  }, [isRecording, isPaused, pacingMode, startPacingMode, stopPacingMode]);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-secondary via-background to-accent/30 ${isRecording ? 'pb-24' : ''}`}>
      {/* Exercise intro modal — shown once per category */}
      <ExerciseIntroModal categoryId={categoryId} onDismiss={() => {}} />
      {/* Fixed Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(journeyStep !== null ? "/dashboard" : categoryId ? "/library" : "/dashboard")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors min-w-[60px]">
            <ArrowLeft className="w-5 h-5" /><span className="hidden sm:inline">{journeyStep !== null ? "Journey" : "Back"}</span>
          </button>
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-2">
              {journeyStep !== null && JOURNEY_STEPS[journeyStep] ? (
                <>
                  <span className="text-base">{JOURNEY_STEPS[journeyStep].icon}</span>
                  <span className="font-display font-bold text-sm sm:text-base">
                    Step {journeyStep + 1} · {JOURNEY_STEPS[journeyStep].title}
                  </span>
                </>
              ) : (
                <>
                  <Activity className="w-5 h-5 text-primary" />
                  <span className="font-display font-bold text-sm sm:text-base">
                    {currentCategory ? currentCategory.title : "Free session"}
                  </span>
                </>
              )}
            </div>
            {/* Journey mini progress dots */}
            {journeyStep !== null && JOURNEY_STEPS[journeyStep] && (
              <div className="flex gap-1">
                {JOURNEY_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-colors ${
                      i < journeyStep! ? "w-3 bg-primary" : i === journeyStep ? "w-5 bg-primary" : "w-3 bg-border"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold tabular-nums min-w-[60px] text-right">{formatTime(elapsedTime)}</div>
        </div>
      </header>

      {/* Retelling Mode: completely separate UI */}
      {isRetelling && currentExercise ? (
        <div className="container mx-auto px-4 py-4 max-w-3xl">
          {/* Exercise navigation header */}
          {currentCategory && currentCategory.exercises.length > 1 && (
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPreviousExercise}
                className="h-10 w-10 rounded-full hover:bg-primary/10"
                title="Previous exercise"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="text-center">
                <p className="text-sm font-medium">{currentExercise.title}</p>
                <p className="text-xs text-muted-foreground">{currentExerciseIndex + 1} / {currentCategory.exercises.length}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNextExercise}
                className="h-10 w-10 rounded-full hover:bg-primary/10"
                title="Next exercise"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}
          <RetellingPlayer
            key={currentExercise.id}
            exercise={currentExercise}
            onBack={() => navigate("/library")}
          />
        </div>
      ) : (
      <>
      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 max-w-3xl">
        {/* Therapist test mode banner */}
        {isTherapist && !dismissedTestBanner && (
          <div className="flex items-start gap-3 p-3 mb-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-sm">
            <FlaskConical className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-blue-700 dark:text-blue-300">Discovery mode</p>
              <p className="text-blue-600/80 dark:text-blue-400/80 text-xs mt-0.5">
                You are testing as an SLP. This session will not be linked to a patient. To record in a patient's file, they must log in with their own account.
              </p>
            </div>
            <button onClick={() => setDismissedTestBanner(true)} className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {/* Navigation arrows wrapper */}
        <div className="flex items-start gap-2">
          {/* Left Navigation Arrow */}
          {currentCategory && currentCategory.exercises.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPreviousExercise}
              disabled={isRecording}
              className="mt-20 h-12 w-12 rounded-full hover:bg-primary/10 flex-shrink-0"
              title="Previous exercise"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          )}
          
          <Card className="flex-1">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {currentCategory && (
                    <span className="text-xl">{currentCategory.icon}</span>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {currentCategory ? currentCategory.title : `Text ${fallbackTextIndex + 1}/${practiceTexts.length}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Pacing Mode Selector */}
                  {!isImprovisation && !isRepetition && !isWarmup && !isProprioception && (
                    <div className="flex items-center bg-muted rounded-lg p-0.5 border border-border">
                      <button
                        type="button"
                        onClick={() => setPacingMode('libre')}
                        disabled={isRecording}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                          pacingMode === 'libre'
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        } disabled:opacity-50`}
                      >
                        Free
                      </button>
                      <button
                        type="button"
                        onClick={() => setPacingMode('guided')}
                        disabled={isRecording}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                          pacingMode === 'guided'
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        } disabled:opacity-50`}
                      >
                        Guided
                      </button>
                      {!isRebus && (
                        <button
                          type="button"
                          onClick={() => setPacingMode('syllabic')}
                          disabled={isRecording}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                            pacingMode === 'syllabic'
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          } disabled:opacity-50`}
                        >
                          Syl.
                        </button>
                      )}
                    </div>
                  )}
                  
                  <Button variant="ghost" size="sm" onClick={shuffleText} disabled={isRecording} className="gap-1 h-8 px-2">
                    <Shuffle className="w-3 h-3" />
                    <span className="hidden sm:inline text-xs">🎲 Random</span>
                  </Button>
                </div>
              </div>
              

              {/* Main Instruction Banner */}
              {!isRecording && (
                <div className={`mb-4 p-4 rounded-xl border ${
                  isImprovisation 
                    ? 'bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20 border-pink-300 dark:border-pink-700'
                    : isRepetition
                    ? 'bg-gradient-to-r from-cyan-100 to-teal-100 dark:from-cyan-900/20 dark:to-teal-900/20 border-cyan-300 dark:border-cyan-700'
                    : isWarmup
                    ? 'bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-300 dark:border-orange-700'
                    : pacingMode === 'syllabic'
                    ? 'bg-gradient-to-r from-purple-100 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-300 dark:border-purple-700'
                    : 'bg-gradient-to-r from-primary/10 to-accent/20 border-primary/20'
                }`}>
                  {isProprioception ? (
                    <p className="text-sm font-medium text-center text-indigo-800 dark:text-indigo-200">
                      🎧 <strong>Self-Monitoring:</strong> Speak about the topic below.
                      <br />
                      <span className="text-indigo-600 dark:text-indigo-400">No feedback during the exercise — results appear at the end.</span>
                    </p>
                  ) : isImprovisation ? (
                    <p className="text-sm font-medium text-center text-pink-800 dark:text-pink-200">
                      🎤 <strong>Instructions:</strong> Speak freely about the displayed topic. No text to read!
                    </p>
                  ) : isRepetition ? (
                    <p className="text-sm font-medium text-center text-cyan-800 dark:text-cyan-200">
                      ⚡ <strong>Instructions:</strong> Repeat the syllables in a regular and controlled manner.
                    </p>
                  ) : isWarmup ? (
                    <p className="text-sm font-medium text-center text-orange-800 dark:text-orange-200">
                      🏋️ <strong>Instructions:</strong> Exaggerate the articulation of each syllable.
                    </p>
                  ) : isRebus && pacingMode === 'libre' ? (
                    <p className="text-sm font-medium text-center">
                      🖼️ <strong>Free Mode:</strong> Listen first, then repeat at your own pace! 🎤
                    </p>
                  ) : isRebus && pacingMode === 'guided' ? (
                    <p className="text-sm font-medium text-center">
                      🖼️ <strong>Guided Mode:</strong> Follow the images lighting up one by one. Speak when it's your turn!
                    </p>
                  ) : pacingMode === 'libre' ? (
                    <p className="text-sm font-medium text-center">
                      📖 <strong>Free Mode:</strong> Read at your own pace. Click Stop when you're done.
                    </p>
                  ) : pacingMode === 'syllabic' ? (
                    <p className="text-sm font-medium text-center text-purple-800 dark:text-purple-200">
                      🔤 <strong>Syllabic Mode:</strong> Follow the rhythm syllable by syllable. Respect the pauses ⏸️.
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-center">
                      🎯 <strong>Guided Mode:</strong> Follow the <strong>blue highlighter</strong> word by word.
                      <br />
                      <span className="text-muted-foreground">Make a clear pause at each ⏸️ icon</span>
                    </p>
                  )}
                </div>
              )}
              
              {/* Content Display */}
              {isRebus && currentExercise?.rebusContent ? (
                <RebusPlayer
                  segments={currentExercise.rebusContent}
                  title={currentExercise.title}
                  highlightedIndex={isRecording && pacingMode === 'guided' ? highlightedWordIndex : null}
                  isRecording={isRecording}
                  countdown={rebusCountdown}
                />
              ) : isProprioception ? (
                <div className="text-center py-6">
                  {/* Theme display for proprioception */}
                  <div className="inline-block p-6 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 border-2 border-indigo-200 dark:border-indigo-800">
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-2 uppercase tracking-wide">Topic</p>
                    <p className="text-xl md:text-2xl font-serif font-medium text-indigo-800 dark:text-indigo-200">
                      "{getCurrentText()}"
                    </p>
                  </div>
                  
                  {/* Breathing Light Animation during recording */}
                  {isRecording && (
                    <motion.div
                      className="mt-6 flex flex-col items-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500"
                        animate={{
                          scale: [1, 1.15, 1],
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      <p className="mt-4 text-sm text-muted-foreground">
                        Keep speaking... no feedback
                      </p>
                    </motion.div>
                  )}
                </div>
              ) : isImprovisation ? (
                <div className="text-center py-6">
                  <div className="inline-block p-6 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 border-2 border-pink-200 dark:border-pink-800">
                    <p className="text-xl md:text-2xl font-serif font-medium text-pink-800 dark:text-pink-200">
                      "{getCurrentText()}"
                    </p>
                  </div>
                </div>
              ) : isRepetition ? (
                <div className="text-center py-6">
                  <motion.div 
                    className="inline-block p-4 rounded-2xl bg-gradient-to-br from-cyan-100 to-teal-100 dark:from-cyan-900/30 dark:to-teal-900/30"
                    animate={isRecording ? { scale: [1, 1.02, 1] } : {}}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    <p className="text-2xl md:text-4xl font-mono font-bold tracking-widest text-cyan-800 dark:text-cyan-200">
                      {getCurrentText()}
                    </p>
                  </motion.div>
                  <p className="mt-3 text-muted-foreground text-xs">
                    🔁 Repeat {currentExercise?.repetitions || 10} times
                  </p>
                </div>
              ) : isWarmup ? (
                <div className="text-center py-6">
                  <motion.div 
                    className="inline-block p-6 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 border-2 border-orange-200 dark:border-orange-800"
                    animate={isRecording ? { boxShadow: ['0 0 0 0 rgba(251, 146, 60, 0.4)', '0 0 0 20px rgba(251, 146, 60, 0)', '0 0 0 0 rgba(251, 146, 60, 0.4)'] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <p className="text-xl md:text-3xl font-serif font-bold text-orange-800 dark:text-orange-200">
                      {getCurrentText()}
                    </p>
                  </motion.div>
                </div>
              ) : pacingMode === 'syllabic' ? (
                <div className="text-lg leading-loose font-serif whitespace-pre-wrap max-h-[50vh] overflow-y-auto pr-2 scrollbar-thin">
                  <div className="space-y-1">
                    {syllabifiedText.map((wordData, wordIdx) => {
                      if (wordData.isPunctuation) {
                        const isPausePunctuation = /[,;:.!?…]/.test(wordData.original);
                        return (
                          <span key={wordIdx}>
                            {wordData.original}
                            {isPausePunctuation && (
                              <span className="inline-flex items-center mx-2 text-red-500 animate-pulse" title="Pause here - Breathe">
                                <span className="text-lg">⏸️</span>
                              </span>
                            )}
                            {" "}
                          </span>
                        );
                      }
                      
                      const nonPunctuationIdx = syllabifiedText
                        .slice(0, wordIdx)
                        .filter(w => !w.isPunctuation).length;
                      
                      const lastSyllable = wordData.syllables[wordData.syllables.length - 1];
                      const hasPause = /[,;:.!?…]$/.test(lastSyllable);
                      
                      return (
                        <span key={wordIdx} className="inline-block mr-1">
                          {wordData.syllables.map((syllable, sylIdx) => {
                            const isHighlighted = isRecording && 
                              highlightedWordIndex === nonPunctuationIdx && 
                              highlightedSyllableIndex === sylIdx;
                            
                            const isLastSyllable = sylIdx === wordData.syllables.length - 1;
                            
                            return (
                              <span key={sylIdx} className="inline">
                                <span
                                  className={`transition-colors duration-150 ${
                                    isHighlighted 
                                      ? "bg-primary text-primary-foreground rounded" 
                                      : ""
                                  }`}
                                >
                                  {syllable}
                                </span>
                                {sylIdx < wordData.syllables.length - 1 && (
                                  <span className="text-muted-foreground/50">-</span>
                                )}
                                {isLastSyllable && hasPause && (
                                  <span className="inline-flex items-center mx-2 text-red-500 animate-pulse" title="Pause here - Breathe">
                                    <span className="text-lg">⏸️</span>
                                  </span>
                                )}
                              </span>
                            );
                          })}
                          {" "}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-lg leading-loose font-serif whitespace-pre-wrap max-h-[50vh] overflow-y-auto pr-2 scrollbar-thin">
                  {(() => {
                    const text = getCurrentText();
                    const segments = text.split(/\[pause\]/gi);
                    let globalWordIndex = 0;
                    const isGuidedMode = pacingMode === 'guided';
                    
                    // Pre-compute breath-group pause positions (same logic as pacing)
                    const breathGroupSize = (() => {
                      const sps = targetSPS;
                      if (sps <= 1.5) return 3;
                      if (sps <= 2.0) return 4;
                      if (sps <= 2.5) return 5;
                      if (sps <= 3.0) return 6;
                      return 0;
                    })();
                    
                    const allWords = text.replace(/\[pause\]/gi, '').split(/\s+/).filter(w => w.length > 0);
                    const breathPauseIndices = new Set<number>();
                    if (breathGroupSize > 0 && isGuidedMode) {
                      let wordsSincePause = 0;
                      for (let i = 0; i < allWords.length; i++) {
                        const hasPunct = /[,;:.!?…⏸️]/.test(allWords[i]);
                        wordsSincePause++;
                        if (hasPunct) {
                          wordsSincePause = 0;
                        } else if (wordsSincePause >= breathGroupSize) {
                          breathPauseIndices.add(i);
                          wordsSincePause = 0;
                        }
                      }
                    }
                    
                    return segments.map((segment, segIndex, array) => {
                      const tokens = segment.trim().split(/\s+/).filter(w => w.length > 0);
                      
                      return (
                        <span key={segIndex}>
                          {tokens.map((token, tokenIndex) => {
                            const currentGlobalIndex = globalWordIndex;
                            globalWordIndex++;
                            const isHighlighted = isGuidedMode && isRecording && highlightedWordIndex === currentGlobalIndex;
                            const isAlreadyRead = isGuidedMode && isRecording && currentGlobalIndex < highlightedWordIndex;
                            const isNotYetRead = isGuidedMode && isRecording && currentGlobalIndex > highlightedWordIndex;
                            
                            const hasPause = /[,;:.!?…]$/.test(token);
                            const hasBreathPause = breathPauseIndices.has(currentGlobalIndex);
                            
                            let wordClass = "transition-colors duration-300 ease-in-out inline ";
                            const isBreathing = isHighlighted && isPausingBreath;
                            if (isHighlighted) {
                              wordClass += isBreathing
                                ? "bg-primary/60 text-primary-foreground rounded"
                                : "bg-primary text-primary-foreground rounded";
                            } else if (isNotYetRead) {
                              wordClass += "opacity-35";
                            } else if (isAlreadyRead) {
                              wordClass += "opacity-60";
                            }
                            
                            return (
                              <span key={tokenIndex} className="inline">
                                <span className={wordClass}>
                                  {token}
                                </span>
                                {isBreathing && (
                                  <span className="inline-flex items-center mx-1.5 text-muted-foreground/70">
                                    <span className="text-xs italic">· pause ·</span>
                                  </span>
                                )}
                                {hasPause && !isBreathing && (
                                  <span 
                                    className={`inline-flex items-center mx-2 ${isNotYetRead ? 'opacity-40' : 'text-orange-500'}`} 
                                    title="Pause here - Breathe"
                                  >
                                    <span className="text-lg">⏸️</span>
                                  </span>
                                )}
                                {hasBreathPause && !hasPause && !isBreathing && (
                                  <span 
                                    className={`inline-flex items-center mx-1.5 ${isNotYetRead ? 'opacity-30' : isAlreadyRead ? 'opacity-50' : 'opacity-70'}`} 
                                    title="Automatic breath pause"
                                  >
                                    <span className="text-sm text-primary/60">💨</span>
                                  </span>
                                )}
                                {tokenIndex < tokens.length - 1 ? " " : ""}
                              </span>
                            );
                          })}
                          {segIndex < array.length - 1 && (
                            <span className="inline-flex items-center mx-3 text-orange-500">
                              <span className="text-base bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-full border border-orange-300 dark:border-orange-700">✋ PAUSE</span>
                            </span>
                          )}
                        </span>
                      );
                    });
                  })()}
                </div>
              )}
              
              {/* Tip display */}
              <div className="mt-3 p-2 rounded-lg bg-muted/50 flex items-start gap-2">
                <Lightbulb className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">{getCurrentTip()}</p>
              </div>
            </CardContent>
          </Card>
            
          {/* Right Navigation Arrow */}
          {currentCategory && currentCategory.exercises.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextExercise}
              disabled={isRecording}
              className="mt-20 h-12 w-12 rounded-full hover:bg-primary/10 flex-shrink-0"
              title="Next exercise"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          )}
        </div>

        {/* Pre-recording controls */}
        {!isRecording && (
          <div className="mt-6 space-y-4">
            {/* Target Speed Selector - 6 niveaux */}
            {!isProprioception && (
              <Card className="border-2 border-primary/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-bold">🎯 Speed target</h3>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        syll/sec
                      </span>
                      {userBirthYear && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                          Calibrated {userAgeGroup}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setShowAllLevels(!showAllLevels)}
                      className="text-xs text-primary hover:underline"
                    >
                      {showAllLevels ? "Fewer options" : "More options"}
                    </button>
                  </div>
                  
                  {/* Compact view: 3 main levels */}
                  {!showAllLevels && (
                    <div className="grid grid-cols-3 gap-2">
                      {EXTENDED_SPS_LEVELS.filter(l => [3, 4, 5].includes(l.level)).map((preset) => (
                        <button
                          key={preset.sps}
                          onClick={() => setTargetSPS(preset.sps as TargetSPS)}
                          className={`p-2 rounded-lg border-2 transition-all text-center relative ${
                            targetSPS === preset.sps
                              ? "border-primary bg-primary/10 shadow-md"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          {preset.isUserNorm && (
                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500 text-white rounded-full whitespace-nowrap">
                              Your norm
                            </span>
                          )}
                          <div className="text-base mb-0.5">{preset.emoji}</div>
                          <div className={`text-xl font-bold ${targetSPS === preset.sps ? "text-primary" : ""}`}>
                            {preset.sps}
                          </div>
                          <div className="text-xs font-medium text-foreground">{preset.label}</div>
                          <div className="text-[9px] text-muted-foreground mt-0.5">{preset.shortDesc}</div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Expanded view: All 6 levels */}
                  {showAllLevels && (
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {EXTENDED_SPS_LEVELS.map((preset) => (
                        <button
                          key={preset.sps}
                          onClick={() => setTargetSPS(preset.sps as TargetSPS)}
                          className={`p-2 rounded-lg border-2 transition-all text-center relative ${
                            targetSPS === preset.sps
                              ? "border-primary bg-primary/10 shadow-md"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          {preset.isUserNorm && (
                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500 text-white rounded-full whitespace-nowrap">
                              ✓
                            </span>
                          )}
                          <div className="text-sm mb-0.5">{preset.emoji}</div>
                          <div className={`text-lg font-bold ${targetSPS === preset.sps ? "text-primary" : ""}`}>
                            {preset.sps}
                          </div>
                          <div className="text-[10px] font-medium text-foreground leading-tight">{preset.label}</div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Warning if selected level exceeds physiological norm */}
                  {userBirthYear && isAboveSafeThreshold(targetSPS, userNormSPS) && (
                    <div className="mt-3 p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        {getAboveNormWarning(targetSPS, userNormSPS, userAgeGroup)}
                      </p>
                    </div>
                  )}
                  
                  <p className="text-xs text-center text-muted-foreground mt-3 px-2">
                    {EXTENDED_SPS_LEVELS.find(p => p.sps === targetSPS)?.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Advanced Settings — collapsed by default for beginners */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Settings2 className="w-4 h-4" />
              <span>{showAdvanced ? "Hide advanced settings" : "Advanced settings"}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""}`} />
            </button>

            {showAdvanced && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* DAF Toggle */}
                {!isImprovisation && pacingMode === 'guided' && (
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                    <DAFToggle
                      isEnabled={isDAFEnabled}
                      isActive={isDAFActive}
                      delayMs={delayMs}
                      onToggle={toggleDAF}
                      onDelayChange={setDelayMs}
                      disabled={isRecording}
                    />
                  </div>
                )}

                {/* Filler Word Detection Toggle */}
                <TooltipProvider>
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🙊</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Label htmlFor="filler-toggle" className="text-sm font-medium cursor-pointer">
                              Filler word detection
                            </Label>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-700 dark:text-amber-300 font-medium">
                              Beta
                            </span>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                              </PopoverTrigger>
                              <PopoverContent className="max-w-[220px] p-3" side="top">
                                <p className="text-xs">The automatic analysis detects your speech habits (Um, Well, Like...) to help you improve your fluency.</p>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </div>
                      <Switch
                        id="filler-toggle"
                        checked={detectFillers}
                        onCheckedChange={setDetectFillers}
                        disabled={isRecording}
                      />
                    </div>
                  </div>
                </TooltipProvider>

                {/* Chain Mode Toggle — warmup & articulation only */}
                {(isWarmup || categoryId === 'articulation') && currentCategory && currentCategory.exercises.length > 1 && (
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Repeat className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <div>
                          <Label htmlFor="chain-toggle" className="text-sm font-medium cursor-pointer">
                            Chain mode
                          </Label>
                          <p className="text-[10px] text-muted-foreground">
                            Chain all {currentCategory.exercises.length} items without stopping the mic
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="chain-toggle"
                        checked={chainMode}
                        onCheckedChange={setChainMode}
                        disabled={isRecording}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Start Button */}
            <div className="flex justify-center">
              <RecordButton onClick={startRecording} isRecording={false} />
            </div>

            <div className="text-center text-muted-foreground text-xs">
              <p className="font-medium">
                {isRebus ? "Listen first, then press to repeat 🎤" : "Press to start"}
              </p>
            </div>
          </div>
        )}

        {/* During recording - Pause button + Chain mode controls */}
        {isRecording && (
          <div className="mt-4 space-y-3">
            {/* Chain mode: item counter + next button */}
            {chainMode && currentCategory && (
              <div className="flex items-center justify-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">
                  Item {currentExerciseIndex + 1}/{currentCategory.exercises.length}
                </span>
                {chainCountdown !== null ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Next in <span className="font-bold text-primary">{chainCountdown}s</span>
                    </span>
                    <Button
                      variant="soft"
                      size="sm"
                      onClick={chainSkipCountdown}
                      className="h-8 px-3"
                    >
                      Skip →
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="soft"
                    size="sm"
                    onClick={chainNextItem}
                    disabled={currentExerciseIndex >= currentCategory.exercises.length - 1}
                    className="h-8 px-4 gap-1"
                  >
                    <ChevronRight className="w-4 h-4" />
                    Next item
                  </Button>
                )}
              </div>
            )}
            
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={togglePause} 
                className="h-12 px-5 rounded-full gap-2"
              >
                {isPaused ? (
                  <>
                    <Play className="w-5 h-5" />
                    <span className="font-medium">Resume</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-5 h-5" />
                    <span className="font-medium">Pause</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Biofeedback Bar - Sticky at bottom during recording (hidden for proprioception) */}
      <AnimatePresence>
        {isRecording && !isProprioception && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
          >
            <BiofeedbackBar
              sps={deepgram.packetSPS}
              targetSps={targetSPS}
              isRecording={isRecording}
              isPaused={isPaused}
              isCalibrated={deepgram.isCalibrated}
              onStop={stopRecording}
              onTogglePause={togglePause}
              disabled={saving}
              fillerCount={detectFillers ? deepgram.fillerCount : undefined}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Minimal control bar for proprioception mode */}
      <AnimatePresence>
        {isRecording && isProprioception && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
          >
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border shadow-lg">
              <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                      Recording in progress...
                    </span>
                  </div>
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={stopRecording}
                    disabled={saving}
                    className="h-14 px-6 rounded-xl gap-2 font-medium"
                  >
                    <span className="w-5 h-5 flex items-center justify-center">■</span>
                    <span>Finish</span>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Modal — same for all exercise types */}
      {sessionResults && (
        <SessionResultModal
          open={showResultModal}
          onOpenChange={setShowResultModal}
          avgSps={sessionResults.avgSps}
          targetSps={sessionResults.frozenTargetSps}
          syllableCount={sessionResults.syllableCount}
          sessionId={sessionResults.sessionId}
          onContinue={handleContinue}
          onRetry={handleRetry}
          actualSpeakingTime={sessionResults.actualSpeakingTime}
          totalSessionTime={sessionResults.totalSessionTime}
          streakIncremented={sessionResults.streakIncremented}
          goalJustCompleted={sessionResults.goalJustCompleted}
          currentStreak={gamification.currentStreak}
          todayMinutes={gamification.todayMinutes}
          dailyGoal={gamification.dailyGoal}
          goalProgress={gamification.goalProgress}
          journeyStep={journeyStep}
          exerciseId={currentExercise?.id}
        />
      )}
      
      </>
      )}
    </div>
  );
};

export default Practice;
