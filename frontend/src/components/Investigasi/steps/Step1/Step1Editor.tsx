import { Upload, FileText, Download, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import type { Dataset } from "../../../../api/datasets.api";

interface Step1EditorProps {
  datasets: Dataset[];
  file: File | null;
  isUploading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: (e: React.FormEvent) => void;
  onDownload: (dataset: Dataset) => void;
  onRequestDelete: (id: string) => void;
}

export default function Step1Editor({
  datasets,
  file,
  isUploading,
  onFileChange,
  onUpload,
  onDownload,
  onRequestDelete,
}: Step1EditorProps) {
  return (
    <div className="space-y-6">
      <Card className="border border-primary/20 bg-primary/5 shadow-sm rounded-xl overflow-hidden">
        <CardHeader>
          <CardTitle className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Unggah Dataset Baru (Admin)
          </CardTitle>
          <CardDescription className="text-primary/70">
            Unggah file CSV baru agar dapat digunakan oleh siswa untuk
            investigasi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={onUpload}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <Input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={onFileChange}
              className="bg-background max-w-md border-border focus:ring-primary h-10"
              required
            />
            <Button
              type="submit"
              disabled={isUploading || !file}
              className="rounded-lg bg-primary hover:bg-primary/90 text-white min-w-[120px]"
            >
              {isUploading ? "Mengunggah..." : "Unggah CSV"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border border-border/20 bg-background shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="border-b border-border/5 bg-background/50">
          <CardTitle className="font-serif text-xl font-bold text-foreground">
            Kelola Dataset
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Daftar dataset referensi CSV yang tersedia di sistem.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-xl border border-border/10 overflow-x-auto overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/30 border-b border-border/10">
                <tr>
                  <th className="px-5 py-4 font-semibold text-foreground">
                    Nama File
                  </th>
                  <th className="px-5 py-4 font-semibold text-foreground w-48">
                    Tanggal
                  </th>
                  <th className="px-5 py-4 font-semibold text-foreground text-right w-32">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/5">
                {datasets.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-5 py-8 text-center text-muted-foreground"
                    >
                      Belum ada dataset yang diunggah.
                    </td>
                  </tr>
                ) : (
                  datasets.map((dataset) => (
                    <tr
                      key={dataset.id}
                      className="hover:bg-muted/10 transition-colors"
                    >
                      <td className="px-5 py-4 font-medium text-foreground">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-primary shrink-0" />
                          <span
                            className="truncate max-w-[300px]"
                            title={dataset.name}
                          >
                            {dataset.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {dataset.uploadDate}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-foreground border-border/20 hover:bg-background hover:text-primary"
                            onClick={() => onDownload(dataset)}
                            disabled={dataset.url === "#"}
                            title="Unduh CSV"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8 bg-red-500 hover:bg-red-600 border-0"
                            onClick={() => onRequestDelete(dataset.id)}
                            title="Hapus Dataset"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
