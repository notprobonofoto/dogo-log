import { useApp } from "@/contexts/AppContext";
import PawBackground from "@/components/PawBackground";
import TopBar from "@/components/TopBar";
import QuickActionsBar from "@/components/QuickActionsBar";
import NewHomeTab from "@/components/tabs/NewHomeTab";
import NewCalendarTab from "@/components/tabs/NewCalendarTab";
import NewWalksTab from "@/components/tabs/NewWalksTab";
import NewFoodTab from "@/components/tabs/NewFoodTab";
import NewHealthTab from "@/components/tabs/NewHealthTab";
import NewDogsTab from "@/components/tabs/NewDogsTab";
import NewTravelTab from "@/components/tabs/NewTravelTab";
import NotificationPanel from "@/components/NotificationPanel";
import SettingsPanel from "@/components/SettingsPanel";
import FullscreenMenu from "@/components/HamburgerMenu";
import { useState } from "react";
import type { MenuTab } from "@/components/HamburgerMenu";

type ExtraPanel = "notifications" | "settings" | null;

const Dashboard = () => {
  const { loading } = useApp();
  const [activeTab, setActiveTab] = useState<MenuTab>("home");
  const [extraPanel, setExtraPanel] = useState<ExtraPanel>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary text-xl font-bold">🐾 DogoLog...</div>
      </div>
    );
  }

  const handleNavigate = (tab: MenuTab) => {
    setActiveTab(tab);
    setExtraPanel(null);
    setIsMenuOpen(false);
  };

  const handleCloseExtra = () => {
    setExtraPanel(null);
  };

  const handleNotificationsClick = () => {
    setExtraPanel("notifications");
    setIsMenuOpen(false);
  };

  const handleSettingsClick = () => {
    setExtraPanel("settings");
    setIsMenuOpen(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <PawBackground />
      
      {/* Floating Icons */}
      <TopBar
        activeTab={activeTab}
        onNavigate={handleNavigate}
        onNotificationsClick={handleNotificationsClick}
        onSettingsClick={handleSettingsClick}
        onMenuClick={() => setIsMenuOpen(true)}
      />

      {/* Fullscreen Menu Overlay */}
      <FullscreenMenu
        isOpen={isMenuOpen}
        activeTab={activeTab}
        onNavigate={handleNavigate}
        onClose={() => setIsMenuOpen(false)}
        onNotificationsClick={handleNotificationsClick}
        onSettingsClick={handleSettingsClick}
      />

      {/* Main content - with top padding to avoid floating icons */}
      <div className="relative z-10 pt-24">
        {extraPanel === "notifications" && <NotificationPanel onClose={handleCloseExtra} />}
        {extraPanel === "settings" && <SettingsPanel onClose={handleCloseExtra} />}
        
        {!extraPanel && (
          <>
            {activeTab === "home" && <NewHomeTab setActiveTab={setActiveTab} />}
            {activeTab === "calendar" && <NewCalendarTab />}
            {activeTab === "walks" && <NewWalksTab />}
            {activeTab === "food" && <NewFoodTab />}
            {activeTab === "health" && <NewHealthTab />}
            {activeTab === "dogs" && <NewDogsTab />}
            {activeTab === "travel" && <NewTravelTab />}
          </>
        )}
      </div>
      
      {/* Quick Actions Bar */}
      {!extraPanel && <QuickActionsBar activeTab={activeTab} onNavigate={handleNavigate} />}
    </div>
  );
};

export default Dashboard;
