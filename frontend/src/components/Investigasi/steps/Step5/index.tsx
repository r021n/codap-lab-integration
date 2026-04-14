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
import Step5Editor from "./Step5Editor";
import Step5Preview from "./Step5Preview";
import Step5Submission from "./Step5Submission";
import { type InvestigasiMode } from "../../StepHeader";
import type { User } from "../../../../api/auth.api";

interface Step5Props {
  mode: InvestigasiMode;
  user: User;
}

const STEP_ID = 5;
const INSTRUCTIONS_SLUG = "investigasi-step-5-instructions";

export default function Step5({ mode, user }: Step5Props) {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [instructions, setInstructions] = useState<string>("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const [isFilesLoading, setIsFilesLoading] = useState(true);
  const [isInstructionsLoading, setIsInstructionsLoading] = useState(true);
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
    setIsFilesLoading(true);
    try {
      const data = await getDatasets(STEP_ID);
      setDatasets(data);
    } catch (err) {
      console.error("Gagal mengambil daftar dataset:", err);
    } finally {
      setIsFilesLoading(false);
    }
  };

  const fetchInstructions = async () => {
    setIsInstructionsLoading(true);
    try {
      const data = await getContent(INSTRUCTIONS_SLUG);
      setInstructions(data.content || "");
    } catch (err) {
      console.error("Gagal mengambil petunjuk:", err);
    } finally {
      setIsInstructionsLoading(false);
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
        "step5-csv-upload",
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
          <Step5Editor
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
        {mode === "preview" && (
          <Step5Preview
            datasets={datasets}
            instructions={instructions}
            onDownload={handleDownload}
          />
        )}
        {mode === "submission" && (
          <Step5Submission
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
