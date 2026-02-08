import { Bell, Settings } from "lucide-react";
import HamburgerMenu, { type MenuTab } from "./HamburgerMenu";

interface TopBarProps {
  activeTab: MenuTab;
  onNavigate: (tab: MenuTab) => void;
  onNotificationsClick: () => void;
  onSettingsClick: () => void;
  unreadNotifications?: number;
}

const TopBar = ({ 
  activeTab, 
  onNavigate, 
  onNotificationsClick, 
  onSettingsClick,
  unreadNotifications = 0 
}: TopBarProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        {/* Left side: Notifications and Settings */}
        <div className="flex items-center gap-2">
          <button
            onClick={onNotificationsClick}
            className="relative p-2 rounded-lg hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
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
            className="p-2 rounded-lg hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Ustawienia"
          >
            <Settings className="w-6 h-6 text-foreground" />
          </button>
        </div>

        {/* Center: Spacer for balance */}
        <div className="flex-1" />

        {/* Right side: Hamburger Menu */}
        <HamburgerMenu activeTab={activeTab} onNavigate={onNavigate} />
      </div>
    </header>
  );
};

export default TopBar;
