import { apiClient } from "./client";

export type ChatMessage = {
  id: number;
  role: "user" | "model";
  content: string;
  createdAt: string;
};

export type Submission = {
  id: number;
  userId: number;
  stepId: number;
  originalName: string;
  storedName: string;
  createdAt: string;
  userName?: string; // Untuk admin view
  userEmail?: string; // Untuk admin view
};

export async function sendMessage(message: string, stepId: number = 2): Promise<ChatMessage> {
  const { data } = await apiClient.post<ChatMessage>("/investigasi/chat", { message, stepId });
  return data;
}

export async function getChatHistory(stepId: number = 2): Promise<ChatMessage[]> {
  const { data } = await apiClient.get<ChatMessage[]>(`/investigasi/chat/${stepId}`);
  return data;
}

export async function submitInvestigationFile(file: File, stepId: number = 2): Promise<Submission> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("stepId", stepId.toString());

  const { data } = await apiClient.post<Submission>("/investigasi/submit", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
}

export async function getMySubmissions(stepId: number = 2): Promise<Submission[]> {
  const { data } = await apiClient.get<Submission[]>(`/investigasi/submissions/${stepId}`);
  return data;
}

export async function getAllSubmissions(stepId: number = 2): Promise<Submission[]> {
  const { data } = await apiClient.get<Submission[]>(`/investigasi/admin/submissions/${stepId}`);
  return data;
}

export async function downloadSubmission(storedName: string): Promise<Blob> {
  const { data } = await apiClient.get(`/investigasi/download/${storedName}`, {
    responseType: "blob",
  });
  return data;
}
