import { FileText, Download, Info, Play } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
import { Button } from "../../../ui/button";
import type { Dataset } from "../../../../api/datasets.api";

interface Step3PreviewProps {
  datasets: Dataset[];
  instructions: string;
  onDownload: (dataset: Dataset) => void;
}

export default function Step3Preview({
  datasets,
  instructions,
  onDownload,
}: Step3PreviewProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-4 lg:gap-8">
      <div className="space-y-6 lg:col-span-1 lg:space-y-8">
        <Card className="border border-border/20 bg-background shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="font-serif text-base font-bold text-foreground sm:text-lg">
              Dataset Langkah 3
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground sm:text-sm">
              Gunakan data ini untuk investigasi lanjut
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {datasets.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  Belum ada dataset khusus Langkah 3.
                </p>
              ) : (
                datasets.map((dataset) => (
                  <div
                    key={dataset.id}
                    className="rounded-xl border border-border/10 p-4 flex flex-col gap-3 bg-background hover:bg-primary/5 hover:border-primary/20 transition-all shadow-sm group"
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm font-semibold text-foreground break-all leading-tight">
                        {dataset.name}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full h-9 text-xs border-border text-foreground hover:bg-primary hover:text-white"
                      onClick={() => onDownload(dataset)}
                      disabled={dataset.url === "#"}
                    >
                      <Download className="h-3.5 w-3.5 mr-2" />
                      Unduh Data
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-indigo-500/20 bg-indigo-500/5 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="font-serif text-base font-bold text-indigo-700 sm:text-lg flex items-center gap-2">
              <Info className="h-5 w-5" />
              Petunjuk Pengerjaan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-foreground/80 sm:text-sm">
            {instructions ? (
              <div className="whitespace-pre-wrap leading-relaxed">
                {instructions}
              </div>
            ) : (
              <p className="italic text-muted-foreground">
                Petunjuk belum tersedia.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="flex min-h-105 h-[70vh] flex-col overflow-hidden rounded-xl border border-border/20 bg-background shadow-md sm:h-160 lg:col-span-3 lg:h-185">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/10 bg-background px-4 py-3 sm:px-6 sm:py-4">
          <CardTitle className="font-serif text-base font-bold text-foreground sm:text-lg flex items-center gap-2">
            <Play className="w-5 h-5 text-emerald-500 fill-emerald-500" />
            CODAP Investigation Workspace
          </CardTitle>
        </CardHeader>
        <div className="flex-1 bg-background relative">
          <iframe
            src="https://codap.concord.org/releases/latest/static/dg/en/cert/index.html"
            className="absolute inset-0 w-full h-full border-0"
            title="CODAP Workspace"
            allowFullScreen
          />
        </div>
      </Card>
    </div>
  );
}
