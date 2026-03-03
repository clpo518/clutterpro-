import { useState, useEffect, useRef, useMemo } from "react";
import ExerciseIntroModal from "@/components/practice/ExerciseIntroModal";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Gauge, MessageCircle, Square, Play, Pause } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useDeepgramSPS } from "@/hooks/useDeepgramSPS";
import { useGamification } from "@/hooks/useGamification";
import { calculateSafeMaxSPS, spsToWpm } from "@/lib/spsUtils";
import { getSPSZone } from "@/lib/spsUtils";
import { getNormSPS, getAgeGroupLabel } from "@/lib/ageNormsUtils";
import SessionResultModal from "@/components/practice/SessionResultModal";

type TargetSPS = 1.0 | 2.0 | 3.0 | 4.0 | 5.0 | 6.0;
type Duration = 30 | 60 | 120 | 180 | 300;

const DURATION_OPTIONS: { value: Duration; label: string }[] = [
  { value: 30, label: "30 sec" },
  { value: 60, label: "1 min" },
  { value: 120, label: "2 min" },
  { value: 180, label: "3 min" },
  { value: 300, label: "5 min" },
];

const SPS_LEVELS = [
  { sps: 1.0, label: "Ultra-slow", emoji: "🐌", shortDesc: "Phonetic" },
  { sps: 2.0, label: "Turtle", emoji: "🐢", shortDesc: "Dictation" },
  { sps: 3.0, label: "Slow", emoji: "🎯", shortDesc: "Steady" },
  { sps: 4.0, label: "Moderate", emoji: "💬", shortDesc: "Conversation" },
  { sps: 5.0, label: "Fast", emoji: "⚡", shortDesc: "Dynamic" },
  { sps: 6.0, label: "Challenge", emoji: "🏃", shortDesc: "Expert" },
];

const FEEDBACK_DEBOUNCE_MS = 1000;
const MIN_SPEAKING_SPS = 0.3;

