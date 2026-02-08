import { useState, useEffect } from "react";
import { useApp, Profile } from "@/contexts/AppContext";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/logo.png";
import LanguageSelector from "./LanguageSelector";
import { User, ChevronRight } from "lucide-react";

const LOCAL_STORAGE_KEY = "dogolog_auth";

const Onboarding = () => {
  const { createHousehold, joinHousehold, loginAsExistingMember, getHouseholdMembers } = useApp();
  const { t } = useLanguage();
  const [step, setStep] = useState<"choose" | "name" | "code" | "selectMember">("choose");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"create" | "join" | "login" | null>(null);
  const [code, setCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasLocalCode, setHasLocalCode] = useState(false);
  const [householdMembers, setHouseholdMembers] = useState<Profile[]>([]);
  const [validatedHouseholdId, setValidatedHouseholdId] = useState<string | null>(null);

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

  const handleValidateCode = async () => {
    if (code.length !== 6) return;
    
    setIsSubmitting(true);
    setErrorMessage("");
    
    const result = await getHouseholdMembers(code);
    
    if (result.success && result.members && result.householdId) {
      setHouseholdMembers(result.members);
      setValidatedHouseholdId(result.householdId);
      if (result.members.length > 0) {
        setStep("selectMember");
      } else {
        setErrorMessage(t("noMembersFound"));
      }
    } else {
      if (result.error === "invalidCode") {
        setErrorMessage(t("invalidCode"));
      } else {
        setErrorMessage(result.error || "Error validating code");
      }
    }
    
    setIsSubmitting(false);
  };

  const handleSelectMember = async (member: Profile) => {
    setIsSubmitting(true);
    setErrorMessage("");
    
    const result = await loginAsExistingMember(code, member.id, member.name);
    
    if (!result.success) {
      setErrorMessage(result.error || "Error logging in");
    }
    
    setIsSubmitting(false);
  };

  const selectMode = (selectedMode: "create" | "join" | "login") => {
    setMode(selectedMode);
    if (selectedMode === "login") {
      setStep("code");
    } else {
      setStep("name");
    }
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
    setHouseholdMembers([]);
    setValidatedHouseholdId(null);
  };

  const handleBackToCode = () => {
    setStep("code");
    setErrorMessage("");
    setHouseholdMembers([]);
    setValidatedHouseholdId(null);
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center px-6 bg-background"
      role="main"
      aria-label={t("welcomeTitle")}
    >
      {/* Logo */}
      <div className="animate-pop-in mb-8">
        <img 
          src={logo} 
          alt="DogoLog - aplikacja dla właścicieli psów" 
          className="w-40 h-auto mx-auto" 
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

      {/* STEP: Create household - enter name */}
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

      {/* Login again - STEP 1: enter code first */}
      {step === "code" && mode === "login" && (
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
            autoFocus
            aria-label={t("enterCode")}
          />
          
          {errorMessage && (
            <p className="text-destructive text-sm font-medium animate-shake" role="alert" aria-live="polite">
              {errorMessage}
            </p>
          )}
          
          <button
            onClick={handleValidateCode}
            disabled={code.length !== 6 || isSubmitting}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-lg disabled:opacity-40 transition-all active:scale-95 hover:scale-[1.02] animate-button-ready"
            aria-label={t("next")}
          >
            {isSubmitting ? "..." : t("next")}
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

      {/* Login again - STEP 2: select member from list */}
      {step === "selectMember" && mode === "login" && (
        <div className="w-full max-w-sm animate-fade-in-up text-center space-y-4">
          <h2 className="text-xl font-bold text-foreground">{t("selectMember")}</h2>
          <p className="text-muted-foreground text-sm">{t("selectMemberDesc")}</p>
          
          <div className="space-y-2">
            {householdMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => handleSelectMember(member)}
                disabled={isSubmitting}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary hover:bg-primary/5 transition-all active:scale-[0.98] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={`${t("continueAs")} ${member.name}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" aria-hidden="true" />
                  </div>
                  <span className="font-semibold text-foreground">{member.name}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
              </button>
            ))}
          </div>
          
          {errorMessage && (
            <p className="text-destructive text-sm font-medium animate-shake" role="alert" aria-live="polite">
              {errorMessage}
            </p>
          )}
          
          <button 
            onClick={handleBackToCode} 
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
