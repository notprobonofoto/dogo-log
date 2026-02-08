import { useLanguage, Language } from "@/contexts/LanguageContext";

const LanguageSelector = () => {
  const { language, setLanguage, t } = useLanguage();

  const languages: { code: Language; flag: string; name: string }[] = [
    { code: "pl", flag: "🇵🇱", name: "Polski" },
    { code: "en", flag: "🇬🇧", name: "English" },
  ];

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-muted-foreground">
        {t("language")}
      </label>
      <div className="flex gap-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
              language === lang.code
                ? "border-2 border-primary bg-transparent text-primary"
                : "bg-muted text-muted-foreground hover:bg-muted/80 border-2 border-transparent"
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span>{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