const Dialogue = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const deepgram = useDeepgramSPS();
  const gamification = useGamification();

  const [targetSPS, setTargetSPS] = useState<TargetSPS>(4.0);
  const [duration, setDuration] = useState<Duration>(60);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [saving, setSaving] = useState(false);

  const [sessionSpsHistory, setSessionSpsHistory] = useState<number[]>([]);

  const [userBirthYear, setUserBirthYear] = useState<number | null>(null);
  const userNormSPS = getNormSPS(userBirthYear);

  // Result modal
  const [showResultModal, setShowResultModal] = useState(false);
  const [sessionResults, setSessionResults] = useState<any>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wpmSamplerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const packetSPSRef = useRef(0);
  packetSPSRef.current = deepgram.packetSPS;

  // Debounced visual state
  const [stableState, setStableState] = useState({
    label: "Waiting", emoji: "🎤", colorClass: "text-muted-foreground", bgClass: "bg-muted"
  });
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const lastChangeTime = useRef(0);

  // Fetch birth year
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("birth_year").eq("id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data?.birth_year) {
          setUserBirthYear(data.birth_year);
          const norm = getNormSPS(data.birth_year);
          const closest = [2, 3, 4, 5, 6].reduce((prev, curr) =>
            Math.abs(curr - norm) < Math.abs(prev - norm) ? curr : prev
          );
          setTargetSPS(closest as TargetSPS);
        }
      });
  }, [user]);

  // No more manual smoothing — deepgram.packetSPS handles it natively

  // Sample SPS every second
  useEffect(() => {
    if (isRecording && !isPaused) {
      wpmSamplerRef.current = setInterval(() => {
        if (packetSPSRef.current > 0) {
          setSessionSpsHistory(prev => [...prev, packetSPSRef.current]);
        }
      }, 1000);
    } else {
      if (wpmSamplerRef.current) clearInterval(wpmSamplerRef.current);
    }
    return () => { if (wpmSamplerRef.current) clearInterval(wpmSamplerRef.current); };
  }, [isRecording, isPaused]);

  // Auto-stop when time runs out
  useEffect(() => {
    if (isRecording && remainingTime <= 0 && elapsedTime > 0) {
      stopRecording();
    }
  }, [remainingTime]);

  // Compute current feedback state
  const currentState = useMemo(() => {
    if (isPaused) return { label: "Paused", emoji: "⏸️", colorClass: "text-yellow-600 dark:text-yellow-400", bgClass: "bg-yellow-100 dark:bg-yellow-900/30" };
    if (deepgram.packetSPS < MIN_SPEAKING_SPS) return { label: !deepgram.isCalibrated ? "Calibrating..." : "Speak...", emoji: "🎤", colorClass: "text-muted-foreground", bgClass: "bg-muted" };
    const zone = getSPSZone(deepgram.packetSPS, targetSPS);
    let emoji = "🎤";
    if (zone.zone === 'perfect') emoji = "✅";
    else if (zone.zone === 'good') emoji = "👍";
    else if (zone.zone === 'too_slow') emoji = "🐢";
    else if (zone.zone === 'warning') emoji = "⚡";
    else if (zone.zone === 'danger') emoji = "🔴";
    return { label: zone.label, emoji, colorClass: zone.colorClass, bgClass: zone.bgClass };
  }, [deepgram.packetSPS, deepgram.isCalibrated, targetSPS, isPaused]);

  // Debounce visual state
  useEffect(() => {
    if (isPaused) { setStableState(currentState); return; }
    if (currentState.label === stableState.label) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    const now = Date.now();
    if (now - lastChangeTime.current > FEEDBACK_DEBOUNCE_MS) {
      setStableState(currentState);
      lastChangeTime.current = now;
    } else {
      debounceTimer.current = setTimeout(() => {
        setStableState(currentState);
        lastChangeTime.current = Date.now();
      }, FEEDBACK_DEBOUNCE_MS);
    }
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [currentState, stableState.label, isPaused]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      try { await deepgram.start(stream, { detectFillers: false }); } catch {
        toast.info("Recording without real-time analysis.", { duration: 3000 });
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.start(1000);

      startTimeRef.current = Date.now();
      setRemainingTime(duration);
      setElapsedTime(0);

      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setElapsedTime(elapsed);
          setRemainingTime(Math.max(duration - elapsed, 0));
        }
      }, 1000);

      setIsRecording(true);
      setIsPaused(false);
      setSessionSpsHistory([]);
    } catch {
      toast.error("Unable to access microphone");
    }
  };

  const togglePause = () => {
    if (isPaused) {
      mediaRecorderRef.current?.resume();
      startTimeRef.current = Date.now() - elapsedTime * 1000;
      setIsPaused(false);
    } else {
      mediaRecorderRef.current?.pause();
      setIsPaused(true);
    }
  };

  const stopRecording = async () => {
    setSaving(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (wpmSamplerRef.current) clearInterval(wpmSamplerRef.current);
    deepgram.stop();
    mediaRecorderRef.current?.stop();
    await new Promise(r => setTimeout(r, 500));
    streamRef.current?.getTracks().forEach(t => t.stop());

    const realAvgSps = sessionSpsHistory.length > 0
      ? Math.round((sessionSpsHistory.reduce((a, b) => a + b, 0) / sessionSpsHistory.length) * 10) / 10
      : 0;
    const realMaxSps = calculateSafeMaxSPS(sessionSpsHistory);

    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      let fileName: string | null = null;
      if (audioBlob.size > 0) {
        fileName = `${user?.id}/${Date.now()}.webm`;
        const { error } = await supabase.storage.from("recordings").upload(fileName, audioBlob);
        if (error) fileName = null;
      }

      const wpmData = sessionSpsHistory.map((sps, i) => ({ timestamp: i, wpm: spsToWpm(sps) }));

      const { data: session, error: dbError } = await supabase
        .from("sessions")
        .insert([{
          user_id: user?.id as string,
          duration_seconds: elapsedTime,
          avg_wpm: spsToWpm(realAvgSps),
          max_wpm: spsToWpm(realMaxSps),
          target_wpm: spsToWpm(targetSPS),
          recording_url: fileName,
          wpm_data: wpmData as unknown as ReturnType<typeof JSON.parse>,
          exercise_type: 'improvisation',
          word_timestamps: deepgram.getWordTimestamps() as unknown as ReturnType<typeof JSON.parse>,
        }])
        .select().single();

      if (dbError) throw dbError;

      const gamificationResult = await gamification.updateAfterSession(elapsedTime);

      setSessionResults({
        avgSps: realAvgSps, maxSps: realMaxSps, duration: elapsedTime,
        syllableCount: deepgram.syllableCount, wordCount: deepgram.wordCount,
        sessionId: session.id, fillerCount: 0, fillerDetails: {},
        actualSpeakingTime: deepgram.actualSpeakingTime, totalSessionTime: elapsedTime,
        streakIncremented: gamificationResult.streakIncremented,
        goalJustCompleted: gamificationResult.goalJustCompleted,
        frozenTargetSps: targetSPS,
      });
      setShowResultModal(true);
      setIsRecording(false);
      setSaving(false);
    } catch {
      toast.error("Error saving session");
      setSaving(false);
    }
  };

  const handleRetry = () => {
    setShowResultModal(false);
    setSessionResults(null);
    setElapsedTime(0);
    setRemainingTime(0);
    deepgram.reset();
    setSessionSpsHistory([]);
  };

  const handleContinue = () => {
    setShowResultModal(false);
    if (sessionResults?.sessionId) navigate(`/session/${sessionResults.sessionId}`);
    else navigate("/dashboard");
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // Big gauge color
  const gaugeColor = useMemo(() => {
    if (deepgram.packetSPS < MIN_SPEAKING_SPS) return "hsl(var(--muted-foreground))";
    const zone = getSPSZone(deepgram.packetSPS, targetSPS);
    if (zone.zone === 'perfect' || zone.zone === 'good') return "hsl(142, 76%, 45%)";
    if (zone.zone === 'too_slow') return "hsl(210, 80%, 60%)";
    if (zone.zone === 'warning') return "hsl(38, 92%, 50%)";
    if (zone.zone === 'danger') return "hsl(0, 84%, 60%)";
    return "hsl(var(--muted-foreground))";
  }, [deepgram.packetSPS, targetSPS]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-accent/30 flex flex-col">
      <ExerciseIntroModal categoryId="dialogue" onDismiss={() => {}} />
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate("/library")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" /><span className="hidden sm:inline">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-sm sm:text-base">Dialogue Mode</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 max-w-lg flex flex-col items-center justify-center">
        {!isRecording ? (
          /* ──── Setup Screen ──── */
          <motion.div className="w-full space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Intro */}
            <div className="text-center">
              <div className="text-5xl mb-3">💬</div>
              <h1 className="text-2xl font-display font-bold mb-2">Dialogue Mode</h1>
              <p className="text-muted-foreground text-sm">
                Place your phone on the table and talk naturally. The indicator guides you in real time.
              </p>
            </div>

            {/* Duration Selector */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">⏱️</span>
                  <h3 className="text-sm font-bold">Session duration</h3>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {DURATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setDuration(opt.value)}
                      className={`p-2 rounded-lg border-2 transition-all text-center ${
                        duration === opt.value
                          ? "border-primary bg-primary/10 shadow-md"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className={`text-sm font-bold ${duration === opt.value ? "text-primary" : ""}`}>
                        {opt.label}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Speed Selector */}
            <Card className="border-2 border-primary/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Gauge className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold">🎯 Speed goal</h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">syllables/sec</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {SPS_LEVELS.map((preset) => (
                    <button
                      key={preset.sps}
                      onClick={() => setTargetSPS(preset.sps as TargetSPS)}
                      className={`p-2 rounded-lg border-2 transition-all text-center ${
                        targetSPS === preset.sps
                          ? "border-primary bg-primary/10 shadow-md"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="text-base mb-0.5">{preset.emoji}</div>
                      <div className={`text-xl font-bold ${targetSPS === preset.sps ? "text-primary" : ""}`}>{preset.sps}</div>
                      <div className="text-[9px] text-muted-foreground">{preset.shortDesc}</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-center text-muted-foreground mt-3">
                  {SPS_LEVELS.find(p => p.sps === targetSPS)?.label}
                </p>
              </CardContent>
            </Card>

            {/* Biofeedback explanation for therapists */}
            <div className="bg-muted/50 rounded-xl p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground/80">💡 How does biofeedback work?</p>
              <p>
                The rate is calculated <strong>in packets of 5 syllables</strong>:
                every 5 syllables spoken, the system measures elapsed time and calculates the actual rate.
                This provides a <strong>stable and accurate</strong> gauge — each update reflects a real speech segment.
              </p>
              <p className="text-muted-foreground/70">
                ⏳ The gauge activates after the first 5 syllables — it is normal if it does not respond immediately.
              </p>
            </div>

            {/* Start */}
            <div className="flex justify-center pt-2">
              <Button size="lg" onClick={startRecording} className="h-16 px-10 rounded-2xl text-lg gap-3 shadow-lg shadow-primary/25">
                <MessageCircle className="w-6 h-6" />
                Start dialogue
              </Button>
            </div>
          </motion.div>
        ) : (
          /* ──── Recording Screen — BIG GAUGE ──── */
          <motion.div
            className="w-full flex flex-col items-center justify-center gap-6 flex-1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {/* Countdown */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Time remaining</p>
              <p className="text-4xl font-mono font-bold tabular-nums">{formatTime(remainingTime)}</p>
            </div>

            {/* BIG Emoji + Label */}
            <div
              className={`flex flex-col items-center justify-center w-56 h-56 rounded-full border-4 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]`}
              style={{ borderColor: gaugeColor, backgroundColor: `${gaugeColor}15` }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={stableState.emoji}
                  initial={{ scale: 0.6, opacity: 0, rotate: -10 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.6, opacity: 0, rotate: 10 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className="text-7xl"
                >
                  {stableState.emoji}
                </motion.span>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.span
                  key={stableState.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className={`text-xl font-bold mt-2`}
                  style={{ color: gaugeColor }}
                >
                  {stableState.label}
                </motion.span>
              </AnimatePresence>
              {deepgram.packetSPS >= MIN_SPEAKING_SPS && (
                <span className="text-xs text-muted-foreground mt-1 transition-opacity duration-500">
                  {deepgram.packetSPS.toFixed(1)} syll/s
                </span>
              )}
            </div>

            {/* Target reminder */}
            <p className="text-sm text-muted-foreground">
              Goal: <span className="font-bold text-foreground">{targetSPS} syll/s</span>
            </p>

            {/* Micro-hint */}
            <p className="text-xs text-muted-foreground/70 text-center max-w-xs">
              {stableState.label === "Speak..."
                ? "Keep talking naturally..."
                : stableState.label === "Perfect" || stableState.label === "Good"
                  ? "Ideal pace, keep it up! 👍"
                  : stableState.label === "Too fast!" || stableState.label === "Slow down..."
                    ? "Try slowing down a little..."
                    : "You can speed up slightly..."
              }
            </p>

            {/* Controls */}
            <div className="flex items-center gap-4 mt-4">
              <Button variant="outline" size="lg" onClick={togglePause} className="h-14 px-6 rounded-xl gap-2">
                {isPaused ? <><Play className="w-5 h-5" /> Resume</> : <><Pause className="w-5 h-5" /> Pause</>}
              </Button>
              <Button variant="destructive" size="lg" onClick={stopRecording} disabled={saving} className="h-14 px-6 rounded-xl gap-2">
                <Square className="w-5 h-5" /> Stop
              </Button>
            </div>
          </motion.div>
        )}
      </main>

      {/* Result Modal */}
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
        />
      )}
    </div>
  );
};

export default Dialogue;
