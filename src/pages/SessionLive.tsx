import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Gauge, Square, Play, Users, Save, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useDeepgramSPS } from "@/hooks/useDeepgramSPS";
import { calculateSafeMaxSPS, spsToWpm, getSPSZone } from "@/lib/spsUtils";
import confetti from "canvas-confetti";

type Duration = 60 | 120 | 300 | 600;

const DURATION_OPTIONS: { value: Duration; label: string }[] = [
  { value: 60, label: "1 min" },
  { value: 120, label: "2 min" },
  { value: 300, label: "5 min" },
  { value: 600, label: "10 min" },
];

interface PatientOption {
  id: string;
  full_name: string | null;
}

/* ──── Target SPS options ──── */
const TARGET_SPS_OPTIONS = [
  { value: 0, label: "None" },
  { value: 3.0, label: "3.0 — Slow" },
  { value: 3.5, label: "3.5 — Steady" },
  { value: 4.0, label: "4.0 — Moderate" },
  { value: 4.5, label: "4.5 — Comfortable" },
  { value: 5.0, label: "5.0 — Fast" },
];

/* ──── Color helpers relative to target ──── */
const getRelativeColor = (sps: number, target: number) => {
  if (sps < 0.3) return "hsl(var(--muted-foreground))";
  if (target === 0) {
    // No target: absolute thresholds
    if (sps <= 4.0) return "hsl(142, 76%, 45%)";
    if (sps <= 5.5) return "hsl(38, 92%, 50%)";
    return "hsl(0, 84%, 60%)";
  }
  const ratio = sps / target;
  if (ratio <= 1.05) return "hsl(142, 76%, 45%)";  // At or below target
  if (ratio <= 1.20) return "hsl(38, 92%, 50%)";   // Slightly above
  return "hsl(0, 84%, 60%)";                        // Well above
};

const getRelativeEmoji = (sps: number, target: number) => {
  if (sps < 0.3) return "🎤";
  if (target === 0) {
    if (sps <= 4.0) return "✅";
    if (sps <= 5.5) return "⚡";
    return "🔴";
  }
  const ratio = sps / target;
  if (ratio <= 1.05) return "✅";
  if (ratio <= 1.20) return "⚡";
  return "🔴";
};

