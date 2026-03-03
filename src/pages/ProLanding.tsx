import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Activity, ArrowRight, BarChart3, Headphones, FileText, Users, Shield,
  Clock, FlaskConical, MessageCircleWarning, AudioWaveform, Timer,
  FileDown, Sparkles, Zap, Dna, CheckCircle2, Play, Flame, Target,
  BookOpen, Wind, Brain, Mic2, Gauge, MessageSquare
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { FounderStorySection } from "@/components/landing/FounderStorySection";
import { ProDemoSection } from "@/components/landing/ProDemoSection";

const benefits = [
  {
    icon: Timer,
    title: "Objective speech rate measurement",
    description: "Measures Syllables Per Second excluding pauses. Van Zaalen clinical metric.",
    isNew: true
  },
  {
    icon: Dna,
    title: "Age-Based Calibration",
    description: "Goals automatically adapted to the patient's profile (child, teen, adult, senior).",
    isNew: true
  },
  {
    icon: MessageCircleWarning,
    title: "Disfluency Detection",
    description: "Automatic detection of filler words ('um', 'like', 'you know'...)."
  },
  {
    icon: Headphones,
    title: "Remote Monitoring",
    description: "Check compliance between sessions. Listen to recordings remotely."
  }
];

const features = [
  {
    icon: Users,
    title: "Patient Management",
    description: "Invite your patients with a unique code. Track their progress from your dashboard."
  },
  {
    icon: Activity,
    title: "SPS & Fluency Ratio",
    description: "Syllables/second calculated on actual speaking time + speech/silence ratio."
  },
  {
    icon: AudioWaveform,
    title: "Visual Feedback & Disfluencies",
    description: "Visualize the waveform and filler word distribution."
  },
  {
    icon: BarChart3,
    title: "Progress Charts",
    description: "Visualize average SPS trends over multiple weeks."
  },
  {
    icon: Clock,
    title: "Complete History",
    description: "Access all sessions with audio recordings and metrics."
  },
  {
    icon: Shield,
    title: "Secure Data",
    description: "HIPAA-conscious hosting. Encrypted data accessible only by you."
  },
  {
    icon: Sparkles,
    title: "Pediatric Mode",
    description: "Visual exercises with emojis for non-reading patients. Integrated breath bars, simplified star-based assessments.",
    isNew: true
  }
];

const ageNorms = [
  { label: "Child", age: "<12 yrs", sps: 4.2, emoji: "👶", color: "bg-blue-500" },
  { label: "Teenager", age: "13-20", sps: 5.5, emoji: "🧑", color: "bg-purple-500" },
  { label: "Adult", age: "21-60", sps: 5.0, emoji: "👤", color: "bg-primary" },
  { label: "Senior", age: ">60 yrs", sps: 4.5, emoji: "🧓", color: "bg-amber-500" },
];

// Animated Speed Gauge Mock Component
const speedStates = [
  { sps: 3.2, label: "Relaxed", emoji: "🐢", color: "text-sky-600 dark:text-sky-400", bgColor: "bg-sky-500", progress: 40 },
  { sps: 4.1, label: "Perfect", emoji: "✅", color: "text-success", bgColor: "bg-success", progress: 51 },
  { sps: 5.3, label: "Fast", emoji: "⚡", color: "text-warning", bgColor: "bg-warning", progress: 66 },
  { sps: 6.8, label: "Too fast", emoji: "🔴", color: "text-destructive", bgColor: "bg-destructive", progress: 85 },
];

