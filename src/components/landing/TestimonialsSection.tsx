import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "I used to manually time recordings and count syllables. TalkSlower does it in real time. My cluttering clients actually practice between sessions now.",
    author: "Sarah M., CCC-SLP",
    role: "Private Practice, Austin TX",
  },
  {
    quote: "I was at 6.2 syllables per second and didn't even know it. After 5 weeks of daily practice, I'm consistently under 4.5. My wife noticed before I did.",
    author: "James T.",
    role: "Patient, 34",
  },
  {
    quote: "There's nothing else like this for cluttering. The SPS metric is clinically sound, and the Dialogue Mode is a game-changer for real-world transfer.",
    author: "Dr. Rebecca L., CCC-SLP",
    role: "University Clinic, Boston",
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
            Trusted by speech-language pathologists
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Feedback from practicing SLPs and their patients.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="relative bg-card rounded-xl p-8 border border-border border-l-2 border-l-primary"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <p className="text-foreground mb-6 italic leading-relaxed">
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
