import { useState, useEffect } from "react";
import {
  deleteDataset,
  downloadDataset,
  getDatasets,
  uploadDataset,
  type Dataset,
} from "../../../../api/datasets.api";
import { getApiErrorMessage } from "../../../../api/errors";
import { showToast } from "../../../ui/toast";
import ConfirmDialog from "../../../ui/confirm-dialog";
import Step1Editor from "./Step1Editor";
import Step1Preview from "./Step1Preview";
import Step1Submission from "./Step1Submission";
import { type InvestigasiMode } from "../../StepHeader";

interface Step1Props {
  mode: InvestigasiMode;
}

export default function Step1({ mode }: Step1Props) {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  return (
    <>
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

      <div className="animate-in fade-in duration-500">
        {mode === "editor" && (
          <Step1Editor
            datasets={datasets}
            file={file}
            isUploading={isUploading}
            onFileChange={handleFileChange}
            onUpload={handleUpload}
            onDownload={handleDownload}
            onRequestDelete={requestDelete}
          />
        )}
        {mode === "preview" && (
          <Step1Preview datasets={datasets} onDownload={handleDownload} />
        )}
        {mode === "submission" && <Step1Submission />}
      </div>
    </>
  );
}