const RealTimeFeedbackMock = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % speedStates.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const current = speedStates[currentIndex];
  const targetSps = 4.0;
  const targetProgress = (targetSps / 8) * 100; // 50%

  return (
    <div className="relative">
      <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
        <div className="space-y-5">
          {/* Target display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="w-4 h-4 text-primary" />
              <span>Target:</span>
              <span className="font-bold text-foreground">{targetSps.toFixed(1)} syll/s</span>
            </div>
          </div>

          {/* Main gauge */}
          <div className="space-y-3">
            {/* Current state with animation */}
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3"
            >
              <span className="text-3xl">{current.emoji}</span>
              <div className="flex-1">
                <div className={`text-lg font-bold ${current.color}`}>
                  {current.label}
                </div>
                <div className="text-sm text-muted-foreground">
                  {current.sps.toFixed(1)} syllables/second
                </div>
              </div>
            </motion.div>

            {/* Progress bar */}
            <div className="relative h-4 bg-muted rounded-full overflow-hidden">
              {/* Target zone indicator */}
              <div
                className="absolute h-full bg-success/20"
                style={{ left: `${targetProgress - 8}%`, width: '16%' }}
              />

              {/* Animated bar */}
              <motion.div
                className={`h-full rounded-full ${current.bgColor}`}
                initial={{ width: 0 }}
                animate={{ width: `${current.progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />

              {/* Target marker */}
              <div
                className="absolute top-0 h-full w-0.5 bg-foreground/40"
                style={{ left: `${targetProgress}%` }}
              />
            </div>

            {/* Scale labels */}
            <div className="flex justify-between text-[10px] text-muted-foreground px-1">
              <span>Slow</span>
              <span className="text-success font-medium">Target zone</span>
              <span>Fast</span>
            </div>
          </div>

          {/* State indicators */}
          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-border">
            {speedStates.map((state, i) => (
              <motion.div
                key={i}
                className={`text-center p-2 rounded-lg transition-all duration-200 ${
                  i === currentIndex
                    ? "bg-muted ring-2 ring-primary"
                    : "bg-muted/30"
                }`}
                animate={{ scale: i === currentIndex ? 1.05 : 1 }}
              >
                <div className="text-lg">{state.emoji}</div>
                <div className="text-[10px] text-muted-foreground">{state.sps}</div>
              </motion.div>
            ))}
          </div>

          {/* Van Zaalen reference */}
          <div className="text-[10px] text-center text-muted-foreground pt-2 border-t border-border">
            <FlaskConical className="w-3 h-3 inline mr-1" />
            Articulatory Rate (Van Zaalen) — silences excluded
          </div>
        </div>
      </div>
    </div>
  );
};

const ProLanding = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 gradient-subtle" />
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-primary/[0.03]"
              animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute top-1/2 -left-24 w-[400px] h-[400px] rounded-full bg-accent/30"
              animate={{ scale: [1.1, 1, 1.1], y: [0, 20, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div className="container relative z-10 px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                className="flex flex-wrap items-center justify-center gap-3 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="badge-clinical">
                  <Activity className="w-3.5 h-3.5" />
                  Cluttering & Tachylalia
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-medium">
                  SLP Portal
                </span>
              </motion.div>

              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-6 leading-[1.1] tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Extend the impact of your sessions{" "}
                <span className="gradient-text">at home.</span>
              </motion.h1>

              <motion.p
                className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                The monitoring tool for your patients who clutter or speak too fast.
                Ensure skills transfer at home and generate data-driven reports in one click.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex flex-col items-center">
                  <Button asChild size="lg" className="text-base px-8 h-14 shadow-md hover:shadow-lg">
                    <Link to="/auth">
                      Start my 30-day free trial
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <span className="text-xs text-muted-foreground mt-2">No credit card required</span>
                </div>
                <Button variant="outline" size="lg" className="text-base px-8 h-14" asChild>
                  <a href="#demo">
                    <Play className="w-4 h-4 mr-2" />
                    Watch the demo
                  </a>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Trust badges */}
        <section className="py-8 bg-muted/50 border-y border-border/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-wrap justify-center gap-6 md:gap-10">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-2 text-muted-foreground"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <benefit.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{benefit.title}</span>
                  {benefit.isNew && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-orange-500 text-white rounded-full uppercase">
                      New
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <ProDemoSection />

        {/* Age Calibration Feature Section */}
        <section className="py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <motion.div
              className="max-w-5xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 md:p-12 border-2 border-primary/20 bg-gradient-to-br from-primary/[0.02] to-transparent">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-bold uppercase tracking-wide">
                    <Dna className="w-4 h-4" />
                    Exclusive
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 text-sm font-medium">
                    <FlaskConical className="w-4 h-4" />
                    Based on Van Zaalen
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-10 items-center">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                      Age-Based <span className="text-primary">Calibration</span>
                    </h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      Natural articulatory rate varies by age.
                      <strong className="text-foreground"> The app automatically adapts goals to each patient's profile.</strong>
                    </p>

                    <ul className="space-y-3 mb-8">
                      {[
                        "No more false positives: age-adapted targets",
                        "Van Zaalen clinical norms built in",
                        "Alert if target exceeds physiological norm"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="relative">
                    <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
                      <div className="text-center text-sm text-muted-foreground mb-4">
                        SPS norms by age group
                      </div>

                      <div className="space-y-4">
                        {ageNorms.map((group, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-2xl">{group.emoji}</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-foreground font-medium">{group.label}</span>
                                <span className="text-muted-foreground">{group.age}</span>
                              </div>
                              <div className="h-3 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${group.color} rounded-full transition-all duration-500`}
                                  style={{ width: `${(group.sps / 6) * 100}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-primary font-bold w-12 text-right">{group.sps}</span>
                          </div>
                        ))}
                      </div>

                      <div className="text-[10px] text-center text-muted-foreground pt-3 mt-4 border-t border-border">
                        Van Zaalen — Articulatory Rate Norms
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* PDF Report Feature */}
        <section className="py-20 md:py-28 bg-secondary/30">
          <div className="container px-4 md:px-6">
            <motion.div
              className="max-w-5xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 md:p-12 border-2 border-primary/20">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-bold uppercase tracking-wide">
                    <Sparkles className="w-4 h-4" />
                    New
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-600 text-sm font-medium">
                    <Zap className="w-4 h-4" />
                    Huge time saver
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-10 items-center">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                      PDF Report <span className="text-primary">in 1 click</span>
                    </h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      Generate a clinical report draft with your patients' objective data.
                      <strong className="text-foreground"> A solid starting point for your clinical summaries.</strong>
                    </p>

                    <ul className="space-y-3 mb-8">
                      {[
                        "Smart analysis: auto-generated clinical interpretations",
                        "Built-in charts: SPS trend graph included in the PDF",
                        "Documented compliance: sessions, practice time, current streak"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>

                    <Button asChild size="lg" className="gap-2">
                      <Link to="/auth">
                        <FileDown className="w-5 h-5" />
                        Try for free
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>

                  {/* PDF Preview Mock */}
                  <div className="relative">
                    <div className="bg-white rounded-xl shadow-lg p-6 transform rotate-1 hover:rotate-0 transition-transform duration-300 border border-border">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b-2 border-primary pb-3">
                          <div>
                            <div className="text-xs text-muted-foreground">Progress Report</div>
                            <div className="text-sm font-bold text-foreground">Patient: Martin D.</div>
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { label: "Avg SPS", value: "4.2" },
                            { label: "Sessions", value: "12" },
                            { label: "Compliance", value: "85%" },
                            { label: "Trend", value: "↑" },
                          ].map((stat, i) => (
                            <div key={i} className="text-center p-2 bg-muted/50 rounded-lg">
                              <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                              <div className="text-sm font-bold text-foreground">{stat.value}</div>
                            </div>
                          ))}
                        </div>

                        {/* Mini chart */}
                        <div className="h-16 bg-muted/50 rounded-lg flex items-end justify-around p-2">
                          {[40, 55, 45, 60, 70, 65, 80].map((h, i) => (
                            <div key={i} className="w-3 bg-primary/60 rounded-t" style={{ height: `${h}%` }} />
                          ))}
                        </div>

                        <div className="text-[10px] text-muted-foreground text-center">
                          SPS trends over 4 weeks
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Real-Time Biofeedback Section */}
        <section className="py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <motion.div
              className="max-w-5xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 md:p-12 border-2 border-success/20 bg-gradient-to-br from-success/[0.02] to-transparent">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-success text-success-foreground text-sm font-bold uppercase tracking-wide">
                    <Target className="w-4 h-4" />
                    Real-Time Biofeedback
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 text-sm font-medium">
                    <FlaskConical className="w-4 h-4" />
                    Based on Van Zaalen
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-10 items-center">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                      Instant <span className="text-success">visual feedback</span>
                    </h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      The patient instantly knows if they're speaking too fast thanks to an intuitive color-coded gauge.
                      <strong className="text-foreground"> No more anxiety-inducing numbers.</strong>
                    </p>

                    <ul className="space-y-3 mb-8">
                      {[
                        "SPS metric: Syllables Per Second, not words/minute -- more clinically precise",
                        "Articulatory Rate: calculation excluding silences (pauses not counted)",
                        "Emotional feedback: emojis and colors instead of raw data",
                        "Personalized target zone: the patient sees their goal in green"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Animated Speed Gauge Mock */}
                  <RealTimeFeedbackMock />
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Dialogue Mode Feature Section */}
        <section className="py-20 md:py-28 bg-secondary/30">
          <div className="container px-4 md:px-6">
            <motion.div
              className="max-w-5xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 md:p-12 border-2 border-primary/20 bg-gradient-to-br from-primary/[0.02] to-transparent">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-bold uppercase tracking-wide">
                    <Sparkles className="w-4 h-4" />
                    New
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    Real-world transfer
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-10 items-center">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                      Dialogue Mode: <span className="text-primary">guided conversation</span>
                    </h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      Your patients set the phone on the table and talk freely.
                      <strong className="text-foreground"> A visual indicator tells them in real time if they're speaking too fast.</strong>
                    </p>

                    <ul className="space-y-3 mb-8">
                      {[
                        "Skills transfer: from exercises to real conversation",
                        "Clean interface: a single emoji visible from afar, zero stress",
                        "Short sessions: 30 sec to 5 min to fit into your session",
                        "Tracked data: SPS, duration and results in the patient file"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>

                    <Button asChild size="lg" className="gap-2">
                      <Link to="/auth">
                        Try Dialogue Mode
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>

                  {/* Dialogue Mode Preview Mock */}
                  <div className="relative">
                    <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
                      <div className="text-center text-sm text-muted-foreground mb-4">
                        Dialogue Mode Preview
                      </div>

                      <div className="flex flex-col items-center gap-4">
                        <div className="w-32 h-32 rounded-full border-4 border-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 flex flex-col items-center justify-center">
                          <span className="text-4xl">✅</span>
                          <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">Perfect</span>
                          <span className="text-[10px] text-muted-foreground">4.0 syll/s</span>
                        </div>

                        <p className="text-xs text-muted-foreground text-center max-w-[200px]">
                          A single large indicator visible from afar -- emoji changes in real time
                        </p>

                        <div className="flex items-center gap-3 w-full mt-2">
                          {[
                            { emoji: "🐢", label: "Slow", color: "bg-sky-100 dark:bg-sky-900/30" },
                            { emoji: "✅", label: "Perfect", color: "bg-emerald-100 dark:bg-emerald-900/30 ring-2 ring-primary" },
                            { emoji: "⚡", label: "Fast", color: "bg-amber-100 dark:bg-amber-900/30" },
                          ].map((state, i) => (
                            <div key={i} className={`flex-1 text-center p-2 rounded-lg ${state.color}`}>
                              <div className="text-lg">{state.emoji}</div>
                              <div className="text-[10px] text-muted-foreground">{state.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="text-[10px] text-center text-muted-foreground pt-3 mt-4 border-t border-border">
                        Set the phone down and chat naturally
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Patient Motivation Section */}
        <section className="py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <motion.div
              className="max-w-5xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 md:p-12 border-2 border-accent-foreground/20 bg-gradient-to-br from-accent/30 to-transparent">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-warning text-warning-foreground text-sm font-bold uppercase tracking-wide">
                    <Flame className="w-4 h-4" />
                    Motivation
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium">
                    <Target className="w-4 h-4" />
                    Prevent dropout
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-10 items-center">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                      Keep your patients <span className="text-accent-foreground">motivated</span>
                    </h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      Inspired by Duolingo, the app gamifies therapy to maximize compliance between sessions.
                      <strong className="text-foreground"> Your patients come back on their own.</strong>
                    </p>

                    <ul className="space-y-3 mb-8">
                      {[
                        "Day streaks: the patient doesn't want to break their streak",
                        "Daily goal: customizable progress ring",
                        "Encouraging feedback: confetti and celebrations on every success"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-accent-foreground flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>

                    <Button asChild size="lg" className="gap-2">
                      <Link to="/auth">
                        Start the free trial
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>

                  {/* Gamification Preview Mock */}
                  <div className="relative">
                    <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
                      <div className="space-y-5">
                        {/* Streak */}
                        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-accent to-accent/50 rounded-xl border border-accent-foreground/20">
                          <div className="w-12 h-12 rounded-full bg-accent-foreground/10 flex items-center justify-center">
                            <Flame className="w-6 h-6 text-accent-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm text-muted-foreground">Current streak</div>
                            <div className="text-2xl font-bold text-accent-foreground">7 days</div>
                          </div>
                        </div>

                        {/* Daily Goal Ring */}
                        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                          <div className="relative">
                            <svg width={60} height={60} className="transform -rotate-90">
                              <circle cx={30} cy={30} r={25} fill="none" stroke="currentColor" strokeWidth={5} className="text-muted/30" />
                              <circle cx={30} cy={30} r={25} fill="none" stroke="hsl(var(--success))" strokeWidth={5} strokeLinecap="round"
                                strokeDasharray={2 * Math.PI * 25} strokeDashoffset={2 * Math.PI * 25 * 0.2} />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <CheckCircle2 className="w-6 h-6 text-success" />
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Daily goal</div>
                            <div className="font-bold text-foreground">3/3 min</div>
                          </div>
                        </div>

                        {/* Week Progress */}
                        <div className="pt-4 border-t border-border">
                          <div className="text-sm text-muted-foreground mb-3 text-center">This week</div>
                          <div className="flex justify-center gap-2">
                            {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                              <div key={i} className="flex flex-col items-center gap-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                                  ${i < 5 ? "bg-success text-success-foreground" : i === 5 ? "bg-primary/20 text-primary ring-2 ring-primary" : "bg-muted text-muted-foreground"}`}>
                                  {i < 5 ? "✓" : day}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Exercise Library Section */}
        <section className="py-20 md:py-28 bg-secondary/30">
          <div className="container px-4 md:px-6">
            <motion.div
              className="max-w-5xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 md:p-12 border-2 border-primary/20 bg-gradient-to-br from-primary/[0.02] to-transparent">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-bold uppercase tracking-wide">
                    <BookOpen className="w-4 h-4" />
                    Library
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    <Sparkles className="w-4 h-4" />
                    90+ varied exercises
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-10 items-center">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                      Content <span className="text-primary">for every goal</span>
                    </h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      A rich and varied library to maintain your patients' engagement.
                      <strong className="text-foreground"> No more monotonous repetitive exercises.</strong>
                    </p>

                    <ul className="space-y-3 mb-8">
                      {[
                        "Progressive exercises adapted to each level",
                        "Targeted categories: articulation, breathing, control...",
                        "New content added regularly"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>

                    <Button asChild size="lg" className="gap-2">
                      <Link to="/auth">
                        Explore the library
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>

                  {/* Exercise Categories Preview */}
                  <div className="relative space-y-4">
                    <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
                      <div className="text-center text-sm text-muted-foreground mb-4">
                        Exercise categories
                      </div>

                      <div className="space-y-3">
                        {[
                          { icon: Gauge, label: "Rate Control", count: 10, color: "bg-primary/10 text-primary" },
                          { icon: Mic2, label: "Articulation", count: 20, color: "bg-success/10 text-success" },
                          { icon: Activity, label: "Motor Challenges", count: 12, color: "bg-warning/10 text-warning" },
                          { icon: Wind, label: "Breath Management", count: 10, color: "bg-sky-500/10 text-sky-600" },
                          { icon: Brain, label: "Cognitive Challenges", count: 8, color: "bg-purple-500/10 text-purple-600" },
                          { icon: Zap, label: "Vocal Warm-up", count: 5, color: "bg-orange-500/10 text-orange-600" },
                          { icon: MessageSquare, label: "Dialogue Mode", count: null, color: "bg-primary/10 text-primary", isNew: true },
                        ].map((cat, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                            <div className={`w-9 h-9 rounded-lg ${cat.color} flex items-center justify-center`}>
                              <cat.icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground">{cat.label}</span>
                              {(cat as any).isNew && (
                                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary text-primary-foreground rounded-full uppercase">
                                  New
                                </span>
                              )}
                            </div>
                            {cat.count && (
                              <span className="text-xs font-bold text-muted-foreground bg-background px-2 py-1 rounded-full">
                                {cat.count}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="text-[10px] text-center text-muted-foreground pt-3 mt-4 border-t border-border">
                        Content created by SLPs
                      </div>
                    </div>

                    {/* Rebus Child Mode Card */}
                    <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/50 dark:via-yellow-950/40 dark:to-orange-950/40 border-2 border-yellow-200 dark:border-yellow-800 p-5">
                      <div className="absolute top-3 right-3 text-2xl opacity-50 animate-bounce" style={{ animationDuration: '3s' }}>🐢</div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">🖼️</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-foreground">Rebus Mode</span>
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full uppercase">
                              New
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">Children & non-readers - Ages 4+</p>
                        </div>
                        <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/40 px-2.5 py-1 rounded-full">
                          25 ex.
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xl bg-white/60 dark:bg-background/40 rounded-lg px-3 py-2">
                        <span>🏠</span>
                        <span className="text-sm text-foreground">→</span>
                        <span className="text-sm font-medium text-foreground">"house"</span>
                        <span className="text-muted-foreground mx-1">·</span>
                        <span>🐱</span>
                        <span className="text-sm text-foreground">→</span>
                        <span className="text-sm font-medium text-foreground">"cat"</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Everything for clinical monitoring
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Tools designed for SLPs, by SLPs.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="p-6 h-full hover:shadow-card-hover transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      {(feature as any).isNew && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-orange-500 text-white rounded-full uppercase">
                          New
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-16 md:py-20">
          <div className="container px-4 md:px-6">
            <motion.div
              className="max-w-3xl mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative bg-card rounded-2xl p-8 md:p-12 shadow-lg border border-primary/10">
                <div className="text-4xl mb-6">💬</div>
                <blockquote className="text-lg md:text-xl text-foreground italic leading-relaxed mb-6">
                  "Well designed and easy to use. It's truly the tool I was missing to objectively measure speech rate."
                </blockquote>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">S</span>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Speech-Language Pathologist</p>
                    <p className="text-sm text-muted-foreground">Healthcare professional</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 md:py-28 bg-muted/30">
          <div className="container px-4 md:px-6">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to know about ClutterPro
              </p>
            </motion.div>

            <motion.div
              className="max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Accordion type="single" collapsible className="space-y-3">
                <AccordionItem value="item-1" className="bg-card border border-border rounded-xl px-6 overflow-hidden">
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="text-foreground font-medium">
                      How do my patients access the app?
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    Your patients create an account and enter your unique Pro Code.
                    They then appear in your dashboard.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="bg-card border border-border rounded-xl px-6 overflow-hidden">
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="text-foreground font-medium">
                      How does the Pro subscription work?
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    You get a <strong className="text-foreground">30-day free trial</strong> with no credit card required.
                    After that, the subscription includes a number of active patient seats (3 or 5).
                    Your patients access all features for free via your Pro Code.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="bg-card border border-border rounded-xl px-6 overflow-hidden">
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="text-foreground font-medium">
                      How do you calculate speech rate?
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    We use the Articulation Rate (SPS) as defined by Van Zaalen.
                    Syllables Per Second are calculated excluding pauses,
                    which is the clinically relevant indicator for cluttering.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4" className="bg-card border border-border rounded-xl px-6 overflow-hidden">
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="text-foreground font-medium">
                      Is the data secure?
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    Absolutely. All data is hosted on secure US-based servers, encrypted,
                    and follows HIPAA-conscious practices. Only you and your patient have access to recordings.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5" className="bg-card border border-border rounded-xl px-6 overflow-hidden">
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="text-foreground font-medium">
                      Do I need to install anything?
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    No installation is required. ClutterPro works directly
                    from a web browser, on phone, tablet, or computer. Your patients
                    can practice anywhere, anytime.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6" className="bg-card border border-border rounded-xl px-6 overflow-hidden">
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="text-foreground font-medium">
                      Can I get a personalized demo?
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    Of course! We provide personalized onboarding to help you get started.
                    Email us at{" "}
                    <a href="mailto:support@clutterpro.com" className="text-primary hover:underline font-medium">
                      support@clutterpro.com
                    </a>{" "}
                    and we'll take the time to show you ClutterPro in detail.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          </div>
        </section>

        {/* Founder Story Section */}
        <FounderStorySection audience="therapist" />

        {/* CTA Section */}
        <section className="py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <motion.div
              className="max-w-3xl mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to improve your patient monitoring?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Create your free account in 30 seconds. No credit card required.
              </p>
              <Button asChild size="lg" className="text-base px-8 h-14 shadow-md hover:shadow-lg">
                <Link to="/auth">
                  Create a free Pro account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ProLanding;
