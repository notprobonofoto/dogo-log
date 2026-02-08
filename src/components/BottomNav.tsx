import { useApp, type Tab } from "@/contexts/AppContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Home, CalendarDays, PawPrint, Utensils, Heart, Dog } from "lucide-react";

const BottomNav = () => {
  const { activeTab, setActiveTab } = useApp();
  const { t } = useLanguage();

  const tabs: { id: Tab; labelKey: "greeting" | "calendarTitle" | "walks" | "meals" | "health" | "dogs"; icon: React.ElementType }[] = [
    { id: "home", labelKey: "greeting", icon: Home },
    { id: "calendar", labelKey: "calendarTitle", icon: CalendarDays },
    { id: "walks", labelKey: "walks", icon: PawPrint },
    { id: "food", labelKey: "meals", icon: Utensils },
    { id: "health", labelKey: "health", icon: Heart },
    { id: "dogs", labelKey: "dogs", icon: Dog },
  ];

  const getLabel = (id: Tab): string => {
    const labels: Record<Tab, string> = {
      home: "Start",
      calendar: t("calendarTitle"),
      walks: t("walks"),
      food: t("meals"),
      health: t("health"),
      dogs: t("dogs"),
    };
    return labels[id];
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/98 backdrop-blur-lg border-t border-border pb-safe z-50 shadow-lg">
      <div className="flex justify-around items-center h-18 max-w-lg mx-auto py-1">
        {tabs.map(({ id, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[56px] ${
                active 
                  ? "text-primary bg-primary/10 scale-105" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon 
                className={`w-6 h-6 transition-all ${active ? "stroke-[2.5]" : "stroke-[1.8]"}`} 
              />
              <span className={`text-[11px] font-bold transition-all ${active ? "text-primary" : "text-muted-foreground"}`}>
                {getLabel(id)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
