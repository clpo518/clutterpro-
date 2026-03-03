import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw, Users, Stethoscope, UserCheck, Activity, BarChart3,
  Clock, Gauge, Mic, CreditCard, XCircle, AlertTriangle, User, UserPlus, DollarSign,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface UserEntry {
  id: string;
  name: string;
  plan: string;
  isTherapist: boolean;
}

interface TrialEntry {
  id: string;
  name: string;
  isTherapist: boolean;
  daysLeft: number;
  endDate: string;
}

interface DeepgramExerciseCost {
  type: string;
  minutes: number;
  cost: number;
  sessions: number;
}

interface DeepgramStats {
  totalMinutes: number;
  costTotal: number;
  costThisWeek: number;
  costThisMonth: number;
  avgPerSession: number;
  byExercise: DeepgramExerciseCost[];
  ratePerMin: number;
}

interface TherapistPatientEntry {
  id: string;
  name: string;
  patientCount: number;
  patients: { id: string; name: string }[];
  subscriptionStatus: string;
  plan: string;
}

interface AdminStats {
  totalUsers: number;
  therapists: number;
  patients: number;
  linkedPatients: number;
  activeCount: number;
  totalSessions: number;
  avgDuration: number;
  avgWpm: number;
  recordingRate: number;
  weeklySignups: { week: string; count: number }[];
  dailySessions: { day: string; count: number }[];
  exerciseBreakdown: { name: string; value: number }[];
  subscriptionBreakdown: { status: string; count: number }[];
  payingUsers: UserEntry[];
  canceledUsers: UserEntry[];
  expiringTrials: TrialEntry[];
  totalTrials: number;
  newTherapistsThisWeek: number;
  newPatientsThisWeek: number;
  deepgramStats: DeepgramStats;
  therapistPatientMap: TherapistPatientEntry[];
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))", "#f59e0b", "#ef4444", "#8b5cf6"];

const EXERCISE_LABELS: Record<string, string> = {
  reading: "Reading",
  improvisation: "Improvisation",
  warmup: "Warm-Up",
  repetition: "Repetition",
  dialogue: "Dialogue",
};

const SUB_LABELS: Record<string, string> = {
  none: "None",
  active: "Active",
  canceled: "Canceled",
  trial: "Trial",
  refunded: "Refunded",
};

const PLAN_LABELS: Record<string, string> = {
  essentiel: "Essential",
  monthly: "Monthly",
  yearly: "Yearly",
  expert: "Expert",
  trial: "Trial",
};

function wpmToSps(wpm: number): string {
  return (wpm / 60 * 2.2).toFixed(1);
}

const KpiCard = ({ title, value, icon: Icon, suffix }: { title: string; value: string | number; icon: React.ElementType; suffix?: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}{suffix}</div>
    </CardContent>
  </Card>
);

const RoleBadge = ({ isTherapist }: { isTherapist: boolean }) => (
  <Badge variant={isTherapist ? "default" : "secondary"} className="text-xs">
    {isTherapist ? "SLP" : "Patient"}
  </Badge>
);

