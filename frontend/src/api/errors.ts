import axios from "axios";

type ApiErrorResponse = {
  error?: string;
  message?: string;
};

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as ApiErrorResponse | undefined;
    return payload?.error || payload?.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
