import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { showToast, ToastContainer } from "../components/ui/toast";
import { ArrowRight } from "lucide-react";
import type { User } from "../api/auth.api";
import {
  completeInvestigasiStep,
  getInvestigasiProgress,
} from "../api/investigasi.api";
import { getApiErrorMessage } from "../api/errors";

import StepHeader, {
  type InvestigasiMode,
} from "../components/Investigasi/StepHeader";
import StepSelectionList from "../components/Investigasi/StepSelectionList";
import StepPlaceholder from "../components/Investigasi/StepPlaceholder";
import Step1 from "../components/Investigasi/steps/Step1";
import Step2 from "../components/Investigasi/steps/Step2";
import Step3 from "../components/Investigasi/steps/Step3";
import Step4 from "../components/Investigasi/steps/Step4";
import Step5 from "../components/Investigasi/steps/Step5";

export default function Investigasi({ user }: { user: User }) {
  const [mode, setMode] = useState<InvestigasiMode>("preview");
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isProgressLoading, setIsProgressLoading] = useState(
    user.role !== "admin",
  );
  const [completingStepId, setCompletingStepId] = useState<number | null>(null);

  useEffect(() => {
    if (user.role === "admin") {
      setIsProgressLoading(false);
      return;
    }

    let isMounted = true;

    const loadProgress = async () => {
      setIsProgressLoading(true);
      try {
        const progress = await getInvestigasiProgress();
        if (isMounted) {
          setCompletedSteps(progress.completedSteps);
        }
      } catch (err) {
        showToast(
          getApiErrorMessage(err, "Gagal memuat progress investigasi."),
          "error",
        );
      } finally {
        if (isMounted) {
          setIsProgressLoading(false);
        }
      }
    };

    void loadProgress();

    return () => {
      isMounted = false;
    };
  }, [user.id, user.role]);

  const handleCompleteStep = async (stepId: number) => {
    if (completingStepId !== null) {
      return;
    }

    setCompletingStepId(stepId);
    try {
      if (user.role === "admin") {
        setCompletedSteps((prev) =>
          prev.includes(stepId) ? prev : [...prev, stepId],
        );
      } else {
        const progress = await completeInvestigasiStep(stepId);
        setCompletedSteps(progress.completedSteps);
      }

      setActiveStep(null); // Return to list after completion
      showToast(`Step ${stepId} selesai!`, "success");
    } catch (err) {
      showToast(
        getApiErrorMessage(err, "Gagal menyimpan progress langkah."),
        "error",
      );
    } finally {
      setCompletingStepId(null);
    }
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
        isProgressLoading ? (
          <div className="rounded-2xl border border-border/30 bg-background/60 p-6 text-sm text-muted-foreground">
            Memuat progress investigasi...
          </div>
        ) : (
          <StepSelectionList
            completedSteps={completedSteps}
            isStepLocked={isStepLocked}
            onSelectStep={setActiveStep}
          />
        )
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">
          {activeStep === 1 && <Step1 mode={activeMode} />}
          {activeStep === 2 && <Step2 mode={activeMode} user={user} />}
          {activeStep === 3 && <Step3 mode={activeMode} user={user} />}
          {activeStep === 4 && <Step4 mode={activeMode} user={user} />}
          {activeStep === 5 && <Step5 mode={activeMode} user={user} />}
          {activeStep !== 1 &&
            activeStep !== 2 &&
            activeStep !== 3 &&
            activeStep !== 4 &&
            activeStep !== 5 && <StepPlaceholder stepId={activeStep} />}

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
                disabled={completingStepId === activeStep}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 rounded-full shadow-lg shadow-emerald-500/20"
              >
                {completingStepId === activeStep
                  ? "Menyimpan Progress..."
                  : `Selesaikan Langkah ${activeStep}`}
                {completingStepId !== activeStep && (
                  <ArrowRight className="ml-2 w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
