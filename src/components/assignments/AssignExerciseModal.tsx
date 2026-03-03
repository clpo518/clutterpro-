import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Send, Users, User } from "lucide-react";
import { exerciseCategories } from "@/data/exercises";
import ExercisePreview from "./ExercisePreview";

interface Patient {
  id: string;
  full_name: string | null;
}

interface AssignExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseCategory?: string;
  exerciseId?: string;
  exerciseTitle?: string;
  // New props for preselected patient (from PatientDetail page)
  preselectedPatientId?: string;
  preselectedPatientName?: string;
}

const AssignExerciseModal = ({
  isOpen,
  onClose,
  exerciseCategory,
  exerciseId,
  exerciseTitle,
  preselectedPatientId,
  preselectedPatientName,
}: AssignExerciseModalProps) => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(true);

  // Initialize with preselected values
  useEffect(() => {
    if (preselectedPatientId) {
      setSelectedPatientId(preselectedPatientId);
    }
    if (exerciseCategory) {
      setSelectedCategory(exerciseCategory);
    }
  }, [preselectedPatientId, exerciseCategory, isOpen]);

  // Fetch linked patients (only if no preselected patient)
  useEffect(() => {
    const fetchPatients = async () => {
      if (!user || preselectedPatientId) {
        setLoadingPatients(false);
        return;
      }
      
      setLoadingPatients(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("linked_therapist_id", user.id);

      if (error) {
        console.error("Error fetching patients:", error);
        toast.error("Error loading patients");
      } else {
        setPatients(data || []);
      }
      setLoadingPatients(false);
    };

    if (isOpen) {
      fetchPatients();
    }
  }, [user, isOpen, preselectedPatientId]);

  const handleAssign = async () => {
    const patientId = preselectedPatientId || selectedPatientId;
    const category = exerciseCategory || selectedCategory;
    
    if (!patientId || !user) {
      toast.error("Please select a patient");
      return;
    }

    if (!category) {
      toast.error("Please select an exercise category");
      return;
    }

    setLoading(true);
    
    const { error } = await supabase.from("assignments").insert({
      patient_id: patientId,
      therapist_id: user.id,
      exercise_category: category,
      exercise_id: exerciseId || null,
      message: message.trim() || null,
      status: "pending",
    });

    if (error) {
      console.error("Error creating assignment:", error);
      toast.error("Error creating assignment");
    } else {
      toast.success("Prescription sent! An email has been sent to the patient.");
      
      // Send notification email to patient (fire-and-forget)
      const displayName = exerciseTitle || exerciseCategories.find(c => c.id === category)?.title || category;
      supabase.functions.invoke("notify-prescription", {
        body: {
          patientId,
          therapistId: user.id,
          exerciseTitle: displayName,
          message: message.trim() || undefined,
        },
      }).catch((err) => console.error("Error sending prescription notification:", err));
      
      onClose();
      setSelectedPatientId("");
      setSelectedCategory("");
      setMessage("");
    }
    
    setLoading(false);
  };

  // Get display info for exercise
  const displayTitle = exerciseTitle || (selectedCategory 
    ? exerciseCategories.find(c => c.id === selectedCategory)?.title 
    : null);
  const displayCategory = exerciseCategory || selectedCategory;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Prescribe an exercise
          </DialogTitle>
          <DialogDescription>
            {preselectedPatientId 
              ? "Prescribe an exercise to this patient"
              : "Prescribe this exercise to one of your patients"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 overflow-y-auto flex-1 min-h-0">
          {/* Patient display - preselected or selector */}
          {preselectedPatientId ? (
            <div className="p-3 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{preselectedPatientName || "Patient"}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="patient">Patient</Label>
              {loadingPatients ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
              ) : patients.length === 0 ? (
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                    <Users className="w-4 h-4" />
                    <p className="text-sm">No linked patients</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Share your Pro Code to link patients.
                  </p>
                </div>
              ) : (
                <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.full_name || "Unnamed patient"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Exercise category selector - only if no category provided */}
          {!exerciseCategory && (
            <div className="space-y-2">
              <Label htmlFor="category">Exercise category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {exerciseCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Exercise preview with selection */}
          {displayCategory && (() => {
            const cat = exerciseCategories.find(c => c.id === displayCategory);
            if (!cat) return null;
            return (
              <ExercisePreview category={cat} />
            );
          })()}

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Personalized note (optional)</Label>
            <Textarea
              id="message"
              placeholder="Ex: Focus on pausing at commas..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssign} 
            disabled={loading || (!preselectedPatientId && !selectedPatientId) || (!exerciseCategory && !selectedCategory)}
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            {loading ? "Sending..." : "Send prescription"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignExerciseModal;
