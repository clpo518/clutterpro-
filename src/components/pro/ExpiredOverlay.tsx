import { Lock, ShieldAlert, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const ExpiredOverlay = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="max-w-lg mx-4 p-8 rounded-2xl bg-background border shadow-2xl text-center"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-900/50 dark:to-orange-900/50 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-amber-600 dark:text-amber-400" />
        </div>

        <h2 className="text-2xl font-display font-bold mb-3">
          Trial period ended
        </h2>

        <p className="text-muted-foreground mb-6">
          Your data is <strong>safely preserved</strong>.
          Subscribe to unlock access to your patients and continue monitoring.
        </p>

        {/* Pricing inline — reduces friction */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-4 rounded-xl border-2 border-border bg-muted/30">
            <p className="text-sm font-medium text-muted-foreground mb-1">Essential</p>
            <p className="text-2xl font-bold text-foreground">$14.90</p>
            <p className="text-xs text-muted-foreground">/mo - 3 patients</p>
          </div>
          <div className="p-4 rounded-xl border-2 border-primary/50 bg-primary/5 relative">
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center gap-1">
              <Star className="w-3 h-3" /> Popular
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Expert</p>
            <p className="text-2xl font-bold text-foreground">$19.90</p>
            <p className="text-xs text-muted-foreground">/mo - 5 patients</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 mb-6">
          <div className="flex items-center gap-3 justify-center text-green-700 dark:text-green-400">
            <ShieldAlert className="w-5 h-5" />
            <span className="text-sm font-medium">Patient data 100% secure</span>
          </div>
        </div>

        <Button 
          size="lg"
          onClick={() => navigate("/pro/subscription")}
          className="w-full gap-2 bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-600"
        >
          Choose my plan
          <ArrowRight className="w-5 h-5" />
        </Button>

        {/* Preuve sociale */}
        <p className="text-xs text-muted-foreground mt-4 italic">
          "The tool I was missing to objectively measure speech rate." — SLP
        </p>

        <p className="text-xs text-muted-foreground mt-2">
          Cancel anytime
        </p>
      </motion.div>
    </motion.div>
  );
};

export default ExpiredOverlay;
