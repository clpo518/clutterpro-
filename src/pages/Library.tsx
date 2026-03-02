import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ArrowLeft, BookOpen, Sparkles, Send, MessageCircle, FlaskConical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { exerciseCategories, ExerciseCategory } from "@/data/exercises";
import AssignExerciseModal from "@/components/assignments/AssignExerciseModal";
import DailyExerciseCard from "@/components/dashboard/DailyExerciseCard";

type FilterTab = "all" | "reading" | "oral" | "motor" | "special";

const FILTER_TABS: { id: FilterTab; label: string; emoji: string }[] = [
  { id: "all", label: "Tous", emoji: "📚" },
  { id: "reading", label: "Lecture", emoji: "📖" },
  { id: "oral", label: "Oral libre", emoji: "🎤" },
  { id: "motor", label: "Moteur", emoji: "⚡" },
  { id: "special", label: "Spécial", emoji: "✨" },
];

const getFilterGroup = (cat: ExerciseCategory): FilterTab => {
  if (cat.type === "improvisation") return "oral";
  if (cat.type === "warmup" || cat.type === "repetition") return "motor";
  if (cat.type === "proprioception" || cat.type === "rebus") return "special";
  if (cat.type === "retelling") return "reading";
  return "reading";
};

const Library = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isTherapist, setIsTherapist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; title: string } | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("profiles")
        .select("is_therapist")
        .eq("id", user.id)
        .maybeSingle();
      setIsTherapist(data?.is_therapist || false);
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const filteredCategories = useMemo(() => {
    if (activeFilter === "all") return exerciseCategories;
    return exerciseCategories.filter(cat => getFilterGroup(cat) === activeFilter);
  }, [activeFilter]);

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/practice?category=${categoryId}`);
  };

  const handleAssignClick = (e: React.MouseEvent, categoryId: string, categoryTitle: string) => {
    e.stopPropagation();
    setSelectedCategory({ id: categoryId, title: categoryTitle });
    setAssignModalOpen(true);
  };

  // Get a short type label for the card
  const getTypeLabel = (cat: ExerciseCategory) => {
    if (cat.isClinical) return { text: "Clinique", class: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400" };
    if (cat.type === "improvisation") return { text: "Oral libre", class: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400" };
    if (cat.type === "repetition") return { text: "Moteur", class: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400" };
    if (cat.type === "warmup") return { text: "Échauffement", class: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400" };
    if (cat.type === "proprioception") return { text: "Proprioception", class: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400" };
    if (cat.type === "rebus") return { text: "Enfant", class: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" };
    if (cat.type === "retelling") return { text: "Récit Résumé", class: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" };
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-accent/30">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </Link>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="font-display font-bold">Bibliothèque</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Therapist Discovery Banner */}
          {isTherapist && (
            <div className="flex items-start gap-3 p-3 mb-6 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-sm">
              <FlaskConical className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-blue-700 dark:text-blue-300">Mode Découverte</p>
                <p className="text-blue-600/80 dark:text-blue-400/80 text-xs mt-0.5">
                  Vous explorez en tant qu'orthophoniste. Les sessions lancées ici ne seront pas rattachées à un patient.
                </p>
              </div>
            </div>
          )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Hero */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Choisissez votre exercice</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
              Vos exercices
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm">
              {exerciseCategories.length} catégories · {exerciseCategories.reduce((sum, c) => sum + c.exercises.length, 0)} exercices à votre rythme
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide justify-center flex-wrap">
            {FILTER_TABS.map(tab => {
              let count = tab.id === "all" 
                ? exerciseCategories.length 
                : exerciseCategories.filter(c => getFilterGroup(c) === tab.id).length;
              // Include Dialogue mode in oral count
              if (tab.id === "oral" || tab.id === "all") count += 1;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    activeFilter === tab.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span>{tab.emoji}</span>
                  <span>{tab.label}</span>
                  <span className={`text-xs ml-0.5 ${activeFilter === tab.id ? "text-primary-foreground/70" : "text-muted-foreground/60"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Daily Exercise Recommendation */}
          {!isTherapist && activeFilter === "all" && <DailyExerciseCard />}

          {/* Dialogue Mode - Featured Card */}
          {(activeFilter === "all" || activeFilter === "oral") && (
            <motion.div
              className="mb-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card
                className="relative cursor-pointer transition-all overflow-hidden border-2 border-primary/30 bg-gradient-to-r from-primary/[0.04] to-accent/30 hover:shadow-lg hover:border-primary/50 group"
                onClick={() => navigate("/dialogue")}
              >
                <div className="flex items-center gap-4 p-4 sm:p-5">
                  <div className="text-3xl sm:text-4xl shrink-0">💬</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <CardTitle className="text-base sm:text-lg leading-tight">Mode Dialogue</CardTitle>
                      <span className="inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        ⭐ Recommandé
                      </span>
                      <span className="inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400">
                        Oral libre
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      Parlez librement avec un retour visuel en temps réel. L'exercice clé pour appliquer vos acquis au quotidien.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 gap-1"
                    onClick={(e) => { e.stopPropagation(); navigate("/dialogue"); }}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Commencer</span>
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Category Cards */}
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {filteredCategories.map((category, index) => {
                const typeLabel = getTypeLabel(category);
                return (
                  <motion.div
                    key={category.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.04, duration: 0.3 }}
                  >
                    <Card
                      className="relative cursor-pointer transition-all overflow-hidden bg-card border-border hover:shadow-lg hover:border-primary/30 group"
                      onClick={() => handleCategoryClick(category.id)}
                    >
                      <div className="flex items-center gap-4 p-4 sm:p-5">
                        {/* Icon */}
                        <div className="text-3xl sm:text-4xl shrink-0">{category.icon}</div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <CardTitle className="text-base sm:text-lg leading-tight">{category.title}</CardTitle>
                            {typeLabel && (
                              <span className={`inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full ${typeLabel.class}`}>
                                {typeLabel.text}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1 sm:line-clamp-2">
                            {category.description}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            {category.exercises.length} exercices
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {isTherapist && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 text-primary border-primary/30 hover:bg-primary/10 hidden sm:flex"
                              onClick={(e) => handleAssignClick(e, category.id, category.title)}
                            >
                              <Send className="w-3.5 h-3.5" />
                              Prescrire
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-muted-foreground group-hover:text-primary transition-colors"
                          >
                            <Activity className="w-4 h-4" />
                            <span className="hidden sm:inline">Commencer</span>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

        </motion.div>
      </main>

      {/* Assign Exercise Modal (Therapists only) */}
      {selectedCategory && (
        <AssignExerciseModal
          isOpen={assignModalOpen}
          onClose={() => {
            setAssignModalOpen(false);
            setSelectedCategory(null);
          }}
          exerciseCategory={selectedCategory.id}
          exerciseTitle={selectedCategory.title}
        />
      )}
    </div>
  );
};

export default Library;
