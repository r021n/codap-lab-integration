import { FileText, Download, Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
import { Button } from "../../../ui/button";
import type { Dataset } from "../../../../api/datasets.api";

interface Step1PreviewProps {
  datasets: Dataset[];
  onDownload: (dataset: Dataset) => void;
}

export default function Step1Preview({
  datasets,
  onDownload,
}: Step1PreviewProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-4">
      <div className="lg:col-span-1 space-y-8">
        <Card className="border border-border/20 bg-background shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="font-serif text-lg font-bold text-foreground">
              Dataset Tersedia
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Pilih dan unduh data untuk dianalisis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {datasets.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Belum ada dataset yang diunggah.
                </p>
              ) : (
                datasets.map((dataset) => (
                  <div
                    key={dataset.id}
                    className="rounded-xl border border-border/10 p-4 flex flex-col gap-3 bg-background hover:bg-primary/5 hover:border-primary/20 transition-all shadow-sm"
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
                      Unduh CSV
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-orange-500/20 bg-orange-500/5 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="font-serif text-lg font-bold text-orange-600 flex items-center gap-2">
              <Info className="h-5 w-5" />
              Petunjuk CODAP
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-foreground/80 space-y-4">
            <ol className="list-decimal pl-5 space-y-3 leading-relaxed marker:text-orange-500 marker:font-bold">
              <li>
                <strong>Unduh</strong> data CSV dari menu di atas.
              </li>
              <li>
                <strong>Tarik (Drag)</strong> file CSV yang sudah diunduh ke
                dalam area CODAP di sebelah kanan.
              </li>
              <li>
                Buat <strong>Grafik (Graph)</strong> menggunakan menu di pojok
                kiri atas CODAP.
              </li>
              <li>
                Tarik kolom data (misal: &quot;Suhu&quot;) ke sumbu X atau Y
                grafik.
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>

      <Card className="lg:col-span-3 flex flex-col h-[740px] border border-border/20 bg-background shadow-md rounded-xl overflow-hidden">
        <CardHeader className="border-b border-border/10 bg-background py-4 px-6 flex flex-row items-center justify-between">
          <CardTitle className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            Ruang Analisis Workspace
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
