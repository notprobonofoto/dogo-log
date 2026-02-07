import { useApp } from "@/contexts/AppContext";
import Onboarding from "@/components/Onboarding";
import BottomNav from "@/components/BottomNav";
import HomeTab from "@/components/tabs/HomeTab";
import CalendarTab from "@/components/tabs/CalendarTab";
import WalksTab from "@/components/tabs/WalksTab";
import FoodTab from "@/components/tabs/FoodTab";
import HealthTab from "@/components/tabs/HealthTab";
import DogsTab from "@/components/tabs/DogsTab";
import PawBackground from "@/components/PawBackground";

const tabs = {
  home: HomeTab,
  calendar: CalendarTab,
  walks: WalksTab,
  food: FoodTab,
  health: HealthTab,
  dogs: DogsTab,
};

const Index = () => {
  const { isOnboarded, activeTab } = useApp();

  if (!isOnboarded) return <Onboarding />;

  const ActiveComponent = tabs[activeTab];

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-background relative">
      <PawBackground />
      <div className="relative z-10">
        <ActiveComponent />
      </div>
      <BottomNav />
    </div>
  );
};

export default Index;
