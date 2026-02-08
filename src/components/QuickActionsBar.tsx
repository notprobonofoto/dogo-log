import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Home, CalendarDays, PawPrint, Utensils, Heart, Dog, Plane, Settings as SettingsIcon } from "lucide-react";
import type { MenuTab } from "./HamburgerMenu";

interface QuickActionsBarProps {
  activeTab: MenuTab;
  onNavigate: (tab: MenuTab) => void;
}

const STORAGE_KEY = "dogolog_quick_actions";

const ALL_TABS: { id: MenuTab; icon: React.ElementType }[] = [
  { id: "home", icon: Home },
  { id: "calendar", icon: CalendarDays },
  { id: "walks", icon: PawPrint },
  { id: "food", icon: Utensils },
  { id: "health", icon: Heart },
  { id: "dogs", icon: Dog },
  { id: "travel", icon: Plane },
];

const DEFAULT_TABS: MenuTab[] = ["home", "walks", "food", "health", "dogs"];

const QuickActionsBar = ({ activeTab, onNavigate }: QuickActionsBarProps) => {
  const { t } = useLanguage();
  const [selectedTabs, setSelectedTabs] = useState<MenuTab[]>(DEFAULT_TABS);
  const [isEditing, setIsEditing] = useState(false);

  // Load saved tabs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length <= 5) {
          setSelectedTabs(parsed);
        }
      } catch {
        // Use defaults
      }
    }
  }, []);

  // Save tabs to localStorage
  const saveTabs = (tabs: MenuTab[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
    setSelectedTabs(tabs);
  };

  const toggleTab = (tabId: MenuTab) => {
    if (selectedTabs.includes(tabId)) {
      if (selectedTabs.length > 1) {
        saveTabs(selectedTabs.filter(t => t !== tabId));
      }
    } else if (selectedTabs.length < 5) {
      saveTabs([...selectedTabs, tabId]);
    }
  };

  const getLabel = (id: MenuTab): string => {
    const labels: Record<MenuTab, string> = {
      home: "Start",
      calendar: t("calendar"),
      walks: t("walks"),
      food: t("meals"),
      health: t("health"),
      dogs: t("dogs"),
      travel: t("travel"),
    };
    return labels[id];
  };

  const visibleTabs = ALL_TABS.filter(tab => selectedTabs.includes(tab.id));

  if (isEditing) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-card/98 backdrop-blur-lg border-t border-border pb-safe z-50 shadow-lg">
        <div className="px-4 py-3 max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-foreground">
              Wybierz do 5 zakładek
            </p>
            <button
              onClick={() => setIsEditing(false)}
              className="text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-ring rounded px-2 py-1"
            >
              Gotowe
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {ALL_TABS.map(({ id, icon: Icon }) => {
              const isSelected = selectedTabs.includes(id);
              const canAdd = selectedTabs.length < 5 || isSelected;
              return (
                <button
                  key={id}
                  onClick={() => toggleTab(id)}
                  disabled={!canAdd && !isSelected}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
                    isSelected
                      ? "bg-primary/20 text-primary border-2 border-primary"
                      : canAdd
                      ? "bg-secondary text-muted-foreground border-2 border-transparent"
                      : "bg-muted text-muted-foreground/50 border-2 border-transparent cursor-not-allowed"
                  }`}
                  aria-pressed={isSelected}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-card/98 backdrop-blur-lg border-t border-border pb-safe z-50 shadow-lg"
      role="navigation"
      aria-label="Szybkie akcje"
    >
      <div className="flex justify-around items-center h-18 max-w-lg mx-auto py-1" role="tablist">
        {visibleTabs.map(({ id, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[56px] focus:outline-none focus:ring-2 focus:ring-ring ${
                active 
                  ? "text-primary bg-primary/10 scale-105" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
              role="tab"
              aria-selected={active}
              aria-label={getLabel(id)}
              tabIndex={active ? 0 : -1}
            >
              <Icon 
                className={`w-6 h-6 transition-all ${active ? "stroke-[2.5]" : "stroke-[1.8]"}`}
                aria-hidden="true"
              />
              <span className={`text-[11px] font-bold transition-all ${active ? "text-primary" : "text-muted-foreground"}`}>
                {getLabel(id)}
              </span>
            </button>
          );
        })}
        
        {/* Edit button */}
        <button
          onClick={() => setIsEditing(true)}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[56px] focus:outline-none focus:ring-2 focus:ring-ring text-muted-foreground hover:text-foreground hover:bg-muted/50"
          aria-label="Edytuj pasek"
        >
          <SettingsIcon className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] font-bold">Edit</span>
        </button>
      </div>
    </nav>
  );
};

export default QuickActionsBar;
