/**
 * Clinical Report Analysis Module
 * 
 * Aggregates patient data and generates intelligent clinical summaries
 * for the PDF report generator.
 */

import { wpmToSps, SPS_THRESHOLDS } from "./spsUtils";

export interface SessionData {
  id: string;
  created_at: string;
  duration_seconds: number;
  avg_wpm: number;
  max_wpm: number;
  exercise_type?: string | null;
}

export interface PatientProfile {
  id: string;
  full_name: string | null;
  current_streak: number;
  longest_streak: number;
  today_minutes: number;
  target_wpm: number | null;
  created_at: string;
  birth_year?: number | null;
}

export interface ExerciseStats {
  min: number;
  max: number;
  avg: number;
  count: number;
}

export interface ReportOptions {
  recipientDoctor?: string;
  therapistNotes?: string;
  includeEvolutionChart?: boolean;
}

export interface ClinicalAnalysis {
  // Patient Info
  patientName: string;
  patientAge?: number | null;
  followUpSince: string;
  
  // Aggregated Metrics
  totalSessions: number;
  totalPracticeMinutes: number;
  
  // SPS Analysis
  avgSPS: number;
  maxSPS: number;
  minSPS: number;
  
  // Stats by exercise type
  readingStats: ExerciseStats;
  improvisationStats: ExerciseStats;
  
  // Variability
  variabilityScore: number;
  
  // Fluency Analysis
  fluencyRatio: number; // % of sessions below target
  articulatoryRate: number; // Estimated articulation rate (without pauses)
  
  // Trend Analysis
  trendPercentage: number;
  trendDirection: "improving" | "stable" | "regressing";
  
  // Engagement Metrics
  currentStreak: number;
  longestStreak: number;
  weeklyMinutes: number;
  
  // Exercise Breakdown
  readingSessions: number;
  improvisationSessions: number;
  
  // Clinical Interpretations (AI-generated text)
  mainDiagnosis: string;
  fluencyInterpretation: string;
  trendInterpretation: string;
  recommendation: string;
  
  // Report options (from modal)
  recipientDoctor?: string;
  therapistNotes?: string;
  includeEvolutionChart: boolean;
  
  // For chart
  evolutionData: {
    date: string;
    sps: number;
    target: number;
  }[];
}

/**
 * Calculate standard deviation for variability score
 */
function calculateStdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(avgSquaredDiff);
}

/**
 * Calculate stats for a specific exercise type
 */
function calculateExerciseStats(sessions: SessionData[], exerciseType: string): ExerciseStats {
  const filtered = sessions.filter(s => 
    exerciseType === "reading" 
      ? (s.exercise_type === "reading" || !s.exercise_type)
      : s.exercise_type === exerciseType
  );
  
  if (filtered.length === 0) {
    return { min: 0, max: 0, avg: 0, count: 0 };
  }
  
  const spsValues = filtered.map(s => wpmToSps(s.avg_wpm));
  const avg = Math.round((spsValues.reduce((a, b) => a + b, 0) / spsValues.length) * 100) / 100;
  
  return {
    min: Math.round(Math.min(...spsValues) * 100) / 100,
    max: Math.round(Math.max(...spsValues) * 100) / 100,
    avg,
    count: filtered.length,
  };
}

/**
 * Generates clinical interpretation text based on SPS thresholds
 */
