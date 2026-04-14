import { useState } from "react";
import {
  Upload,
  FileText,
  Download,
  CheckCircle2,
  History,
  Loader2,
  BookOpen,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import {
  type Submission,
  submitInvestigationFile,
} from "../../../../api/investigasi.api";
import { showToast } from "../../../ui/toast";
import { getApiErrorMessage } from "../../../../api/errors";

interface Step5SubmissionProps {
  submissions: Submission[];
  role: string;
  onRefresh: () => void;
  onDownload: (submission: Submission) => void;
  isLoading: boolean;
}

const STEP_ID = 5;
const MAX_FILE_SIZE = 100 * 1024; // 100KB

export default function Step5Submission({
  submissions,
  role,
  onRefresh,
  onDownload,
  isLoading,
}: Step5SubmissionProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > MAX_FILE_SIZE) {
        showToast("Ukuran file maksimal adalah 100KB.", "error");
        e.target.value = "";
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    try {
      await submitInvestigationFile(file, STEP_ID);
      showToast("Laporan investigasi berhasil dikumpulkan!", "success");
      setFile(null);
      onRefresh();
      // Reset input
      const fileInput = document.getElementById(
        "step5-file-upload",
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err) {
      showToast(getApiErrorMessage(err, "Gagal mengunggah laporan."), "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* SECTION: SISWA UPLOAD */}
      {role !== "admin" && (
        <Card className="border border-rose-500/20 bg-rose-500/5 shadow-sm rounded-3xl overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-serif text-2xl font-bold text-foreground flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
                    <Upload className="h-6 w-6" />
                  </div>
                  Submit Laporan Akhir
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-1 ml-11">
                  Kumpulkan draf atau versi final laporan investigasi kamu (Maks 100KB).
                </CardDescription>
              </div>
              {submissions.length > 0 && (
                <div className="flex items-center gap-2 bg-rose-100 text-rose-700 px-4 py-2 rounded-full text-sm font-semibold border border-rose-200 shadow-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  Selesai Dikirim ({submissions.length})
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <form
              onSubmit={handleUpload}
              className="flex flex-col sm:flex-row items-end gap-4 p-4 rounded-2xl bg-background/50 border border-border/10"
            >
              <div className="flex-1 w-full space-y-2">
                <label
                  htmlFor="step5-file-upload"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1"
                >
                  Pilih File Laporan
                </label>
                <Input
                  id="step5-file-upload"
                  type="file"
                  onChange={handleFileChange}
                  className="bg-background border-border/20 focus:ring-rose-500 h-11 rounded-xl cursor-pointer"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isUploading || !file}
                className="h-11 px-8 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg shadow-rose-500/20"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  "Kumpulkan Laporan"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* SECTION: HISTORY / ADMIN DASHBOARD */}
      <Card className="border border-border/20 bg-background/50 backdrop-blur-sm shadow-xl rounded-3xl overflow-hidden">
        <CardHeader className="border-b border-border/10 bg-muted/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-serif text-xl font-bold text-foreground flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl ${role === "admin" ? "bg-rose-500/10 text-rose-600" : "bg-purple-500/10 text-purple-600"}`}
                >
                  <History className="h-5 w-5" />
                </div>
                {role === "admin"
                  ? "Daftar Laporan Akhir Siswa"
                  : "Riwayat Laporan Kamu"}
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1 ml-11">
                {role === "admin"
                  ? "Pantau seluruh laporan akhir yang telah dikirimkan oleh siswa (Langkah 5)."
                  : "Daftar berkas laporan yang telah kamu kirimkan ke sistem."}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="rounded-full hover:bg-muted"
            >
              <Loader2
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b border-border/10">
                <tr>
                  {role === "admin" && (
                    <th className="px-6 py-4 font-bold text-foreground uppercase tracking-tight">
                      Siswa
                    </th>
                  )}
                  <th className="px-6 py-4 font-bold text-foreground uppercase tracking-tight">
                    Nama File
                  </th>
                  <th className="px-6 py-4 font-bold text-foreground uppercase tracking-tight">
                    Tanggal
                  </th>
                  <th className="px-6 py-4 font-bold text-foreground uppercase tracking-tight text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/5">
                {submissions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={role === "admin" ? 4 : 3}
                      className="px-6 py-16 text-center text-muted-foreground h-[200px]"
                    >
                      <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
                        <BookOpen className="h-12 w-12" />
                        <p className="font-medium">Belum ada laporan.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => (
                    <tr
                      key={sub.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {role === "admin" && (
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground">
                              {sub.userName}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {sub.userEmail}
                            </span>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 font-medium text-foreground">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-rose-500" />
                          <span
                            className="truncate max-w-[200px]"
                            title={sub.originalName}
                          >
                            {sub.originalName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(sub.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDownload(sub)}
                          className="rounded-xl border-border/20 hover:bg-rose-600 hover:text-white transition-all"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
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
