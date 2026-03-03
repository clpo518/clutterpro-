import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Send, Zap, Users, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-background">
      <div className="container max-w-2xl mx-auto px-4 py-12 md:py-16">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Need help? We're listening.
          </h1>
          <p className="text-muted-foreground text-lg">
            Our team personally reads and responds to every message.
          </p>
        </motion.div>

        {/* Trust Grid */}
        <motion.div
          className="grid grid-cols-3 gap-4 md:gap-8 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Fast Response (24h)</span>
          </div>
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Human Support</span>
          </div>
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">100% Confidential</span>
          </div>
        </motion.div>

        {/* Main Action Card */}
        <motion.div
          className="bg-card shadow-lg rounded-2xl p-8 text-center border border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-primary" />
          </div>

          <h2 className="text-xl font-semibold text-foreground mb-4">
            Send us a direct email.
          </h2>

          <Button
            size="lg"
            className="w-full md:w-auto gap-2 mb-4"
            asChild
          >
            <a href="mailto:support@clutterpro.com">
              Write to our team
              <Send className="w-4 h-4" />
            </a>
          </Button>

          <p className="text-sm text-muted-foreground">
            Or write directly to: <span className="font-medium text-foreground select-all">support@clutterpro.com</span>
          </p>
        </motion.div>

        {/* Footer note */}
        <motion.p
          className="text-center text-xs text-muted-foreground mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Breathe in... Breathe out... We'll take the time to respond.
        </motion.p>
      </div>
    </div>
  );
};

export default Contact;
