import { useState, useRef, useCallback, useEffect } from "react";
import ExerciseIntroModal from "@/components/practice/ExerciseIntroModal";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mic, Square, FlaskConical, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useDeepgramSPS } from "@/hooks/useDeepgramSPS";
import { getDebitStatus } from "@/lib/spsUtils";

interface PacketResult {
  id: number;
  sps: number;
  syllables: number;
  durationMs: number;
}

interface DebugWord {
  word: string;
  syllables: number;
  timestamp: number;
}

const PACKET_SIZES = [5, 10, 15, 20] as const;

function getSpsColor(sps: number): string {
  if (sps === 0) return "text-muted-foreground";
  if (sps < 3.5) return "text-blue-500";
  if (sps <= 5.5) return "text-emerald-500";
  if (sps <= 6.5) return "text-orange-500";
  return "text-red-500";
}

function getSpsEmoji(sps: number): string {
  if (sps === 0) return "⏸️";
  if (sps < 3.5) return "🐢";
  if (sps <= 5.5) return "✅";
  if (sps <= 6.5) return "⚡";
  return "🔴";
}

function getSpsBadgeVariant(sps: number): "default" | "secondary" | "destructive" | "outline" {
  if (sps < 3.5) return "secondary";
  if (sps <= 5.5) return "default";
  if (sps <= 6.5) return "outline";
  return "destructive";
}

