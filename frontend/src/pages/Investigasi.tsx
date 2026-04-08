import { useState, useEffect } from "react";
import {
  deleteDataset,
  downloadDataset,
  getDatasets,
  uploadDataset,
  type Dataset,
} from "../api/datasets.api";
import { getApiErrorMessage } from "../api/errors";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { showToast, ToastContainer } from "../components/ui/toast";
import ConfirmDialog from "../components/ui/confirm-dialog";
import {
  Upload,
  Download,
  FileText,
  Info,
  Trash2,
  Eye,
  Edit,
} from "lucide-react";

type User = {
  name: string;
  email: string;
  role: string;
};

export default function Investigasi({ user }: { user: User }) {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [mode, setMode] = useState<"editor" | "preview">("editor");

  // State untuk confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const data = await getDatasets();
      setDatasets(data);
    } catch (err) {
      console.error("Gagal mengambil daftar dataset:", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);

    try {
      await uploadDataset(file);
      showToast("File berhasil diunggah!", "success");
      setFile(null);
      fetchDatasets();
      // Reset file input
      const fileInput = document.getElementById(
        "csv-upload",
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err) {
      console.error(err);
      showToast(getApiErrorMessage(err, "Gagal mengunggah file."), "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (dataset: Dataset) => {
    if (dataset.url === "#") return;

    try {
      const blob = await downloadDataset(dataset.url);
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = dataset.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Download error:", err);
      showToast(getApiErrorMessage(err, "Gagal mengunduh file."), "error");
    }
  };

  const requestDelete = (id: string) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!pendingDeleteId) return;

    setConfirmOpen(false);
    const idToDelete = pendingDeleteId;
    setPendingDeleteId(null);

    try {
      await deleteDataset(idToDelete);
      showToast("Dataset berhasil dihapus!", "success");
      fetchDatasets();
    } catch (err) {
      console.error(err);
      showToast(getApiErrorMessage(err, "Gagal menghapus dataset."), "error");
    }
  };

  const handleDeleteCancelled = () => {
    setConfirmOpen(false);
    setPendingDeleteId(null);
  };

  const activeMode = user.role === "admin" ? mode : "preview";

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12 font-sans text-foreground">
      <ToastContainer />
      <ConfirmDialog
        open={confirmOpen}
        onConfirm={handleDeleteConfirmed}
        onCancel={handleDeleteCancelled}
        title="Hapus Dataset"
        description="Apakah Anda yakin ingin menghapus dataset ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
      />

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Ruang Investigasi Data
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Pelajari dan analisis data lingkungan dengan interaktif menggunakan
            CODAP.
          </p>
        </div>

        {user.role === "admin" && (
          <div className="flex bg-background p-1 rounded-lg border border-border/20 shrink-0">
            <button
              onClick={() => setMode("editor")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === "editor" ? "bg-background shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Edit className="w-4 h-4" /> Editor
            </button>
            <button
              onClick={() => setMode("preview")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === "preview" ? "bg-background shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Eye className="w-4 h-4" /> Preview
            </button>
          </div>
        )}
      </header>

      {activeMode === "editor" ? (
        <div className="space-y-6">
          <Card className="border border-primary/20 bg-primary/5 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-lg">
            <CardHeader>
              <CardTitle className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Unggah Dataset Baru (Admin)
              </CardTitle>
              <CardDescription className="text-primary">
                Unggah file CSV baru agar dapat digunakan oleh siswa untuk
                investigasi.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleUpload}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
              >
                <Input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="bg-background max-w-md border-gray-300 focus:border-primary focus:ring-primary focus-visible:ring-primary"
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

          <Card className="border border-border/20 bg-background shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-lg">
            <CardHeader className="border-b border-border/10 bg-background/50">
              <CardTitle className="font-serif text-xl font-bold text-foreground">
                Kelola Dataset
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Daftar dataset referensi CSV yang tersedia di sistem.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="rounded-lg border border-border/20 overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-background border-b border-border/20">
                    <tr>
                      <th className="px-5 py-4 font-semibold text-foreground">
                        Nama File
                      </th>
                      <th className="px-5 py-4 font-semibold text-foreground w-48">
                        Tanggal Unggah
                      </th>
                      <th className="px-5 py-4 font-semibold text-foreground text-right w-32">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/10">
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
                          className="hover:bg-background/50 transition-colors"
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
                                onClick={() => handleDownload(dataset)}
                                disabled={dataset.url === "#"}
                                title="Unduh CSV"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8 bg-red-500 hover:bg-red-600 focus:ring-red-500"
                                onClick={() => requestDelete(dataset.id)}
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
      ) : (
        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-1 space-y-8">
            <Card className="border border-border/20 bg-background shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-lg">
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
                        className="rounded-lg border border-border/20 p-4 flex flex-col gap-3 bg-background hover:bg-primary/5 hover:border-primary/20 transition-all shadow-sm"
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
                          className="w-full h-9 text-xs border-foreground text-foreground hover:bg-foreground/5 hover:text-foreground"
                          onClick={() => handleDownload(dataset)}
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

            <Card className="border border-warning/20 bg-warning/5 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-lg">
              <CardHeader className="pb-4">
                <CardTitle className="font-serif text-lg font-bold text-warning flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Petunjuk CODAP
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-foreground space-y-4">
                <ol className="list-decimal pl-5 space-y-2 leading-relaxed marker:text-warning marker:font-bold">
                  <li>
                    <strong>Unduh</strong> data CSV dari menu di atas.
                  </li>
                  <li>
                    <strong>Tarik (Drag)</strong> file CSV yang sudah diunduh
                    dari folder komputermu, lalu{" "}
                    <strong>Lepaskan (Drop)</strong> ke dalam area CODAP di
                    sebelah kanan.
                  </li>
                  <li>
                    Buat <strong>Grafik (Graph)</strong> menggunakan menu di
                    pojok kiri atas CODAP.
                  </li>
                  <li>
                    Tarik nama kolom data (misal: &quot;Suhu&quot; atau
                    &quot;Tahun&quot;) dari tabel ke sumbu X atau Y pada grafik
                    untuk menganalisis hubungan.
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>

          <Card className="lg:col-span-3 flex flex-col h-[740px] border border-border/20 bg-background shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-lg overflow-hidden">
            <CardHeader className="border-b border-border/10 bg-background py-4">
              <CardTitle className="font-serif text-lg font-bold text-foreground">
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
      )}
    </div>
  );
}
