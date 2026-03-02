import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingDown, TrendingUp, Target, BarChart3, Zap, CheckCircle2 } from "lucide-react";
import { 
  XAxis, YAxis, ResponsiveContainer, Area, ComposedChart, 
  Line, ReferenceLine, Tooltip, CartesianGrid 
} from "recharts";
import { motion } from "framer-motion";
import { wpmToSps } from "@/lib/spsUtils";

interface Session {
  created_at: string;
  avg_wpm: number;
  max_wpm: number;
}

interface PatientProgressCardProps {
  sessions: Session[];
}

const PatientProgressCard = ({ sessions }: PatientProgressCardProps) => {
  // Not enough data state
  if (sessions.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Vos progrès
          </CardTitle>
          <CardDescription>
            {sessions.length === 0 
              ? "Lancez votre première séance pour découvrir vos progrès"
              : "Encore une séance pour débloquer votre courbe d'évolution !"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center bg-muted/30 rounded-lg">
            <p className="text-muted-foreground text-sm">
              📊 Votre courbe de progression apparaîtra ici
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data (oldest first, last 15 sessions max) - converted to SPS
  const chartData = [...sessions].slice(0, 15).reverse().map((s, i) => ({
    session: i + 1,
    date: new Date(s.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
    avg: wpmToSps(s.avg_wpm),
    max: wpmToSps(s.max_wpm),
  }));

  // Calculate trend (first half vs second half)
  const firstHalf = chartData.slice(0, Math.floor(chartData.length / 2));
  const secondHalf = chartData.slice(Math.floor(chartData.length / 2));
  const firstAvg = firstHalf.reduce((acc, s) => acc + s.avg, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((acc, s) => acc + s.avg, 0) / secondHalf.length;
  const improvement = Math.round((firstAvg - secondAvg) * 10) / 10;
  const isImproving = improvement > 0.3;
  const isRegressing = improvement < -0.3;

  // Calculate stats in SPS
  const overallAvg = Math.round(chartData.reduce((acc, s) => acc + s.avg, 0) / chartData.length * 10) / 10;
  const sessionsInTarget = chartData.filter(s => s.avg <= 4.5).length;
  const targetPercentage = Math.round((sessionsInTarget / chartData.length) * 100);

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Vos progrès
            </CardTitle>
            <CardDescription>
              Évolution sur vos {chartData.length} sessions
            </CardDescription>
          </div>
          
          {/* Trend Badge */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              isImproving ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
              isRegressing ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
              "bg-muted text-muted-foreground"
            }`}
          >
            {isImproving ? <TrendingDown className="w-4 h-4" /> :
             isRegressing ? <TrendingUp className="w-4 h-4" /> :
             <Target className="w-4 h-4" />}
            <span>
              {isImproving ? `−${improvement} syll/sec` :
               isRegressing ? `+${Math.abs(improvement)} syll/sec` :
               "Stable"}
            </span>
          </motion.div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Stats Summary - 2 KPIs */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="relative bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 rounded-xl p-4 text-center"
          >
            <Zap className="w-4 h-4 text-primary mx-auto mb-1.5" />
            <div className="text-2xl font-bold text-foreground">
              {overallAvg}
            </div>
            <div className="text-[11px] text-muted-foreground font-medium mt-0.5">syll/sec moy.</div>
          </motion.div>
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative bg-gradient-to-br from-accent/30 to-accent/10 border border-accent/20 rounded-xl p-4 text-center"
          >
            <CheckCircle2 className="w-4 h-4 text-primary mx-auto mb-1.5" />
            <div className="text-2xl font-bold text-foreground">
              {targetPercentage}%
            </div>
            <div className="text-[11px] text-muted-foreground font-medium mt-0.5">≤ 5.5 syll/sec</div>
          </motion.div>
        </div>

        {/* Main Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="h-52 rounded-xl bg-muted/20 border border-border/50 p-3 pt-4"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <defs>
                <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                domain={[2, 8]}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "10px",
                  color: "hsl(var(--foreground))",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  padding: "8px 12px",
                }}
                labelStyle={{ color: "hsl(var(--muted-foreground))", fontSize: 11 }}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    avg: "Moyenne",
                    max: "Maximum",
                  };
                  return [`${value} syll/sec`, labels[name] || name];
                }}
              />
              
              {/* Target Zone - 4.5 SPS */}
              <ReferenceLine 
                y={4.5} 
                stroke="hsl(var(--primary))" 
                strokeDasharray="6 4"
                strokeWidth={1.5}
                label={{ 
                  value: "Zone confort (4.5)", 
                  position: "right", 
                  fontSize: 9,
                  fill: "hsl(var(--primary))",
                }}
              />
              
              {/* Danger Zone - 6 SPS */}
              <ReferenceLine 
                y={6} 
                stroke="hsl(var(--destructive))" 
                strokeDasharray="3 3"
                strokeWidth={1}
                strokeOpacity={0.6}
              />
              
              {/* Area under curve */}
              <Area 
                type="monotone" 
                dataKey="avg" 
                stroke="transparent"
                fill="url(#progressGradient)"
              />
              
              {/* Average line */}
              <Line 
                type="monotone" 
                dataKey="avg" 
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                dot={{ fill: "hsl(var(--primary))", r: 3.5, strokeWidth: 2, stroke: "hsl(var(--background))" }}
                activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2, fill: "hsl(var(--background))" }}
              />
              
              {/* Max line */}
              <Line 
                type="monotone" 
                dataKey="max" 
                stroke="hsl(var(--destructive))"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                strokeOpacity={0.5}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Legend - cleaner */}
        <div className="flex items-center justify-center gap-5 text-[11px]">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-muted-foreground">Vitesse moyenne</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-[2px] bg-destructive/50 rounded" />
            <span className="text-muted-foreground">Vitesse max</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-[2px] border-t-[2px] border-dashed border-primary" />
            <span className="text-muted-foreground">Zone confort</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientProgressCard;
