import { motion } from "framer-motion";
import { Eye, Mic, TrendingUp, MessageCircleQuestion, Zap, Shuffle } from "lucide-react";

const problems = [
  {
    icon: MessageCircleQuestion,
    title: "On vous fait souvent répéter ?",
    description: "Vos interlocuteurs perdent le fil de ce que vous dites.",
  },
  {
    icon: Zap,
    title: "Vos idées vont plus vite que vos mots ?",
    description: "Vous pensez vite mais votre bouche ne suit pas le rythme.",
  },
  {
    icon: Shuffle,
    title: "Vous mélangez les syllabes sous stress ?",
    description: "En situation importante, votre débit s'emballe.",
  },
];

const steps = [
  {
    icon: Mic,
    title: "Pratiquez sans ennui",
    description: "Accédez à des exercices variés : lecture guidée, virelangues et improvisation pour travailler le transfert dans la vie réelle.",
    color: "text-blue-600",
  },
  {
    icon: Eye,
    title: "Comprenez votre débit",
    description: "Visualisez la forme d'onde de votre voix. Un retour visuel concret pour apprendre à placer vos pauses.",
    color: "text-green-600",
  },
  {
    icon: TrendingUp,
    title: "Restez connecté à votre Orthophoniste",
    description: "Ne vous entraînez plus seul. Partagez vos séances avec votre orthophoniste et recevez ses conseils à distance.",
    color: "text-primary",
  },
];

export const ProblemSection = () => {
  return (
    <>
      {/* Problem Recognition Section */}
      <section id="symptoms" className="py-24 bg-card">
        <div className="container px-4 md:px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Vous reconnaissez-vous ?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ces situations vous parlent ? ParlerMoinsVite est fait pour vous.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {problems.map((problem, index) => (
              <motion.div
                key={index}
                className="bg-background rounded-2xl p-8 border border-border/50 text-center hover:shadow-lg transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <problem.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {problem.title}
                </h3>
                <p className="text-muted-foreground">
                  {problem.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="py-24 bg-gradient-to-b from-background to-secondary/30">
        <div className="container px-4 md:px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Comment ça marche
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Une méthode en 3 étapes pour reprendre le contrôle de votre débit.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="relative bg-card rounded-2xl p-8 shadow-lg border border-border/50 hover:shadow-xl transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>
                <div className={`w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-6`}>
                  <step.icon className={`w-7 h-7 ${step.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
