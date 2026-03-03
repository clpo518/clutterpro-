import { useState } from "react";
import { Users, AlertTriangle, HelpCircle, Archive, ChevronDown, ArrowUpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

interface SeatCounterProps {
  activePatients: number;
  seatsLimit: number;
}

const SeatCounter = ({ activePatients, seatsLimit }: SeatCounterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isAtLimit = activePatients >= seatsLimit;
  const percentUsed = Math.min((activePatients / seatsLimit) * 100, 100);
  const remainingSeats = seatsLimit - activePatients;

  return (
    <Card className={`${isAtLimit ? "border-red-500/30 bg-red-500/5" : "border-border"}`}>
      <div 
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Users className={`w-5 h-5 ${isAtLimit ? "text-red-500" : "text-muted-foreground"}`} />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium flex items-center gap-1.5">
              Active Patients
              <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
            </span>
            <span className={`text-sm font-bold ${isAtLimit ? "text-red-500" : ""}`}>
              {activePatients} / {seatsLimit}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                isAtLimit ? "bg-red-500" : "bg-primary"
              }`}
              style={{ width: `${percentUsed}%` }}
            />
          </div>
        </div>
        {isAtLimit && (
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
        )}
        <ChevronDown 
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <CardContent className="pt-0 pb-4 space-y-4">
              {/* What is a seat */}
              <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  What is a "seat"?
                </h4>
                <p className="text-xs text-muted-foreground">
                  Each <strong>seat</strong> represents an active patient you are monitoring.
                  Your current plan allows you to monitor up to <strong>{seatsLimit} patients</strong> simultaneously.
                </p>
              </div>

              {/* Archiving explanation */}
              <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Archive className="w-4 h-4 text-orange-500" />
                  How to free a seat?
                </h4>
                <p className="text-xs text-muted-foreground">
                  When a patient finishes therapy, you can <strong>archive</strong> them
                  (<Archive className="w-3 h-3 inline" /> button in the table). This frees a seat
                  while preserving their history. You can restore them at any time.
                </p>
              </div>

              {/* Upgrade hint if at limit */}
              {isAtLimit ? (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                    Limit reached
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    You are using all your seats. To accommodate new patients:
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                    <li>- <strong>Archive</strong> an inactive patient to free a seat</li>
                    <li>- Or <strong>upgrade to the 5-patient plan</strong> for more capacity</li>
                  </ul>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-xs text-green-700 dark:text-green-400">
                    <strong>{remainingSeats} seat{remainingSeats > 1 ? "s" : ""} available</strong> — You can invite {remainingSeats > 1 ? "new patients" : "a new patient"}.
                  </p>
                </div>
              )}

              {/* Upgrade CTA */}
              {seatsLimit === 3 && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-3">
                  <ArrowUpCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground">Need more patients?</strong> The 5-patient plan
                      gives you more flexibility to support your caseload.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default SeatCounter;
