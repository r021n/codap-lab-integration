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
    <div className="grid gap-4 py-2 sm:gap-6 sm:py-4">
      {INVESTIGASI_STEPS.map((step) => {
        const isLocked = isStepLocked(step.id);
        const isCompleted = completedSteps.includes(step.id);

        return (
          <div
            key={step.id}
            onClick={() => !isLocked && onSelectStep(step.id)}
            className={`group relative overflow-hidden rounded-xl border transition-all duration-300 sm:rounded-2xl ${
              isLocked
                ? "opacity-60 grayscale cursor-not-allowed border-border/10 bg-muted/20"
                : "cursor-pointer hover:shadow-xl hover:-translate-y-1 border-border/20 bg-background"
            }`}
          >
            <div className="flex items-start gap-4 p-4 sm:items-center sm:gap-6 sm:p-6">
              {/* Step Number/Icon */}
              <div
                className={`h-12 w-12 shrink-0 rounded-lg text-xl font-bold transition-transform group-hover:scale-110 sm:h-16 sm:w-16 sm:rounded-xl sm:text-2xl ${step.bgColor} ${step.color} flex items-center justify-center`}
              >
                {isCompleted ? (
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8" />
                ) : isLocked ? (
                  <Lock className="h-5 w-5 sm:h-7 sm:w-7" />
                ) : (
                  step.id
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3
                    className={`font-serif text-lg font-bold leading-tight sm:text-xl ${isLocked ? "text-muted-foreground" : "text-foreground"}`}
                  >
                    {step.title}
                  </h3>
                  {isCompleted && (
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      Selesai
                    </span>
                  )}
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground sm:line-clamp-1">
                  {step.description}
                </p>
              </div>

              {/* Arrow Indicator */}
              {!isLocked && (
                <div className="hidden shrink-0 translate-x-4 opacity-0 transition-opacity group-hover:translate-x-0 group-hover:opacity-100 sm:block">
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
