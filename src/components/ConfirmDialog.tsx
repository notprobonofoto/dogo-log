import { AlertTriangle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = ({ open, title, message, confirmLabel, onConfirm, onCancel }: ConfirmDialogProps) => {
  const { t } = useLanguage();

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      <div className="bg-card rounded-2xl p-6 max-w-sm w-full space-y-4 animate-scale-in">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center"
            aria-hidden="true"
          >
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <h3 id="confirm-dialog-title" className="font-bold text-foreground text-lg">
            {title}
          </h3>
        </div>
        <p id="confirm-dialog-message" className="text-muted-foreground text-sm">
          {message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-muted text-muted-foreground font-semibold transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label={t("cancel")}
          >
            {t("cancel")}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-bold transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label={confirmLabel || t("delete")}
          >
            {confirmLabel || t("delete")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
