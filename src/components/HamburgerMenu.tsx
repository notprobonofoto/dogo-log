import { useLanguage } from "@/contexts/LanguageContext";
import { X, Home, CalendarDays, PawPrint, Utensils, Heart, Dog, Plane, Bell, Settings } from "lucide-react";

export type MenuTab = "home" | "calendar" | "walks" | "food" | "health" | "dogs" | "travel";

interface FullscreenMenuProps {
  isOpen: boolean;
  activeTab: MenuTab;
  onNavigate: (tab: MenuTab) => void;
  onClose: () => void;
  onNotificationsClick: () => void;
  onSettingsClick: () => void;
}

const FullscreenMenu = ({ 
  isOpen, 
  activeTab, 
  onNavigate, 
  onClose,
  onNotificationsClick,
  onSettingsClick 
}: FullscreenMenuProps) => {
  const { t } = useLanguage();

  const menuItems: { id: MenuTab | "notifications" | "settings"; icon: React.ElementType; label: string }[] = [
    { id: "home", icon: Home, label: "Start" },
    { id: "calendar", icon: CalendarDays, label: t("calendar") },
    { id: "walks", icon: PawPrint, label: t("walks") },
    { id: "food", icon: Utensils, label: t("meals") },
    { id: "health", icon: Heart, label: t("health") },
    { id: "dogs", icon: Dog, label: t("dogs") },
    { id: "travel", icon: Plane, label: t("travel") },
    { id: "notifications", icon: Bell, label: t("notifications") },
    { id: "settings", icon: Settings, label: t("settings") },
  ];

  const handleItemClick = (id: MenuTab | "notifications" | "settings") => {
    if (id === "notifications") {
      onNotificationsClick();
    } else if (id === "settings") {
      onSettingsClick();
    } else {
      onNavigate(id);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Menu nawigacji"
    >
      {/* Background overlay */}
      <div 
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Fullscreen menu content */}
      <div className="absolute inset-0 bg-card flex flex-col animate-slide-up-bounce">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-12 h-12 rounded-full bg-secondary border-2 border-border shadow-lg flex items-center justify-center hover:bg-destructive/10 hover:border-destructive transition-all duration-200 active:scale-95 z-10"
          aria-label="Zamknij menu"
        >
          <X className="w-6 h-6 text-foreground" />
        </button>

        {/* Menu items - scrollable */}
        <nav className="flex-1 overflow-y-auto px-6 py-20 max-w-md mx-auto w-full" role="navigation">
          <div className="space-y-3 min-h-full flex flex-col justify-center">
            {menuItems.map(({ id, icon: Icon, label }, index) => {
              const isActive = id === activeTab;
              return (
                <button
                  key={id}
                  onClick={() => handleItemClick(id)}
                  className={`w-full flex items-center gap-5 p-5 rounded-2xl transition-all duration-200 active:scale-[0.98] animate-fade-in-up ${
                    isActive 
                      ? "bg-primary/15 border-2 border-primary shadow-md" 
                      : "bg-secondary/50 border-2 border-transparent hover:bg-secondary hover:border-border"
                  }`}
                  style={{ animationDelay: `${index * 40}ms` }}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isActive ? "bg-primary/20" : "bg-muted"
                  }`}>
                    <Icon className={`w-6 h-6 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <span className={`text-lg font-bold ${isActive ? "text-primary" : "text-foreground"}`}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default FullscreenMenu;
