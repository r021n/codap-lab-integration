import { useState, useEffect } from "react";
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
import { Upload, Download, FileText, Info, Trash2, Eye, Edit } from "lucide-react";

type User = {
  name: string;
  email: string;
  role: string;
};

type Dataset = {
  id: string;
  name: string;
  url: string;
  uploadDate: string;
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
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/datasets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setDatasets(data);
      }
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
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/datasets/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        showToast("File berhasil diunggah!", "success");
        setFile(null);
        fetchDatasets();
        // Reset file input
        const fileInput = document.getElementById(
          "csv-upload",
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        showToast(
          "Gagal mengunggah file. Pastikan server berjalan dan endpoint sesuai.",
          "error",
        );
      }
    } catch (err) {
      console.error(err);
      showToast(
        "Gagal mengunggah file. Terjadi kesalahan jaringan.",
        "error",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (dataset: Dataset) => {
    if (dataset.url === "#") return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(dataset.url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Gagal mengunduh dataset");
      }

      const blob = await res.blob();
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
      showToast("Gagal mengunduh file.", "error");
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
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/datasets/${idToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.ok) {
        showToast("Dataset berhasil dihapus!", "success");
        fetchDatasets();
      } else {
        showToast("Gagal menghapus dataset.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast(
        "Terjadi kesalahan jaringan saat menghapus dataset.",
        "error",
      );
    }
  };

  const handleDeleteCancelled = () => {
    setConfirmOpen(false);
    setPendingDeleteId(null);
  };

  const activeMode = user.role === "admin" ? mode : "preview";

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12 font-sans text-[#0F172A]">
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
          <h1 className="font-serif text-3xl font-bold text-[#0F172A]">
            Ruang Investigasi Data
          </h1>
          <p className="text-[#94A3B8] mt-2 text-lg">
            Pelajari dan analisis data lingkungan dengan interaktif menggunakan
            CODAP.
          </p>
        </div>

        {user.role === "admin" && (
          <div className="flex bg-[#FDFBF0] p-1 rounded-lg border border-[#94A3B8]/20 shrink-0">
            <button
              onClick={() => setMode("editor")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === "editor" ? "bg-[#FFFFFF] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] text-[#F97316]" : "text-[#94A3B8] hover:text-[#0F172A]"}`}
            >
              <Edit className="w-4 h-4" /> Editor
            </button>
            <button
              onClick={() => setMode("preview")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === "preview" ? "bg-[#FFFFFF] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] text-[#F97316]" : "text-[#94A3B8] hover:text-[#0F172A]"}`}
            >
              <Eye className="w-4 h-4" /> Preview
            </button>
          </div>
        )}
      </header>

      {activeMode === "editor" ? (
        <div className="space-y-6">
          <Card className="border border-[#F97316]/20 bg-[#F97316]/5 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-lg">
            <CardHeader>
              <CardTitle className="font-serif text-xl font-bold text-[#0F172A] flex items-center gap-2">
                <Upload className="h-5 w-5 text-[#F97316]" />
                Unggah Dataset Baru (Admin)
              </CardTitle>
              <CardDescription className="text-[#F97316]">
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
                  className="bg-[#FFFFFF] max-w-md border-gray-300 focus:border-[#F97316] focus:ring-[#F97316] focus-visible:ring-[#F97316]"
                  required
                />
                <Button
                  type="submit"
                  disabled={isUploading || !file}
                  className="rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-[#FFFFFF] min-w-[120px]"
                >
                  {isUploading ? "Mengunggah..." : "Unggah CSV"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border border-[#94A3B8]/20 bg-[#FFFFFF] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-lg">
            <CardHeader className="border-b border-[#94A3B8]/10 bg-[#FFFFFF]/50">
              <CardTitle className="font-serif text-xl font-bold text-[#0F172A]">
                Kelola Dataset
              </CardTitle>
              <CardDescription className="text-[#94A3B8]">
                Daftar dataset referensi CSV yang tersedia di sistem.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="rounded-lg border border-[#94A3B8]/20 overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#FDFBF0] border-b border-[#94A3B8]/20">
                    <tr>
                      <th className="px-5 py-4 font-semibold text-[#0F172A]">
                        Nama File
                      </th>
                      <th className="px-5 py-4 font-semibold text-[#0F172A] w-48">
                        Tanggal Unggah
                      </th>
                      <th className="px-5 py-4 font-semibold text-[#0F172A] text-right w-32">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#94A3B8]/10">
                    {datasets.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-5 py-8 text-center text-[#94A3B8]"
                        >
                          Belum ada dataset yang diunggah.
                        </td>
                      </tr>
                    ) : (
                      datasets.map((dataset) => (
                        <tr
                          key={dataset.id}
                          className="hover:bg-[#FDFBF0]/50 transition-colors"
                        >
                          <td className="px-5 py-4 font-medium text-[#0F172A]">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-[#F97316] shrink-0" />
                              <span
                                className="truncate max-w-[300px]"
                                title={dataset.name}
                              >
                                {dataset.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-[#94A3B8]">
                            {dataset.uploadDate}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 text-[#0F172A] border-[#94A3B8]/20 hover:bg-[#FDFBF0] hover:text-[#F97316]"
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
            <Card className="border border-[#94A3B8]/20 bg-[#FFFFFF] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-lg">
              <CardHeader className="pb-4">
                <CardTitle className="font-serif text-lg font-bold text-[#0F172A]">
                  Dataset Tersedia
                </CardTitle>
                <CardDescription className="text-[#94A3B8]">
                  Pilih dan unduh data untuk dianalisis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {datasets.length === 0 ? (
                    <p className="text-sm text-[#94A3B8]">
                      Belum ada dataset yang diunggah.
                    </p>
                  ) : (
                    datasets.map((dataset) => (
                      <div
                        key={dataset.id}
                        className="rounded-lg border border-[#94A3B8]/20 p-4 flex flex-col gap-3 bg-[#FDFBF0] hover:bg-[#10B981]/5 hover:border-[#10B981]/20 transition-all shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 text-[#10B981] shrink-0 mt-0.5" />
                          <span className="text-sm font-semibold text-[#0F172A] break-all leading-tight">
                            {dataset.name}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full h-9 text-xs border-[#0F172A] text-[#0F172A] hover:bg-[#0F172A]/5 hover:text-[#0F172A]"
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

            <Card className="border border-[#F59E0B]/20 bg-[#F59E0B]/5 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-lg">
              <CardHeader className="pb-4">
                <CardTitle className="font-serif text-lg font-bold text-[#F59E0B] flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Petunjuk CODAP
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-[#0F172A] space-y-4">
                <ol className="list-decimal pl-5 space-y-2 leading-relaxed marker:text-[#F59E0B] marker:font-bold">
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

          <Card className="lg:col-span-3 flex flex-col h-[740px] border border-[#94A3B8]/20 bg-[#FFFFFF] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-lg overflow-hidden">
            <CardHeader className="border-b border-[#94A3B8]/10 bg-[#FDFBF0] py-4">
              <CardTitle className="font-serif text-lg font-bold text-[#0F172A]">
                Ruang Analisis Workspace
              </CardTitle>
            </CardHeader>
            <div className="flex-1 bg-[#FFFFFF] relative">
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
