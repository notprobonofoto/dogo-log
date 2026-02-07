import { useApp } from "@/contexts/AppContext";
import dogFull from "@/assets/dog-full.png";
import { Footprints, UtensilsCrossed, HeartPulse, Dog, Settings, Copy } from "lucide-react";
import { useState } from "react";

const today = () => new Date().toISOString().split("T")[0];

const HomeTab = () => {
  const { data, setActiveTab } = useApp();
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const todayStr = today();
  const todayWalks = data.walks.filter((w) => w.date === todayStr).length;
  const todayMeals = data.meals.filter((m) => m.date === todayStr).length;

  const copyCode = () => {
    navigator.clipboard.writeText(data.householdCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen pb-20 px-4 pt-safe">
      {/* Header */}
      <div className="flex justify-between items-center pt-4 mb-2">
        <div />
        <button onClick={() => setShowCode(!showCode)} className="p-2 rounded-full bg-card text-muted-foreground">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {showCode && (
        <div className="animate-fade-in-up bg-card rounded-xl p-4 mb-4 text-center space-y-2">
          <p className="text-sm text-muted-foreground">Kod gospodarstwa</p>
          <div className="text-2xl font-black tracking-[0.2em] text-primary">{data.householdCode}</div>
          <button onClick={copyCode} className="inline-flex items-center gap-1 text-sm text-primary font-semibold">
            <Copy className="w-4 h-4" /> {copied ? "Skopiowano!" : "Kopiuj kod"}
          </button>
        </div>
      )}

      {/* Dog hero */}
      <div className="flex justify-center mb-6 animate-pop-in">
        <img src={dogFull} alt="Piesek" className="w-36 h-36 animate-breathe" />
      </div>

      {/* Greeting */}
      <div className="text-center mb-6 animate-fade-in-up">
        <h1 className="text-2xl font-extrabold text-foreground">Cześć, {data.userName}! 🐾</h1>
        <p className="text-muted-foreground mt-1">Co robimy dziś z naszymi pieskami?</p>
      </div>

      {/* Today stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-card rounded-xl p-4 text-center animate-fade-in-up delay-100">
          <Footprints className="w-6 h-6 mx-auto text-primary mb-1" />
          <div className="text-2xl font-bold text-foreground">{todayWalks}</div>
          <div className="text-xs text-muted-foreground">Spacery dziś</div>
        </div>
        <div className="bg-card rounded-xl p-4 text-center animate-fade-in-up delay-200">
          <UtensilsCrossed className="w-6 h-6 mx-auto text-accent mb-1" />
          <div className="text-2xl font-bold text-foreground">{todayMeals}</div>
          <div className="text-xs text-muted-foreground">Posiłki dziś</div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="space-y-3">
        {[
          { tab: "walks" as const, icon: Footprints, label: "Zapisz spacer", color: "bg-primary/10 text-primary" },
          { tab: "food" as const, icon: UtensilsCrossed, label: "Zapisz posiłek", color: "bg-accent/10 text-accent" },
          { tab: "health" as const, icon: HeartPulse, label: "Zdrowie", color: "bg-destructive/10 text-destructive" },
          { tab: "dogs" as const, icon: Dog, label: `Pieski (${data.dogs.length})`, color: "bg-secondary text-secondary-foreground" },
        ].map(({ tab, icon: Icon, label, color }, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`w-full flex items-center gap-3 p-4 rounded-xl ${color} font-semibold text-left transition-all active:scale-[0.98] animate-fade-in-up`}
            style={{ animationDelay: `${(i + 2) * 100}ms` }}
          >
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomeTab;
