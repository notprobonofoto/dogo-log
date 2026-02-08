import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import dogPaws from "@/assets/dog-paws.png";
import LanguageSelector from "@/components/LanguageSelector";
import { Mail, Lock, User, ArrowLeft, Home, UserPlus } from "lucide-react";

type AuthStep = "choice" | "login" | "register" | "household";
type HouseholdMode = "create" | "join" | null;

const Auth = () => {
  const { signIn, signUp, createHousehold, joinHousehold, user, profile } = useAuth();
  const { t } = useLanguage();

  const [step, setStep] = useState<AuthStep>("choice");
  const [householdMode, setHouseholdMode] = useState<HouseholdMode>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    const result = await signIn(email, password);
    if (result.error) {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleRegister = async () => {
    setError(null);
    setLoading(true);

    const result = await signUp(email, password, name);
    if (result.error) {
      setError(result.error);
    } else if (result.needsVerification) {
      setNeedsVerification(true);
    }

    setLoading(false);
  };

  const handleCreateHousehold = async () => {
    setError(null);
    setLoading(true);

    const result = await createHousehold(name);
    if (result.error) {
      setError(result.error);
    } else if (result.code) {
      setGeneratedCode(result.code);
    }

    setLoading(false);
  };

  const handleJoinHousehold = async () => {
    setError(null);
    setLoading(true);

    const result = await joinHousehold(code, name);
    if (result.error) {
      setError(result.error);
    }

    setLoading(false);
  };

  // If user is logged in but has no profile, show household setup
  if (user && !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
        <div className="animate-pop-in mb-8">
          <img src={dogPaws} alt="DogoLog" className="w-32 h-32 mx-auto animate-dog-bounce" />
        </div>

        {!householdMode && (
          <div className="w-full max-w-sm animate-fade-in-up text-center space-y-4">
            <h2 className="text-xl font-bold text-foreground">{t("hello")}, {name || email}! 👋</h2>
            <p className="text-muted-foreground text-sm">{t("whatToDo")}</p>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("ownerNamePlaceholder")}
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <button
              onClick={() => setHouseholdMode("create")}
              disabled={!name.trim()}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-lg transition-all active:scale-95 hover:scale-[1.02] disabled:opacity-50"
            >
              <Home className="inline-block w-5 h-5 mr-2" />
              {t("createHousehold")}
            </button>

            <button
              onClick={() => setHouseholdMode("join")}
              disabled={!name.trim()}
              className="w-full py-3 rounded-lg bg-secondary text-secondary-foreground font-bold text-lg transition-all active:scale-95 hover:scale-[1.02] disabled:opacity-50"
            >
              <UserPlus className="inline-block w-5 h-5 mr-2" />
              {t("joinHousehold")}
            </button>
          </div>
        )}

        {householdMode === "create" && !generatedCode && (
          <div className="w-full max-w-sm animate-fade-in-up text-center space-y-4">
            <h2 className="text-xl font-bold text-foreground">{t("createHousehold")}</h2>
            <p className="text-muted-foreground text-sm">{t("shareCode")}</p>

            {error && <p className="text-destructive text-sm">{error}</p>}

            <button
              onClick={handleCreateHousehold}
              disabled={loading}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-lg transition-all active:scale-95 hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? "..." : t("letsStart")}
            </button>

            <button onClick={() => setHouseholdMode(null)} className="text-sm text-muted-foreground underline">
              <ArrowLeft className="inline-block w-4 h-4 mr-1" />
              {t("back")}
            </button>
          </div>
        )}

        {householdMode === "create" && generatedCode && (
          <div className="w-full max-w-sm animate-fade-in-up text-center space-y-4">
            <h2 className="text-xl font-bold text-foreground">{t("yourHouseholdCode")}</h2>
            <p className="text-muted-foreground text-sm">{t("shareCode")}</p>
            <div className="text-4xl font-black tracking-[0.3em] text-primary animate-pop-in bg-card rounded-xl py-4">
              {generatedCode}
            </div>
            <p className="text-sm text-muted-foreground">{t("redirecting")}...</p>
          </div>
        )}

        {householdMode === "join" && (
          <div className="w-full max-w-sm animate-fade-in-up text-center space-y-4">
            <h2 className="text-xl font-bold text-foreground">{t("joinHouseholdTitle")}</h2>
            <p className="text-muted-foreground text-sm">{t("enterCode")}</p>

            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="w-full text-center text-3xl tracking-[0.3em] font-bold rounded-lg border border-border bg-card px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={6}
              inputMode="numeric"
            />

            {error && <p className="text-destructive text-sm">{error}</p>}

            <button
              onClick={handleJoinHousehold}
              disabled={code.length !== 6 || loading}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-lg disabled:opacity-40 transition-all active:scale-95 hover:scale-[1.02]"
            >
              {loading ? "..." : t("join")}
            </button>

            <button onClick={() => setHouseholdMode(null)} className="text-sm text-muted-foreground underline">
              <ArrowLeft className="inline-block w-4 h-4 mr-1" />
              {t("back")}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Email verification message
  if (needsVerification) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
        <div className="animate-pop-in mb-8">
          <img src={dogPaws} alt="DogoLog" className="w-32 h-32 mx-auto" />
        </div>
        <div className="w-full max-w-sm text-center space-y-4">
          <h2 className="text-xl font-bold text-foreground">📧 {t("checkEmail")}</h2>
          <p className="text-muted-foreground">{t("verifyEmailMessage")}</p>
          <button
            onClick={() => {
              setNeedsVerification(false);
              setStep("login");
            }}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold"
          >
            {t("login")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <div className="animate-pop-in mb-8">
        <img src={dogPaws} alt="DogoLog" className="w-32 h-32 mx-auto animate-dog-bounce" />
      </div>

      {step === "choice" && (
        <div className="w-full max-w-sm animate-fade-in-up text-center space-y-6">
          <h1 className="text-2xl font-extrabold text-foreground">{t("welcomeTitle")}</h1>

          <div className="flex justify-center mb-4">
            <LanguageSelector />
          </div>

          <button
            onClick={() => setStep("login")}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-lg transition-all active:scale-95 hover:scale-[1.02]"
          >
            <Lock className="inline-block w-5 h-5 mr-2" />
            {t("login")}
          </button>

          <button
            onClick={() => setStep("register")}
            className="w-full py-3 rounded-lg bg-secondary text-secondary-foreground font-bold text-lg transition-all active:scale-95 hover:scale-[1.02]"
          >
            <UserPlus className="inline-block w-5 h-5 mr-2" />
            {t("register")}
          </button>
        </div>
      )}

      {step === "login" && (
        <div className="w-full max-w-sm animate-fade-in-up text-center space-y-4">
          <h2 className="text-xl font-bold text-foreground">{t("login")}</h2>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("password")}
              className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={!email || !password || loading}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-lg disabled:opacity-40 transition-all active:scale-95 hover:scale-[1.02]"
          >
            {loading ? "..." : t("login")}
          </button>

          <button onClick={() => setStep("choice")} className="text-sm text-muted-foreground underline">
            <ArrowLeft className="inline-block w-4 h-4 mr-1" />
            {t("back")}
          </button>
        </div>
      )}

      {step === "register" && (
        <div className="w-full max-w-sm animate-fade-in-up text-center space-y-4">
          <h2 className="text-xl font-bold text-foreground">{t("register")}</h2>

          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("ownerNamePlaceholder")}
              className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("password")}
              className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <button
            onClick={handleRegister}
            disabled={!email || !password || !name || loading}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-lg disabled:opacity-40 transition-all active:scale-95 hover:scale-[1.02]"
          >
            {loading ? "..." : t("register")}
          </button>

          <button onClick={() => setStep("choice")} className="text-sm text-muted-foreground underline">
            <ArrowLeft className="inline-block w-4 h-4 mr-1" />
            {t("back")}
          </button>
        </div>
      )}
    </div>
  );
};

export default Auth;
