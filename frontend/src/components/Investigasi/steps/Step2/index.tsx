import { useState, useEffect, useCallback } from "react";
import { type InvestigasiMode } from "../../StepHeader";
import Step2Chat from "./Step2Chat";
import Step2Submission from "./Step2Submission";
import {
  getChatHistory,
  getMySubmissions,
  getAllSubmissions,
  type ChatMessage,
  type Submission,
  downloadSubmission,
} from "../../../../api/investigasi.api";
import { showToast } from "../../../ui/toast";
import { getApiErrorMessage } from "../../../../api/errors";

interface Step2Props {
  mode: InvestigasiMode;
  user: {
    id: number;
    name: string;
    role: string;
  };
}

export default function Step2({ mode, user }: Step2Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const history = await getChatHistory(2);
      setMessages(history);
    } catch (err) {
      console.error("Gagal mengambil riwayat chat:", err);
    }
  }, []);

  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data =
        user.role === "admin"
          ? await getAllSubmissions(2)
          : await getMySubmissions(2);
      setSubmissions(data);
    } catch (err) {
      console.error("Gagal mengambil submission:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user.role]);

  useEffect(() => {
    if (mode === "preview") {
      void fetchHistory();
    } else if (mode === "submission" || mode === "editor") {
      void fetchSubmissions();
    }
  }, [mode, fetchHistory, fetchSubmissions]);

  const handleDownload = async (submission: Submission) => {
    try {
      const blob = await downloadSubmission(submission.storedName);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = submission.originalName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showToast(getApiErrorMessage(err, "Gagal mengunduh file."), "error");
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {mode === "preview" && (
        <Step2Chat messages={messages} setMessages={setMessages} user={user} />
      )}

      {(mode === "submission" || mode === "editor") && (
        <Step2Submission
          submissions={submissions}
          role={user.role}
          onRefresh={fetchSubmissions}
          onDownload={handleDownload}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
