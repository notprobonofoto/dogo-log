import { useApp } from "@/contexts/AppContext";
import PawBackground from "@/components/PawBackground";
import BottomNav from "@/components/BottomNav";
import HamburgerMenu from "@/components/HamburgerMenu";
import NewHomeTab from "@/components/tabs/NewHomeTab";
import NewCalendarTab from "@/components/tabs/NewCalendarTab";
import NewWalksTab from "@/components/tabs/NewWalksTab";
import NewFoodTab from "@/components/tabs/NewFoodTab";
import NewHealthTab from "@/components/tabs/NewHealthTab";
import NewDogsTab from "@/components/tabs/NewDogsTab";
import NewTravelTab from "@/components/tabs/NewTravelTab";
import NotificationPanel from "@/components/NotificationPanel";
import { useState } from "react";

type ExtraTab = "travel" | "notifications" | null;

const Dashboard = () => {
  const { activeTab, setActiveTab, loading } = useApp();
  const [extraTab, setExtraTab] = useState<ExtraTab>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary text-xl font-bold">🐾 DogoLog...</div>
      </div>
    );
  }

  const handleMenuNavigate = (tab: string) => {
    setExtraTab(tab as ExtraTab);
  };

  const handleCloseExtra = () => {
    setExtraTab(null);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <PawBackground />
      <HamburgerMenu onNavigate={handleMenuNavigate} />
      <div className="relative z-10">
        {extraTab === "travel" && <NewTravelTab />}
        {extraTab === "notifications" && <NotificationPanel onClose={handleCloseExtra} />}
        {!extraTab && (
          <>
            {activeTab === "home" && <NewHomeTab setActiveTab={setActiveTab} />}
            {activeTab === "calendar" && <NewCalendarTab />}
            {activeTab === "walks" && <NewWalksTab />}
            {activeTab === "food" && <NewFoodTab />}
            {activeTab === "health" && <NewHealthTab />}
            {activeTab === "dogs" && <NewDogsTab />}
          </>
        )}
      </div>
      {!extraTab && <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />}
      
      {/* Back button for extra tabs */}
      {extraTab && (
        <button
          onClick={handleCloseExtra}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-primary text-primary-foreground rounded-full shadow-lg font-semibold"
        >
          ← Wróć
        </button>
      )}
    </div>
  );
};

export default Dashboard;
