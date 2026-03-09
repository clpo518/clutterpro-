import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useLimitCheck } from "@/hooks/useLimitCheck";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Activity, ArrowLeft, Share2, Clock, TrendingUp, Award, Copy, Check, MessageSquare, Send, Loader2, BarChart3, FileAudio, FlaskConical, RotateCcw } from "lucide-react";
import CoachBilan from "@/components/practice/CoachBilan";
import FillerCard from "@/components/practice/FillerCard";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ClinicalWaveform, ClinicalMetricsBar, PatientEvolutionChart, TranscriptHeatmap } from "@/components/clinical";
import { getEducationalFeedback, getWpmColorClasses } from "@/lib/clinicalSummary";
import { wpmToSps, getTargetLevelBySPS } from "@/lib/spsUtils";
import { Target } from "lucide-react";
import type { WordTimestamp } from "@/lib/analyzeDisfluency";

interface WpmDataPoint {
  timestamp: number;
  wpm: number;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  author_id: string;
  author_name?: string;
}

interface Session {
  id: string;
  user_id: string;
  created_at: string;
  duration_seconds: number;
  avg_wpm: number;
  max_wpm: number;
  target_wpm: number | null;
  recording_url: string | null;
  wpm_data: WpmDataPoint[];
  word_timestamps?: WordTimestamp[] | null;
  notes: string | null;
  word_count?: number;
  patient_sentiment?: string | null;
  filler_count?: number;
  filler_details?: Record<string, number>;
}

interface PatientSession {
  id: string;
  created_at: string;
  duration_seconds: number;
  avg_wpm: number;
  max_wpm: number;
}

interface Profile {
  is_therapist: boolean;
  is_premium: boolean;
  linked_therapist_id: string | null;
  full_name: string | null;
}

const SessionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isPremium, isTherapist, linkedTherapistValid } = useLimitCheck();
  const hasFullAccess = isPremium || isTherapist || linkedTherapistValid;
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [patientName, setPatientName] = useState<string | null>(null);
  const [patientSessions, setPatientSessions] = useState<PatientSession[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [copied, setCopied] = useState(false);
  const [signedAudioUrl, setSignedAudioUrl] = useState<string | null>(null);
  const [audioLoadError, setAudioLoadError] = useState(false);
  const [showDisfluencyAnalysis, setShowDisfluencyAnalysis] = useState(false);

  const loadSignedUrl = async (recordingUrl: string) => {
    setAudioLoadError(false);
    const pathMatch = recordingUrl.match(/recordings\/(.+)$/);
    const filePath = pathMatch ? pathMatch[1] : recordingUrl;
    
    const { data: signedData, error: signedError } = await supabase.storage
      .from("recordings")
      .createSignedUrl(filePath, 3600);
    
    if (signedError) {
      console.error("Error creating signed URL:", signedError, "for path:", filePath);
      setAudioLoadError(true);
      return;
    }
    
    if (signedData?.signedUrl) {
      setSignedAudioUrl(signedData.signedUrl);
    } else {
      setAudioLoadError(true);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !user) return;

      try {
        // Fetch user profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("is_therapist, is_premium, linked_therapist_id, full_name")
          .eq("id", user.id)
          .maybeSingle();

        if (profileData) {
          setProfile(profileData);
        }

        // Fetch session
        const { data: sessionData, error } = await supabase
          .from("sessions")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) throw error;

        if (sessionData) {
          // Derive filler data from word_timestamps (available in DB for all sessions)
          let fillerCount = 0;
          let fillerDetails: Record<string, number> = {};
          
          const wordTimestamps = sessionData.word_timestamps as unknown as Array<{ word: string; isFiller?: boolean; fillerKey?: string }> | null;
          if (wordTimestamps && Array.isArray(wordTimestamps)) {
            for (const wt of wordTimestamps) {
              if (wt.isFiller) {
                fillerCount++;
                // Use fillerKey if available (preserves two-word fillers like "en fait")
                const key = wt.fillerKey || wt.word.toLowerCase().trim().replace(/[.,!?;:]/g, '');
                fillerDetails[key] = (fillerDetails[key] || 0) + 1;
              }
            }
          }
          
          // Fallback to localStorage for older sessions without isFiller flag
          if (fillerCount === 0) {
            try {
              const savedFillers = localStorage.getItem(`session_fillers_${sessionData.id}`);
              if (savedFillers) {
                const parsed = JSON.parse(savedFillers);
                fillerCount = parsed.fillerCount || 0;
                fillerDetails = parsed.fillerDetails || {};
              }
            } catch (e) {
              console.error('Error loading filler data:', e);
            }
          }
          
          setSession({
            ...sessionData,
            wpm_data: (sessionData.wpm_data as unknown as WpmDataPoint[]) || [],
            word_timestamps: (sessionData.word_timestamps as unknown as WordTimestamp[]) || null,
            filler_count: fillerCount,
            filler_details: fillerDetails,
          });
          
          // Generate signed URL for audio playback (secure access)
          if (sessionData.recording_url) {
            await loadSignedUrl(sessionData.recording_url);
          }

          // If therapist viewing patient's session, get patient info and history
          if (profileData?.is_therapist && sessionData.user_id !== user.id) {
            // Get patient name
            const { data: patientProfile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", sessionData.user_id)
              .maybeSingle();
            
            if (patientProfile) {
              setPatientName(patientProfile.full_name);
            }

            // Get patient's session history for evolution chart
            const { data: historySessions } = await supabase
              .from("sessions")
              .select("id, created_at, duration_seconds, avg_wpm, max_wpm")
              .eq("user_id", sessionData.user_id)
              .order("created_at", { ascending: false })
              .limit(20);

            if (historySessions) {
              setPatientSessions(historySessions);
            }
          }

          // Fetch comments for this session
          const { data: commentsData } = await supabase
            .from("session_comments")
            .select("*")
            .eq("session_id", id)
            .order("created_at", { ascending: true });

          if (commentsData) {
            const authorIds = [...new Set(commentsData.map(c => c.author_id))];
            const { data: authors } = await supabase
              .from("profiles")
              .select("id, full_name")
              .in("id", authorIds);

            const authorMap = new Map(authors?.map(a => [a.id, a.full_name]) || []);

            setComments(commentsData.map(c => ({
              ...c,
              author_name: authorMap.get(c.author_id) || "Unknown"
            })));

            // Mark comments as read if user is the session owner
            if (sessionData.user_id === user.id) {
              const unreadIds = commentsData.filter(c => !c.is_read && c.author_id !== user.id).map(c => c.id);
              if (unreadIds.length > 0) {
                await supabase
                  .from("session_comments")
                  .update({ is_read: true })
                  .in("id", unreadIds);
              }
            }
          }
        } else {
          toast.error("Session not found");
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        toast.error("Error loading session");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user, navigate]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !session || !user) return;
    setSubmittingComment(true);

    try {
      const { data, error } = await supabase
        .from("session_comments")
        .insert({
          session_id: session.id,
          author_id: user.id,
          content: newComment.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      const { data: authorData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      setComments(prev => [...prev, {
        ...data,
        author_name: authorData?.full_name || "You"
      }]);
      setNewComment("");
      toast.success("Feedback sent!");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Error sending feedback");
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCommentDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPerformanceLevel = (avgWpm: number) => {
    if (avgWpm <= 140) return { label: "Excellent", color: "text-green-600", bg: "bg-green-100" };
    if (avgWpm <= 160) return { label: "Very good", color: "text-green-500", bg: "bg-green-50" };
    if (avgWpm <= 180) return { label: "Good", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { label: "Needs improvement", color: "text-red-600", bg: "bg-red-100" };
  };

  const handleShare = async () => {
    if (!session) return;

    const avgSps = wpmToSps(session.avg_wpm);
    
    const shareText = `Session Summary - ClutterPro
Date: ${formatDate(session.created_at)}
Duration: ${formatDuration(session.duration_seconds)}
Average rate: ${avgSps} syll/sec
Performance: ${getPerformanceLevel(session.avg_wpm).label}

${session.recording_url ? `🎧 Recording available` : ""}`;

    try {
      // Modern method (Clipboard API)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareText);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (!successful) {
          throw new Error('execCommand copy failed');
        }
      }
      setCopied(true);
      toast.success("Summary copied to clipboard");
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error("Copy error:", error);
      toast.error("Unable to copy. Try selecting the text manually.");
    }
  };

  const canComment = profile?.is_therapist && session && session.user_id !== user?.id;
  const isOwnSession = session?.user_id === user?.id;
  const isTherapistView = profile?.is_therapist && !isOwnSession;
  const isDiscoverySession = isOwnSession && profile?.is_therapist;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const performance = getPerformanceLevel(session.avg_wpm);

  return (
    <div className={`min-h-screen ${isTherapistView ? "bg-gradient-to-br from-purple-50 via-background to-accent/30" : "bg-gradient-to-br from-secondary via-background to-accent/30"}`}>
      {/* Header */}
      <header className={`border-b sticky top-0 z-50 ${isTherapistView ? "border-t-2 border-t-purple-500 border-border/50 bg-background/80" : "border-border/50 bg-background/80"} backdrop-blur-sm`}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to={isTherapistView && patientSessions.length > 0 ? `/patient/${session.user_id}` : "/dashboard"}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{isTherapistView ? `Back to ${patientName || "Patient"}` : "Back"}</span>
          </Link>
          
          {isTherapistView && (
            <div className="flex items-center gap-2 text-sm px-3 py-1 rounded-full bg-purple-100 text-purple-700">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span className="font-medium">Clinical View</span>
            </div>
          )}
          
          <Button variant="outline" onClick={handleShare} className="gap-2">
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? "Copied!" : "Share"}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Discovery mode banner for therapist's own sessions */}
          {isDiscoverySession && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-sm">
              <FlaskConical className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-blue-700 dark:text-blue-300">Test session - Discovery mode</p>
                <p className="text-blue-600/80 dark:text-blue-400/80 text-xs mt-0.5">
                  This session was performed from your SLP account. It is not linked to a patient and does not appear in clinical records.
                </p>
              </div>
            </div>
          )}

          {/* Header with date and patient name */}
          <div className="text-center mb-8">
            {isTherapistView && patientName && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 mb-4">
                <Activity className="w-5 h-5" />
                <span className="font-medium">{patientName}</span>
              </div>
            )}
            {!isTherapistView && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                <Activity className="w-5 h-5" />
                <span className="font-medium">Session completed</span>
              </div>
            )}
            <h1 className="text-2xl font-display font-bold mb-2">
              {formatDate(session.created_at)}
            </h1>
          </div>

          {/* Clinical View for Therapists */}
          {isTherapistView ? (
            <Tabs defaultValue="analysis" className="space-y-6">
              <TabsList className="bg-muted">
                <TabsTrigger value="analysis" className="gap-2">
                  <FileAudio className="w-4 h-4" />
                  Audio Analysis
                </TabsTrigger>
                <TabsTrigger value="evolution" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  History & Progress
                </TabsTrigger>
              </TabsList>

              <TabsContent value="analysis" className="space-y-6">
                {/* Disfluency Detection Toggle */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-800/30">
                  <div className="flex items-center gap-3">
                    <FlaskConical className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor="disfluency-toggle"
                          className="font-medium text-foreground cursor-pointer"
                        >
                          Stuttering detection
                        </Label>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-medium">
                          Beta
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                        Automatically detects sound repetitions, syllable prolongations, and unusual silences in the recording.
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="disfluency-toggle"
                    checked={showDisfluencyAnalysis}
                    onCheckedChange={setShowDisfluencyAnalysis}
                  />
                </div>

                {/* Disfluency Heatmap (if enabled) */}
                {showDisfluencyAnalysis && session.word_timestamps && session.word_timestamps.length > 0 && (
                  <TranscriptHeatmap wordTimestamps={session.word_timestamps} />
                )}
                
                {/* Show message if no word timestamps available */}
                {showDisfluencyAnalysis && (!session.word_timestamps || session.word_timestamps.length === 0) && (
                  <Card className="border-dashed border-amber-200 bg-amber-50/50">
                    <CardContent className="py-6 text-center">
                      <FlaskConical className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                      <p className="text-sm text-amber-700 font-medium">
                        Transcription data not available
                      </p>
                      <p className="text-xs text-amber-600 mt-1">
                        This session was recorded before disfluency analysis was enabled.
                        <br />
                        New sessions will include this data automatically.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Clinical Waveform - or Locked State for non-premium patients */}
                {signedAudioUrl ? (
                  <ClinicalWaveform 
                    audioUrl={signedAudioUrl} 
                    wpmData={session.wpm_data}
                  />
                ) : audioLoadError && session.recording_url ? (
                  <Card className="border-destructive/30 bg-destructive/5">
                    <CardContent className="py-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                        <FileAudio className="w-8 h-8 text-destructive" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        Unable to load recording
                      </h3>
                      <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
                        The access URL could not be generated. Check your connection and try again.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => loadSignedUrl(session.recording_url!)}
                        className="gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Retry
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-muted/50 border-dashed border-border">
                    <CardContent className="py-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <FileAudio className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        Recording not available
                      </h3>
                      <p className="text-muted-foreground text-sm max-w-md mx-auto">
                        This session was recorded before audio was enabled.
                        <br />
                        <span className="text-muted-foreground/70">New sessions will include the recording automatically.</span>
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Clinical Metrics Bar */}
                <ClinicalMetricsBar
                  avgWpm={session.avg_wpm}
                  maxWpm={session.max_wpm}
                  targetWpm={session.target_wpm}
                  durationSeconds={session.duration_seconds}
                  wpmData={session.wpm_data}
                  wordTimestamps={session.word_timestamps}
                  isTherapist={true}
                />

                {/* Disfluencies - always visible for the SLP */}
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <FillerCard
                    fillerCount={session.filler_count || 0}
                    fillerDetails={session.filler_details || {}}
                  />
                </motion.div>

                {/* Patient Sentiment Display */}
                {session.patient_sentiment && (
                  <Card className="border-purple-200 bg-purple-50/50">
                    <CardContent className="py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">
                          {session.patient_sentiment === "too_slow" && "🐢"}
                          {session.patient_sentiment === "comfortable" && "✅"}
                          {session.patient_sentiment === "too_fast" && "🐇"}
                        </span>
                        <div>
                          <p className="text-sm font-medium">
                            How {patientName || "this patient"} felt
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {session.patient_sentiment === "too_slow" && "Felt too slow"}
                            {session.patient_sentiment === "comfortable" && "Felt comfortable"}
                            {session.patient_sentiment === "too_fast" && "Felt too fast"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Feedback Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-purple-600" />
                      Note for the patient
                    </CardTitle>
                    <CardDescription>
                      Send personalized feedback based on your analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {comments.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {comments.map((comment) => (
                          <div 
                            key={comment.id} 
                            className={`p-4 rounded-xl ${
                              comment.author_id === user?.id 
                                ? "bg-purple-50 border border-purple-200" 
                                : "bg-muted border border-border"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm text-foreground">
                                {comment.author_id === user?.id ? "Vous" : comment.author_name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatCommentDate(comment.created_at)}
                              </span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {canComment && (
                      <div className="space-y-3">
                        {/* Quick Emoji Feedback Buttons */}
                        <div className="flex gap-2 flex-wrap">
                          {[
                            { emoji: "👍", label: "Well done!" },
                            { emoji: "⭐", label: "Excellent work" },
                            { emoji: "💪", label: "Keep it up" },
                            { emoji: "🎯", label: "Goal reached" }
                          ].map(({ emoji, label }) => (
                            <Button
                              key={emoji}
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const content = `${emoji} ${label}`;
                                setNewComment(content);
                              }}
                              className="text-lg hover:bg-purple-50 hover:border-purple-300"
                              title={label}
                            >
                              {emoji}
                            </Button>
                          ))}
                        </div>
                        
                        <Textarea
                          placeholder="Write a personalized message or click an emoji above..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="resize-none"
                          rows={4}
                        />
                        <Button 
                          onClick={handleAddComment} 
                          disabled={submittingComment || !newComment.trim()}
                          className="gap-2"
                        >
                          {submittingComment ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          Send feedback
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="evolution" className="space-y-6">
                <PatientEvolutionChart 
                  sessions={patientSessions}
                  patientName={patientName || undefined}
                />
              </TabsContent>
            </Tabs>
          ) : (
            /* Regular View for Patients - 4 KPI Cards */
            <>
              {/* Educational Feedback Badge */}
              {(() => {
              const feedback = getEducationalFeedback(session.avg_wpm, session.target_wpm);
                const colors = getWpmColorClasses(session.avg_wpm, session.target_wpm);
                return (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex justify-center"
                  >
                    <div className={`inline-flex items-center gap-4 px-8 py-5 rounded-2xl ${colors.bg} border ${colors.border}`}>
                      <span className="text-4xl">{feedback.emoji}</span>
                      <div>
                        <p className={`text-xl font-bold ${colors.text}`}>{feedback.title}</p>
                        <p className="text-sm text-muted-foreground max-w-md">{feedback.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })()}

              {/* Target Level Badge */}
              {session.target_wpm && session.target_wpm > 0 && (() => {
                const targetSps = wpmToSps(session.target_wpm);
                const targetLevel = getTargetLevelBySPS(targetSps);
                return (
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.12 }}
                    className="flex justify-center"
                  >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">
                        Selected goal: <span className="text-primary">Level {targetLevel.level} — {targetLevel.label} ({targetSps} syll/sec)</span>
                      </span>
                    </div>
                  </motion.div>
                );
              })()}

              <div className="grid grid-cols-2 gap-4">
                {/* Vitesse Moyenne - Color coded */}
                {(() => {
                  const colors = getWpmColorClasses(session.avg_wpm, session.target_wpm);
                  const avgSps = wpmToSps(session.avg_wpm);
                  return (
                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.15 }}
                    >
                      <Card className={`${colors.bg} border ${colors.border}`}>
                        <CardHeader className="pb-2 pt-5">
                          <CardDescription className="flex items-center gap-2 text-muted-foreground">
                            <Activity className="w-4 h-4" />
                            Average Rate
                          </CardDescription>
                          <CardTitle className={`text-4xl font-bold ${colors.text}`}>
                            {avgSps} <span className="text-lg font-normal">syll/sec</span>
                          </CardTitle>
                        </CardHeader>
                      </Card>
                    </motion.div>
                  );
                })()}

                {/* Stability (Max) */}
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card>
                    <CardHeader className="pb-2 pt-5">
                      <CardDescription className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Stability (Peak)
                      </CardDescription>
                      <CardTitle className="text-4xl font-bold">
                        {wpmToSps(session.max_wpm)} <span className="text-lg font-normal text-muted-foreground">syll/sec</span>
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {session.max_wpm - session.avg_wpm > 40
                          ? "Significant variations detected"
                          : "Stable rate throughout the session"}
                      </p>
                    </CardHeader>
                  </Card>
                </motion.div>

                {/* Duration */}
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  <Card>
                    <CardHeader className="pb-2 pt-5">
                      <CardDescription className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Duration
                      </CardDescription>
                      <CardTitle className="text-4xl font-bold">
                        {formatDuration(session.duration_seconds)}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {session.duration_seconds >= 180
                          ? "Excellent training duration"
                          : "Keep practicing"}
                      </p>
                    </CardHeader>
                  </Card>
                </motion.div>

                {/* Volume Verbal */}
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-2 pt-5">
                      <CardDescription className="flex items-center gap-2 text-primary/70">
                        <Award className="w-4 h-4" />
                        Word Volume
                      </CardDescription>
                      <CardTitle className="text-4xl font-bold text-primary">
                        {session.wpm_data?.length > 0 
                          ? Math.round(session.avg_wpm * session.duration_seconds / 60)
                          : Math.round(session.avg_wpm * session.duration_seconds / 60)
                        } <span className="text-lg font-normal">mots</span>
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        Words spoken during the session
                      </p>
                    </CardHeader>
                  </Card>
                </motion.div>
              </div>

              {/* Professional Waveform Audio Player */}
              {signedAudioUrl ? (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  <ClinicalWaveform 
                    audioUrl={signedAudioUrl} 
                    wpmData={session.wpm_data}
                  />
                </motion.div>
              ) : (
                <Card className="border-dashed border-muted-foreground/30">
                  <CardContent className="py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                      <FileAudio className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Audio recording not available for this session
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      New sessions will include audio automatically
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Filler Card - Only show if session has filler data */}
              {session.filler_count !== undefined && session.filler_count > 0 && (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.38 }}
                >
                  <FillerCard
                    fillerCount={session.filler_count || 0}
                    fillerDetails={session.filler_details || {}}
                  />
                </motion.div>
              )}

              {/* Coach Bilan - Analysis with freemium gating */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <CoachBilan
                  avgWpm={session.avg_wpm}
                  maxWpm={session.max_wpm}
                  targetWpm={session.target_wpm || undefined}
                  wordCount={Math.round(session.avg_wpm * session.duration_seconds / 60)}
                  duration={session.duration_seconds}
                />
              </motion.div>

              {/* Comments Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Therapist Comments
                  </CardTitle>
                  <CardDescription>
                    Your speech therapist's feedback will appear here
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {comments.length > 0 ? (
                    <div className="space-y-3">
                      {comments.map((comment) => (
                        <div 
                          key={comment.id} 
                          className={`p-4 rounded-xl ${
                            comment.author_id === user?.id 
                              ? "bg-primary/10 border border-primary/20" 
                              : "bg-gradient-to-r from-chart-2/10 to-primary/5 border border-chart-2/20"
                          }`}
                        >
                          {comment.author_id !== user?.id && (
                            <div className="flex items-center gap-2 mb-2 text-chart-2">
                              <MessageSquare className="w-4 h-4" />
                              <span className="text-sm font-medium">Message from your speech therapist</span>
                            </div>
                          )}
                          <p className="text-sm">{comment.content}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatCommentDate(comment.created_at)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      No comments yet
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Speech fluency analysis - Patient-friendly */}
              {session.word_timestamps && session.word_timestamps.length > 0 && (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.45 }}
                >
                  <Card className="border-dashed border-muted-foreground/20">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🔍</span>
                        <CardTitle className="text-base">Speech fluency</CardTitle>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                          New
                        </span>
                      </div>
                      <CardDescription className="text-xs">
                        Identifies hesitations, repetitions, and long pauses in your recording
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TranscriptHeatmap wordTimestamps={session.word_timestamps} />
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Share CTA */}
              {isOwnSession && (
                <Card className="bg-gradient-to-r from-primary/10 to-chart-2/10 border-primary/20">
                  <CardContent className="py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="font-display font-bold text-lg mb-1">
                        Share with your speech therapist
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Copy your session summary to share it easily
                      </p>
                    </div>
                    <Button onClick={handleShare} className="gap-2">
                      <Copy className="w-4 h-4" />
                      Copy summary
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Action buttons */}
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate(isTherapistView && patientSessions.length > 0 ? `/patient/${session.user_id}` : "/dashboard")}
              className={isTherapistView ? "border-slate-600 text-slate-300 hover:bg-slate-800" : ""}
            >
              {isTherapistView ? `All sessions for ${patientName || "this patient"}` : "Back to dashboard"}
            </Button>
            {isOwnSession && (
              <Button onClick={() => navigate("/practice")}>
                New session
              </Button>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default SessionDetail;
