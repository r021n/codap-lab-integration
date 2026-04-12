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
    <Card className="border-dashed border-2 border-border/40 bg-muted/5 rounded-2xl h-[500px] flex items-center justify-center text-center p-12">
      <div className="max-w-md space-y-4">
        <div
          className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${step?.bgColor} ${step?.color}`}
        >
          <Icon className="w-10 h-10" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">
          Materi {step?.title} Sedang Disiapkan
        </h2>
        <p className="text-muted-foreground">
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