const UserListCard = ({
  title,
  icon: Icon,
  iconColor,
  users,
  emptyText,
  showPlan = false,
}: {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  users: UserEntry[];
  emptyText: string;
  showPlan?: boolean;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center gap-2 pb-3">
      <Icon className={`h-5 w-5 ${iconColor}`} />
      <CardTitle className="text-base">{title}</CardTitle>
      <Badge variant="outline" className="ml-auto">{users.length}</Badge>
    </CardHeader>
    <CardContent>
      {users.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-medium">{u.name}</span>
                <RoleBadge isTherapist={u.isTherapist} />
              </div>
              {showPlan && (
                <span className="text-xs text-muted-foreground">{PLAN_LABELS[u.plan] || u.plan}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

export default function Admin() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fnError } = await supabase.functions.invoke("admin-stats");
    if (fnError) {
      setError(fnError.message?.includes("non-2xx") ? "Access denied. Check that your account is authorized." : fnError.message);
      setLoading(false);
      return;
    }
    if (data?.error) {
      setError(data.error);
      setLoading(false);
      return;
    }
    setStats(data as AdminStats);
    setLoading(false);
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <p className="text-destructive font-medium">{error}</p>
            <Button className="mt-4" onClick={fetchStats}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {loading && !stats ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : stats ? (
          <>
            {/* This week signups */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="py-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <UserPlus className="h-5 w-5 text-primary" />
                  <span className="font-semibold">This week:</span>
                  <Badge variant="default">{stats.newTherapistsThisWeek ?? 0} new SLP{(stats.newTherapistsThisWeek ?? 0) > 1 ? "s" : ""}</Badge>
                  <Badge variant="secondary">{stats.newPatientsThisWeek ?? 0} new patient{(stats.newPatientsThisWeek ?? 0) > 1 ? "s" : ""}</Badge>
                  <span className="text-sm text-muted-foreground ml-auto">Total: {(stats.newTherapistsThisWeek ?? 0) + (stats.newPatientsThisWeek ?? 0)} sign-ups</span>
                </div>
              </CardContent>
            </Card>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <KpiCard title="Total sign-ups" value={stats.totalUsers} icon={Users} />
              <KpiCard title="SLPs" value={stats.therapists} icon={Stethoscope} />
              <KpiCard title="Patients" value={stats.patients} icon={Users} />
              <KpiCard title="Linked patients" value={stats.linkedPatients} icon={UserCheck} />
              <KpiCard title="Active (7d)" value={stats.activeCount} icon={Activity} />
              <KpiCard title="Sessions (total)" value={stats.totalSessions} icon={BarChart3} />
            </div>

            {/* === SUBSCRIPTION FOCUS === */}
            <div className="space-y-2">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription Focus
              </h2>
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard title="Active paying" value={(stats.payingUsers ?? []).length} icon={CreditCard} />
                <KpiCard title="Canceled" value={(stats.canceledUsers ?? []).length} icon={XCircle} />
                <KpiCard title="In trial" value={stats.totalTrials ?? 0} icon={Clock} />
                <KpiCard title="Trials expiring (7d)" value={(stats.expiringTrials ?? []).length} icon={AlertTriangle} />
              </div>
            </div>

            {/* Detailed lists */}
            <div className="grid md:grid-cols-3 gap-6">
              <UserListCard
                title="Paying users"
                icon={CreditCard}
                iconColor="text-green-500"
                users={stats.payingUsers ?? []}
                emptyText="No active subscribers"
                showPlan
              />
              <UserListCard
                title="Who stopped"
                icon={XCircle}
                iconColor="text-destructive"
                users={stats.canceledUsers ?? []}
                emptyText="No canceled subscriptions"
                showPlan
              />
              <Card>
                <CardHeader className="flex flex-row items-center gap-2 pb-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <CardTitle className="text-base">Trials ending soon</CardTitle>
                  <Badge variant="outline" className="ml-auto">{(stats.expiringTrials ?? []).length}</Badge>
                </CardHeader>
                <CardContent>
                  {(stats.expiringTrials ?? []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No trials expiring in the next 7 days</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {(stats.expiringTrials ?? []).map((t) => (
                        <div key={t.id} className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50">
                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm font-medium">{t.name}</span>
                            <RoleBadge isTherapist={t.isTherapist} />
                          </div>
                          <Badge
                            variant={t.daysLeft <= 2 ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {t.daysLeft}d left
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Subscription breakdown */}
            <Card>
              <CardHeader><CardTitle className="text-base">Subscription breakdown</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {stats.subscriptionBreakdown.map((s) => (
                    <div key={s.status} className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold">{s.count}</p>
                      <p className="text-xs text-muted-foreground mt-1">{SUB_LABELS[s.status] || s.status}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* === THERAPIST-PATIENT RELATIONSHIPS === */}
            {stats.therapistPatientMap && stats.therapistPatientMap.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  SLP → Patient Relationships
                  <Badge variant="outline" className="ml-2">{stats.therapistPatientMap.length} SLPs</Badge>
                </h2>
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {stats.therapistPatientMap.map((t) => (
                        <div key={t.id} className="p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <Stethoscope className="h-4 w-4 text-primary" />
                              <span className="font-medium text-sm">{t.name}</span>
                              <Badge variant={t.subscriptionStatus === "active" ? "default" : "secondary"} className="text-xs">
                                {SUB_LABELS[t.subscriptionStatus] || t.subscriptionStatus}
                              </Badge>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {t.patientCount} patient{t.patientCount > 1 ? "s" : ""}
                            </Badge>
                          </div>
                          {t.patientCount > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2 pl-6">
                              {t.patients.map((p) => (
                                <span key={p.id} className="text-xs px-2 py-0.5 rounded-full bg-background border">
                                  {p.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base">Sign-ups / week</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={stats.weeklySignups}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="week" fontSize={12} />
                      <YAxis fontSize={12} allowDecimals={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="count" name="Sign-ups" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Sessions / day (14d)</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={stats.dailySessions}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="day" fontSize={12} />
                      <YAxis fontSize={12} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" name="Sessions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Exercise breakdown - horizontal bars */}
            <Card>
              <CardHeader><CardTitle className="text-base">Exercise breakdown (all time)</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.exerciseBreakdown
                    .sort((a, b) => b.value - a.value)
                    .map((ex, i) => {
                      const total = stats.exerciseBreakdown.reduce((s, e) => s + e.value, 0);
                      const pct = total > 0 ? Math.round((ex.value / total) * 100) : 0;
                      return (
                        <div key={ex.name} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{EXERCISE_LABELS[ex.name] || ex.name}</span>
                            <span className="text-muted-foreground">{ex.value} ({pct}%)</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            {/* === DEEPGRAM COSTS === */}
            {stats.deepgramStats && (
              <div className="space-y-2">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Deepgram Costs (estimated)
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <KpiCard title="Total cost" value={`$${stats.deepgramStats.costTotal}`} icon={DollarSign} />
                  <KpiCard title="This month" value={`$${stats.deepgramStats.costThisMonth}`} icon={DollarSign} />
                  <KpiCard title="This week" value={`$${stats.deepgramStats.costThisWeek}`} icon={DollarSign} />
                  <KpiCard title="Avg. / session" value={`$${stats.deepgramStats.avgPerSession}`} icon={Clock} />
                </div>
                <Card>
                  <CardHeader><CardTitle className="text-base">Cost by exercise type</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.deepgramStats.byExercise.map((ex, i) => {
                        const maxCost = stats.deepgramStats.byExercise[0]?.cost || 1;
                        const pct = maxCost > 0 ? Math.round((ex.cost / maxCost) * 100) : 0;
                        return (
                          <div key={ex.type} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{EXERCISE_LABELS[ex.type] || ex.type}</span>
                              <span className="text-muted-foreground">
                                ${ex.cost} · {ex.minutes} min · {ex.sessions} sessions
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                      Based on Nova-2 streaming rate: ${stats.deepgramStats.ratePerMin}/min · {stats.deepgramStats.totalMinutes} total minutes
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Secondary metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KpiCard title="Avg. duration (all time)" value={`${stats.avgDuration}s`} icon={Clock} />
              <KpiCard title="Avg. speed (all time)" value={wpmToSps(stats.avgWpm)} icon={Gauge} suffix=" syll/s" />
              <KpiCard title="Recording rate" value={`${stats.recordingRate}%`} icon={Mic} />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
