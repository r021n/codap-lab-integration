import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";

type ConfirmDialogProps = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "default";
  icon?: ReactNode;
};

const variantStyles = {
  danger: {
    iconBg: "bg-red-100",
    iconWrap: <AlertTriangle className="h-6 w-6 text-red-500" />,
    confirmBtn:
      "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500/30",
  },
  warning: {
    iconBg: "bg-secondary/10",
    iconWrap: <AlertTriangle className="h-6 w-6 text-secondary" />,
    confirmBtn:
      "bg-secondary hover:bg-secondary/90 text-white focus:ring-secondary/30",
  },
  default: {
    iconBg: "bg-primary/10",
    iconWrap: <AlertTriangle className="h-6 w-6 text-primary" />,
    confirmBtn:
      "bg-primary hover:bg-primary/90 text-white focus:ring-primary/30",
  },
};

export default function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title = "Konfirmasi",
  description = "Apakah Anda yakin ingin melanjutkan?",
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  variant = "default",
  icon,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  // Fokus ke tombol konfirmasi saat dialog terbuka
  useEffect(() => {
    if (open) {
      setTimeout(() => confirmRef.current?.focus(), 100);
    }
  }, [open]);

  // Tutup dengan Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  const styles = variantStyles[variant];

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-background rounded-xl shadow-[0px_20px_60px_-12px_rgba(0,0,0,0.25)] border border-border/20 max-w-md w-full mx-4 p-6 animate-scale-in">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Tutup"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center gap-4">
          {/* Icon */}
          <div
            className={`w-14 h-14 rounded-full ${styles.iconBg} flex items-center justify-center`}
          >
            {icon ?? styles.iconWrap}
          </div>

          {/* Text */}
          <div className="space-y-2">
            <h3 className="font-serif text-lg font-bold text-foreground">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 w-full mt-2">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg border-2 border-foreground text-foreground hover:bg-foreground/5 active:scale-[0.98] transition-all"
            >
              {cancelText}
            </button>
            <button
              ref={confirmRef}
              onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg active:scale-[0.98] transition-all focus:outline-none focus:ring-2 ${styles.confirmBtn}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
