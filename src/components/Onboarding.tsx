import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { useLanguage } from "@/contexts/LanguageContext";
import dogPaws from "@/assets/dog-paws.png";
import LanguageSelector from "./LanguageSelector";

const LOCAL_STORAGE_KEY = "dogolog_auth";

const Onboarding = () => {
  const { createHousehold, joinHousehold, loginWithCode } = useApp();
  const { t } = useLanguage();
  const [step, setStep] = useState<"choose" | "name">("choose");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"create" | "join" | "login" | null>(null);
  const [code, setCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasLocalCode, setHasLocalCode] = useState(false);

  // Check if there's a saved code in localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.householdCode) {
          setHasLocalCode(true);
        }
      }
    } catch {
      setHasLocalCode(false);
    }
  }, []);

  const handleCreateHousehold = async () => {
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    setErrorMessage("");
    
    const result = await createHousehold(name.trim());
    
    if (result.success && result.code) {
      setGeneratedCode(result.code);
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

  const selectMode = (selectedMode: "create" | "join" | "login") => {
    setMode(selectedMode);
    setStep("name");
    setErrorMessage("");
    setCode("");
  };

  const handleBackToChoose = () => {
    setStep("choose");
    setMode(null);
    setName("");
    setCode("");
    setErrorMessage("");
    setGeneratedCode("");
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center px-6 bg-background"
      role="main"
      aria-label={t("welcomeTitle")}
    >
      {/* Animated dog */}
      <div className="animate-pop-in mb-8">
        <img 
          src={dogPaws} 
          alt="DogoLog - aplikacja dla właścicieli psów" 
          className="w-32 h-32 mx-auto animate-dog-bounce" 
        />
      </div>

      {/* STEP 1: Choose mode (Create / Join / Login) */}
      {step === "choose" && (
        <div className="w-full max-w-sm animate-fade-in-up text-center space-y-4">
          <h1 className="text-2xl font-extrabold text-foreground">{t("welcomeTitle")}</h1>
          
          <div className="flex justify-center mb-4">
            <LanguageSelector />
          </div>
          
          <p className="text-muted-foreground text-sm">{t("whatToDo")}</p>
          
          <button
            onClick={() => selectMode("create")}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-lg transition-all active:scale-95 hover:scale-[1.02] animate-button-ready"
            aria-label={t("createHousehold")}
          >
            {t("createHousehold")}
          </button>
          
          <button
            onClick={() => selectMode("join")}
            className="w-full py-3 rounded-lg bg-secondary text-secondary-foreground font-bold text-lg transition-all active:scale-95 hover:scale-[1.02] animate-button-ready delay-100"
            aria-label={t("joinHousehold")}
          >
            {t("joinHousehold")}
          </button>
          
          <button
            onClick={() => selectMode("login")}
            className="w-full py-3 rounded-lg bg-accent text-accent-foreground font-bold text-lg transition-all active:scale-95 hover:scale-[1.02] animate-button-ready delay-200"
            aria-label={t("loginAgain")}
          >
            {t("loginAgain")}
          </button>
        </div>
      )}

      {/* STEP 2: Enter name and optionally code */}
      {step === "name" && mode === "create" && !generatedCode && (
        <div className="w-full max-w-sm animate-fade-in-up text-center space-y-4">
          <h2 className="text-xl font-bold text-foreground">{t("createHousehold")}</h2>
          <p className="text-muted-foreground text-sm">{t("ownerNamePlaceholder")}</p>
          
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("ownerNamePlaceholder")}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
            aria-label={t("ownerNamePlaceholder")}
          />
          
          {errorMessage && (
            <p className="text-destructive text-sm font-medium" role="alert" aria-live="polite">
              {errorMessage}
            </p>
          )}
          
          <button
            onClick={handleCreateHousehold}
            disabled={!name.trim() || isSubmitting}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-lg disabled:opacity-40 transition-all active:scale-95 hover:scale-[1.02] animate-button-ready"
            aria-label={t("createHousehold")}
          >
            {isSubmitting ? "..." : t("createHousehold")}
          </button>
          
          <button 
            onClick={handleBackToChoose} 
            className="text-sm text-muted-foreground underline"
            aria-label={t("back")}
          >
            {t("back")}
          </button>
        </div>
      )}

      {/* Created household - show code */}
      {step === "name" && mode === "create" && generatedCode && (
        <div className="w-full max-w-sm animate-fade-in-up text-center space-y-4">
          <h2 className="text-xl font-bold text-foreground">{t("yourHouseholdCode")}</h2>
          <p className="text-muted-foreground text-sm">{t("shareCode")}</p>
          <div 
            className="text-4xl font-black tracking-[0.3em] text-primary animate-pop-in bg-card rounded-xl py-4"
            aria-label={`Kod gospodarstwa: ${generatedCode}`}
            role="status"
          >
            {generatedCode}
          </div>
          <p className="text-muted-foreground text-xs" aria-live="polite">
            ✅ {t("letsStart")}
          </p>
        </div>
      )}

      {/* Join household - enter code and name */}
      {step === "name" && mode === "join" && (
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
            aria-label={t("enterCode")}
          />
          
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("ownerNamePlaceholder")}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={t("ownerNamePlaceholder")}
          />
          
          {errorMessage && (
            <p className="text-destructive text-sm font-medium animate-shake" role="alert" aria-live="polite">
              {errorMessage}
            </p>
          )}
          
          <button
            onClick={handleJoinHousehold}
            disabled={code.length !== 6 || !name.trim() || isSubmitting}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-lg disabled:opacity-40 transition-all active:scale-95 hover:scale-[1.02] animate-button-ready"
            aria-label={t("join")}
          >
            {isSubmitting ? "..." : t("join")}
          </button>
          
          <button 
            onClick={handleBackToChoose} 
            className="text-sm text-muted-foreground underline"
            aria-label={t("back")}
          >
            {t("back")}
          </button>
        </div>
      )}

      {/* Login again - enter code and name */}
      {step === "name" && mode === "login" && (
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
            aria-label={t("enterCode")}
          />
          
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("ownerNamePlaceholder")}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={t("ownerNamePlaceholder")}
          />
          
          {errorMessage && (
            <p className="text-destructive text-sm font-medium animate-shake" role="alert" aria-live="polite">
              {errorMessage}
            </p>
          )}
          
          <button
            onClick={handleLoginWithCode}
            disabled={code.length !== 6 || !name.trim() || isSubmitting}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-lg disabled:opacity-40 transition-all active:scale-95 hover:scale-[1.02] animate-button-ready"
            aria-label={t("login")}
          >
            {isSubmitting ? "..." : t("login")}
          </button>
          
          <button 
            onClick={handleBackToChoose} 
            className="text-sm text-muted-foreground underline"
            aria-label={t("back")}
          >
            {t("back")}
          </button>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
