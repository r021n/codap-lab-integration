import { useState, useEffect } from "react";
import {
  deleteDataset,
  downloadDataset,
  getDatasets,
  uploadDataset,
  type Dataset,
} from "../../../../api/datasets.api";
import { getContent, updateContent } from "../../../../api/content.api";
import {
  getMySubmissions,
  getAllSubmissions,
  downloadSubmission,
  type Submission,
} from "../../../../api/investigasi.api";
import { getApiErrorMessage } from "../../../../api/errors";
import { showToast } from "../../../ui/toast";
import ConfirmDialog from "../../../ui/confirm-dialog";
import Step3Editor from "./Step3Editor";
import Step3Preview from "./Step3Preview";
import Step3Submission from "./Step3Submission";
import { type InvestigasiMode } from "../../StepHeader";
import type { User } from "../../../../api/auth.api";

interface Step3Props {
  mode: InvestigasiMode;
  user: User;
}

const STEP_ID = 3;
const INSTRUCTIONS_SLUG = "investigasi-step-3-instructions";

export default function Step3({ mode, user }: Step3Props) {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [instructions, setInstructions] = useState<string>("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const [isSubmissionsLoading, setIsSubmissionsLoading] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingInstructions, setIsSavingInstructions] = useState(false);

  // State untuk confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchDatasets();
    fetchInstructions();
    fetchSubmissions();
  }, [user.role]);

  const fetchDatasets = async () => {
    try {
      const data = await getDatasets(STEP_ID);
      setDatasets(data);
    } catch (err) {
      console.error("Gagal mengambil daftar dataset:", err);
    }
  };

  const fetchInstructions = async () => {
    try {
      const data = await getContent(INSTRUCTIONS_SLUG);
      setInstructions(data.content || "");
    } catch (err) {
      console.error("Gagal mengambil petunjuk:", err);
    }
  };

  const fetchSubmissions = async () => {
    setIsSubmissionsLoading(true);
    try {
      const data =
        user.role === "admin"
          ? await getAllSubmissions(STEP_ID)
          : await getMySubmissions(STEP_ID);
      setSubmissions(data);
    } catch (err) {
      console.error("Gagal mengambil submission:", err);
    } finally {
      setIsSubmissionsLoading(false);
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
      await uploadDataset(file, STEP_ID);
      showToast("File berhasil diunggah!", "success");
      setFile(null);
      fetchDatasets();
      // Reset file input
      const fileInput = document.getElementById(
        "step3-csv-upload",
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err) {
      console.error(err);
      showToast(getApiErrorMessage(err, "Gagal mengunggah file."), "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveInstructions = async (newContent: string) => {
    setIsSavingInstructions(true);
    try {
      await updateContent(INSTRUCTIONS_SLUG, newContent);
      setInstructions(newContent);
      showToast("Petunjuk berhasil diperbarui!", "success");
    } catch (err) {
      console.error(err);
      showToast(
        getApiErrorMessage(err, "Gagal memperbarui petunjuk."),
        "error",
      );
    } finally {
      setIsSavingInstructions(false);
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

  const handleDownloadSubmission = async (sub: Submission) => {
    try {
      const blob = await downloadSubmission(sub.storedName);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = sub.originalName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
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
      await deleteDataset(idToDelete);
      showToast("Dataset berhasil dihapus!", "success");
      fetchDatasets();
    } catch (err) {
      console.error(err);
      showToast(getApiErrorMessage(err, "Gagal menghapus dataset."), "error");
    }
  };

  return (
    <>
      <ConfirmDialog
        open={confirmOpen}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmOpen(false)}
        title="Hapus Dataset"
        description="Apakah Anda yakin ingin menghapus dataset ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
      />

      <div className="animate-in fade-in duration-500">
        {mode === "editor" && (
          <Step3Editor
            datasets={datasets}
            instructions={instructions}
            file={file}
            isUploading={isUploading}
            isSavingInstructions={isSavingInstructions}
            onFileChange={handleFileChange}
            onUpload={handleUpload}
            onSaveInstructions={handleSaveInstructions}
            onDownload={handleDownload}
            onRequestDelete={requestDelete}
          />
        )}
        <div
          className={
            mode === "preview"
              ? "block"
              : "invisible h-0 overflow-hidden pointer-events-none"
          }
          aria-hidden={mode !== "preview"}
        >
          <Step3Preview
            datasets={datasets}
            instructions={instructions}
            onDownload={handleDownload}
          />
        </div>
        {mode === "submission" && (
          <Step3Submission
            submissions={submissions}
            role={user.role}
            onRefresh={fetchSubmissions}
            onDownload={handleDownloadSubmission}
            isLoading={isSubmissionsLoading}
          />
        )}
      </div>
    </>
  );
}