export default function DialogueLab() {
  const navigate = useNavigate();
  const deepgram = useDeepgramSPS();

  const [packetSize, setPacketSize] = useState<number>(10);
  const [isRunning, setIsRunning] = useState(false);
  const [packetHistory, setPacketHistory] = useState<PacketResult[]>([]);
  const [currentPacketSyllables, setCurrentPacketSyllables] = useState(0);
  const [latestPacketSps, setLatestPacketSps] = useState(0);
  const [debugWords, setDebugWords] = useState<DebugWord[]>([]);

  // EMA state
  const [alpha, setAlpha] = useState(0.25);
  const [emaSps, setEmaSps] = useState(0);
  const emaSpsRef = useRef(0);
  const emaWordIndexRef = useRef(0);
  const alphaRef = useRef(0.25);

  // Packet tracking refs
  const packetSyllableCountRef = useRef(0);
  const packetFirstStartRef = useRef<number | null>(null);
  const packetLastEndRef = useRef<number | null>(null);
  const processedWordIndexRef = useRef(0);
  const packetIdRef = useRef(0);
  const packetSizeRef = useRef(packetSize);

  // Keep refs in sync
  useEffect(() => { packetSizeRef.current = packetSize; }, [packetSize]);
  useEffect(() => { alphaRef.current = alpha; }, [alpha]);

  const resetPacket = useCallback(() => {
    packetSyllableCountRef.current = 0;
    packetFirstStartRef.current = null;
    packetLastEndRef.current = null;
    setCurrentPacketSyllables(0);
  }, []);

  /**
   * Process words instantly when they arrive from Deepgram (zero polling latency).
   * Called via onWords callback — fires on both final and interim results.
   */
  const processNewWords = useCallback(() => {
    const words = deepgram.getWordTimestamps();
    const startIdx = processedWordIndexRef.current;
    if (words.length <= startIdx) return;

    const size = packetSizeRef.current;

    for (let i = startIdx; i < words.length; i++) {
      const w = words[i];
      if (w.isFiller) continue;

      const syllables = w.syllables;

      // === EMA calculation using 3-word micro-window for stability ===
      if (i >= emaWordIndexRef.current) {
        const microWindow: typeof words = [];
        for (let j = i; j >= 0 && microWindow.length < 3; j--) {
          if (!words[j].isFiller) microWindow.push(words[j]);
        }
        const totalSyll = microWindow.reduce((s, mw) => s + mw.syllables, 0);
        const totalDur = microWindow.reduce((s, mw) => {
          const d = mw.end - mw.start;
          return s + (d > 0.05 && d < 5 ? d : 0);
        }, 0);

        if (totalDur > 0.1) {
          const instantSps = totalSyll / totalDur;
          const a = alphaRef.current;
          const prev = emaSpsRef.current;
          const newEma = prev === 0 ? instantSps : a * instantSps + (1 - a) * prev;
          const clamped = Math.round(Math.min(newEma, 12) * 10) / 10;
          emaSpsRef.current = clamped;
          setEmaSps(clamped);
        }
        emaWordIndexRef.current = i + 1;
      }

      // === Packet calculation ===
      if (packetFirstStartRef.current === null) {
        packetFirstStartRef.current = w.start;
      }
      packetSyllableCountRef.current += syllables;
      packetLastEndRef.current = w.end;

      // Debug: track word
      setDebugWords(prev => [...prev.slice(-19), { word: w.word, syllables, timestamp: Date.now() }]);

      setCurrentPacketSyllables(packetSyllableCountRef.current);

      if (packetSyllableCountRef.current >= size) {
        const duration = (packetLastEndRef.current! - packetFirstStartRef.current!) * 1000;
        const sps = duration > 0
          ? Math.round((packetSyllableCountRef.current / (duration / 1000)) * 10) / 10
          : 0;

        packetIdRef.current += 1;
        const result: PacketResult = {
          id: packetIdRef.current,
          sps,
          syllables: packetSyllableCountRef.current,
          durationMs: Math.round(duration),
        };

        setPacketHistory(prev => [result, ...prev]);
        setLatestPacketSps(sps);
        resetPacket();
      }
    }

    processedWordIndexRef.current = words.length;
  }, [resetPacket, deepgram.getWordTimestamps]);

  // Register instant callback — fires on every Deepgram message (no polling delay)
  useEffect(() => {
    if (isRunning) {
      deepgram.setOnWords(() => processNewWords());
    }
    return () => {
      deepgram.setOnWords(null);
    };
  }, [isRunning, processNewWords, deepgram.setOnWords]);

  const [startError, setStartError] = useState<string | null>(null);

  const handleStart = async () => {
    setStartError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      resetPacket();
      processedWordIndexRef.current = 0;
      packetIdRef.current = 0;
      emaWordIndexRef.current = 0;
      emaSpsRef.current = 0;
      setEmaSps(0);
      setPacketHistory([]);
      setDebugWords([]);
      setLatestPacketSps(0);
      deepgram.reset();
      await deepgram.start(stream);
      setIsRunning(true);
    } catch (e: any) {
      console.error("Start error:", e);
      setStartError(e?.message || "Error starting the microphone");
    }
  };

  const handleStop = () => {
    deepgram.stop();
    setIsRunning(false);
  };

  const progressPercent = packetSize > 0 ? Math.min((currentPacketSyllables / packetSize) * 100, 100) : 0;
  const debitStatus = getDebitStatus(latestPacketSps);
  const classicDebitStatus = getDebitStatus(deepgram.currentSPS);
  const emaDebitStatus = getDebitStatus(emaSps);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background p-4 max-w-lg mx-auto">
        <ExerciseIntroModal categoryId="dialogue-lab" onDismiss={() => {}} />
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Dialogue Lab</h1>
            <Badge variant="outline" className="text-xs">beta</Badge>
          </div>
          <div className="w-10" />
        </div>

        {/* Settings row */}
        <div className="mb-4 space-y-3">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Taille du paquet (syllabes) :</p>
            <div className="flex gap-2">
              {PACKET_SIZES.map(size => (
                <Button
                  key={size}
                  variant={packetSize === size ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPacketSize(size)}
                  disabled={isRunning}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <p className="text-sm text-muted-foreground">Alpha EMA : {alpha.toFixed(2)}</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">
                  <p className="font-medium mb-1">Moyenne Mobile Exponentielle (EMA)</p>
                  <p>Recalcule le SPS à chaque mot reçu. Alpha contrôle la réactivité :</p>
                  <p className="mt-1">• <strong>Alpha bas (0.10)</strong> = très lissé, stable</p>
                  <p>• <strong>Alpha haut (0.50)</strong> = très réactif, fluctuant</p>
                  <p className="mt-1 italic">Formule : SPS = α × SPS_mot + (1−α) × SPS_précédent</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Slider
              value={[alpha]}
              onValueChange={([v]) => setAlpha(v)}
              min={0.05}
              max={0.5}
              step={0.05}
              disabled={isRunning}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
              <span>Stable</span>
              <span>Réactif</span>
            </div>
          </div>
        </div>

        {/* Current packet progress */}
        <Card className="mb-4">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Paquet en cours</p>
            <p className="text-sm font-medium mb-2">
              {currentPacketSyllables} / {packetSize} syllabes
            </p>
            <Progress value={progressPercent} className="h-3" />
            {/* Debug: mots reçus */}
            {debugWords.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {debugWords.map((dw, i) => (
                  <span key={i} className="inline-flex items-center gap-0.5 text-[10px] bg-muted rounded px-1.5 py-0.5">
                    <span>{dw.word}</span>
                    <span className="font-bold text-primary">({dw.syllables})</span>
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* SPS comparison — 3 methods */}
        <div className="mb-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">A/B/C Comparison</p>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <SPSCard label="A · Classic" sublabel="2s window" sps={deepgram.currentSPS} />
          <SPSCard label="B · Packets" sublabel={`${packetSize} syll`} sps={latestPacketSps} />
          <SPSCard label="C · EMA" sublabel={`α=${alpha.toFixed(2)}`} sps={emaSps} />
        </div>

        {/* Start / Stop */}
        <div className="flex gap-3 mb-4">
          {!isRunning ? (
            <Button className="flex-1 gap-2" size="lg" onClick={handleStart}>
              <Mic className="h-5 w-5" /> Start
            </Button>
          ) : (
            <Button className="flex-1 gap-2" size="lg" variant="destructive" onClick={handleStop}>
              <Square className="h-5 w-5" /> Stop
            </Button>
          )}
        </div>

        {/* Errors */}
        {(deepgram.error || startError) && (
          <p className="text-sm text-destructive mb-3">{deepgram.error || startError}</p>
        )}

        {/* Connection status */}
        {isRunning && (
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-2 h-2 rounded-full ${deepgram.isConnected ? "bg-emerald-500" : "bg-orange-500"} animate-pulse`} />
            <span className="text-xs text-muted-foreground">
              {deepgram.isConnected ? "Connected" : "Connecting…"} · {deepgram.syllableCount} total syll.
            </span>
          </div>
        )}

        {/* Method explanations */}
        <Card className="mb-4">
          <CardContent className="pt-4 pb-4 space-y-4 text-xs text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground mb-1">A · Classic — Sliding window (2 seconds)</p>
              <p>All syllables spoken in the <strong>last 2 seconds</strong> are counted and divided by actual speech duration (silences excluded).</p>
              <p className="mt-1"><span className="text-emerald-500">✓</span> Very stable, minimal visual fluctuation.</p>
              <p><span className="text-red-500">✗</span> ~1 second latency: sudden rate spikes appear with a delay. Very short bursts can be smoothed out by the window.</p>
              <p className="mt-1 italic">Analogy: like a 2-hour temperature average — reliable but won't catch a sudden heat spike.</p>
            </div>

            <div>
              <p className="font-semibold text-foreground mb-1">B · Packets — Batch calculation of N syllables</p>
              <p>Waits until exactly <strong>N syllables</strong> (e.g. 10) are spoken, then calculates SPS for that packet: N ÷ packet duration.</p>
              <p className="mt-1"><span className="text-emerald-500">✓</span> Precise and representative: each packet has equal syllable weight. Useful for comparing equal-length segments.</p>
              <p><span className="text-red-500">✗</span> Discontinuous feedback: no updates between packets. If the patient says 9 of 10 syllables, nothing shows until the 10th.</p>
              <p className="mt-1 italic">Analogy: like a car meter showing average speed every 10 km — accurate but not real-time.</p>
            </div>

            <div>
              <p className="font-semibold text-foreground mb-1">C · Smart smoothing (per word)</p>
              <p>With each new word, instantaneous rate is calculated over the <strong>last 3 words</strong> (micro-window), then the displayed score is <strong>adjusted</strong> via a weighted average.</p>

              <p className="mt-2 font-medium text-foreground">The "alpha" slider = a balance ⚖️</p>
              <p>It decides how much weight to give the <strong>latest word</strong> vs. <strong>all previous history</strong>.</p>
              <ul className="list-disc pl-4 space-y-0.5 mt-1">
                <li><strong>Low (0.10)</strong> → 10% latest word, 90% history → very stable</li>
                <li><strong>Medium (0.25)</strong> → recommended → good balance</li>
                <li><strong>High (0.50)</strong> → 50/50 → very responsive</li>
              </ul>

              <div className="mt-2 bg-muted/50 rounded-lg p-2.5">
                <p className="font-medium text-foreground text-[11px] mb-1">📌 Example (alpha = 0.25)</p>
                <p>Patient is speaking at <strong>5.0 syll/s</strong> (current score).</p>
                <p>They speed up and say a word at <strong>8.0 syll/s</strong>.</p>
                <p className="mt-1">→ New score = 25% of 8.0 + 75% of 5.0 = <strong>5.8 syll/s</strong></p>
                <p className="mt-1">The number rises slightly, without jumping to 8. If the patient keeps speaking fast, the score gradually climbs. If they slow down, it eases back smoothly.</p>
              </div>

              <p className="mt-2"><span className="text-emerald-500">✓</span> Updates on every word. Rate evolves smoothly, no sudden jumps.</p>
              <p><span className="text-red-500">✗</span> Requires testing with the patient to find the right setting.</p>
              <p className="mt-1 italic">Analogy: like a GPS recalculating arrival time at every turn — without changing its mind every second.</p>
            </div>
          </CardContent>
        </Card>

        {/* Packet history */}
        <div>
          <p className="text-sm font-medium mb-2">Packet history</p>
          {packetHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No packets completed yet</p>
          ) : (
            <ScrollArea className="h-48">
              <div className="space-y-1.5">
                {packetHistory.map(p => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                  >
                    <span className="text-muted-foreground">#{p.id}</span>
                    <span className={`font-semibold ${getSpsColor(p.sps)}`}>
                      {p.sps.toFixed(1)} syll/s
                    </span>
                    <Badge variant={getSpsBadgeVariant(p.sps)} className="text-xs">
                      {getDebitStatus(p.sps).shortLabel}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {p.syllables} syll · {(p.durationMs / 1000).toFixed(1)}s
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

/** Reusable SPS display card for A/B/C comparison */
function SPSCard({ label, sublabel, sps }: { label: string; sublabel: string; sps: number }) {
  const status = getDebitStatus(sps);
  return (
    <Card>
      <CardContent className="pt-3 pb-3 text-center px-2">
        <p className="text-[10px] font-medium text-muted-foreground leading-tight">{label}</p>
        <p className="text-[9px] text-muted-foreground">{sublabel}</p>
        <p className={`text-2xl font-bold mt-1 ${getSpsColor(sps)}`}>
          {sps > 0 ? sps.toFixed(1) : "—"}
        </p>
        <p className="text-base">{getSpsEmoji(sps)}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{status.label}</p>
      </CardContent>
    </Card>
  );
}
