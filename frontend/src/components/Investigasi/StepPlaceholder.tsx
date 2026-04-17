import { BookOpen, Info } from "lucide-react";
import { Card } from "../../components/ui/card";
import { INVESTIGASI_STEPS } from "./constants";

interface StepPlaceholderProps {
  stepId: number;
}

export default function StepPlaceholder({ stepId }: StepPlaceholderProps) {
  const step = INVESTIGASI_STEPS.find((s) => s.id === stepId);
  const Icon = step?.icon || Info;

  return (
    <Card className="flex min-h-90 items-center justify-center rounded-2xl border-2 border-dashed border-border/40 bg-muted/5 p-6 text-center sm:h-125 sm:p-12">
      <div className="max-w-md space-y-4">
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full sm:h-20 sm:w-20 ${step?.bgColor} ${step?.color}`}
        >
          <Icon className="h-8 w-8 sm:h-10 sm:w-10" />
        </div>
        <h2 className="font-serif text-xl font-bold leading-tight text-foreground sm:text-2xl">
          Materi {step?.title} Sedang Disiapkan
        </h2>
        <p className="text-sm text-muted-foreground sm:text-base">
          Step ini adalah bagian dari kurikulum investigasi. Kami sedang
          mengoptimalkan konten untuk memberikan pengalaman belajar terbaik.
        </p>
        <div className="pt-4">
          <div className="flex items-center justify-center gap-2 text-primary font-medium">
            <BookOpen className="w-4 h-4" />
            <span>Coming Soon</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
