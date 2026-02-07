import { useApp } from "@/contexts/AppContext";
import logo from "@/assets/logo.png";
import { PawPrint, Utensils, Heart, Dog, Settings, Copy, LogOut, Download } from "lucide-react";
import { useState } from "react";
import DogAvatar from "@/components/DogAvatar";
import LogoutDialog from "@/components/LogoutDialog";
import ReminderBanner from "@/components/ReminderBanner";
import { Link } from "react-router-dom";

const today = () => new Date().toISOString().split("T")[0];

const HomeTab = () => {
  const { data, setActiveTab, logout } = useApp();
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const todayStr = today();
  const todayWalks = data.walks.filter((w) => w.date === todayStr).length;
  const todayMeals = data.meals.filter((m) => m.date === todayStr).length;

  const copyCode = () => {
    navigator.clipboard.writeText(data.householdCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    logout();
    setShowLogout(false);
  };

  return (
    <div className="min-h-screen pb-20 px-4 pt-safe">
      <div className="flex justify-between items-center pt-4 mb-2">
        <div />
        <button onClick={() => setShowCode(!showCode)} className="p-2 rounded-full bg-card text-muted-foreground active:scale-95">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {showCode && (
        <div className="animate-fade-in-up bg-card rounded-xl p-4 mb-4 text-center space-y-3">
          <p className="text-sm text-muted-foreground">Kod gospodarstwa</p>
          <div className="text-2xl font-black tracking-[0.2em] text-primary">{data.householdCode}</div>
          <button onClick={copyCode} className="inline-flex items-center gap-1 text-sm text-primary font-semibold active:scale-95">
            <Copy className="w-4 h-4" /> {copied ? "✓" : "📋"}
          </button>
          <div className="flex gap-2 mt-3">
            <Link
              to="/install"
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-primary/10 text-primary font-semibold text-sm active:scale-95"
            >
              <Download className="w-4 h-4" /> Instaluj
            </Link>
            <button
              onClick={() => setShowLogout(true)}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-destructive/10 text-destructive font-semibold text-sm active:scale-95"
            >
              <LogOut className="w-4 h-4" /> Wyloguj
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-center mb-6 animate-fade-in-up">
        <img src={logo} alt="DogoLog" className="w-40 h-auto" />
      </div>

      <div className="text-center mb-6 animate-fade-in-up">
        <h1 className="text-2xl font-extrabold text-foreground">Cześć, {data.userName}! 🐾</h1>
        {data.dogs.length > 0 && (
          <div className="flex justify-center gap-3 mt-4">
            {data.dogs.map((dog) => (
              <DogAvatar key={dog.id} dogId={dog.id} size="lg" />
            ))}
          </div>
        )}
      </div>

      <ReminderBanner />

      <div className="grid grid-cols-2 gap-3 mb-6">
        <button onClick={() => setActiveTab("walks")} className="bg-card rounded-xl p-4 text-center animate-fade-in-up delay-100 active:scale-95 hover:scale-[1.02] transition-all">
          <PawPrint className="w-7 h-7 mx-auto text-primary mb-1" />
          <div className="text-2xl font-bold text-foreground">{todayWalks}</div>
          <span className="text-xs text-muted-foreground">Spacery</span>
        </button>
        <button onClick={() => setActiveTab("food")} className="bg-card rounded-xl p-4 text-center animate-fade-in-up delay-200 active:scale-95 hover:scale-[1.02] transition-all">
          <Utensils className="w-7 h-7 mx-auto text-accent mb-1" />
          <div className="text-2xl font-bold text-foreground">{todayMeals}</div>
          <span className="text-xs text-muted-foreground">Posiłki</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setActiveTab("health")}
          className="flex flex-col items-center justify-center gap-1 p-4 rounded-xl bg-destructive/10 text-destructive font-semibold transition-all active:scale-95 hover:scale-[1.02] animate-button-ready"
        >
          <Heart className="w-6 h-6" />
          <span className="text-xs">Zdrowie</span>
        </button>
        <button
          onClick={() => setActiveTab("dogs")}
          className="flex flex-col items-center justify-center gap-1 p-4 rounded-xl bg-secondary text-secondary-foreground font-semibold transition-all active:scale-95 hover:scale-[1.02] animate-button-ready"
        >
          <Dog className="w-6 h-6" />
          <span className="text-xs">{data.dogs.length} Pieski</span>
        </button>
      </div>

      <LogoutDialog
        open={showLogout}
        householdCode={data.householdCode}
        onConfirm={handleLogout}
        onCancel={() => setShowLogout(false)}
      />
    </div>
  );
};

export default HomeTab;
