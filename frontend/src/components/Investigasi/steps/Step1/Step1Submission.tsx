import { FileBox, History } from "lucide-react";
import { Card } from "../../../ui/card";

export default function Step1Submission() {
  return (
    <Card className="border-dashed border-2 border-border/40 bg-muted/5 rounded-2xl h-[400px] flex items-center justify-center text-center p-12">
      <div className="max-w-md space-y-4">
        <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center bg-blue-500/10 text-blue-500">
          <FileBox className="w-10 h-10" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">
          Ruang Pengumpulan Tugas
        </h2>
        <p className="text-muted-foreground">
          Tab ini akan digunakan untuk melihat riwayat dan hasil pengumpulan
          tugas dari siswa untuk langkah investigasi ini.
        </p>
        <div className="pt-4">
          <div className="flex items-center justify-center gap-2 text-primary font-medium">
            <History className="w-4 h-4" />
            <span>Sedang Dikembangkan</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
