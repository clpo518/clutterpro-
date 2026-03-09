import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Do you speak too fast? How to find out?",
    answer: "Take our free 30-second voice test on the Diagnostic page. The app measures your rate in Syllables Per Second (SPS) and compares it to Van Zaalen's clinical norms adapted to your age.",
  },
  {
    question: "How do my patients access the app?",
    answer: "Your patients create an account and enter your unique Pro Code. They then appear in your dashboard and get access to all features for free.",
  },
  {
    question: "How does the Pro subscription work?",
    answer: "You get a 30-day free trial with no credit card required. After that, the subscription includes a number of active patient seats (3 or 5). Your patients access all features for free via your Pro Code.",
  },
  {
    question: "Is the app free for patients?",
    answer: "Yes, if your speech therapist uses ClutterPro, you get free access to all features. You can also use the app on your own for $9/month.",
  },
  {
    question: "How do you calculate speech rate?",
    answer: "We use the Articulation Rate (SPS) as defined by Van Zaalen. Syllables Per Second are calculated excluding pauses, which is the clinically relevant indicator for cluttering.",
  },
  {
    question: "Does the app also help with stuttering?",
    answer: "Yes! Rate control, breathing, and dialogue transfer exercises are also beneficial for people who stutter. The app complements in-session therapy work.",
  },
  {
    question: "Is the data secure?",
    answer: "Absolutely. All data is hosted on secure US-based servers, encrypted, and follows HIPAA-conscious practices. Only you and your speech therapist (if linked) have access to recordings.",
  },
  {
    question: "Do I need to install anything?",
    answer: "No installation is required. ClutterPro works directly from a web browser, on phone, tablet, or computer.",
  },
  {
    question: "Can I get a personalized demo?",
    answer: "Of course! Email us at support@clutterpro.com and we'll take the time to show you ClutterPro in detail.",
  },
];

export const UnifiedFAQ = () => {
  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container px-4 md:px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about ClutterPro
          </p>
        </motion.div>

        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 overflow-hidden"
              >
                <AccordionTrigger className="text-left hover:no-underline py-5">
                  <span className="text-foreground font-medium">{item.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};
