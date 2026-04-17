import { useState, useEffect } from "react";
import { Upload, FileText, Download, Trash2, Edit3, Save } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Textarea } from "../../../ui/textarea";
import type { Dataset } from "../../../../api/datasets.api";

interface Step3EditorProps {
  datasets: Dataset[];
  instructions: string;
  file: File | null;
  isUploading: boolean;
  isSavingInstructions: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: (e: React.FormEvent) => void;
  onSaveInstructions: (content: string) => void;
  onDownload: (dataset: Dataset) => void;
  onRequestDelete: (id: string) => void;
}

export default function Step3Editor({
  datasets,
  instructions,
  file,
  isUploading,
  isSavingInstructions,
  onFileChange,
  onUpload,
  onSaveInstructions,
  onDownload,
  onRequestDelete,
}: Step3EditorProps) {
  const [localInstructions, setLocalInstructions] = useState(instructions);

  useEffect(() => {
    setLocalInstructions(instructions);
  }, [instructions]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* MANAGE INSTRUCTIONS */}
      <Card className="border border-indigo-500/20 bg-indigo-500/5 shadow-sm rounded-xl overflow-hidden">
        <CardHeader>
          <CardTitle className="font-serif text-lg font-bold text-foreground sm:text-xl flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-indigo-600" />
            Edit Petunjuk Pengerjaan (Admin)
          </CardTitle>
          <CardDescription className="text-indigo-700/70">
            Sesuaikan instruksi yang akan dilihat siswa pada Langkah 3.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={localInstructions}
            onChange={(e) => setLocalInstructions(e.target.value)}
            placeholder="Masukkan petunjuk pengerjaan di sini..."
            className="min-h-45 bg-background border-border focus:ring-indigo-500 font-sans leading-relaxed sm:min-h-50"
          />
          <div className="flex justify-end">
            <Button
              onClick={() => onSaveInstructions(localInstructions)}
              disabled={
                isSavingInstructions || localInstructions === instructions
              }
              className="w-full bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg sm:w-auto flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSavingInstructions ? "Menyimpan..." : "Simpan Petunjuk"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* UPLOAD DATASET */}
      <Card className="border border-primary/20 bg-primary/5 shadow-sm rounded-xl overflow-hidden">
        <CardHeader>
          <CardTitle className="font-serif text-lg font-bold text-foreground sm:text-xl flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Unggah Dataset Langkah 3 (Admin)
          </CardTitle>
          <CardDescription className="text-primary/70">
            Unggah file CSV baru khusus untuk audit investigasi Langkah 3.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={onUpload}
            className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4"
          >
            <Input
              id="step3-csv-upload"
              type="file"
              accept=".csv"
              onChange={onFileChange}
              className="h-10 w-full bg-background border-border focus:ring-primary sm:max-w-md"
              required
            />
            <Button
              type="submit"
              disabled={isUploading || !file}
              className="min-w-30 rounded-lg bg-primary text-white hover:bg-primary/90 sm:w-auto"
            >
              {isUploading ? "Mengunggah..." : "Unggah CSV"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* DATASET LIST */}
      <Card className="border border-border/20 bg-background shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="border-b border-border/5 bg-background/50">
          <CardTitle className="font-serif text-lg font-bold text-foreground sm:text-xl">
            Kelola Dataset Langkah 3
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Daftar dataset yang sedang aktif untuk Langkah 3.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 sm:pt-6">
          <div className="overflow-x-auto rounded-xl border border-border/10">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/30 border-b border-border/10">
                <tr>
                  <th className="px-4 py-3 font-semibold text-foreground sm:px-5 sm:py-4">
                    Nama File
                  </th>
                  <th className="w-40 px-4 py-3 font-semibold text-foreground sm:w-48 sm:px-5 sm:py-4">
                    Tanggal
                  </th>
                  <th className="w-28 px-4 py-3 text-right font-semibold text-foreground sm:w-32 sm:px-5 sm:py-4">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/5">
                {datasets.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-8 text-center text-muted-foreground sm:px-5"
                    >
                      Belum ada dataset yang diunggah untuk Langkah 3.
                    </td>
                  </tr>
                ) : (
                  datasets.map((dataset) => (
                    <tr
                      key={dataset.id}
                      className="hover:bg-muted/10 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-foreground sm:px-5 sm:py-4">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-primary shrink-0" />
                          <span
                            className="truncate max-w-75"
                            title={dataset.name}
                          >
                            {dataset.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5 sm:py-4">
                        {dataset.uploadDate}
                      </td>
                      <td className="px-4 py-3 text-right sm:px-5 sm:py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-foreground border-border/20 hover:bg-background hover:text-primary"
                            onClick={() => onDownload(dataset)}
                            disabled={dataset.url === "#"}
                            title="Unduh"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8 bg-red-500 hover:bg-red-600 border-0"
                            onClick={() => onRequestDelete(dataset.id)}
                            title="Hapus"
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
