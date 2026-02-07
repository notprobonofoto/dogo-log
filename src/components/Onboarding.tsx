import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import dogPaws from "@/assets/dog-paws.png";
import dogFull from "@/assets/dog-full.png";

const generateCode = () => String(Math.floor(100000 + Math.random() * 900000));

const Onboarding = () => {
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"create" | "join" | null>(null);
  const [code, setCode] = useState("");
  const [generatedCode] = useState(generateCode);

  const handleNext = () => {
    if (step === 0 && name.trim()) setStep(1);
    if (step === 1 && mode === "create") {
      completeOnboarding(name.trim(), generatedCode);
    }
    if (step === 1 && mode === "join" && code.length === 6) {
      completeOnboarding(name.trim(), code);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      {/* Animated Dog */}
      <div className="animate-pop-in mb-6">
        <img 
          src={dogPaws} 
          alt="DogoLog Piesek" 
          className="w-40 h-40 mx-auto animate-dog-bounce" 
        />
      </div>

      {step === 0 && (
        <div className="w-full max-w-sm animate-fade-in-up text-center space-y-6">
          <h1 className="text-2xl font-extrabold text-foreground">Witaj w DogoLog! 🐾</h1>
          <p className="text-muted-foreground">Jak masz na imię?</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Twoje imię..."
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
          <button
            onClick={handleNext}
            disabled={!name.trim()}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-lg disabled:opacity-40 transition-all active:scale-95"
          >
            Dalej →
          </button>
        </div>
      )}

      {step === 1 && !mode && (
        <div className="w-full max-w-sm animate-fade-in-up text-center space-y-4">
          <img src={dogFull} alt="Piesek" className="w-28 h-28 mx-auto animate-float" />
          <h2 className="text-xl font-bold text-foreground">Cześć, {name}! 👋</h2>
          <p className="text-muted-foreground text-sm">Co chcesz zrobić?</p>
          <button
            onClick={() => setMode("create")}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-lg transition-all active:scale-95"
          >
            ➕ Stwórz nowe gospodarstwo
          </button>
          <button
            onClick={() => setMode("join")}
            className="w-full py-3 rounded-lg bg-secondary text-secondary-foreground font-bold text-lg transition-all active:scale-95"
          >
            🔑 Dołącz do istniejącego
          </button>
        </div>
      )}

      {step === 1 && mode === "create" && (
        <div className="w-full max-w-sm animate-fade-in-up text-center space-y-4">
          <h2 className="text-xl font-bold text-foreground">Twój kod gospodarstwa</h2>
          <p className="text-muted-foreground text-sm">Udostępnij go domownikom, żeby mogli dołączyć</p>
          <div className="text-4xl font-black tracking-[0.3em] text-primary animate-pop-in bg-card rounded-xl py-4">
            {generatedCode}
          </div>
          <button
            onClick={handleNext}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-lg transition-all active:scale-95"
          >
            Zacznijmy! 🐶
          </button>
        </div>
      )}

      {step === 1 && mode === "join" && (
        <div className="w-full max-w-sm animate-fade-in-up text-center space-y-4">
          <h2 className="text-xl font-bold text-foreground">Dołącz do gospodarstwa</h2>
          <p className="text-muted-foreground text-sm">Wpisz 6-cyfrowy kod od domownika</p>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            className="w-full text-center text-3xl tracking-[0.3em] font-bold rounded-lg border border-border bg-card px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            maxLength={6}
            inputMode="numeric"
          />
          <button
            onClick={handleNext}
            disabled={code.length !== 6}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-lg disabled:opacity-40 transition-all active:scale-95"
          >
            Dołącz! 🐾
          </button>
          <button onClick={() => setMode(null)} className="text-sm text-muted-foreground underline">
            ← Wróć
          </button>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
