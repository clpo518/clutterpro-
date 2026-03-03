import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  ArrowRight, 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  Stethoscope,
  Activity,
  Sparkles
} from "lucide-react";

interface Question {
  id: number;
  text: string;
  subtitle: string;
  category: string;
}

const questions: Question[] = [
  {
    id: 1,
    text: "Do you have trouble planning what you're going to say?",
    subtitle: "Do you often start a sentence without knowing how you'll finish it, or lose the thread of your thought mid-speech?",
    category: "Planning skills"
  },
  {
    id: 2,
    text: "Do you speak without apparent effort, even when you stumble?",
    subtitle: "Unlike classic stuttering, do you feel little physical tension (mouth, neck) when speaking?",
    category: "Low physical effort"
  },
  {
    id: 3,
    text: "Is your speech rate irregular?",
    subtitle: "Do you feel like you speak in \"bursts\" or sudden rushes of acceleration?",
    category: "Irregular rate"
  },
  {
    id: 4,
    text: "Do you tend to clip the ends of words?",
    subtitle: "For example, saying \"gonna\" for \"going to\" or collapsing multiple syllables together.",
    category: "Word telescoping"
  },
  {
    id: 5,
    text: "Do you speak too fast?",
    subtitle: "Is \"slow down!\" the most common feedback you get from people around you?",
    category: "Fast speech rate"
  },
  {
    id: 6,
    text: "Does your voice drop off at the end of sentences?",
    subtitle: "Do you often mumble or run out of breath at the end of phrases, making the ending inaudible?",
    category: "Unintelligible speech"
  },
  {
    id: 7,
    text: "Do you lack breathing pauses?",
    subtitle: "Do you tend to say everything in one go, without leaving silences for punctuation?",
    category: "Lack of pauses"
  },
  {
    id: 8,
    text: "Do you often repeat parts of phrases?",
    subtitle: "For example: \"I'm gonna... I'm gonna go to the movies\" (buying time while you think).",
    category: "Phrase repetitions"
  },
  {
    id: 9,
    text: "Do you also experience blocks?",
    subtitle: "Do you ever get completely stuck on a sound (l-l-like this) with a sense of struggle?",
    category: "Co-occurring stuttering"
  },
  {
    id: 10,
    text: "Do you struggle with long words?",
    subtitle: "Do you have difficulty pronouncing complex words quickly (e.g. \"uncharacteristically\", \"enthusiastically\")?",
    category: "Motor coordination"
  }
];

const scaleLabels = [
  { value: 0, label: "Never" },
  { value: 1, label: "Rarely" },
  { value: 2, label: "Sometimes" },
  { value: 3, label: "Often" },
  { value: 4, label: "Very often" },
  { value: 5, label: "Always" }
];

const Assessment = () => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
  const isHighRisk = totalScore > 24;

  const handleAnswer = (value: number) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const currentAnswer = answers[currentQuestion?.id];
  const canProceed = currentAnswer !== undefined;

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-accent/30">
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </Link>
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-primary" />
              <span className="font-display font-bold">Results</span>
            </div>
            <div className="w-20" />
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className={`overflow-hidden ${isHighRisk ? 'border-orange-300 dark:border-orange-700' : 'border-green-300 dark:border-green-700'}`}>
              <div className={`p-6 ${isHighRisk ? 'bg-gradient-to-r from-orange-500/10 to-red-500/10' : 'bg-gradient-to-r from-green-500/10 to-teal-500/10'}`}>
                <div className="flex justify-center mb-4">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isHighRisk ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                    {isHighRisk ? (
                      <AlertTriangle className="w-10 h-10 text-orange-600 dark:text-orange-400" />
                    ) : (
                      <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                    )}
                  </div>
                </div>
                
                <h2 className={`text-2xl font-bold text-center mb-2 ${isHighRisk ? 'text-orange-700 dark:text-orange-400' : 'text-green-700 dark:text-green-400'}`}>
                  {isHighRisk ? "High Cluttering Risk" : "Fast Speech Rate"}
                </h2>
                
                <div className="text-center mb-4">
                  <span className="text-4xl font-bold">{totalScore}</span>
                  <span className="text-muted-foreground">/50 points</span>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="mb-6 p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Clinical threshold:</strong> Score &gt; 24 = Signs characteristic of cluttering
                  </p>
                  <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                      style={{ width: '100%' }}
                    />
                    <div 
                      className="absolute top-0 h-full w-1 bg-foreground"
                      style={{ left: `${(totalScore / 50) * 100}%` }}
                    />
                    <div 
                      className="absolute top-0 h-full w-0.5 bg-foreground/50"
                      style={{ left: '48%' }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                    <span>0</span>
                    <span>24 (threshold)</span>
                    <span>50</span>
                  </div>
                </div>

                <p className="text-center text-muted-foreground mb-6">
                  {isHighRisk ? (
                    <>
                      Your score indicates <strong>signs characteristic of cluttering</strong>.
                      It is recommended to consult a speech therapist.
                      Our app can help you <strong>start slowing down right now</strong>.
                    </>
                  ) : (
                    <>
                      You don't appear to have pathological cluttering,
                      but training will help you <strong>gain confidence</strong> and
                      clarity in your presentations.
                    </>
                  )}
                </p>

                <div className="flex items-center justify-center gap-2 mb-6 p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <Stethoscope className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm text-purple-800 dark:text-purple-200">
                    This test is based on the clinically validated Predictive Cluttering Inventory.
                  </span>
                </div>

                <motion.div
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Button 
                    size="lg" 
                    className="w-full text-lg py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25"
                    onClick={() => navigate("/auth")}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start my training program
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>

                <p className="text-center text-xs text-muted-foreground mt-4">
                  Free • 5 minutes a day • Results in 2 weeks
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-accent/30">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <span className="font-display font-bold">Self-Assessment</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {currentQuestionIndex + 1}/{questions.length}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-8">
              <CardContent className="p-8">
                {/* Category badge */}
                <div className="flex justify-center mb-4">
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
                    {currentQuestion.category}
                  </span>
                </div>

                {/* Question */}
                <h2 className="text-xl md:text-2xl font-semibold text-center mb-3">
                  {currentQuestion.text}
                </h2>
                
                {/* Subtitle / Explanation */}
                <p className="text-sm text-muted-foreground text-center mb-8 max-w-md mx-auto">
                  {currentQuestion.subtitle}
                </p>

                {/* Scale */}
                <div className="grid grid-cols-6 gap-2">
                  {scaleLabels.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => handleAnswer(value)}
                      className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                        currentAnswer === value
                          ? 'border-primary bg-primary/10 shadow-md'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <span className={`text-2xl font-bold ${currentAnswer === value ? 'text-primary' : 'text-foreground'}`}>
                        {value}
                      </span>
                      <span className="text-xs text-muted-foreground text-center mt-1 hidden sm:block">
                        {label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Mobile labels */}
                <div className="flex justify-between mt-2 sm:hidden text-xs text-muted-foreground">
                  <span>Never</span>
                  <span>Always</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="gap-2"
          >
            {currentQuestionIndex === questions.length - 1 ? (
              <>
                See my results
                <Activity className="w-4 h-4" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

        {/* Info box */}
        <div className="mt-8 p-4 rounded-lg bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">
            <Stethoscope className="w-4 h-4 inline mr-1" />
            This test is based on the <strong>Predictive Cluttering Inventory</strong>,
            a screening tool validated by speech-language pathology research.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Assessment;