function generateMainDiagnosis(avgSPS: number, readingStats: ExerciseStats, improvisationStats: ExerciseStats): string {
  if (avgSPS === 0) {
    return "Insufficient data to establish a speech rate diagnosis.";
  }

  const parts: string[] = [];

  if (avgSPS < 3.5) {
    parts.push("Controlled articulatory rate, below the conversational norm.");
  } else if (avgSPS <= 5.5) {
    parts.push("Normal-fluent articulatory rate, within the conversational norm range (3.5–5.5 syll/s).");
  } else if (avgSPS <= 6.5) {
    parts.push("Fast spontaneous rate (> 5.5 syll/s), characteristic of an acceleration tendency.");
  } else {
    parts.push("Spontaneous rate characteristic of cluttering/tachylalia (> 6.5 syll/s).");
  }

  // Add range information if available
  if (improvisationStats.count > 0) {
    parts.push(`In spontaneous speech: average of ${improvisationStats.avg.toFixed(2)} syll/s, ranging from ${improvisationStats.min.toFixed(2)} to ${improvisationStats.max.toFixed(2)}.`);
  }

  if (readingStats.count > 0 && improvisationStats.count > 0) {
    const diff = improvisationStats.avg - readingStats.avg;
    if (Math.abs(diff) > 0.5) {
      if (diff > 0) {
        parts.push("The speech rate during improvisation is significantly faster than during reading.");
      } else {
        parts.push("The speech rate is paradoxically slower during improvisation than during reading.");
      }
    }
  }
  
  return parts.join(" ");
}

/**
 * Generates fluency interpretation
 */
function generateFluencyInterpretation(fluencyRatio: number, avgSPS: number, variabilityScore: number): string {
  const parts: string[] = [];
  
  if (fluencyRatio >= 80) {
    parts.push(`Excellent rate control: ${fluencyRatio}% of sessions within the target zone.`);
  } else if (fluencyRatio >= 50) {
    parts.push(`Consistency improving: ${fluencyRatio}% of sessions reach the target.`);
  } else if (avgSPS > 5.0) {
    parts.push(`Insufficient breathing control: only ${fluencyRatio}% of sessions within target.`);
  } else {
    parts.push(`Significant rate variability: ${fluencyRatio}% of sessions within range.`);
  }

  // Add variability interpretation
  if (variabilityScore > 1.0) {
    parts.push(`Marked rate instability (standard deviation = ${variabilityScore.toFixed(2)} syll/s).`);
  } else if (variabilityScore > 0.5) {
    parts.push(`Moderate rate variability (standard deviation = ${variabilityScore.toFixed(2)} syll/s).`);
  } else if (variabilityScore > 0) {
    parts.push(`Good rate stability (standard deviation = ${variabilityScore.toFixed(2)} syll/s).`);
  }
  
  return parts.join(" ");
}

/**
 * Generates trend interpretation
 */
function generateTrendInterpretation(
  trendDirection: "improving" | "stable" | "regressing",
  trendPercentage: number,
  totalSessions: number
): string {
  if (totalSessions < 4) {
    return "Insufficient number of sessions to establish a significant trend.";
  }

  if (trendDirection === "improving") {
    return `Encouraging progress with a ${Math.abs(trendPercentage).toFixed(0)}% regularization of the articulatory rate over the analyzed period. The speech pattern is progressively stabilizing.`;
  }

  if (trendDirection === "stable") {
    return "Stable articulatory rate over the analyzed period. Consolidated speech pattern; maintenance of gains observed.";
  }

  return `Slight regression in speech rate (+${Math.abs(trendPercentage).toFixed(0)}%). Reinforcement of slowing techniques and review of prior gains recommended.`;
}

/**
 * Generates recommendation based on analysis
 */
function generateRecommendation(avgSPS: number, trendDirection: string, fluencyRatio: number, readingStats: ExerciseStats, improvisationStats: ExerciseStats): string {
  const recommendations: string[] = [];
  
  if (avgSPS > 5.0) {
    recommendations.push("Intensify work on inter-sentence breathing pauses and voluntary slowing");
  }

  if (avgSPS > 5.5) {
    recommendations.push("Slowing exercises with delayed auditory feedback (DAF) recommended");
  }

  if (fluencyRatio < 50) {
    recommendations.push("Increase frequency of oral reading exercises with an internal metronome");
  }

  if (trendDirection === "regressing") {
    recommendations.push("Revise therapeutic goals and consolidate prior gains before advancing further");
  }

  if (trendDirection === "improving" && fluencyRatio >= 70) {
    recommendations.push("Gradual transition to improvisation and spontaneous speech exercises");
  }

  // Specific recommendations based on exercise type differences
  if (readingStats.count > 0 && improvisationStats.count > 0) {
    const diff = improvisationStats.avg - readingStats.avg;
    if (diff > 1.0) {
      recommendations.push("Specific work on transferring reading gains to spontaneous speech");
    }
  }

  if (recommendations.length === 0) {
    recommendations.push("Continue the current protocol while maintaining gains and progressively generalizing");
  }
  
  return recommendations.join(". ") + ".";
}

