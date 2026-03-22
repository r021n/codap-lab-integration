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
import { Upload, Download, FileText, Info } from "lucide-react";

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
        alert("File berhasil diunggah!");
        setFile(null);
        fetchDatasets();
        // Reset file input
        const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        alert("Gagal mengunggah file. Pastikan server berjalan dan endpoint sesuai.");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal mengunggah file. Terjadi kesalahan jaringan.");
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
      // Fallback in case of parsing error or anything else
      alert("Gagal mengunduh file.");
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Ruang Investigasi Data</h1>
        <p className="text-slate-600">Pelajari dan analisis data lingkungan dengan interaktif menggunakan CODAP.</p>
      </header>

      {user.role === "admin" && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Unggah Dataset Baru (Admin)
            </CardTitle>
            <CardDescription className="text-blue-700">
              Unggah file CSV baru agar dapat digunakan oleh siswa untuk investigasi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="flex items-center gap-4">
              <Input 
                id="csv-upload"
                type="file" 
                accept=".csv" 
                onChange={handleFileChange}
                className="bg-white"
                required
              />
              <Button type="submit" disabled={isUploading || !file} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
                {isUploading ? "Mengunggah..." : "Unggah CSV"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar Kiri: Daftar Data dan Petunjuk */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Dataset Tersedia</CardTitle>
              <CardDescription>Pilih dan unduh data untuk dianalisis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {datasets.length === 0 ? (
                  <p className="text-sm text-slate-500">Belum ada dataset yang diunggah.</p>
                ) : (
                  datasets.map((dataset) => (
                    <div key={dataset.id} className="rounded-md border p-3 flex flex-col gap-2 bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-slate-700 break-all">
                          {dataset.name}
                        </span>
                      </div>
                      <Button size="sm" variant="outline" className="w-full h-8 text-xs" onClick={() => handleDownload(dataset)} disabled={dataset.url === "#"}>
                        <Download className="h-3 w-3 mr-2" />
                        Unduh CSV
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 border-amber-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-amber-900 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Petunjuk CODAP
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-amber-800 space-y-3">
              <ol className="list-decimal pl-4 space-y-1">
                <li><strong>Unduh</strong> data CSV dari menu di atas.</li>
                <li><strong>Tarik (Drag)</strong> file CSV yang sudah diunduh dari folder komputermu, lalu <strong>Lepaskan (Drop)</strong> ke dalam area CODAP di sebelah kanan.</li>
                <li>Buat <strong>Grafik (Graph)</strong> menggunakan menu di pojok kiri atas CODAP.</li>
                <li>Tarik nama kolom data (misal: "Suhu" atau "Tahun") dari tabel ke sumbu X atau Y pada grafik untuk menganalisis hubungan.</li>
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Area CODAP Utama */}
        <Card className="lg:col-span-3 flex flex-col h-[700px] border-slate-300">
          <CardHeader className="border-b bg-slate-50 py-3">
            <CardTitle className="text-lg">Ruang Analisis Workspace</CardTitle>
          </CardHeader>
          <div className="flex-1 bg-white relative">
            <iframe 
              src="https://codap.concord.org/releases/latest/static/dg/en/cert/index.html" 
              className="absolute inset-0 w-full h-full border-0"
              title="CODAP Workspace"
              allowFullScreen
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
