import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useLanguage } from "@/contexts/LanguageContext";
import dogPaws from "@/assets/dog-paws.png";
import LanguageSelector from "./LanguageSelector";

const Onboarding = () => {
  const { createHousehold, joinHousehold, loginWithCode } = useApp();
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"create" | "join" | "login" | null>(null);
  const [code, setCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCreateHousehold = async () => {
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    setErrorMessage("");
    
    const result = await createHousehold(name.trim());
    
    if (result.success && result.code) {
      setGeneratedCode(result.code);
      setMode("create");
    } else {
      setErrorMessage(result.error || "Error creating household");
    }
    
    setIsSubmitting(false);
  };

  const handleJoinHousehold = async () => {
    if (!name.trim() || code.length !== 6) return;
    
    setIsSubmitting(true);
    setErrorMessage("");
    
    const result = await joinHousehold(code, name.trim());
    
    if (!result.success) {
      if (result.error === "invalidCode") {
        setErrorMessage(t("invalidCode"));
      } else {
        setErrorMessage(result.error || "Error joining household");
      }
    }
    // If success, the context will update isOnboarded and redirect automatically
    
    setIsSubmitting(false);
  };

  const handleLoginWithCode = async () => {
    if (!name.trim() || code.length !== 6) return;
    
    setIsSubmitting(true);
    setErrorMessage("");
    
    const result = await loginWithCode(code, name.trim());
    
    if (!result.success) {
      if (result.error === "invalidCode") {
        setErrorMessage(t("invalidCode"));
      } else {
        setErrorMessage(result.error || "Error logging in");
      }
    }
    
    setIsSubmitting(false);
  };

  const handleNext = () => {
    if (step === 0 && name.trim()) setStep(1);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      {/* Single animated dog - sized for mobile */}
      <div className="animate-pop-in mb-8">
        <img 
          src={dogPaws} 
          alt="DogoLog Piesek" 
          className="w-32 h-32 mx-auto animate-dog-bounce" 
        />
      </div>

      {step === 0 && (
        <div className="w-full max-w-sm animate-fade-in-up text-center space-y-6">
          <h1 className="text-2xl font-extrabold text-foreground">{t("welcomeTitle")}</h1>
          
          <div className="flex justify-center mb-4">
            <LanguageSelector />
          </div>
          
          <p className="text-muted-foreground">{t("ownerNamePlaceholder")}</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("ownerNamePlaceholder")}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
          <button
            onClick={handleNext}
            disabled={!name.trim()}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-lg disabled:opacity-40 transition-all active:scale-95 hover:scale-[1.02] animate-button-ready"
          >
            {t("next")}
          </button>
        </div>
      )}

      {step === 1 && !mode && (
        <div className="w-full max-w-sm animate-fade-in-up text-center space-y-4">
          <h2 className="text-xl font-bold text-foreground">{t("hello")}, {name}! 👋</h2>
          <p className="text-muted-foreground text-sm">{t("whatToDo")}</p>
          <button
            onClick={handleCreateHousehold}
            disabled={isSubmitting}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-lg transition-all active:scale-95 hover:scale-[1.02] animate-button-ready disabled:opacity-40"
          >
            {isSubmitting ? "..." : t("createHousehold")}
          </button>
          <button
            onClick={() => setMode("join")}
            disabled={isSubmitting}
            className="w-full py-3 rounded-lg bg-secondary text-secondary-foreground font-bold text-lg transition-all active:scale-95 hover:scale-[1.02] animate-button-ready delay-100"
          >
            {t("joinHousehold")}
          </button>
          <button
            onClick={() => setMode("login")}
            disabled={isSubmitting}
            className="w-full py-3 rounded-lg bg-accent text-accent-foreground font-bold text-lg transition-all active:scale-95 hover:scale-[1.02] animate-button-ready delay-200"
          >
            {t("loginAgain")}
          </button>
          
          {errorMessage && (
            <p className="text-destructive text-sm font-medium">{errorMessage}</p>
          )}
        </div>
      )}

      {step === 1 && mode === "create" && generatedCode && (
        <div className="w-full max-w-sm animate-fade-in-up text-center space-y-4">
          <h2 className="text-xl font-bold text-foreground">{t("yourHouseholdCode")}</h2>
          <p className="text-muted-foreground text-sm">{t("shareCode")}</p>
          <div className="text-4xl font-black tracking-[0.3em] text-primary animate-pop-in bg-card rounded-xl py-4">
            {generatedCode}
          </div>
          <p className="text-muted-foreground text-xs">
            ✅ {t("letsStart")}
          </p>
        </div>
      )}

      {step === 1 && mode === "join" && (
        <div className="w-full max-w-sm animate-fade-in-up text-center space-y-4">
          <h2 className="text-xl font-bold text-foreground">{t("joinHouseholdTitle")}</h2>
          <p className="text-muted-foreground text-sm">{t("enterCode")}</p>
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
              setErrorMessage("");
            }}
            placeholder="000000"
            className="w-full text-center text-3xl tracking-[0.3em] font-bold rounded-lg border border-border bg-card px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            maxLength={6}
            inputMode="numeric"
          />
          
          {errorMessage && (
            <p className="text-destructive text-sm font-medium animate-shake">{errorMessage}</p>
          )}
          
          <button
            onClick={handleJoinHousehold}
            disabled={code.length !== 6 || isSubmitting}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-lg disabled:opacity-40 transition-all active:scale-95 hover:scale-[1.02] animate-button-ready"
          >
            {isSubmitting ? "..." : t("join")}
          </button>
          <button 
            onClick={() => { setMode(null); setErrorMessage(""); setCode(""); }} 
            className="text-sm text-muted-foreground underline"
          >
            {t("back")}
          </button>
        </div>
      )}

      {step === 1 && mode === "login" && (
        <div className="w-full max-w-sm animate-fade-in-up text-center space-y-4">
          <h2 className="text-xl font-bold text-foreground">{t("welcomeBack")}</h2>
          <p className="text-muted-foreground text-sm">{t("enterSavedCode")}</p>
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
              setErrorMessage("");
            }}
            placeholder="000000"
            className="w-full text-center text-3xl tracking-[0.3em] font-bold rounded-lg border border-border bg-card px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            maxLength={6}
            inputMode="numeric"
          />
          
          {errorMessage && (
            <p className="text-destructive text-sm font-medium animate-shake">{errorMessage}</p>
          )}
          
          <button
            onClick={handleLoginWithCode}
            disabled={code.length !== 6 || isSubmitting}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-lg disabled:opacity-40 transition-all active:scale-95 hover:scale-[1.02] animate-button-ready"
          >
            {isSubmitting ? "..." : t("login")}
          </button>
          <button 
            onClick={() => { setMode(null); setErrorMessage(""); setCode(""); }} 
            className="text-sm text-muted-foreground underline"
          >
            {t("back")}
          </button>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
