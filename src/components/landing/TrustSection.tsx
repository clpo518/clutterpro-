import { motion } from "framer-motion";
import { Activity, Shield, Eye, Stethoscope, Award } from "lucide-react";

const trustBadges = [
  {
    icon: Activity,
    label: "Calcul de Vitesse en Temps Réel",
  },
  {
    icon: Eye,
    label: "Retour Visuel Motivant",
  },
  {
    icon: Stethoscope,
    label: "Méthode Clinique Validée",
  },
  {
    icon: Shield,
    label: "Données Sécurisées (RGPD)",
  },
  {
    icon: Award,
    label: "Recommandé par les Orthophonistes",
  },
];

export const TrustSection = () => {
  return (
    <section className="py-8 bg-muted/50 border-y border-border/50">
      <div className="container px-4 md:px-6">
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-muted-foreground text-sm md:text-base">
            Méthode basée sur les travaux de{" "}
            <span className="font-semibold text-foreground">Van Zaalen & Reichel</span> et les protocoles de l'
            <span className="font-semibold text-foreground">International Cluttering Association</span>.
          </p>
        </motion.div>

        <motion.div
          className="flex flex-wrap justify-center gap-6 md:gap-10"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {trustBadges.map((badge, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <badge.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium">{badge.label}</span>
              {'isNew' in badge && badge.isNew && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-orange-500 text-white rounded-full uppercase">
                  Nouveau
                </span>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
