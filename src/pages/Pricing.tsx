import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Shield, Headphones, RotateCcw, ArrowRight, Stethoscope, User, Mic, BarChart3, MessageSquare, Gift, Sparkles, Users, Zap, Coffee, Archive, RefreshCw, UserPlus, Activity } from "lucide-react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const Pricing = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Determine which tab to show based on URL param or default to "pro"
  const audienceParam = searchParams.get("audience");
  const defaultTab = audienceParam === "patient" ? "patient" : "pro";

  const handleTabChange = (value: string) => {
    setSearchParams({ audience: value });
  };

  const proPlans = [
    {
      id: "starter",
      name: "3 Patients",
      price: "29",
      seats: 3,
      tagline: "Less than a coffee a day.",
      features: [
        "3 active patient accounts",
        "Real-time syllables/second measurement",
        "60+ varied exercises",
        "Auto-filled clinical assessment",
        "Remote exercise prescriptions",
        "Audio analysis & waveforms",
      ],
      popular: false,
    },
    {
      id: "pro",
      name: "5 Patients",
      price: "39",
      seats: 5,
      tagline: "Most popular among SLPs.",
      features: [
        "5 active patient accounts",
        "Real-time syllables/second measurement",
        "60+ varied exercises",
        "Auto-filled clinical assessment",
        "Remote exercise prescriptions",
        "Audio analysis & waveforms",
      ],
      popular: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-16">
        {/* Hero Section with Tabs */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl md:text-4xl font-semibold mb-4">
                Pricing
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                Simple, transparent pricing for every practice. Designed for SLPs. Trusted by ASHA members.
              </p>

              {/* Audience Toggle Tabs */}
              <Tabs value={defaultTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                  <TabsTrigger value="pro" className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" />
                    SLPs
                  </TabsTrigger>
                  <TabsTrigger value="patient" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Patients
                  </TabsTrigger>
                </TabsList>

                {/* PRO CONTENT */}
                <TabsContent value="pro" className="mt-0">
                  <ProPricingContent plans={proPlans} navigate={navigate} />
                </TabsContent>

                {/* PATIENT CONTENT */}
                <TabsContent value="patient" className="mt-0">
                  <PatientPricingContent navigate={navigate} />
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

// ============ PRO PRICING CONTENT ============
interface PlanType {
  id: string;
  name: string;
  price: string;
  seats: number;
  tagline: string;
  features: string[];
  popular: boolean;
}

const ProPricingContent = ({
  plans,
  navigate
}: {
  plans: PlanType[];
  navigate: ReturnType<typeof useNavigate>;
}) => (
  <>
    {/* Hero text for Pro */}
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-10"
    >
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
        <Zap className="w-4 h-4" />
        30-day free trial
      </div>
      <h2 className="text-2xl md:text-3xl font-semibold mb-3">
        Save clinical time. Stay connected with your patients.
      </h2>
      <p className="text-muted-foreground max-w-2xl mx-auto">
        Track your patients' progress between sessions with objective metrics.
        <strong className="text-foreground"> Free for your patients</strong> — you manage the subscription.
      </p>
    </motion.div>

    {/* Pricing Cards */}
    <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
      {plans.map((plan, index) => (
        <motion.div
          key={plan.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={`relative h-full ${
            plan.popular
              ? "border-2 border-primary shadow-lg shadow-primary/10"
              : "border-border"
          }`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  Most popular
                </span>
              </div>
            )}

            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.tagline}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Price */}
              <div className="text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Coffee className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {plan.id === "starter" ? "Less than $1/day" : "Best value"}
                  </span>
                </div>
              </div>

              {/* Patient accounts highlight */}
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-center">
                <div className="flex items-center justify-center gap-2 text-primary font-bold">
                  <Users className="w-5 h-5" />
                  {plan.seats} Active Patient Accounts
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2.5">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                className={`w-full ${plan.popular ? "" : ""}`}
                size="lg"
                onClick={() => navigate("/auth?tab=signup")}
              >
                Start free trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>

    {/* How Patient Accounts Work */}
    <div className="max-w-5xl mx-auto space-y-8 mt-16">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">
          How do patient accounts work?
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Manage your active caseload with full flexibility. Archive patients on pause and reactivate them when they return.
        </p>
      </div>

      {/* Visual explanation */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="relative p-6 rounded-xl bg-muted/50 border border-border"
        >
          <div className="absolute -top-3 left-4">
            <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4 mt-2">
            <UserPlus className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold mb-2 text-center">Active patients</h3>
          <p className="text-sm text-muted-foreground text-center">
            Your current patients use an active account. They practice, you track their progress.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-green-600" />
            </div>
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-green-600" />
            </div>
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="relative p-6 rounded-xl bg-muted/50 border border-border"
        >
          <div className="absolute -top-3 left-4">
            <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4 mt-2">
            <Archive className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="font-semibold mb-2 text-center">Archive a patient</h3>
          <p className="text-sm text-muted-foreground text-center">
            Patient on pause? Archive them in one click. Their data is preserved, the slot is freed up.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4" />
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Archive className="w-4 h-4 text-amber-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="relative p-6 rounded-xl bg-muted/50 border border-border"
        >
          <div className="absolute -top-3 left-4">
            <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4 mt-2">
            <RefreshCw className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold mb-2 text-center">Flexible rotation</h3>
          <p className="text-sm text-muted-foreground text-center">
            Reactivate an archived patient at any time. Manage dozens of patients with just 3 or 5 active slots.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-blue-600 text-sm">
            <RefreshCw className="w-4 h-4" />
            <span>Unlimited patients total</span>
          </div>
        </motion.div>
      </div>

      {/* In practice banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="max-w-3xl mx-auto mt-8 p-5 rounded-xl bg-card border border-border shadow-sm"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="font-semibold mb-1">In practice</h4>
            <p className="text-sm text-muted-foreground">
              With <strong className="text-primary">3 active accounts</strong>, you can follow 3 patients simultaneously. When one completes therapy, archive them and activate a new patient. Full history remains accessible for reports.
            </p>
          </div>
        </div>
      </motion.div>
    </div>

    {/* Trust badges */}
    <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground mt-12">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4" />
        Secure payment
      </div>
      <div className="flex items-center gap-2">
        <RotateCcw className="w-4 h-4" />
        Cancel anytime
      </div>
      <div className="flex items-center gap-2">
        <Headphones className="w-4 h-4" />
        Responsive support
      </div>
    </div>

    {/* FAQ Pro */}
    <div className="max-w-2xl mx-auto mt-16">
      <h3 className="text-xl font-semibold text-center mb-6">
        Frequently asked questions
      </h3>

      <Accordion type="single" collapsible className="space-y-3">
        <AccordionItem value="trial" className="bg-card border border-border rounded-xl px-5">
          <AccordionTrigger className="text-left hover:no-underline py-4">
            <span className="font-medium text-sm">How does the free trial work?</span>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground pb-4 text-sm">
            You get 30 days to test all features with up to 3 patients. No credit card required during the trial. At the end, choose the plan that works for you.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="patients" className="bg-card border border-border rounded-xl px-5">
          <AccordionTrigger className="text-left hover:no-underline py-4">
            <span className="font-medium text-sm">Do my patients need to pay?</span>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground pb-4 text-sm">
            No, <strong className="text-foreground">it's free for your patients</strong>. Your subscription covers their access. They simply create their account using your Pro Code.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="cancel" className="bg-card border border-border rounded-xl px-5">
          <AccordionTrigger className="text-left hover:no-underline py-4">
            <span className="font-medium text-sm">Can I cancel anytime?</span>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground pb-4 text-sm">
            Yes, no commitment. You can cancel from your account at any time. Access remains active until the end of the paid period.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="data" className="bg-card border border-border rounded-xl px-5">
          <AccordionTrigger className="text-left hover:no-underline py-4">
            <span className="font-medium text-sm">Is patient data secure?</span>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground pb-4 text-sm">
            Absolutely. All data is encrypted and stored securely with HIPAA-conscious practices. Only you and your patient have access to their progress data.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="hipaa" className="bg-card border border-border rounded-xl px-5">
          <AccordionTrigger className="text-left hover:no-underline py-4">
            <span className="font-medium text-sm">Is ClutterPro HIPAA-compliant?</span>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground pb-4 text-sm">
            ClutterPro does not store Protected Health Information (PHI). Audio is processed in real time and not retained on our servers. Session data (rate scores, session counts) is stored without identifiable health records. Always consult your practice's compliance officer for full HIPAA guidance specific to your workflow.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  </>
);

// ============ PATIENT PRICING CONTENT ============
const PatientPricingContent = ({
  navigate
}: {
  navigate: ReturnType<typeof useNavigate>;
}) => (
  <>
    {/* Hero text for Patient */}
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-10"
    >
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 text-sm font-medium mb-4">
        <Gift className="w-4 h-4" />
        Full access included
      </div>
      <h2 className="text-2xl md:text-3xl font-semibold mb-3">
        Free for you.
      </h2>
      <p className="text-muted-foreground max-w-2xl mx-auto">
        Your SLP covers the subscription.
        You get access to <strong className="text-foreground">all features</strong> at no cost.
      </p>
    </motion.div>

    {/* Single Patient Card */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="max-w-xl mx-auto mb-12"
    >
      <Card className="p-6 md:p-8 border-2 border-green-500/50 shadow-xl shadow-green-500/10 relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-sm font-semibold px-4 py-1 rounded-full flex items-center gap-1">
          <Sparkles className="w-4 h-4" />
          Everything included
        </div>

        <div className="text-center mb-6 pt-2">
          <h3 className="text-lg font-semibold mb-2">Full Patient Access</h3>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl font-bold text-green-500">$0</span>
            <span className="text-muted-foreground">/mo</span>
          </div>
          <p className="text-muted-foreground mt-2 text-sm">
            Included in your SLP's subscription
          </p>
        </div>

        <div className="space-y-2.5 mb-6 max-w-sm mx-auto">
          {[
            "Full library: 60+ exercises",
            "Real-time speech rate measurement",
            "Disfluency detection",
            "Age-based personalized goals",
            "History and progress charts",
            "Audio sharing with your SLP",
          ].map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button
            onClick={() => navigate("/auth?tab=signup")}
            className="shadow-lg shadow-primary/25 hover:shadow-xl transition-all"
            size="lg"
          >
            Create my patient account
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            You'll need your SLP's Pro Code
          </p>
        </div>
      </Card>
    </motion.div>

    {/* How it Works Section */}
    <div className="max-w-3xl mx-auto mb-12">
      <h3 className="text-lg font-semibold text-center mb-6">
        How does it work?
      </h3>

      <Card className="p-5 md:p-8 overflow-hidden">
        {/* Flow Steps */}
        <div className="grid sm:grid-cols-4 gap-4 sm:gap-2">
          {[
            { icon: Stethoscope, step: 1, title: "Your SLP", desc: "Subscribes and gives you a unique code" },
            { icon: User, step: 2, title: "You sign up", desc: "Create your account with the Pro Code" },
            { icon: Mic, step: 3, title: "You practice", desc: "5 min/day with real-time measurement" },
            { icon: BarChart3, step: 4, title: "Remote follow-up", desc: "Your SLP tracks your progress" },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <span className="inline-block bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full mb-1">
                {item.step}
              </span>
              <h4 className="font-medium text-sm mb-0.5">{item.title}</h4>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Important Notice */}
        <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">Why do I need an SLP code?</h4>
              <p className="text-xs text-muted-foreground">
                Cluttering is a clinical disorder. The app is <strong className="text-foreground">complementary to professional therapy</strong>,
                not a substitute. The code ensures you are supported by a qualified specialist.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>

    {/* FAQ Patient */}
    <div className="max-w-2xl mx-auto mt-12">
      <h3 className="text-lg font-semibold text-center mb-6">
        Frequently asked questions
      </h3>

      <Accordion type="single" collapsible className="space-y-3">
        <AccordionItem value="code" className="bg-card border border-border rounded-xl px-5">
          <AccordionTrigger className="text-left hover:no-underline py-4">
            <span className="font-medium text-sm">How do I get an SLP code?</span>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground pb-4 text-sm">
            Ask your speech-language pathologist if they use ClutterPro. If so, they'll give you their unique Pro Code (format: PRO-XXXXXX).
            If your clinician doesn't know about the app yet, invite them to discover <Link to="/" className="text-primary hover:underline">the Pro space</Link>.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="free" className="bg-card border border-border rounded-xl px-5">
          <AccordionTrigger className="text-left hover:no-underline py-4">
            <span className="font-medium text-sm">Why is it free for me?</span>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground pb-4 text-sm">
            Your SLP pays a subscription that includes a number of patient seats.
            By linking to their account via the Pro Code, you automatically get access to <strong className="text-foreground">all features</strong> at no extra cost.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="no-therapist" className="bg-card border border-border rounded-xl px-5">
          <AccordionTrigger className="text-left hover:no-underline py-4">
            <span className="font-medium text-sm">I don't have an SLP. What should I do?</span>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground pb-4 text-sm">
            Good news: you can sign up in{" "}
            <a href="/auth" className="text-primary hover:underline font-semibold">Solo Mode</a>{" "}
            and start practicing today with a free 7-day trial.
            We still recommend seeing a speech-language pathologist for a personalized assessment.
            And if you find a clinician later, you can link your account at any time to benefit from their follow-up.{" "}
            <a href="/contact" className="text-primary hover:underline">Questions?</a>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="data" className="bg-card border border-border rounded-xl px-5">
          <AccordionTrigger className="text-left hover:no-underline py-4">
            <span className="font-medium text-sm">Is my data secure?</span>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground pb-4 text-sm">
            Absolutely. All data is encrypted and stored securely with HIPAA-conscious practices.
            Only you and your SLP have access to your recordings and progress data.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>

    {/* Reassurance Icons */}
    <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground mt-10">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4" />
        HIPAA-conscious security
      </div>
      <div className="flex items-center gap-2">
        <RotateCcw className="w-4 h-4" />
        Instant access
      </div>
      <div className="flex items-center gap-2">
        <Headphones className="w-4 h-4" />
        Responsive support
      </div>
    </div>
  </>
);

export default Pricing;
