import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Bien conçu et facile d'utilisation. C'est vraiment l'outil qu'il me manquait pour mesurer objectivement le débit de parole.",
    author: "Orthophoniste",
    role: "Professionnelle de santé",
    rating: 5,
  },
  {
    quote: "Avant, je parlais trop vite en réunion. Maintenant, j'ai le rythme du surligneur en tête.",
    author: "Thomas",
    role: "Commercial",
    rating: 5,
  },
  {
    quote: "Un outil génial en complément de mes séances d'orthophonie.",
    author: "Sarah",
    role: "Étudiante",
    rating: 5,
  },
  {
    quote: "Enfin une app qui ne confond pas bégaiement et bredouillement !",
    author: "Marc",
    role: "Ingénieur",
    rating: 5,
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container px-4 md:px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ils ont retrouvé le contrôle
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Des milliers d'utilisateurs progressent chaque jour avec ParlerMoinsVite.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="relative bg-card rounded-2xl p-8 shadow-lg border border-border/50"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/20" />
              
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <p className="text-foreground mb-6 italic">
                "{testimonial.quote}"
              </p>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {testimonial.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
