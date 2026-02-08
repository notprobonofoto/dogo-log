import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Copy, Check, LogOut } from "lucide-react";

interface LogoutDialogProps {
  open: boolean;
  householdCode: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const LogoutDialog = ({ open, householdCode, onConfirm, onCancel }: LogoutDialogProps) => {
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  if (!open) return null;

  const copyCode = async () => {
    await navigator.clipboard.writeText(householdCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-dialog-title"
    >
      <div className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-xl animate-slide-up-bounce space-y-4">
        <div className="flex items-center justify-center gap-2 text-destructive">
          <LogOut className="w-6 h-6" aria-hidden="true" />
          <h2 id="logout-dialog-title" className="text-lg font-bold">{t("logoutTitle")}</h2>
        </div>
        
        <div className="bg-destructive/10 rounded-xl p-4 text-center space-y-2">
          <p className="text-sm text-muted-foreground font-medium">
            {t("saveCodeWarning")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("needCodeToLogin")}
          </p>
          <div 
            className="text-2xl font-black tracking-[0.2em] text-primary py-2"
            aria-label={`Kod gospodarstwa: ${householdCode}`}
          >
            {householdCode}
          </div>
          <button
            onClick={copyCode}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label={copied ? t("copied") : t("copyCode")}
          >
            {copied ? <Check className="w-4 h-4" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
            {copied ? t("copied") : t("copyCode")}
          </button>
        </div>

        <p className="text-xs text-muted-foreground text-center" role="alert">
          {t("loseAccessWarning")}
        </p>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg bg-muted text-muted-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label={t("cancel")}
          >
            {t("cancel")}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg bg-destructive text-destructive-foreground font-bold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label={t("logout")}
          >
            {t("logout")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutDialog;
