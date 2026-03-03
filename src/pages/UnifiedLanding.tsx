import { Navbar } from "@/components/landing/Navbar";
import { UnifiedHeroSection } from "@/components/landing/UnifiedHeroSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { MethodSection } from "@/components/landing/MethodSection";
import { ExerciseDemoSection } from "@/components/landing/ExerciseDemoSection";
import { LibraryShowcase } from "@/components/landing/LibraryShowcase";
import { SPSExplainerSection } from "@/components/landing/SPSExplainerSection";

import { ProSections } from "@/components/landing/ProSections";
import { FounderStorySection } from "@/components/landing/FounderStorySection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { UnifiedFAQ } from "@/components/landing/UnifiedFAQ";
import { Footer } from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { User, Stethoscope } from "lucide-react";

const UnifiedLanding = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {/* Hero commun */}
        <UnifiedHeroSection />

        {/* Sections communes */}
        <ProblemSection />
        <MethodSection />

        {/* Section Patients */}
        <div id="patients">
          <section className="py-12 md:py-16">
            <div className="container px-4 md:px-6">
              <motion.div
                className="flex items-center justify-center gap-3 mb-2"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  For patients
                </h2>
              </motion.div>
              <motion.p
                className="text-center text-lg text-muted-foreground max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                Train 5 min/day and track your progress.
              </motion.p>
            </div>
          </section>
          <ExerciseDemoSection />
          <LibraryShowcase />
          <SPSExplainerSection />
        </div>

        {/* Section SLPs */}
        <div id="for-slps">
          <section className="py-12 md:py-16">
            <div className="container px-4 md:px-6">
              <motion.div
                className="flex items-center justify-center gap-3 mb-2"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  For SLPs
                </h2>
              </motion.div>
              <motion.p
                className="text-center text-lg text-muted-foreground max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                Extend the effectiveness of your sessions at home.
              </motion.p>
            </div>
          </section>
          <ProSections />
        </div>

        {/* Sections communes en bas */}
        <FounderStorySection />
        <TestimonialsSection />
        <UnifiedFAQ />
      </main>
      <Footer />
    </div>
  );
};

export default UnifiedLanding;
