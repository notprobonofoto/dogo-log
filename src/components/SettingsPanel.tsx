import { useApp } from "@/contexts/AppContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Settings, Copy, Check, LogOut, Globe, ArrowLeft, Users } from "lucide-react";
import { useState } from "react";
import LogoutDialog from "@/components/LogoutDialog";
import HouseholdMembersPanel from "@/components/HouseholdMembersPanel";

interface SettingsPanelProps {
  onClose: () => void;
}

const SettingsPanel = ({ onClose }: SettingsPanelProps) => {
  const { householdCode, logout } = useApp();
  const { t, language, setLanguage } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(householdCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    logout();
    setShowLogout(false);
  };

  if (showMembers) {
    return (
      <div className="min-h-screen pb-24 px-4 pt-6" role="main" aria-label={t("householdMembers")}>
        <button
          onClick={() => setShowMembers(false)}
          className="mb-4 text-primary font-semibold flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary rounded p-2 -ml-2"
        >
          <ArrowLeft className="w-5 h-5" />
          {t("back")}
        </button>
        <HouseholdMembersPanel />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-4 pt-6" role="main" aria-label={t("settings")}>
      <button
        onClick={onClose}
        className="mb-4 text-primary font-semibold flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary rounded p-2 -ml-2"
      >
        <ArrowLeft className="w-5 h-5" />
        {t("back")}
      </button>

      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">{t("settings")}</h1>
      </div>

      <div className="space-y-4">
        {/* Household Code */}
        <div className="bg-card rounded-xl p-4">
          <h3 className="font-semibold text-foreground mb-3">{t("householdCode")}</h3>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-secondary rounded-lg px-4 py-3 font-mono text-lg text-center tracking-widest text-foreground">
              {householdCode}
            </div>
            <button
              onClick={handleCopy}
              className="p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label={t("copyCode")}
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          {copied && (
            <p className="text-sm text-primary mt-2 text-center">{t("copied")}</p>
          )}
        </div>

        {/* Household Members */}
        <button
          onClick={() => setShowMembers(true)}
          className="w-full bg-card rounded-xl p-4 flex items-center gap-4 hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <Users className="w-6 h-6 text-primary" />
          <span className="font-semibold text-foreground">{t("householdMembers")}</span>
        </button>

        {/* Language */}
        <div className="bg-card rounded-xl p-4">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            {t("language")}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setLanguage("pl")}
              className={`p-3 rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
                language === "pl" 
                  ? "border-2 border-primary bg-transparent text-primary" 
                  : "bg-secondary text-secondary-foreground border-2 border-transparent"
              }`}
            >
              🇵🇱 Polski
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`p-3 rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
                language === "en" 
                  ? "border-2 border-primary bg-transparent text-primary" 
                  : "bg-secondary text-secondary-foreground border-2 border-transparent"
              }`}
            >
              🇬🇧 English
            </button>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => setShowLogout(true)}
          className="w-full bg-destructive/10 rounded-xl p-4 flex items-center gap-4 hover:bg-destructive/20 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <LogOut className="w-6 h-6 text-destructive" />
          <span className="font-semibold text-destructive">{t("logout")}</span>
        </button>
      </div>

      <LogoutDialog
        open={showLogout}
        householdCode={householdCode}
        onConfirm={handleLogout}
        onCancel={() => setShowLogout(false)}
      />
    </div>
  );
};

export default SettingsPanel;
