import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Menu, X, Home, CalendarDays, PawPrint, Utensils, Heart, Dog, Plane } from "lucide-react";

export type MenuTab = "home" | "calendar" | "walks" | "food" | "health" | "dogs" | "travel";

interface HamburgerMenuProps {
  activeTab: MenuTab;
  onNavigate: (tab: MenuTab) => void;
}

const HamburgerMenu = ({ activeTab, onNavigate }: HamburgerMenuProps) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems: { id: MenuTab; icon: React.ElementType; label: string }[] = [
    { id: "home", icon: Home, label: "Start" },
    { id: "calendar", icon: CalendarDays, label: t("calendar") },
    { id: "walks", icon: PawPrint, label: t("walks") },
    { id: "food", icon: Utensils, label: t("meals") },
    { id: "health", icon: Heart, label: t("health") },
    { id: "dogs", icon: Dog, label: t("dogs") },
    { id: "travel", icon: Plane, label: t("travel") },
  ];

  const handleNavigate = (tab: MenuTab) => {
    onNavigate(tab);
    setIsOpen(false);
  };

  return (
    <>
      {/* Menu button - positioned by parent */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Menu"
        aria-expanded={isOpen}
      >
        <Menu className="w-6 h-6 text-foreground" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-in menu - full opaque background */}
      <div 
        className={`fixed top-0 right-0 h-full w-72 bg-background z-50 shadow-2xl transform transition-transform duration-300 ease-out border-l border-border ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu nawigacji"
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Menu</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Zamknij menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Menu items */}
        <nav className="p-4 space-y-2" role="navigation">
          {menuItems.map(({ id, icon: Icon, label }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => handleNavigate(id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
                  isActive 
                    ? "bg-primary/10 text-primary border-2 border-primary" 
                    : "bg-secondary hover:bg-secondary/80 text-foreground border-2 border-transparent"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className={`w-6 h-6 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                <span className="font-semibold">{label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default HamburgerMenu;
