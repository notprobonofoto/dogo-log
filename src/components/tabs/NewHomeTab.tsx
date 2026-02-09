import { useApp } from "@/contexts/AppContext";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/dogolog-logo.png";
import { PawPrint, Utensils, Heart, Dog } from "lucide-react";
import DogAvatar from "@/components/DogAvatar";
import ReminderBanner from "@/components/ReminderBanner";
import WalkReminderBanner from "@/components/WalkReminderBanner";
import HappinessCard from "@/components/HappinessCard";
import WelcomeGreeting from "@/components/WelcomeGreeting";
import UserStatsCard from "@/components/UserStatsCard";
import type { MenuTab } from "@/components/HamburgerMenu";

interface NewHomeTabProps {
  setActiveTab: (tab: MenuTab) => void;
}

const today = () => new Date().toISOString().split("T")[0];

const NewHomeTab = ({ setActiveTab }: NewHomeTabProps) => {
  const { userName, dogs, walks, meals } = useApp();
  const { t } = useLanguage();

  const todayStr = today();
  const todayWalks = walks.filter((w) => w.date === todayStr).length;
  const todayMeals = meals.filter((m) => m.date === todayStr).length;

  return (
    <div className="min-h-screen pb-24 px-4" role="main" aria-label="Strona główna">

      <div className="flex justify-center mb-3 animate-fade-in-up -mt-2">
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

    </div>
  );
};

export default NewHomeTab;