/**
 * Main analysis function - aggregates all patient data
 */
export function analyzePatientData(
  sessions: SessionData[],
  profile: PatientProfile,
  options: ReportOptions = {}
): ClinicalAnalysis {
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  
  // Basic counts
  const totalSessions = sortedSessions.length;
  const totalPracticeMinutes = Math.round(
    sortedSessions.reduce((acc, s) => acc + s.duration_seconds, 0) / 60
  );
  
  // SPS calculations
  const spsValues = sortedSessions.map(s => wpmToSps(s.avg_wpm));
  const avgSPS = totalSessions > 0 
    ? Math.round((spsValues.reduce((a, b) => a + b, 0) / totalSessions) * 100) / 100
    : 0;
  const maxSPS = totalSessions > 0 ? Math.round(Math.max(...spsValues) * 100) / 100 : 0;
  const minSPS = totalSessions > 0 ? Math.round(Math.min(...spsValues.filter(s => s > 0)) * 100) / 100 : 0;
  
  // Calculate stats by exercise type
  const readingStats = calculateExerciseStats(sortedSessions, "reading");
  const improvisationStats = calculateExerciseStats(sortedSessions, "improvisation");
  
  // Variability score (standard deviation)
  const variabilityScore = Math.round(calculateStdDev(spsValues) * 100) / 100;
  
  // Target threshold (default 4.5 SPS = ~150 WPM)
  const targetSPS = profile.target_wpm ? wpmToSps(profile.target_wpm) : 4.5;
  
  // Fluency ratio (% of sessions at or below target)
  const sessionsInTarget = sortedSessions.filter(s => wpmToSps(s.avg_wpm) <= targetSPS).length;
  const fluencyRatio = totalSessions > 0 
    ? Math.round((sessionsInTarget / totalSessions) * 100)
    : 0;
  
  // Estimated articulatory rate (without pauses) - typically 1.2x the speaking rate
  const articulatoryRate = Math.round(avgSPS * 1.2 * 100) / 100;
  
  // Trend analysis (compare first third vs last third)
  let trendPercentage = 0;
  let trendDirection: "improving" | "stable" | "regressing" = "stable";
  
  if (sortedSessions.length >= 4) {
    const thirdLength = Math.floor(sortedSessions.length / 3);
    const firstThird = sortedSessions.slice(0, thirdLength);
    const lastThird = sortedSessions.slice(-thirdLength);
    
    const firstThirdAvg = firstThird.reduce((acc, s) => acc + s.avg_wpm, 0) / firstThird.length;
    const lastThirdAvg = lastThird.reduce((acc, s) => acc + s.avg_wpm, 0) / lastThird.length;
    
    const firstSPS = wpmToSps(firstThirdAvg);
    const lastSPS = wpmToSps(lastThirdAvg);
    
    trendPercentage = firstSPS > 0 
      ? ((firstSPS - lastSPS) / firstSPS) * 100 
      : 0;
    
    if (trendPercentage > 5) {
      trendDirection = "improving"; // Lower SPS = improvement
    } else if (trendPercentage < -5) {
      trendDirection = "regressing";
    }
  }
  
  // Exercise breakdown
  const readingSessions = readingStats.count;
  const improvisationSessions = improvisationStats.count;
  
  // Weekly minutes (last 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weeklyMinutes = Math.round(
    sortedSessions
      .filter(s => new Date(s.created_at) >= oneWeekAgo)
      .reduce((acc, s) => acc + s.duration_seconds, 0) / 60
  );
  
  // Evolution data for chart (last 10 sessions)
  const recentSessions = sortedSessions.slice(-10);
  const evolutionData = recentSessions.map(s => ({
    date: new Date(s.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short" }),
    sps: wpmToSps(s.avg_wpm),
    target: targetSPS,
  }));
  
  // Calculate patient age
  const patientAge = profile.birth_year 
    ? new Date().getFullYear() - profile.birth_year
    : null;
  
  // Generate interpretations
  const mainDiagnosis = generateMainDiagnosis(avgSPS, readingStats, improvisationStats);
  const fluencyInterpretation = generateFluencyInterpretation(fluencyRatio, avgSPS, variabilityScore);
  const trendInterpretation = generateTrendInterpretation(trendDirection, trendPercentage, totalSessions);
  const recommendation = generateRecommendation(avgSPS, trendDirection, fluencyRatio, readingStats, improvisationStats);
  
  return {
    patientName: profile.full_name || "Patient",
    patientAge,
    followUpSince: new Date(profile.created_at).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    totalSessions,
    totalPracticeMinutes,
    avgSPS,
    maxSPS,
    minSPS,
    readingStats,
    improvisationStats,
    variabilityScore,
    fluencyRatio,
    articulatoryRate,
    trendPercentage,
    trendDirection,
    currentStreak: profile.current_streak,
    longestStreak: profile.longest_streak,
    weeklyMinutes,
    readingSessions,
    improvisationSessions,
    mainDiagnosis,
    fluencyInterpretation,
    trendInterpretation,
    recommendation,
    recipientDoctor: options.recipientDoctor,
    therapistNotes: options.therapistNotes,
    includeEvolutionChart: options.includeEvolutionChart ?? true,
    evolutionData,
  };
}

