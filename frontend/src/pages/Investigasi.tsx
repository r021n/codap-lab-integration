import { useState } from "react";
import { Button } from "../components/ui/button";
import { showToast, ToastContainer } from "../components/ui/toast";
import { ArrowRight } from "lucide-react";
import type { User } from "../api/auth.api";

import StepHeader, {
  type InvestigasiMode,
} from "../components/Investigasi/StepHeader";
import StepSelectionList from "../components/Investigasi/StepSelectionList";
import StepPlaceholder from "../components/Investigasi/StepPlaceholder";
import Step1 from "../components/Investigasi/steps/Step1";
import Step2 from "../components/Investigasi/steps/Step2";
import Step3 from "../components/Investigasi/steps/Step3";

export default function Investigasi({ user }: { user: User }) {
  const [mode, setMode] = useState<InvestigasiMode>("preview");
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleCompleteStep = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
    setActiveStep(null); // Return to list after completion
    showToast(`Step ${stepId} selesai!`, "success");
  };

  const isStepLocked = (stepId: number) => {
    if (user.role === "admin") return false;
    if (stepId === 1) return false;
    return !completedSteps.includes(stepId - 1);
  };

  // Determine actual rendered mode (Student shouldn't see editor)
  const activeMode: InvestigasiMode =
    user.role === "admin" ? mode : mode === "editor" ? "preview" : mode;

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12 font-sans text-foreground">
      <ToastContainer />

      <StepHeader
        activeStep={activeStep}
        onBack={() => setActiveStep(null)}
        role={user.role}
        mode={mode}
        setMode={setMode}
      />

      {activeStep === null ? (
        <StepSelectionList
          completedSteps={completedSteps}
          isStepLocked={isStepLocked}
          onSelectStep={setActiveStep}
        />
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">
          {activeStep === 1 && <Step1 mode={activeMode} />}
          {activeStep === 2 && <Step2 mode={activeMode} user={user} />}
          {activeStep === 3 && <Step3 mode={activeMode} user={user} />}
          {activeStep !== 1 && activeStep !== 2 && activeStep !== 3 && (
            <StepPlaceholder stepId={activeStep} />
          )}

          {/* ACTION FOOTER */}
          <div className="pt-8 border-t border-border/10 flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={() => setActiveStep(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              Kembali ke Daftar Langkah
            </Button>

            {activeStep !== null && !completedSteps.includes(activeStep) && (
              <Button
                onClick={() => handleCompleteStep(activeStep)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 rounded-full shadow-lg shadow-emerald-500/20"
              >
                Selesaikan Langkah {activeStep}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
