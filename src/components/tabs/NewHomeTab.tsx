import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/logo.png";
import { PawPrint, Utensils, Heart, Dog, Settings, Copy, LogOut, Download, Users, Bell } from "lucide-react";
import { useState } from "react";
import DogAvatar from "@/components/DogAvatar";
import LogoutDialog from "@/components/LogoutDialog";
import ReminderBanner from "@/components/ReminderBanner";
import WalkReminderBanner from "@/components/WalkReminderBanner";
import HappinessCard from "@/components/HappinessCard";
import LanguageSelector from "@/components/LanguageSelector";
import WelcomeGreeting from "@/components/WelcomeGreeting";
import NotificationPanel from "@/components/NotificationPanel";
import { Link } from "react-router-dom";

type ActiveTab = "home" | "calendar" | "walks" | "food" | "health" | "dogs";

interface NewHomeTabProps {
  setActiveTab: (tab: ActiveTab) => void;
}

const today = () => new Date().toISOString().split("T")[0];

const NewHomeTab = ({ setActiveTab }: NewHomeTabProps) => {
  const { profile, householdCode, householdMembers, signOut } = useAuth();
  const { dogs, walks, meals } = useData();
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
    await signOut();
    setShowLogout(false);
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-safe">
      <div className="flex justify-between items-center pt-4 mb-2">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="p-2 rounded-full bg-card text-muted-foreground active:scale-95 hover:bg-muted transition-colors"
        >
          <Bell className="w-5 h-5" />
        </button>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-full bg-card text-muted-foreground active:scale-95 hover:bg-muted transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {showNotifications && <NotificationPanel onClose={() => setShowNotifications(false)} />}

      {showSettings && (
        <div className="animate-fade-in-up bg-card rounded-xl p-4 mb-4 space-y-4">
          <p className="text-sm text-muted-foreground text-center">{t("householdCode")}</p>
          <div className="text-2xl font-black tracking-[0.2em] text-primary text-center">{householdCode}</div>
          <button onClick={copyCode} className="flex items-center justify-center gap-1 text-sm text-primary font-semibold active:scale-95 w-full">
            <Copy className="w-4 h-4" /> {copied ? "✓" : t("copy")}
          </button>

          {/* Household members */}
          <div className="pt-3 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">{t("householdMembers")}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {householdMembers.map((member) => (
                <span
                  key={member.id}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    member.id === profile?.id
                      ? "bg-primary/20 text-primary"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {member.name} {member.id === profile?.id && "(Ty)"}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <LanguageSelector />
          </div>

          <div className="flex gap-2">
            <Link
              to="/install"
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-primary/10 text-primary font-semibold text-sm active:scale-95"
            >
              <Download className="w-4 h-4" /> {t("install")}
            </Link>
            <button
              onClick={() => setShowLogout(true)}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-destructive/10 text-destructive font-semibold text-sm active:scale-95"
            >
              <LogOut className="w-4 h-4" /> {t("logout")}
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-center mb-4 animate-fade-in-up">
        <img src={logo} alt="DogoLog" className="w-36 h-auto" />
      </div>

      <WelcomeGreeting name={profile?.name || ""} />

      {dogs.length > 0 && (
        <div className="flex justify-center gap-4 mb-4 animate-fade-in-up">
          {dogs.map((dog) => (
            <div key={dog.id} className="flex flex-col items-center gap-1">
              <DogAvatar dogId={dog.id} size="xl" />
              <span className="text-xs font-bold text-foreground">{dog.name}</span>
            </div>
          ))}
        </div>
      )}

      <ReminderBanner />
      <WalkReminderBanner />
      <HappinessCard />

      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => setActiveTab("walks")}
          className="bg-card rounded-xl p-4 text-center animate-fade-in-up delay-100 active:scale-95 hover:scale-[1.02] transition-all"
        >
          <PawPrint className="w-8 h-8 mx-auto text-primary mb-1" />
          <div className="text-2xl font-bold text-foreground">{todayWalks}</div>
          <span className="text-xs text-muted-foreground font-semibold">{t("walks")}</span>
        </button>
        <button
          onClick={() => setActiveTab("food")}
          className="bg-card rounded-xl p-4 text-center animate-fade-in-up delay-200 active:scale-95 hover:scale-[1.02] transition-all"
        >
          <Utensils className="w-8 h-8 mx-auto text-accent mb-1" />
          <div className="text-2xl font-bold text-foreground">{todayMeals}</div>
          <span className="text-xs text-muted-foreground font-semibold">{t("meals")}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setActiveTab("health")}
          className="flex flex-col items-center justify-center gap-1 p-4 rounded-xl bg-destructive/10 text-destructive font-semibold transition-all active:scale-95 hover:scale-[1.02]"
        >
          <Heart className="w-7 h-7" />
          <span className="text-xs">{t("health")}</span>
        </button>
        <button
          onClick={() => setActiveTab("dogs")}
          className="flex flex-col items-center justify-center gap-1 p-4 rounded-xl bg-secondary text-secondary-foreground font-semibold transition-all active:scale-95 hover:scale-[1.02]"
        >
          <Dog className="w-7 h-7" />
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