/**
 * Get color for SPS value (for PDF styling)
 */
export function getSPSColor(sps: number): "green" | "orange" | "red" | "gray" {
  if (sps === 0) return "gray";
  if (sps <= SPS_THRESHOLDS.optimal) return "green";
  if (sps <= SPS_THRESHOLDS.tachylalia) return "orange";
  return "red";
}

/**
 * Get interpretation label
 */
export function getSPSInterpretation(sps: number): string {
  if (sps === 0) return "—";
  if (sps < 3.5) return "Slow (controlled)";
  if (sps <= 5.5) return "Normal fluency";
  if (sps <= 6.5) return "Fast";
  return "Cluttering range";
}

/**
 * Generate a plain text report from the clinical analysis
 */
export function generateTextReport(analysis: ClinicalAnalysis, therapistName?: string): string {
  const lines: string[] = [];
  const date = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const divider = "─".repeat(52);
  const doubleDivider = "═".repeat(52);

  // Header
  lines.push(doubleDivider);
  lines.push("");
  lines.push("    SLP FOLLOW-UP CLINICAL REPORT");
  lines.push("    Instrumental analysis of articulatory rate");
  lines.push("");
  lines.push(doubleDivider);
  lines.push("");
  lines.push(`  Report date        ${date}`);
  if (therapistName) {
    lines.push(`  Clinician          ${therapistName}`);
  }
  if (analysis.recipientDoctor) {
    lines.push(`  Recipient          Dr ${analysis.recipientDoctor}`);
  }
  lines.push("");

  // Section 1: Patient Info
  lines.push(divider);
  lines.push("  1 · PATIENT INFORMATION");
  lines.push(divider);
  lines.push("");
  lines.push(`  Patient            ${analysis.patientName}`);
  if (analysis.patientAge) {
    lines.push(`  Age                ${analysis.patientAge} years`);
  }
  lines.push(`  Follow-up since    ${analysis.followUpSince}`);
  lines.push("");

  // Section 2: Summary - Key metrics in a clean grid
  lines.push(divider);
  lines.push("  2 · FOLLOW-UP SUMMARY");
  lines.push(divider);
  lines.push("");
  lines.push(`  ┌────────────────────────┬────────────────────────┐`);
  lines.push(`  │  Sessions              │  ${String(analysis.totalSessions).padEnd(20)} │`);
  lines.push(`  │  Practice minutes      │  ${String(analysis.totalPracticeMinutes).padEnd(20)} │`);
  lines.push(`  │  Current streak        │  ${String(analysis.currentStreak + " days").padEnd(20)} │`);
  lines.push(`  │  Sessions on target    │  ${String(analysis.fluencyRatio + "%").padEnd(20)} │`);
  lines.push(`  └────────────────────────┴────────────────────────┘`);
  lines.push("");

  // Section 3: Articulation Rate Measurements
  lines.push(divider);
  lines.push("  3 · ARTICULATORY RATE MEASUREMENTS");
  lines.push(divider);
  lines.push("");
  lines.push("  Context                    Min      Avg      Max      Norm");
  lines.push("  ·························  ·····    ·····    ·····    ·········");

  if (analysis.readingStats.count > 0) {
    const r = analysis.readingStats;
    lines.push(`  Reading (${String(r.count).padStart(2)} sessions)      ${r.min.toFixed(2).padStart(5)}    ${r.avg.toFixed(2).padStart(5)}    ${r.max.toFixed(2).padStart(5)}    3.5 – 5.5`);
  }

  if (analysis.improvisationStats.count > 0) {
    const i = analysis.improvisationStats;
    lines.push(`  Spontaneous speech (${String(i.count).padStart(2)})    ${i.min.toFixed(2).padStart(5)}    ${i.avg.toFixed(2).padStart(5)}    ${i.max.toFixed(2).padStart(5)}    4.0 – 6.0`);
  }

  lines.push("");
  lines.push(`  Articulatory rate*         ${analysis.articulatoryRate.toFixed(2)} syll/s   (norm: 5.0 – 6.5)`);
  lines.push("  * Estimated per Van Zaalen (rate excluding pauses)");
  lines.push("");

  // Section 4: Regularity Analysis
  lines.push(divider);
  lines.push("  4 · REGULARITY ANALYSIS");
  lines.push(divider);
  lines.push("");
  // Wrap long text with indentation
  wrapText(analysis.mainDiagnosis, 48).forEach(l => lines.push(`  ${l}`));
  lines.push("");
  wrapText(analysis.fluencyInterpretation, 48).forEach(l => lines.push(`  ${l}`));
  lines.push("");

  // Section 5: Evolution
  lines.push(divider);
  lines.push("  5 · PROGRESSION");
  lines.push(divider);
  lines.push("");
  wrapText(analysis.trendInterpretation, 48).forEach(l => lines.push(`  ${l}`));
  lines.push("");

  // Section 6: Therapist Notes
  let nextSection = 6;
  if (analysis.therapistNotes) {
    lines.push(divider);
    lines.push(`  ${nextSection} · CLINICIAN OBSERVATIONS`);
    lines.push(divider);
    lines.push("");
    wrapText(analysis.therapistNotes, 48).forEach(l => lines.push(`  ${l}`));
    lines.push("");
    nextSection++;
  }

  // Recommendations
  lines.push(divider);
  lines.push(`  ${nextSection} · SUGGESTED THERAPEUTIC DIRECTIONS`);
  lines.push(divider);
  lines.push("");
  const recommendations = analysis.recommendation.split(". ");
  recommendations.forEach(rec => {
    if (rec.trim()) {
      const text = `${rec.trim()}${rec.endsWith(".") ? "" : "."}`;
      const wrapped = wrapText(text, 46);
      lines.push(`  → ${wrapped[0]}`);
      wrapped.slice(1).forEach(l => lines.push(`    ${l}`));
    }
  });
  lines.push("");

  // Footer
  lines.push(doubleDivider);
  lines.push("");
  lines.push("  This document is an instrumental aid for");
  lines.push("  measuring articulatory rate. It does not");
  lines.push("  replace clinical diagnosis.");
  lines.push("");
  lines.push("  Generated via ClutterPro.com");
  lines.push("");
  lines.push(doubleDivider);

  return lines.join("\n");
}

/**
 * Wrap text to a maximum width
 */
function wrapText(text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (currentLine.length + word.length + 1 > maxWidth && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = currentLine ? `${currentLine} ${word}` : word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}
