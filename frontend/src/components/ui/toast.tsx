/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState } from "react";
import { X, CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";

type ToastVariant = "success" | "error" | "warning" | "info";

type ToastData = {
  id: number;
  message: string;
  variant: ToastVariant;
};

let toastId = 0;
let addToastCallback: ((toast: ToastData) => void) | null = null;

/**
 * Fungsi global untuk menampilkan toast notification.
 *
 *   showToast("Berhasil!", "success");
 *   showToast("Gagal mengunggah", "error");
 */
export function showToast(message: string, variant: ToastVariant = "info") {
  toastId += 1;
  addToastCallback?.({ id: toastId, message, variant });
}

const variantConfig: Record<
  ToastVariant,
  { bg: string; border: string; icon: React.ReactNode; text: string }
> = {
  success: {
    bg: "bg-primary/10",
    border: "border-primary/30",
    icon: <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />,
    text: "text-foreground",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-300/40",
    icon: <XCircle className="h-5 w-5 text-red-500 shrink-0" />,
    text: "text-foreground",
  },
  warning: {
    bg: "bg-secondary/10",
    border: "border-secondary/30",
    icon: <AlertTriangle className="h-5 w-5 text-secondary shrink-0" />,
    text: "text-foreground",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-300/40",
    icon: <Info className="h-5 w-5 text-blue-500 shrink-0" />,
    text: "text-foreground",
  },
};

const TOAST_DURATION = 4000;

/**
 * Komponen container yang harus di-render sekali di root layout / App.
 * Cukup letakkan <ToastContainer /> di component tree.
 */
export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    addToastCallback = (toast) => {
      setToasts((prev) => [...prev, toast]);
    };
    return () => {
      addToastCallback = null;
    };
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed inset-x-3 top-3 sm:inset-x-auto sm:top-4 sm:right-4 z-9999 flex flex-col gap-3 max-w-sm w-auto sm:w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: ToastData;
  onRemove: () => void;
}) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, TOAST_DURATION);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isExiting) {
      const timer = setTimeout(onRemove, 300);
      return () => clearTimeout(timer);
    }
  }, [isExiting, onRemove]);

  const config = variantConfig[toast.variant];

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg border ${config.bg} ${config.border} shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] backdrop-blur-sm transition-all duration-300 ${
        isExiting
          ? "opacity-0 translate-x-4"
          : "opacity-100 translate-x-0 animate-slide-in-right"
      }`}
      role="alert"
    >
      {config.icon}
      <p
        className={`text-sm font-medium ${config.text} flex-1 leading-relaxed`}
      >
        {toast.message}
      </p>
      <button
        onClick={() => setIsExiting(true)}
        className="text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-0.5"
        aria-label="Tutup"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
