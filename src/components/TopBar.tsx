import { Bell, Settings, Menu } from "lucide-react";
import type { MenuTab } from "./HamburgerMenu";

interface TopBarProps {
  activeTab: MenuTab;
  onNavigate: (tab: MenuTab) => void;
  onNotificationsClick: () => void;
  onSettingsClick: () => void;
  onMenuClick: () => void;
  unreadNotifications?: number;
}

const TopBar = ({ 
  onNotificationsClick, 
  onSettingsClick,
  onMenuClick,
  unreadNotifications = 0 
}: TopBarProps) => {
  return (
    <>
      {/* Floating Menu Button - Top Left */}
      <button
        onClick={onMenuClick}
        className="fixed top-4 left-4 z-40 w-12 h-12 rounded-full bg-card/95 backdrop-blur-sm border-2 border-border shadow-lg flex items-center justify-center hover:bg-secondary transition-all duration-200 active:scale-95"
        aria-label="Menu"
      >
        <Menu className="w-6 h-6 text-foreground" />
      </button>

      {/* Floating Icons - Top Right */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-3">
        <button
          onClick={onNotificationsClick}
          className="relative w-12 h-12 rounded-full bg-card/95 backdrop-blur-sm border-2 border-border shadow-lg flex items-center justify-center hover:bg-secondary transition-all duration-200 active:scale-95"
          aria-label="Powiadomienia"
        >
          <Bell className="w-6 h-6 text-foreground" />
          {unreadNotifications > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
              {unreadNotifications > 9 ? "9+" : unreadNotifications}
            </span>
          )}
        </button>
        <button
          onClick={onSettingsClick}
          className="w-12 h-12 rounded-full bg-card/95 backdrop-blur-sm border-2 border-border shadow-lg flex items-center justify-center hover:bg-secondary transition-all duration-200 active:scale-95"
          aria-label="Ustawienia"
        >
          <Settings className="w-6 h-6 text-foreground" />
        </button>
      </div>
    </>
  );
};

export default TopBar;
