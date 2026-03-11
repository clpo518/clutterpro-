import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "How do I know if I speak too fast?",
    answer: "Take our free 30-second voice test. The app measures your rate in Syllables Per Second (SPS) and compares it to clinical norms for your age. Most people who clutter score above 5.0 SPS without realizing it.",
  },
  {
    question: "What's the difference between cluttering and stuttering?",
    answer: "Stuttering involves blocks and repetitions — and you usually know when it happens. Cluttering is fast, irregular speech with poor self-awareness. Many people who clutter don't realize they're hard to understand until someone points it out.",
  },
  {
    question: "I don't have a speech therapist. Can I still use the app?",
    answer: "Yes. You can sign up in Solo Mode with a 7-day free trial, then $9/month. We recommend working with a speech therapist for best results, but the app is designed to be useful on your own too.",
  },
  {
    question: "Is it free for patients with a therapist?",
    answer: "Yes. If your speech therapist uses TalkSlower, you get full access to all features at no cost. Just enter their Pro Code when you sign up.",
  },
  {
    question: "How does the Pro subscription work for SLPs?",
    answer: "30-day free trial, no credit card required. After that, $29/month (3 patient seats) or $39/month (5 seats). Your patients get free access via your unique Pro Code.",
  },
  {
    question: "How do you measure speech rate?",
    answer: "We use Articulation Rate (Syllables Per Second), the clinical gold standard defined by Van Zaalen. Unlike words-per-minute, we only measure actual speech time — pauses don't count against you.",
  },
  {
    question: "Does the app also help with stuttering?",
    answer: "Yes. Rate control, breathing exercises, and real-world conversation practice are beneficial for both cluttering and stuttering. Many users have both.",
  },
  {
    question: "Is my data secure?",
    answer: "All data is hosted on secure US-based servers, encrypted in transit and at rest, and follows HIPAA-conscious practices. Only you and your linked therapist can access your recordings.",
  },
  {
    question: "Do I need to install anything?",
    answer: "No. TalkSlower runs in your web browser — phone, tablet, or computer. No app store download required.",
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
            Everything you need to know about TalkSlower
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
