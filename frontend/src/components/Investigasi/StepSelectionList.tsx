import { CheckCircle, Lock, ArrowRight } from "lucide-react";
import { INVESTIGASI_STEPS } from "./constants";

interface StepSelectionListProps {
  completedSteps: number[];
  isStepLocked: (stepId: number) => boolean;
  onSelectStep: (stepId: number) => void;
}

export default function StepSelectionList({
  completedSteps,
  isStepLocked,
  onSelectStep,
}: StepSelectionListProps) {
  return (
    <div className="grid gap-6 py-4">
      {INVESTIGASI_STEPS.map((step) => {
        const isLocked = isStepLocked(step.id);
        const isCompleted = completedSteps.includes(step.id);

        return (
          <div
            key={step.id}
            onClick={() => !isLocked && onSelectStep(step.id)}
            className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
              isLocked
                ? "opacity-60 grayscale cursor-not-allowed border-border/10 bg-muted/20"
                : "cursor-pointer hover:shadow-xl hover:-translate-y-1 border-border/20 bg-background"
            }`}
          >
            <div className="p-6 flex items-center gap-6">
              {/* Step Number/Icon */}
              <div
                className={`shrink-0 w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold transition-transform group-hover:scale-110 ${step.bgColor} ${step.color}`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-8 h-8" />
                ) : isLocked ? (
                  <Lock className="w-7 h-7" />
                ) : (
                  step.id
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3
                    className={`font-serif text-xl font-bold truncate ${isLocked ? "text-muted-foreground" : "text-foreground"}`}
                  >
                    {step.title}
                  </h3>
                  {isCompleted && (
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      Selesai
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm line-clamp-1">
                  {step.description}
                </p>
              </div>

              {/* Arrow Indicator */}
              {!isLocked && (
                <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                  <ArrowRight className="h-6 w-6 text-primary" />
                </div>
              )}
            </div>

            {/* Progress Bar (Background) */}
            {!isLocked && (
              <div className="absolute bottom-0 left-0 h-1 bg-primary/10 w-full overflow-hidden">
                {isCompleted && (
                  <div className="h-full bg-emerald-500 w-full" />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
