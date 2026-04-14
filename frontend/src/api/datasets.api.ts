import { apiClient } from "./client";

export type Dataset = {
  id: string;
  name: string;
  url: string;
  uploadDate: string;
};

export async function getDatasets(stepId: number = 1): Promise<Dataset[]> {
  const { data } = await apiClient.get<Dataset[]>("/datasets", {
    params: { stepId },
  });
  return data;
}

export async function uploadDataset(file: File, stepId: number = 1): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("stepId", stepId.toString());
  await apiClient.post("/datasets/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export async function deleteDataset(datasetId: string): Promise<void> {
  await apiClient.delete(`/datasets/${datasetId}`);
}

export async function downloadDataset(url: string): Promise<Blob> {
  const { data } = await apiClient.get<Blob>(url, {
    responseType: "blob",
  });
  return data;
}
