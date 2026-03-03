import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FillerCardProps {
  fillerCount: number;
  fillerDetails: Record<string, number>;
}

const FillerCard = ({ fillerCount, fillerDetails }: FillerCardProps) => {
  // Sort fillers by frequency
  const sortedFillers = Object.entries(fillerDetails)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const hasData = fillerCount > 0 || Object.keys(fillerDetails).length > 0;

  const getHeaderStyle = () => {
    if (!hasData) {
      return { color: "text-muted-foreground", bg: "bg-muted/50", emoji: "🔇" };
    }
    if (fillerCount <= 5) {
      return { color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20", emoji: "✨" };
    }
    if (fillerCount <= 10) {
      return { color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20", emoji: "⚠️" };
    }
    return { color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20", emoji: "🙊" };
  };

  const style = getHeaderStyle();

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          Filler Words
        </CardTitle>
        <CardDescription>
          Filler words or expressions automatically detected during the session.
          <span className="block mt-1 text-xs text-muted-foreground/80">
            ℹ️ These are speech habits ("um", "like", "you know"...), not blocks or cluttering-type disfluencies. They are excluded from the rate calculation (SPS).
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Header with count */}
        <div className={`flex items-center gap-3 p-4 rounded-xl mb-4 ${style.bg}`}>
          <span className="text-2xl">{style.emoji}</span>
          <div>
            {hasData ? (
              <>
                <p className={`text-2xl font-bold ${style.color}`}>
                  {fillerCount} <span className="text-base font-normal">filler word{fillerCount > 1 ? 's' : ''}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {fillerCount <= 5
                    ? "Fluent and natural speech"
                    : fillerCount <= 10
                      ? "Some hesitations detected"
                      : "Work on breathing pauses"}
                </p>
              </>
            ) : (
              <>
                <p className="text-base font-medium text-muted-foreground">
                  Detection not enabled
                </p>
                <p className="text-sm text-muted-foreground">
                  The patient can enable this option before starting an exercise
                </p>
              </>
            )}
          </div>
        </div>

        {/* Filler details */}
        {hasData && (
          <div className="space-y-3">
            {sortedFillers.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {sortedFillers.map(([filler, count]) => (
                  <Badge 
                    key={filler} 
                    variant="secondary"
                    className="text-sm py-1.5 px-3"
                  >
                    <span className="font-medium">"{filler}"</span>
                    <span className="ml-1.5 text-primary font-bold">×{count}</span>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No filler words detected
              </p>
            )}

            {/* Coach tip */}
            {fillerCount > 5 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20"
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">💡</span>
                  <div>
                    <p className="font-medium text-sm text-primary">Tip</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {fillerCount > 10
                        ? "Many filler words. Encourage the patient to use breathing pauses instead."
                        : "Some hesitations. Work on breathing between sentences."}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {fillerCount <= 5 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">🎉</span>
                  <div>
                    <p className="font-medium text-sm text-emerald-700 dark:text-emerald-400">Very good</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Fluent speech, few or no filler words.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FillerCard;
