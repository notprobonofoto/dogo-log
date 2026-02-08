import { useApp } from "@/contexts/AppContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Settings, Copy, Check, LogOut, Globe, ArrowLeft, Users, Bell, BellOff, BellRing, AlertCircle, Send } from "lucide-react";
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
  const [testSending, setTestSending] = useState(false);

  const { 
    status: pushStatus, 
    isRegistering, 
    registerPush, 
    unsubscribePush, 
    sendTestPush,
    isSupported: pushSupported 
  } = usePushNotifications();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(householdCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    logout();
    setShowLogout(false);
  };

  const handleTestPush = async () => {
    setTestSending(true);
    await sendTestPush();
    setTestSending(false);
  };

  const getPushStatusText = () => {
    switch (pushStatus) {
      case 'enabled': return language === 'pl' ? 'Włączone' : 'Enabled';
      case 'disabled': return language === 'pl' ? 'Wyłączone' : 'Disabled';
      case 'denied': return language === 'pl' ? 'Zablokowane' : 'Blocked';
      case 'unsupported': return language === 'pl' ? 'Nieobsługiwane' : 'Unsupported';
      default: return language === 'pl' ? 'Ładowanie...' : 'Loading...';
    }
  };

  const getPushStatusIcon = () => {
    switch (pushStatus) {
      case 'enabled': return <BellRing className="w-5 h-5 text-primary" />;
      case 'denied': return <AlertCircle className="w-5 h-5 text-destructive" />;
      case 'unsupported': return <BellOff className="w-5 h-5 text-muted-foreground" />;
      default: return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
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
        {/* Push Notifications */}
        {pushSupported && (
          <div className="bg-card rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              {getPushStatusIcon()}
              {t("notifications")}
            </h3>
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Status:</span>
              <span className={`text-sm font-semibold ${
                pushStatus === 'enabled' ? 'text-primary' : 
                pushStatus === 'denied' ? 'text-destructive' : 'text-muted-foreground'
              }`}>
                {getPushStatusText()}
              </span>
            </div>

            {pushStatus === 'denied' && (
              <p className="text-xs text-muted-foreground mb-3 bg-destructive/10 rounded-lg p-2">
                {language === 'pl' 
                  ? 'Powiadomienia są zablokowane w przeglądarce. Aby je włączyć, przejdź do ustawień przeglądarki i odblokuj powiadomienia dla tej strony.'
                  : 'Notifications are blocked in browser. To enable them, go to browser settings and unblock notifications for this site.'}
              </p>
            )}

            <div className="flex gap-2">
              {pushStatus === 'disabled' && (
                <button
                  onClick={registerPush}
                  disabled={isRegistering}
                  className="flex-1 py-2 px-4 rounded-lg bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  {isRegistering 
                    ? (language === 'pl' ? 'Włączanie...' : 'Enabling...') 
                    : (language === 'pl' ? 'Włącz powiadomienia' : 'Enable notifications')}
                </button>
              )}

              {pushStatus === 'enabled' && (
                <>
                  <button
                    onClick={unsubscribePush}
                    className="flex-1 py-2 px-4 rounded-lg bg-secondary text-secondary-foreground font-semibold text-sm flex items-center justify-center gap-2"
                  >
                    <BellOff className="w-4 h-4" />
                    {language === 'pl' ? 'Wyłącz' : 'Disable'}
                  </button>
                  <button
                    onClick={handleTestPush}
                    disabled={testSending}
                    className="py-2 px-4 rounded-lg bg-accent text-accent-foreground font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {testSending ? '...' : 'Test'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

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
