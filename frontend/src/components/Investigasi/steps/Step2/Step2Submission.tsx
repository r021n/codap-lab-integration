import { useState } from "react";
import {
  Upload,
  FileText,
  Download,
  CheckCircle2,
  History,
  Loader2,
  FileSpreadsheet,
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

interface Step2SubmissionProps {
  submissions: Submission[];
  role: string;
  onRefresh: () => void;
  onDownload: (submission: Submission) => void;
  isLoading: boolean;
}

export default function Step2Submission({
  submissions,
  role,
  onRefresh,
  onDownload,
  isLoading,
}: Step2SubmissionProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      const validExtensions = [".csv", ".xlsx", ".xls"];
      const ext = selectedFile.name
        .toLowerCase()
        .substring(selectedFile.name.lastIndexOf("."));

      if (!validExtensions.includes(ext)) {
        showToast("Hanya file CSV atau Excel yang diperbolehkan.", "error");
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
      await submitInvestigationFile(file, 2);
      showToast("Data berhasil dikumpulkan!", "success");
      setFile(null);
      onRefresh();
      // Reset input
      const fileInput = document.getElementById(
        "file-upload",
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err) {
      showToast(getApiErrorMessage(err, "Gagal mengunggah data."), "error");
    } finally {
      setIsUploading(false);
    }
  };

  const isExcel = (filename: string) => {
    return (
      filename.toLowerCase().endsWith(".xlsx") ||
      filename.toLowerCase().endsWith(".xls")
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* SECTION: SISWA UPLOAD */}
      {role !== "admin" && (
        <Card className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/5 shadow-sm sm:rounded-3xl">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle className="font-serif text-xl font-bold text-foreground sm:text-2xl flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-600">
                    <Upload className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  Kumpulkan Hasil Penyelidikan
                </CardTitle>
                <CardDescription className="ml-0 mt-1 text-sm text-muted-foreground sm:ml-11">
                  Unggah file dataset (CSV atau Excel) yang telah kamu temukan.
                  Kamu dapat mengunggah lebih dari satu kali jika ada pembaruan
                  data.
                </CardDescription>
              </div>
              {submissions.length > 0 && (
                <div className="animate-in zoom-in flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm sm:px-4 sm:py-2 sm:text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  Terkumpul ({submissions.length})
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-1 sm:pt-2">
            <form
              onSubmit={handleUpload}
              className="flex flex-col items-stretch gap-3 rounded-2xl border border-border/10 bg-background/50 p-3 sm:items-end sm:gap-4 sm:p-4"
            >
              <div className="flex-1 w-full space-y-2">
                <label
                  htmlFor="file-upload"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1"
                >
                  Pilih File (CSV, XLSX, XLS)
                </label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  onChange={handleFileChange}
                  className="bg-background border-border/20 focus:ring-emerald-500 h-11 rounded-xl cursor-pointer"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isUploading || !file}
                className="h-11 w-full rounded-xl bg-emerald-600 px-6 font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] hover:bg-emerald-700 active:scale-95 disabled:opacity-50 sm:w-auto sm:px-8 sm:hover:scale-105"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengunggah...
                  </>
                ) : (
                  "Kumpulkan Data"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* SECTION: HISTORY / ADMIN DASHBOARD */}
      <Card className="overflow-hidden rounded-2xl border border-border/20 bg-background/50 shadow-xl backdrop-blur-sm sm:rounded-3xl">
        <CardHeader className="border-b border-border/10 bg-muted/20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="font-serif text-lg font-bold text-foreground sm:text-xl flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl ${role === "admin" ? "bg-blue-500/10 text-blue-600" : "bg-purple-500/10 text-purple-600"}`}
                >
                  <History className="h-5 w-5" />
                </div>
                {role === "admin"
                  ? "Daftar Pengumpulan Siswa"
                  : "Riwayat Pengumpulan Kamu"}
              </CardTitle>
              <CardDescription className="ml-0 mt-1 text-sm text-muted-foreground sm:ml-11">
                {role === "admin"
                  ? "Pantau dan unduh data yang telah dikirimkan oleh seluruh siswa."
                  : "Daftar data yang telah berhasil kamu kirimkan ke sistem."}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="w-fit rounded-full hover:bg-muted"
            >
              <Loader2
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Segarkan
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-190 text-sm text-left">
              <thead className="bg-muted/50 border-b border-border/10">
                <tr>
                  {role === "admin" && (
                    <th className="px-4 py-3 font-bold text-foreground uppercase tracking-tight sm:px-6 sm:py-4">
                      Siswa
                    </th>
                  )}
                  <th className="px-4 py-3 font-bold text-foreground uppercase tracking-tight sm:px-6 sm:py-4">
                    Nama File
                  </th>
                  <th className="px-4 py-3 font-bold text-foreground uppercase tracking-tight sm:px-6 sm:py-4">
                    Format
                  </th>
                  <th className="px-4 py-3 font-bold text-foreground uppercase tracking-tight sm:px-6 sm:py-4">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 text-right font-bold text-foreground uppercase tracking-tight sm:px-6 sm:py-4">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/5">
                {submissions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={role === "admin" ? 5 : 4}
                      className="h-45 px-4 py-10 text-center text-muted-foreground sm:h-50 sm:px-6 sm:py-16"
                    >
                      <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
                        <FileText className="h-12 w-12" />
                        <p className="font-medium">
                          Belum ada data yang dikumpulkan.
                        </p>
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
                        <td className="px-4 py-3 sm:px-6 sm:py-4">
                          <div className="flex flex-col">
                            <span className="max-w-35 truncate font-bold text-foreground sm:max-w-45">
                              {sub.userName}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {sub.userEmail}
                            </span>
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-3 font-medium text-foreground sm:px-6 sm:py-4">
                        <div className="flex items-center gap-3">
                          {isExcel(sub.originalName) ? (
                            <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <FileText className="h-5 w-5 text-blue-500" />
                          )}
                          <span
                            className="max-w-45 truncate sm:max-w-55"
                            title={sub.originalName}
                          >
                            {sub.originalName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4">
                        <span
                          className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                            isExcel(sub.originalName)
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {sub.originalName.split(".").pop()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-6 sm:py-4">
                        {new Date(sub.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3 text-right sm:px-6 sm:py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDownload(sub)}
                          className="whitespace-nowrap rounded-xl border-border/20 transition-all hover:bg-primary hover:text-white group-hover:shadow-md"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Unduh
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
