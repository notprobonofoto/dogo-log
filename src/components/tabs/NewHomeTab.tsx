import { useApp } from "@/contexts/AppContext";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/logo.png";
import { PawPrint, Utensils, Heart, Dog, Settings, Copy, LogOut, Download, Bell } from "lucide-react";
import { useState } from "react";
import DogAvatar from "@/components/DogAvatar";
import LogoutDialog from "@/components/LogoutDialog";
import ReminderBanner from "@/components/ReminderBanner";
import WalkReminderBanner from "@/components/WalkReminderBanner";
import HappinessCard from "@/components/HappinessCard";
import LanguageSelector from "@/components/LanguageSelector";
import WelcomeGreeting from "@/components/WelcomeGreeting";
import NotificationPanel from "@/components/NotificationPanel";
import UserStatsCard from "@/components/UserStatsCard";
import HouseholdMembersPanel from "@/components/HouseholdMembersPanel";
import { Link } from "react-router-dom";

type ActiveTab = "home" | "calendar" | "walks" | "food" | "health" | "dogs";

interface NewHomeTabProps {
  setActiveTab: (tab: ActiveTab) => void;
}

const today = () => new Date().toISOString().split("T")[0];

const NewHomeTab = ({ setActiveTab }: NewHomeTabProps) => {
  const { userName, householdCode, dogs, walks, meals, logout } = useApp();
  const { t } = useLanguage();

  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const todayStr = today();
  const todayWalks = walks.filter((w) => w.date === todayStr).length;
  const todayMeals = meals.filter((m) => m.date === todayStr).length;

  const copyCode = () => {
    if (householdCode) {
      navigator.clipboard.writeText(householdCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = async () => {
    logout();
    setShowLogout(false);
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-safe" role="main" aria-label="Strona główna">
      <div className="flex justify-between items-center pt-4 mb-2">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="p-2 rounded-full bg-card text-muted-foreground active:scale-95 hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label={t("notifications")}
          aria-expanded={showNotifications}
        >
          <Bell className="w-5 h-5" aria-hidden="true" />
        </button>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-full bg-card text-muted-foreground active:scale-95 hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label={t("settings")}
          aria-expanded={showSettings}
        >
          <Settings className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {showNotifications && <NotificationPanel onClose={() => setShowNotifications(false)} />}

      {showSettings && (
        <div 
          className="animate-fade-in-up bg-card rounded-xl p-4 mb-4 space-y-4"
          role="region"
          aria-label={t("settings")}
        >
          <p className="text-sm text-muted-foreground text-center">{t("householdCode")}</p>
          <div 
            className="text-2xl font-black tracking-[0.2em] text-primary text-center"
            aria-label={`Kod gospodarstwa: ${householdCode}`}
          >
            {householdCode}
          </div>
          <button 
            onClick={copyCode} 
            className="flex items-center justify-center gap-1 text-sm text-primary font-semibold active:scale-95 w-full focus:outline-none focus:ring-2 focus:ring-ring rounded"
            aria-label={copied ? t("copied") : t("copyCode")}
          >
            <Copy className="w-4 h-4" aria-hidden="true" /> {copied ? "✓" : t("copy")}
          </button>

          {/* Household members panel with management */}
          <div className="pt-3 border-t border-border">
            <HouseholdMembersPanel />
          </div>

          <div className="pt-2 border-t border-border">
            <LanguageSelector />
          </div>

          <div className="flex gap-2">
            <Link
              to="/install"
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-primary/10 text-primary font-semibold text-sm active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label={t("install")}
            >
              <Download className="w-4 h-4" aria-hidden="true" /> {t("install")}
            </Link>
            <button
              onClick={() => setShowLogout(true)}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-destructive/10 text-destructive font-semibold text-sm active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label={t("logout")}
            >
              <LogOut className="w-4 h-4" aria-hidden="true" /> {t("logout")}
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-center mb-4 animate-fade-in-up">
        <img src={logo} alt="DogoLog - aplikacja do zarządzania pieskami" className="w-36 h-auto" />
      </div>

      <WelcomeGreeting name={userName} />

      {dogs.length > 0 && (
        <div 
          className="flex justify-center gap-4 mb-4 animate-fade-in-up"
          role="list"
          aria-label={t("dogs")}
        >
          {dogs.map((dog) => (
            <div key={dog.id} className="flex flex-col items-center gap-1" role="listitem">
              <DogAvatar dogId={dog.id} size="xl" />
              <span className="text-xs font-bold text-foreground">{dog.name}</span>
            </div>
          ))}
        </div>
      )}

      <ReminderBanner />
      <WalkReminderBanner />
      <HappinessCard />
      
      {/* User stats card */}
      <UserStatsCard />

      <div className="grid grid-cols-2 gap-3 mb-4" role="navigation" aria-label="Skróty do sekcji">
        <button
          onClick={() => setActiveTab("walks")}
          className="bg-card rounded-xl p-4 text-center animate-fade-in-up delay-100 active:scale-95 hover:scale-[1.02] transition-all focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label={`${t("walks")}: ${todayWalks} dzisiaj`}
        >
          <PawPrint className="w-8 h-8 mx-auto text-primary mb-1" aria-hidden="true" />
          <div className="text-2xl font-bold text-foreground">{todayWalks}</div>
          <span className="text-xs text-muted-foreground font-semibold">{t("walks")}</span>
        </button>
        <button
          onClick={() => setActiveTab("food")}
          className="bg-card rounded-xl p-4 text-center animate-fade-in-up delay-200 active:scale-95 hover:scale-[1.02] transition-all focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label={`${t("meals")}: ${todayMeals} dzisiaj`}
        >
          <Utensils className="w-8 h-8 mx-auto text-accent mb-1" aria-hidden="true" />
          <div className="text-2xl font-bold text-foreground">{todayMeals}</div>
          <span className="text-xs text-muted-foreground font-semibold">{t("meals")}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setActiveTab("health")}
          className="flex flex-col items-center justify-center gap-1 p-4 rounded-xl bg-destructive/10 text-destructive font-semibold transition-all active:scale-95 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label={t("health")}
        >
          <Heart className="w-7 h-7" aria-hidden="true" />
          <span className="text-xs">{t("health")}</span>
        </button>
        <button
          onClick={() => setActiveTab("dogs")}
          className="flex flex-col items-center justify-center gap-1 p-4 rounded-xl bg-secondary text-secondary-foreground font-semibold transition-all active:scale-95 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label={`${dogs.length} ${t("dogs")}`}
        >
          <Dog className="w-7 h-7" aria-hidden="true" />
          <span className="text-xs">
            {dogs.length} {t("dogs")}
          </span>
        </button>
      </div>

      <LogoutDialog
        open={showLogout}
        householdCode={householdCode || ""}
        onConfirm={handleLogout}
        onCancel={() => setShowLogout(false)}
      />
    </div>
  );
};

export default NewHomeTab;
