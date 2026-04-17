import { ChevronLeft, Edit, Eye, FileText } from "lucide-react";
import { INVESTIGASI_STEPS } from "./constants";
import { Button } from "../ui/button";

export type InvestigasiMode = "editor" | "preview" | "submission";

interface StepHeaderProps {
  activeStep: number | null;
  onBack: () => void;
  role: string;
  mode: InvestigasiMode;
  setMode: (mode: InvestigasiMode) => void;
}

export default function StepHeader({
  activeStep,
  onBack,
  role,
  mode,
  setMode,
}: StepHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        {activeStep !== null && (
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            className="h-9 w-9 shrink-0 rounded-full border-border/20 hover:bg-background sm:h-10 sm:w-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="font-serif text-2xl font-bold leading-tight text-foreground sm:text-3xl">
            {activeStep
              ? INVESTIGASI_STEPS.find((s) => s.id === activeStep)?.title
              : "Urutan Langkah Investigasi"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-lg">
            {activeStep
              ? "Selesaikan langkah ini untuk melanjutkan ke tahap berikutnya."
              : "Ikuti langkah demi langkah untuk menyelesaikan investigasi data Anda."}
          </p>
        </div>
      </div>

      {activeStep !== null && (
        <div className="max-w-full shrink-0 overflow-x-auto rounded-lg border border-border/20 bg-background p-1 shadow-sm">
          <div className="flex min-w-max gap-1">
            {role === "admin" && (
              <button
                onClick={() => setMode("editor")}
                className={`flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-xs font-medium transition-all sm:px-4 sm:text-sm ${
                  mode === "editor"
                    ? "bg-white dark:bg-zinc-800 shadow-sm text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Edit className="w-4 h-4" /> Editor
              </button>
            )}
            <button
              onClick={() => setMode("preview")}
              className={`flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-xs font-medium transition-all sm:px-4 sm:text-sm ${
                mode === "preview"
                  ? "bg-white dark:bg-zinc-800 shadow-sm text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye className="w-4 h-4" /> Preview
            </button>

            <button
              onClick={() => setMode("submission")}
              className={`flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-xs font-medium transition-all sm:px-4 sm:text-sm ${
                mode === "submission"
                  ? "bg-white dark:bg-zinc-800 shadow-sm text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="w-4 h-4" /> Submission
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
