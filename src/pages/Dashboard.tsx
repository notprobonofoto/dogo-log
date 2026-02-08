import { useApp } from "@/contexts/AppContext";
import PawBackground from "@/components/PawBackground";
import BottomNav from "@/components/BottomNav";
import NewHomeTab from "@/components/tabs/NewHomeTab";
import NewCalendarTab from "@/components/tabs/NewCalendarTab";
import NewWalksTab from "@/components/tabs/NewWalksTab";
import NewFoodTab from "@/components/tabs/NewFoodTab";
import NewHealthTab from "@/components/tabs/NewHealthTab";
import NewDogsTab from "@/components/tabs/NewDogsTab";

const Dashboard = () => {
  const { activeTab, setActiveTab, loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary text-xl font-bold">🐾 DogoLog...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <PawBackground />
      <div className="relative z-10">
        {activeTab === "home" && <NewHomeTab setActiveTab={setActiveTab} />}
        {activeTab === "calendar" && <NewCalendarTab />}
        {activeTab === "walks" && <NewWalksTab />}
        {activeTab === "food" && <NewFoodTab />}
        {activeTab === "health" && <NewHealthTab />}
        {activeTab === "dogs" && <NewDogsTab />}
      </div>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default Dashboard;
