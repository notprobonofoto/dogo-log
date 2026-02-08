import { useState } from "react";
import { Menu, X, Plane, Bell } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface HamburgerMenuProps {
  onNavigate: (tab: string) => void;
}

const HamburgerMenu = ({ onNavigate }: HamburgerMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t, language } = useLanguage();

  const menuItems = [
    { id: "travel", icon: Plane, label: language === "pl" ? "Podróże" : "Travel" },
    { id: "notifications", icon: Bell, label: t("notifications") },
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-card shadow-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label={isOpen ? "Zamknij menu" : "Otwórz menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-foreground" />
        ) : (
          <Menu className="w-6 h-6 text-foreground" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Menu panel */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-card shadow-xl z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu nawigacyjne"
      >
        <div className="pt-16 px-4">
          <h2 className="text-lg font-bold text-foreground mb-4">{t("settings")}</h2>
          
          <nav className="space-y-2" role="navigation">
            {menuItems.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => handleItemClick(id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <Icon className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default HamburgerMenu;
