import { useState, useCallback } from "react";
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
import WelcomeGreeting from "@/components/WelcomeGreeting";

const GREETING_SHOWN_KEY = "dogolog_greeting_shown";

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
  
  // Check if greeting was shown today
  const today = new Date().toISOString().split("T")[0];
  const lastGreeting = localStorage.getItem(GREETING_SHOWN_KEY);
  const shouldShowGreeting = isOnboarded && lastGreeting !== today;
  
  const [showGreeting, setShowGreeting] = useState(shouldShowGreeting);

  const handleGreetingComplete = useCallback(() => {
    localStorage.setItem(GREETING_SHOWN_KEY, today);
    setShowGreeting(false);
  }, [today]);

  if (!isOnboarded) return <Onboarding />;

  if (showGreeting) {
    return <WelcomeGreeting onComplete={handleGreetingComplete} />;
  }

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
