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
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-4">
        {activeStep !== null && (
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            className="rounded-full h-10 w-10 border-border/20 hover:bg-background shrink-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            {activeStep
              ? INVESTIGASI_STEPS.find((s) => s.id === activeStep)?.title
              : "Urutan Langkah Investigasi"}
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            {activeStep
              ? "Selesaikan langkah ini untuk melanjutkan ke tahap berikutnya."
              : "Ikuti langkah demi langkah untuk menyelesaikan investigasi data Anda."}
          </p>
        </div>
      </div>

      {activeStep !== null && (
        <div className="flex bg-background p-1 rounded-lg border border-border/20 shrink-0 shadow-sm overflow-x-auto max-w-full">
          {role === "admin" && (
            <button
              onClick={() => setMode("editor")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
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
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
              mode === "preview"
                ? "bg-white dark:bg-zinc-800 shadow-sm text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="w-4 h-4" /> Preview
          </button>
          
          <button
            onClick={() => setMode("submission")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
              mode === "submission"
                ? "bg-white dark:bg-zinc-800 shadow-sm text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="w-4 h-4" /> Submission
          </button>
        </div>
      )}
    </header>
  );
}
