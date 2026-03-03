import { motion } from "framer-motion";
import { Heart, Quote, Stethoscope, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import founderImage from "@/assets/clement-founder.jpg";

export const FounderProSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800/95 to-slate-900" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-3xl opacity-30" />
      
      <div className="container px-4 md:px-6 relative">
        <motion.div
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4">
              <Heart className="w-4 h-4" />
              Why this tool exists
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Built by a patient, <span className="text-primary">for your patients</span>.
            </h2>
          </motion.div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">
            {/* Photo Column */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative">
                {/* Decorative frame */}
                <div className="absolute -inset-3 bg-gradient-to-br from-primary/30 to-cyan-500/20 rounded-2xl blur-sm" />
                <div className="relative">
                  <img
                    src={founderImage}
                    alt="Clément Pontegnier, founder of ClutterPro"
                    className="w-full aspect-[4/5] object-cover rounded-2xl shadow-2xl border border-slate-700/50"
                  />
                  {/* Name overlay */}
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-slate-700/50">
                    <p className="font-semibold text-white">Clément Pontegnier</p>
                    <p className="text-sm text-slate-400">Founder • Person who clutters</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Story Column */}
            <motion.div
              className="lg:col-span-3 space-y-6"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {/* Quote */}
              <div className="relative">
                <Quote className="absolute -top-2 -left-2 w-10 h-10 text-primary/30" />
                <blockquote className="pl-8 text-xl md:text-2xl text-white font-medium italic leading-relaxed">
                  "You have the clinical expertise. But between sessions,
                  <span className="text-primary not-italic font-bold"> your patients are on their own</span>."
                </blockquote>
              </div>

              <div className="space-y-4 text-slate-300 leading-relaxed">
                <p>
                  My name is Clément. In 2022, I finally sought help for my <strong className="text-white">cluttering</strong>.
                  My SLP was amazing. But once I got home, I had no tools
                  to practice what she taught me.
                </p>
                
                <p>
                  <strong className="text-white">No visual feedback.</strong> No objective measurement.
                  Just a stopwatch and the hope of "speaking more slowly" —
                  without knowing if I actually was.
                </p>

                <p className="text-white font-medium">
                  I built ClutterPro to fill that gap.
                </p>

                <p>
                  Today, dozens of patients use the app between sessions.
                  Their SLPs receive objective data — SPS, practice duration, consistency —
                  without any extra work on their end.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="text-2xl font-bold text-white">100+</span>
                  </div>
                  <p className="text-sm text-slate-400">Active patients</p>
                </div>
                <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Stethoscope className="w-5 h-5 text-primary" />
                    <span className="text-2xl font-bold text-white">20+</span>
                  </div>
                  <p className="text-sm text-slate-400">SLPs</p>
                </div>
              </div>

              {/* CTA */}
              <div className="pt-4">
                <Button asChild size="lg" className="rounded-xl gap-2">
                  <Link to="/auth">
                    Create my free Pro account
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
