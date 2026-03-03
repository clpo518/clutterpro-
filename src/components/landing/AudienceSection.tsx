import { motion } from "framer-motion";
import { HelpCircle, ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Does this replace an SLP?",
    answer: "No, ClutterPro is a complementary tool for practicing between sessions. It is ideally recommended and monitored by your practitioner. The app does not diagnose and does not replace professional care."
  },
  {
    question: "What is cluttering?",
    answer: "Cluttering is a fluency disorder characterized by a speech rate perceived as too fast and/or irregular, syllable telescoping, and sometimes difficulty organizing discourse. Unlike stuttering, people who clutter are often unaware of it."
  },
  {
    question: "Does the app also help with stuttering?",
    answer: "Yes! Although originally designed for cluttering, the app is also useful for working on fluency in the context of stuttering. Rate control, breathing, and dialogue transfer exercises help improve speech fluidity, as a complement to SLP sessions."
  },
  {
    question: "Why does the app ask for my age?",
    answer: "Children, teenagers, and adults don't speak at the same speed - that's natural! By knowing your age, the app automatically adjusts your speed target to be realistic and personalized. This avoids frustrating false positives where you'd be told to slow down when you're speaking at a normal rate for your age."
  },
  {
    question: "How long should I practice?",
    answer: "5 to 10 minutes per day is enough to see progress. Consistency is more important than duration. We recommend short but daily sessions."
  },
  {
    question: "Does the app work offline?",
    answer: "No, an internet connection is required for real-time voice analysis and session saving. Your data is stored securely."
  },
  {
    question: "Are my recordings confidential?",
    answer: "Yes, absolutely. Your recordings are encrypted and accessible only by you (and your SLP if you link your account). We never use them for any other purpose."
  },
  {
    question: "My child can't read yet, can they use the app?",
    answer: "Yes! The Rebus mode uses images and emojis to guide speech, without the need to read. Ideal for children aged 4 to 7."
  },
];

export const AudienceSection = () => {
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
            <HelpCircle className="w-4 h-4" />
            Frequently Asked Questions
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Have questions?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about ClutterPro and fluency disorders.
          </p>
        </motion.div>
        
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-background rounded-xl border border-border/50 px-6 overflow-hidden"
              >
                <AccordionTrigger className="text-left text-lg font-medium hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};
