import { motion } from "framer-motion";
import { Check, Stethoscope, ArrowRight, Gift, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const PricingTeaser = () => {
  return (
    <section className="py-24 bg-card">
      <div className="container px-4 md:px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Gift className="w-4 h-4" />
            Full access included
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Free for patients
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your SLP covers the subscription. You get access to all features.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {/* Single Card - Patient Access */}
          <motion.div
            className="relative bg-background rounded-2xl p-8 md:p-10 border-2 border-primary shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Everything included
              </span>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Full Patient Access
              </h3>
              <p className="text-muted-foreground">
                Included in your SLP's subscription
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {[
                "Full library: 60+ varied exercises",
                "Real-time speech rate measurement (SPS)",
                "Disfluency detection (um, like...)",
                "History and progress charts",
                "Audio sharing with your SLP",
                "Personalized goals based on your age",
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Button className="hover:scale-105 transition-transform duration-200" size="lg" asChild>
                <Link to="/auth?tab=signup">
                  Create my patient account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                You'll need your SLP's Pro Code
              </p>
            </div>
          </motion.div>

          {/* B2C Solo option */}
          <motion.div
            className="mt-6 relative bg-background rounded-2xl p-8 border border-amber-500/30 shadow-md"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  No SLP?
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Start with a <strong>7-day free trial</strong>, then a simple no-commitment subscription.
                </p>
                <p className="text-xs text-muted-foreground">
                  A dedicated team, regularly updated exercises, and secure data hosting.
                </p>
              </div>
              <Button variant="outline" className="border-amber-500/50 hover:bg-amber-500/10" asChild>
                <Link to="/auth?tab=signup">
                  Try for free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Therapist Banner */}
          <motion.div
            className="mt-6 p-6 bg-muted/50 rounded-xl border border-border/50"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Stethoscope className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-1">
                  Are you an SLP?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Free 30-day trial. Manage up to 5 patients with a single subscription.
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/">
                  Discover the Pro plan
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
