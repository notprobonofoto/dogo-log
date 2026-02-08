import { useWalkReminder } from "@/hooks/useWalkReminder";
import { useLanguage } from "@/contexts/LanguageContext";
import { Bell, X, PawPrint } from "lucide-react";

const WalkReminderBanner = () => {
  const { shouldShow, averageTime, dismiss } = useWalkReminder();
  const { t } = useLanguage();

  if (!shouldShow) return null;

  return (
    <div className="relative bg-primary/15 border-2 border-primary rounded-xl p-4 mb-4 animate-slide-up-bounce">
      <button
        onClick={dismiss}
        className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/20 rounded-full">
          <PawPrint className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 pr-6">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary">
              ~{averageTime}
            </span>
          </div>
          <p className="text-sm text-foreground font-medium">
            {t("walkReminder")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalkReminderBanner;
