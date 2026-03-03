import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "ClutterPro has transformed how I support my cluttering clients between sessions. The real-time SPS measurement is exactly what I needed.",
    author: "Sarah M., SLP",
    role: "Private Practice, Austin TX",
    rating: 5,
  },
  {
    quote: "I never realized how fast I was speaking until I saw my numbers. Five weeks in and my rate is finally in the normal range.",
    author: "James T.",
    role: "Patient, 34 years old",
    rating: 5,
  },
  {
    quote: "Finally a tool built specifically for cluttering. My students use it for assessment and my clients use it for home practice. Highly recommend.",
    author: "Dr. Rebecca L., CCC-SLP",
    role: "University Clinic, Boston",
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
            They took back control
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            SLPs and patients are making real progress with ClutterPro every day.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
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