/* ──── Radial Gauge SVG ──── */
const BilanRadialGauge = ({ avg, target }: { avg: number; target: number }) => {
  const maxSps = 8;
  const pct = Math.min(avg / maxSps, 1);
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - pct * 0.75);

  const color = getRelativeColor(avg, target);
  const emoji = avg === 0 ? "📊" : getRelativeEmoji(avg, target);

  return (
    <div className="relative w-52 h-52 flex items-center justify-center">
      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-[135deg]">
        {/* Background arc */}
        <circle cx="100" cy="100" r={radius} fill="none" stroke="hsl(var(--muted) / 0.5)" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`} />
        {/* Target marker */}
        {target > 0 && (() => {
          const targetPct = Math.min(target / maxSps, 1);
          const targetAngle = targetPct * 270; // degrees in the 270° arc
          const rad = (targetAngle * Math.PI) / 180;
          const x = 100 + radius * Math.cos(rad);
          const y = 100 + radius * Math.sin(rad);
          return <circle cx={x} cy={y} r="4" fill="hsl(var(--foreground))" opacity="0.5" />;
        })()}
        {/* Value arc */}
        <motion.circle cx="100" cy="100" r={radius} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          initial={{ strokeDashoffset: circumference * 0.75 }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="text-4xl" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.6 }}>
          {emoji}
        </motion.span>
        <motion.span className="text-3xl font-bold tabular-nums mt-1" style={{ color }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          {avg > 0 ? avg.toFixed(1) : "—"}
        </motion.span>
        <span className="text-xs text-muted-foreground">syll/s</span>
        {target > 0 && avg > 0 && (
          <motion.span className="text-[10px] text-muted-foreground mt-0.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}>
            target: {target.toFixed(1)}
          </motion.span>
        )}
      </div>
    </div>
  );
};

/* ──── Verdict Card ──── */
const BilanVerdict = ({ avg, target }: { avg: number; target: number }) => {
  const { title, description, emoji, bgClass } = useMemo(() => {
    if (avg === 0) return { title: "Session too short", description: "Not enough speech detected.", emoji: "⏸️", bgClass: "bg-muted/50" };

    if (target > 0) {
      const ratio = avg / target;
      if (ratio <= 0.90) return { title: "Below target", description: `Average rate of ${avg.toFixed(1)} syll/s against a target of ${target.toFixed(1)}. You can aim a little higher.`, emoji: "🐢", bgClass: "bg-emerald-50 dark:bg-emerald-950/20" };
      if (ratio <= 1.05) return { title: "Goal reached! 🎯", description: `Average rate of ${avg.toFixed(1)} syll/s — right on target at ${target.toFixed(1)}. Well done!`, emoji: "✨", bgClass: "bg-green-50 dark:bg-green-950/20" };
      if (ratio <= 1.20) return { title: "Slightly above target", description: `Average rate of ${avg.toFixed(1)} syll/s against a target of ${target.toFixed(1)}. Remember to pause.`, emoji: "⚡", bgClass: "bg-orange-50 dark:bg-orange-950/20" };
      return { title: "Above target", description: `Average rate of ${avg.toFixed(1)} syll/s — target is ${target.toFixed(1)}. Work on respiratory pauses.`, emoji: "🌬️", bgClass: "bg-red-50 dark:bg-red-950/20" };
    }

    if (avg <= 3.5) return { title: "Very steady pace", description: "Excellent rate control — ideal for articulation work.", emoji: "🐢", bgClass: "bg-emerald-50 dark:bg-emerald-950/20" };
    if (avg <= 5.0) return { title: "Normal-fluent pace", description: "The rate is comfortable and natural. Well done!", emoji: "✨", bgClass: "bg-green-50 dark:bg-green-950/20" };
    if (avg <= 6.0) return { title: "Slightly fast rate", description: "Some accelerations detected. Remember inter-sentence pauses.", emoji: "⚡", bgClass: "bg-orange-50 dark:bg-orange-950/20" };
    return { title: "High rate", description: "The pace is fast. Work on respiratory pauses.", emoji: "🌬️", bgClass: "bg-red-50 dark:bg-red-950/20" };
  }, [avg, target]);

  return (
    <Card className={`${bgClass} border-0 shadow-sm`}>
      <CardContent className="p-4 flex items-start gap-3">
        <span className="text-2xl mt-0.5">{emoji}</span>
        <div>
          <p className="font-display font-bold text-sm">{title}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

/* ──── Stability Indicator ──── */
const BilanStability = ({ avg, max, min }: { avg: number; max: number; min: number }) => {
  if (avg === 0) return null;
  const range = max - min;
  const variance = avg > 0 ? ((max - avg) / avg) * 100 : 0;

  const { label, description, emoji, barColor } = useMemo(() => {
    if (variance < 20) return { label: "Very stable", description: `Only ${range.toFixed(1)} syll/s variation — excellent control.`, emoji: "🎯", barColor: "bg-emerald-500" };
    if (variance < 40) return { label: "Stable", description: `${range.toFixed(1)} syll/s variation — some normal fluctuations.`, emoji: "📈", barColor: "bg-primary" };
    return { label: "Variable", description: `${range.toFixed(1)} syll/s variation — respiratory pauses may help.`, emoji: "🌬️", barColor: "bg-orange-500" };
  }, [variance, range]);

  const stabilityPct = Math.max(0, Math.min(100, 100 - variance));

  return (
    <Card className="border-0 shadow-sm bg-muted/30">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>{emoji}</span>
            <p className="text-sm font-medium">{label}</p>
          </div>
          <p className="text-xs text-muted-foreground">{Math.round(stabilityPct)}%</p>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div className={`h-full rounded-full ${barColor}`}
            initial={{ width: 0 }} animate={{ width: `${stabilityPct}%` }}
            transition={{ duration: 0.8, delay: 1.5, ease: "easeOut" }}
          />
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

const SessionLive = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deepgram = useDeepgramSPS();

  const preselectedPatient = searchParams.get("patient");

  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(preselectedPatient || "none");
  const [duration, setDuration] = useState<Duration>(120);
  const [targetSps, setTargetSps] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [saving, setSaving] = useState(false);
  const [sessionSpsHistory, setSessionSpsHistory] = useState<number[]>([]);
  const [showBilan, setShowBilan] = useState(false);
  const [bilanData, setBilanData] = useState<{ avg: number; max: number; min: number; duration: number } | null>(null);
  const [clinicalNote, setClinicalNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(true);

  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const samplerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const packetSPSRef = useRef(0);
  packetSPSRef.current = deepgram.packetSPS;

  // Fetch patients
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("linked_therapist_id", user.id)
      .eq("is_archived", false)
      .then(({ data }) => {
        if (data) setPatients(data);
        setLoadingPatients(false);
      });
  }, [user]);

  // Sample SPS
  useEffect(() => {
    if (isRecording) {
      samplerRef.current = setInterval(() => {
        if (packetSPSRef.current > 0) {
          setSessionSpsHistory(prev => [...prev, packetSPSRef.current]);
        }
      }, 1000);
    } else {
      if (samplerRef.current) clearInterval(samplerRef.current);
    }
    return () => { if (samplerRef.current) clearInterval(samplerRef.current); };
  }, [isRecording]);

  // Auto-stop
  useEffect(() => {
    if (isRecording && remainingTime <= 0 && elapsedTime > 0) {
      stopRecording();
    }
  }, [remainingTime]);

  const isNoPatient = selectedPatientId === "none";

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      try { await deepgram.start(stream, { detectFillers: false }); } catch {
        toast.info("Recording without real-time analysis.", { duration: 3000 });
      }

      startTimeRef.current = Date.now();
      setRemainingTime(duration);
      setElapsedTime(0);
      setSessionSpsHistory([]);

      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setElapsedTime(elapsed);
          setRemainingTime(Math.max(duration - elapsed, 0));
        }
      }, 1000);

      setIsRecording(true);
    } catch {
      toast.error("Unable to access microphone");
    }
  };

  const stopRecording = async () => {
    setSaving(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (samplerRef.current) clearInterval(samplerRef.current);
    deepgram.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());

    const validSps = sessionSpsHistory.filter(s => s > 0);
    const avg = validSps.length > 0 ? Math.round((validSps.reduce((a, b) => a + b, 0) / validSps.length) * 10) / 10 : 0;
    const max = calculateSafeMaxSPS(validSps);
    const min = validSps.length > 0 ? Math.round(Math.min(...validSps) * 10) / 10 : 0;

    try {
      if (!isNoPatient) {
        const wpmData = sessionSpsHistory.map((sps, i) => ({ timestamp: i, wpm: spsToWpm(sps) }));

        await supabase.from("sessions").insert([{
          user_id: selectedPatientId,
          duration_seconds: elapsedTime,
          avg_wpm: spsToWpm(avg),
          max_wpm: spsToWpm(max),
          target_wpm: 0,
          exercise_type: 'live_session',
          wpm_data: wpmData as unknown as ReturnType<typeof JSON.parse>,
          word_timestamps: deepgram.getWordTimestamps() as unknown as ReturnType<typeof JSON.parse>,
        }]);
      }

      setBilanData({ avg, max, min, duration: elapsedTime });
      setShowBilan(true);
      setIsRecording(false);
      setSaving(false);
    } catch {
      toast.error("Error saving session");
      setSaving(false);
    }
  };

  const handleSaveNote = async () => {
    if (!clinicalNote.trim() || !user || isNoPatient) return;
    setSavingNote(true);
    try {
      await supabase.from("clinical_notes").insert({
        patient_id: selectedPatientId,
        therapist_id: user.id,
        content: clinicalNote.trim(),
      });
      toast.success("Clinical note saved");
      setClinicalNote("");
    } catch {
      toast.error("Error saving note");
    } finally {
      setSavingNote(false);
    }
  };

  const handleNewSession = () => {
    setShowBilan(false);
    setBilanData(null);
    setElapsedTime(0);
    setRemainingTime(0);
    deepgram.reset();
    setSessionSpsHistory([]);
    setClinicalNote("");
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // Gauge color — relative to target
  const gaugeColor = useMemo(() => getRelativeColor(deepgram.packetSPS, targetSps), [deepgram.packetSPS, targetSps]);
  const gaugeEmoji = useMemo(() => getRelativeEmoji(deepgram.packetSPS, targetSps), [deepgram.packetSPS, targetSps]);

  const selectedPatientName = isNoPatient ? "No patient" : (patients.find(p => p.id === selectedPatientId)?.full_name || "Patient");

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-accent/30 flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" /><span className="hidden sm:inline">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-sm sm:text-base">Live Rate Meter</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 max-w-lg flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {showBilan && bilanData ? (
            /* ──── Bilan Wahou ──── */
            <motion.div key="bilan" className="w-full space-y-5" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
              
              {/* Radial Gauge Hero */}
              <div className="flex flex-col items-center pt-2">
                <BilanRadialGauge avg={bilanData.avg} target={targetSps} />
                <motion.p 
                  className="text-sm text-muted-foreground mt-2"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                >
                  {selectedPatientName} • {formatTime(bilanData.duration)}
                </motion.p>
              </div>

              {/* Verdict */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}
              >
                <BilanVerdict avg={bilanData.avg} target={targetSps} />
              </motion.div>

              {/* Min / Max cards */}
              <motion.div 
                className="grid grid-cols-2 gap-3"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}
              >
                <Card className="border-emerald-200/50 dark:border-emerald-900/30 bg-gradient-to-br from-emerald-50/50 to-background dark:from-emerald-950/20">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Min</p>
                      <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{bilanData.min} <span className="text-xs font-normal text-muted-foreground">syll/s</span></p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-red-200/50 dark:border-red-900/30 bg-gradient-to-br from-red-50/50 to-background dark:from-red-950/20">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-red-500 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Max</p>
                      <p className="text-xl font-bold text-red-500 dark:text-red-400">{bilanData.max} <span className="text-xs font-normal text-muted-foreground">syll/s</span></p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Stability */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }}
              >
                <BilanStability avg={bilanData.avg} max={bilanData.max} min={bilanData.min} />
              </motion.div>

              {/* Note clinique — only when a patient is selected */}
              {!isNoPatient && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6 }}>
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <p className="text-sm font-medium">📝 Add a clinical note</p>
                      <Textarea
                        placeholder="Session observations..."
                        value={clinicalNote}
                        onChange={e => setClinicalNote(e.target.value)}
                        rows={3}
                      />
                      <Button onClick={handleSaveNote} disabled={!clinicalNote.trim() || savingNote} size="sm" className="gap-2">
                        <Save className="w-4 h-4" />
                        {savingNote ? "Saving..." : "Save note"}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              {isNoPatient && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}>
                  <p className="text-xs text-center text-muted-foreground">This measurement was not saved (no patient selected).</p>
                </motion.div>
              )}

              <motion.div 
                className="flex gap-3"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8 }}
              >
                <Button variant="outline" className="flex-1 gap-2" onClick={handleNewSession}>
                  New measurement
                </Button>
                {!isNoPatient && (
                  <Button className="flex-1 gap-2" onClick={() => navigate(`/patient/${selectedPatientId}`)}>
                    View patient file
                  </Button>
                )}
              </motion.div>
            </motion.div>
          ) : !isRecording ? (
            /* ──── Setup ──── */
            <motion.div key="setup" className="w-full space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="text-center">
                <div className="text-5xl mb-3">🎯</div>
                <h1 className="text-2xl font-display font-bold mb-2">Live Rate Meter</h1>
                <p className="text-muted-foreground text-sm">
                  Measure your patient's speech rate live during the consultation.
                </p>
              </div>

              {/* Patient Selector */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold">Patient</h3>
                  </div>
                  {loadingPatients ? (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  ) : (
                    <>
                      <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a patient" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No patient (not saved)</SelectItem>
                          {patients.map(p => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.full_name || "Unnamed patient"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isNoPatient && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                          ⚠️ The measurement will not be saved without a selected patient.
                        </p>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Duration */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">⏱️</span>
                    <h3 className="text-sm font-bold">Duration</h3>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {DURATION_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setDuration(opt.value)}
                        className={`p-3 rounded-lg border-2 transition-all text-center ${
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

              {/* Target SPS */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">🎯</span>
                    <h3 className="text-sm font-bold">Target rate</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {TARGET_SPS_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setTargetSps(opt.value)}
                        className={`p-3 rounded-lg border-2 transition-all text-center ${
                          targetSps === opt.value
                            ? "border-primary bg-primary/10 shadow-md"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className={`text-sm font-bold ${targetSps === opt.value ? "text-primary" : ""}`}>
                          {opt.value === 0 ? "—" : opt.value.toFixed(1)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {opt.value === 0 ? "None" : opt.label.split(" — ")[1]}
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Gauge colors will adapt to this target.
                  </p>
                </CardContent>
              </Card>

              <div className="flex justify-center pt-2">
                <Button
                  size="lg"
                  onClick={startRecording}
                  disabled={false}
                  className="h-16 px-10 rounded-2xl text-lg gap-3 shadow-lg shadow-primary/25"
                >
                  <Play className="w-6 h-6" />
                  Start measurement
                </Button>
              </div>
            </motion.div>
          ) : (
            /* ──── Recording: BIG GAUGE ──── */
            <motion.div
              key="recording"
              className="w-full flex flex-col items-center justify-center gap-6 flex-1"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Patient name */}
              <p className="text-sm text-muted-foreground">{selectedPatientName}</p>

              {/* Countdown */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Time remaining</p>
                <p className="text-4xl font-mono font-bold tabular-nums">{formatTime(remainingTime)}</p>
              </div>

              {/* BIG Gauge */}
              <div
                className="flex flex-col items-center justify-center w-56 h-56 rounded-full border-4 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{ borderColor: gaugeColor }}
              >
                <motion.span
                  className="text-6xl"
                  key={gaugeEmoji}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  {gaugeEmoji}
                </motion.span>
                <motion.span
                  className="text-3xl font-bold tabular-nums mt-1"
                  style={{ color: gaugeColor }}
                >
                  {deepgram.packetSPS > 0.3 ? deepgram.packetSPS.toFixed(1) : "—"}
                </motion.span>
                <span className="text-xs text-muted-foreground">syll/s</span>
                {targetSps > 0 && (
                  <span className="text-[10px] text-muted-foreground mt-0.5">target: {targetSps.toFixed(1)}</span>
                )}
              </div>

              {/* Stop */}
              <Button
                size="lg"
                variant="destructive"
                onClick={stopRecording}
                disabled={saving}
                className="h-14 px-8 rounded-2xl text-lg gap-2"
              >
                <Square className="w-5 h-5" />
                {saving ? "Saving..." : "Stop"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default SessionLive;
