import { motion } from "framer-motion";
import { Heart, Quote, ArrowRight, Building2, Users, Code, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import founderImage from "@/assets/clement-founder.jpg";

interface FounderStorySectionProps {
  audience?: "patient" | "therapist";
}

export const FounderStorySection = ({ audience = "patient" }: FounderStorySectionProps) => {
  const isTherapist = audience === "therapist";

  return (
    <section className="py-24 bg-gradient-to-b from-background via-secondary/30 to-background relative overflow-hidden">
      {/* Subtle decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

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
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Heart className="w-4 h-4" />
              Our Story
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              {isTherapist ? (
                <>Built by a <span className="text-primary">patient</span>, for the professionals.</>
              ) : (
                <>I know what you're going through. <span className="text-primary">I've been there too.</span></>
              )}
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
                <div className="absolute -inset-3 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl blur-sm" />
                <div className="relative">
                  <img
                    src={founderImage}
                    alt="Clement Pontegnier, founder of ClutterPro"
                    className="w-full aspect-[4/5] object-cover rounded-2xl shadow-2xl"
                  />
                  {/* Name overlay */}
                  <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                    <p className="font-semibold text-foreground">Clement Pontegnier</p>
                    <p className="text-sm text-muted-foreground">Founder &middot; Person who clutters</p>
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
                <Quote className="absolute -top-2 -left-2 w-10 h-10 text-primary/20" />
                <blockquote className="pl-8 text-xl md:text-2xl text-foreground font-medium italic leading-relaxed">
                  {isTherapist ? (
                    <>"I know what your patients go through. <span className="text-primary not-italic font-bold">I'm one of them.</span>"</>
                  ) : (
                    <>"For years, people told me to 'slow down.'
                    But nobody showed me <span className="text-primary not-italic font-bold">how</span>."</>
                  )}
                </blockquote>
              </div>

              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  My name is Clement, and I've lived with <strong className="text-foreground">cluttering</strong> since childhood.
                  Ideas racing faster than my words. Sentences colliding.
                  That look from people when they can't understand you.
                </p>

                <p>
                  In 2022, I finally saw an amazing speech therapist. She taught me the techniques.
                  But between sessions, I was on my own. No tool to practice with.
                  No visual feedback. Just a stopwatch and my frustration.
                </p>

                <p className="text-foreground font-medium">
                  So I built the tool I wish I'd had.
                </p>

                {isTherapist ? (
                  <p>
                    <strong className="text-foreground">ClutterPro</strong> was born from that experience:
                    giving SLPs a tool that speaks their patients' language,
                    with rigorous clinical metrics (SPS, Van Zaalen norms) and an experience
                    that makes people want to practice. After helping hundreds of French-speaking patients, we're bringing this tool to the US SLP community.
                  </p>
                ) : (
                  <p>
                    <strong className="text-foreground">ClutterPro</strong> was born from late-night coding sessions, dozens of practice rounds,
                    and a simple belief: <em>if it helps me, it can help others.</em> After helping hundreds of French-speaking patients, we're bringing this tool to the US SLP community.
                  </p>
                )}
              </div>

              {/* CTA */}
              <div className="pt-4">
                <Button asChild size="lg" className="rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                  <Link to={isTherapist ? "/auth" : "/assessment"}>
                    {isTherapist ? "Create a Pro account" : "Start my training"}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Company Section */}
        <motion.div
          className="max-w-4xl mx-auto mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="p-8 md:p-10 rounded-2xl bg-card border border-border shadow-lg">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Building2 className="w-4 h-4" />
                The team behind ClutterPro
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                A solid company, a clear mission
              </h3>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-7 h-7 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">ClutterPro Inc.</h4>
                <p className="text-sm text-muted-foreground">
                  A company specializing in digital health tools for speech fluency.
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Dedicated team</h4>
                <p className="text-sm text-muted-foreground">
                  Developers, designers, and clinical advisors working together.
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Code className="w-7 h-7 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Continuous improvement</h4>
                <p className="text-sm text-muted-foreground">
                  Regular updates based on feedback from users and clinicians.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 pt-4 border-t border-border">
              <Sparkles className="w-5 h-5 text-primary" />
              <p className="text-sm text-muted-foreground text-center">
                <strong className="text-foreground">ClutterPro</strong> is developed and maintained with the goal of helping every person who clutters regain confidence.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
