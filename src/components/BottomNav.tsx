import { useApp, type Tab } from "@/contexts/AppContext";
import { Home, Calendar, Footprints, UtensilsCrossed, HeartPulse, Dog } from "lucide-react";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "home", label: "Start", icon: Home },
  { id: "calendar", label: "Kalendarz", icon: Calendar },
  { id: "walks", label: "Spacery", icon: Footprints },
  { id: "food", label: "Jedzenie", icon: UtensilsCrossed },
  { id: "health", label: "Zdrowie", icon: HeartPulse },
  { id: "dogs", label: "Pieski", icon: Dog },
];

const BottomNav = () => {
  const { activeTab, setActiveTab } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border pb-safe z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 transition-all duration-200 ${
                active ? "text-primary scale-110" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-semibold">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
