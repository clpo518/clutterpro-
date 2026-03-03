import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Activity, ArrowLeft, User, Calendar, TrendingDown, TrendingUp, Clock, ChevronRight, Award, FileText, Plus, Loader2, Lock, Trash2, Send, Gauge } from "lucide-react";
import { ExerciseTypeBadge } from "@/lib/exerciseTypeUtils";
import AssignExerciseModal from "@/components/assignments/AssignExerciseModal";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { generateShortSummary, getDebitStatus } from "@/lib/clinicalSummary";
import { MetricTooltip, METRIC_TOOLTIPS } from "@/components/pro/MetricTooltip";
import GenerateReportButton from "@/components/reports/GenerateReportButton";
import { wpmToSps } from "@/lib/spsUtils";
import { getAgeGroup, calculateAge, getNormSPS } from "@/lib/ageNormsUtils";
import { Target, Info } from "lucide-react";

interface Session {
  id: string;
  created_at: string;
  duration_seconds: number;
  avg_wpm: number;
  max_wpm: number;
  notes: string | null;
  exercise_type?: string | null;
  patient_sentiment?: string | null;
}

interface Patient {
  id: string;
  full_name: string | null;
  created_at: string;
  current_streak: number;
  longest_streak: number;
  today_minutes: number;
  target_wpm: number | null;
  birth_year: number | null;
}

interface ClinicalNote {
  id: string;
  content: string;
  created_at: string;
}

const PatientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingNote, setSavingNote] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !user) return;

      try {
        // Verify this patient is linked to the current therapist
        const { data: patientData, error: patientError } = await supabase
          .from("profiles")
          .select("id, full_name, linked_therapist_id, created_at, current_streak, longest_streak, today_minutes, target_wpm, birth_year")
          .eq("id", id)
          .maybeSingle();

        if (patientError) throw patientError;

        if (!patientData || patientData.linked_therapist_id !== user.id) {
          toast.error("Patient not found");
          navigate("/dashboard");
          return;
        }

        setPatient({
          id: patientData.id,
          full_name: patientData.full_name,
          created_at: patientData.created_at,
          current_streak: patientData.current_streak,
          longest_streak: patientData.longest_streak,
          today_minutes: patientData.today_minutes,
          target_wpm: patientData.target_wpm,
          birth_year: patientData.birth_year,
        });

        // Fetch patient's sessions
        const { data: sessionsData } = await supabase
          .from("sessions")
          .select("id, created_at, duration_seconds, avg_wpm, max_wpm, notes, exercise_type, patient_sentiment")
          .eq("user_id", id)
          .order("created_at", { ascending: false })
          .limit(20);

        if (sessionsData) {
          setSessions(sessionsData);
        }

        // Fetch clinical notes for this patient
        const { data: notesData } = await supabase
          .from("clinical_notes")
          .select("id, content, created_at")
          .eq("patient_id", id)
          .eq("therapist_id", user.id)
          .order("created_at", { ascending: false });

        if (notesData) {
          setNotes(notesData);
        }
      } catch (error) {
        console.error("Error fetching patient:", error);
        toast.error("Error loading patient data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user, navigate]);

  const handleAddNote = async () => {
    if (!newNote.trim() || !user || !id) return;

    setSavingNote(true);
    try {
      const { data, error } = await supabase
        .from("clinical_notes")
        .insert({
          patient_id: id,
          therapist_id: user.id,
          content: newNote.trim(),
        })
        .select("id, content, created_at")
        .single();

      if (error) throw error;

      setNotes([data, ...notes]);
      setNewNote("");
      toast.success("Note added");
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Error adding note");
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from("clinical_notes")
        .delete()
        .eq("id", noteId);

      if (error) throw error;

      setNotes(notes.filter(n => n.id !== noteId));
      toast.success("Note deleted");
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Error deleting note");
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatNoteDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Get sentiment icon based on patient_sentiment column
  const getSentimentIcon = (sentiment: string | null) => {
    if (!sentiment) return { icon: "—", label: "Not specified" };
    if (sentiment === "too_fast") return { icon: "🐇", label: "Too fast" };
    if (sentiment === "comfortable") return { icon: "✅", label: "Comfortable" };
    if (sentiment === "too_slow") return { icon: "🐢", label: "Too slow" };
    return { icon: "—", label: "" };
  };

  // Calculate stats
  const totalSessions = sessions.length;
  const totalMinutes = Math.round(sessions.reduce((acc, s) => acc + s.duration_seconds, 0) / 60);
  const avgWpm = totalSessions > 0 
    ? Math.round(sessions.reduce((acc, s) => acc + s.avg_wpm, 0) / totalSessions) 
    : 0;

  // Prepare chart data (reverse to show oldest first) - converted to SPS
  const chartData = [...sessions].reverse().map((s, i) => ({
    session: i + 1,
    avg: wpmToSps(s.avg_wpm),
    max: wpmToSps(s.max_wpm),
    date: new Date(s.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short" }),
  }));

  // Find best and worst sessions
  const bestSession = sessions.length > 0 
    ? sessions.reduce((best, s) => s.avg_wpm < best.avg_wpm ? s : best, sessions[0])
    : null;
  const worstSession = sessions.length > 0 
    ? sessions.reduce((worst, s) => s.avg_wpm > worst.avg_wpm ? s : worst, sessions[0])
    : null;

  // Calculate follow-up duration
  const followUpSince = patient?.created_at 
    ? new Date(patient.created_at).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-accent/30">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to patients</span>
          </Link>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <span className="font-display font-bold">Patient File</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Patient Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold">
                  {patient.full_name || "Patient"}
                </h1>
                <p className="text-muted-foreground">
                  {totalSessions} session{totalSessions > 1 ? "s" : ""} • {totalMinutes} min of training
                  {followUpSince && <span> • Follow-up since {followUpSince}</span>}
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => navigate(`/session-live?patient=${id}`)}
              >
                <Gauge className="w-4 h-4" />
                <span className="hidden sm:inline">Measure rate</span>
                <span className="sm:hidden">Measure</span>
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => setAssignModalOpen(true)}
              >
                <Send className="w-4 h-4" />
                Prescribe
              </Button>
              <GenerateReportButton
                sessions={sessions}
                profile={patient}
                therapistName={user?.user_metadata?.full_name}
              />
            </div>
          </div>

          {/* 2-Column Layout */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Monitoring (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Sessions
                    </CardDescription>
                    <CardTitle className="text-2xl">{totalSessions}</CardTitle>
                  </CardHeader>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Total time
                    </CardDescription>
                    <CardTitle className="text-2xl">{totalMinutes} min</CardTitle>
                  </CardHeader>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <MetricTooltip content={METRIC_TOOLTIPS.AVG_SPS}>
                        <Activity className="w-4 h-4" />
                        <span>Avg. SPS</span>
                      </MetricTooltip>
                    </CardDescription>
                    {(() => {
                      const sps = wpmToSps(avgWpm);
                      return (
                        <CardTitle className={`text-2xl ${sps <= 4.0 ? "text-green-600" : sps <= 5.0 ? "text-yellow-600" : "text-red-600"}`}>
                          {sps}
                        </CardTitle>
                      );
                    })()}
                  </CardHeader>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <MetricTooltip content="Best SPS score (lower = better rate control)">
                        <Award className="w-4 h-4" />
                        <span>Best</span>
                      </MetricTooltip>
                    </CardDescription>
                    <CardTitle className="text-2xl text-green-600">
                      {bestSession ? wpmToSps(bestSession.avg_wpm) : "-"}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              {/* Clinical Target Card - Age-based norm */}
              {patient.birth_year && (
                <Card className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-emerald-500/30">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <Target className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">Personalized clinical target</h3>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                            Van Zaalen
                          </span>
                        </div>
                        {(() => {
                          const ageGroup = getAgeGroup(patient.birth_year);
                          const age = calculateAge(patient.birth_year!);
                          return (
                            <>
                              <p className="text-sm text-muted-foreground mb-2">
                                {ageGroup.emoji} <strong>{ageGroup.label}</strong> ({age} years old) — {ageGroup.description}
                              </p>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl font-bold text-emerald-600">{ageGroup.normSPS}</span>
                                  <span className="text-sm text-muted-foreground">syll/sec</span>
                                </div>
                                <div className="h-8 w-px bg-border" />
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Info className="w-3 h-3" />
                                  Comfort zone : {(ageGroup.normSPS - 0.5).toFixed(1)} – {(ageGroup.normSPS + 0.5).toFixed(1)} syll/s
                                </p>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!patient.birth_year && (
                <Card className="bg-muted/50 border-dashed">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Info className="w-5 h-5" />
                      <p className="text-sm">
                        Birth year is not set. The personalized clinical target is not available.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Access: Best & Worst */}
              {sessions.length >= 2 && (
                <div className="grid md:grid-cols-2 gap-4">
                  {bestSession && (
                    <Card 
                      className="bg-green-500/10 border-green-500/20 cursor-pointer hover:bg-green-500/15 transition-colors"
                      onClick={() => navigate(`/session/${bestSession.id}`)}
                    >
                      <CardContent className="py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <TrendingDown className="w-8 h-8 text-green-600" />
                          <div>
                            <p className="font-medium text-green-700">Best session</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(bestSession.created_at)} • {wpmToSps(bestSession.avg_wpm)} syll/s
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-green-600" />
                      </CardContent>
                    </Card>
                  )}
                  
                  {worstSession && worstSession.id !== bestSession?.id && (
                    <Card 
                      className="bg-red-500/10 border-red-500/20 cursor-pointer hover:bg-red-500/15 transition-colors"
                      onClick={() => navigate(`/session/${worstSession.id}`)}
                    >
                      <CardContent className="py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="w-8 h-8 text-red-600" />
                          <div>
                            <p className="font-medium text-red-700">Session to review</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(worstSession.created_at)} • {wpmToSps(worstSession.avg_wpm)} syll/s
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-red-600" />
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Evolution Chart */}
              {chartData.length > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Progress over recent sessions</CardTitle>
                    <CardDescription>
                      Average rate (syll/sec) over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 12 }}
                            className="text-muted-foreground"
                          />
                          <YAxis 
                            domain={[2, 8]}
                            tick={{ fontSize: 12 }}
                            className="text-muted-foreground"
                            tickFormatter={(value) => `${value}`}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: "hsl(var(--background))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                            formatter={(value: number, name: string) => [
                              `${value.toFixed(1)} syll/s`,
                              name === "avg" ? "Average" : "Maximum"
                            ]}
                          />
                          <ReferenceLine 
                            y={4.5} 
                            stroke="#10b981" 
                            strokeDasharray="5 5"
                            label={{ value: "Comfort zone", position: "right", fontSize: 10, fill: "#10b981" }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="avg" 
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            name="Average"
                            dot={{ fill: "hsl(var(--primary))", r: 4 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="max" 
                            stroke="hsl(var(--destructive))"
                            strokeWidth={1}
                            strokeDasharray="3 3"
                            name="Maximum"
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Sessions List */}
              <Card>
                <CardHeader>
                  <CardTitle>Session history</CardTitle>
                  <CardDescription>
                    Click on a session to view details and listen to it
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {sessions.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {sessions.map((session) => {
                        const sentiment = getSentimentIcon(session.patient_sentiment);
                        const debitStatus = getDebitStatus(session.avg_wpm);
                        const shortSummary = generateShortSummary(session.avg_wpm);
                        
                        // Color classes for the clinical summary badge
                        const statusColorClasses = {
                          green: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
                          yellow: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
                          red: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
                          gray: "bg-muted text-muted-foreground border-border",
                        };
                        
                        return (
                          <Link
                            key={session.id}
                            to={`/session/${session.id}`}
                            className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                  <p className="font-medium">{formatDate(session.created_at)}</p>
                                  <ExerciseTypeBadge exerciseType={session.exercise_type} />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {formatDuration(session.duration_seconds)}
                                </p>
                              </div>
                            </div>
                            
                            {/* Bilan Rapide - Clinical Summary for quick scan */}
                            <div className="flex items-center gap-3">
                              <div className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${statusColorClasses[debitStatus.color]}`}>
                                {shortSummary}
                              </div>
                              <div className="text-right hidden sm:block">
                                <span className="text-xl" title={sentiment.label}>{sentiment.icon}</span>
                              </div>
                              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>This patient has no sessions yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Clinical Notes (1/3 width) */}
            <div className="space-y-6">
              <Card className="border-2 border-amber-500/20 bg-amber-500/5">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="w-5 h-5 text-amber-600" />
                    Follow-up Notes
                    <Lock className="w-4 h-4 text-amber-600" />
                  </CardTitle>
                  <CardDescription>
                    Private notes — the patient cannot access these
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add Note Form */}
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Add a clinical observation..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="min-h-[100px] resize-none bg-background"
                    />
                    <Button 
                      onClick={handleAddNote} 
                      disabled={savingNote || !newNote.trim()}
                      className="w-full gap-2"
                    >
                      {savingNote ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      Add note
                    </Button>
                  </div>

                  {/* Notes List */}
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {notes.length > 0 ? (
                      notes.map((note) => (
                        <div 
                          key={note.id} 
                          className="p-3 rounded-lg bg-background border border-border group"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-xs text-muted-foreground font-medium">
                              {formatNoteDate(note.created_at)}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No notes for this patient</p>
                        <p className="text-xs mt-1">
                          Add your clinical observations here
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Privacy Notice */}
              <div className="p-4 rounded-lg bg-muted/50 border border-dashed border-border">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Confidentiality</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      These notes are strictly private and protected by security rules.
                      Only you can read and modify them. The patient never has access.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Assign Exercise Modal */}
      <AssignExerciseModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        preselectedPatientId={patient.id}
        preselectedPatientName={patient.full_name || "Patient"}
      />
    </div>
  );
};

export default PatientDetail;