import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Plane, Search, AlertTriangle, FileText, Syringe, ClipboardList, Ban, Lightbulb, DoorOpen, ArrowLeft } from "lucide-react";
import { getCountriesSorted, getTravelInfo, type TravelInfo } from "@/data/travelData";

const NewTravelTab = () => {
  const { t, language } = useLanguage();
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [travelInfo, setTravelInfo] = useState<TravelInfo | null>(null);

  // Get countries sorted alphabetically in current language
  const sortedCountries = useMemo(() => getCountriesSorted(language), [language]);

  const filteredCountries = useMemo(() => 
    sortedCountries.filter(country =>
      country.toLowerCase().includes(searchQuery.toLowerCase())
    ), [sortedCountries, searchQuery]);

  const handleSelectCountry = (country: string) => {
    setSelectedCountry(country);
    setSearchQuery("");
    const info = getTravelInfo(country);
    setTravelInfo(info);
  };

  const handleBack = () => {
    setSelectedCountry("");
    setTravelInfo(null);
  };

  const sections = travelInfo ? [
    { icon: FileText, label: language === "pl" ? "Dokumenty" : "Documents", content: travelInfo.documents },
    { icon: Syringe, label: language === "pl" ? "Szczepienia" : "Vaccinations", content: travelInfo.vaccinations },
    { icon: ClipboardList, label: language === "pl" ? "Wymagania" : "Requirements", content: travelInfo.requirements },
    { icon: Ban, label: language === "pl" ? "Ograniczenia" : "Restrictions", content: travelInfo.restrictions },
    { icon: Lightbulb, label: language === "pl" ? "Zalecenia" : "Recommendations", content: travelInfo.recommendations },
    { icon: DoorOpen, label: language === "pl" ? "Procedura wjazdu" : "Entry Procedure", content: travelInfo.entryProcedure },
  ] : [];

  return (
    <div className="min-h-screen pb-24 px-4 pt-6" role="main" aria-label={t("travel")}>
      <div className="flex items-center gap-3 mb-6">
        <Plane className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">{t("travel")}</h1>
      </div>

      {/* AI Disclaimer */}
      <div className="bg-warn/10 border border-warn/30 rounded-xl p-4 mb-6 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-warn flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          {t("aiDisclaimer")}
        </p>
      </div>

      {!selectedCountry ? (
        <>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === "pl" ? "Szukaj kraju..." : "Search country..."}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Country count */}
          <p className="text-sm text-muted-foreground mb-3">
            {language === "pl" 
              ? `${filteredCountries.length} krajów` 
              : `${filteredCountries.length} countries`}
          </p>

          {/* Country list */}
          <div className="space-y-2 max-h-[60vh] overflow-y-auto" role="list" aria-label={language === "pl" ? "Lista krajów" : "Country list"}>
            {filteredCountries.map((country) => (
              <button
                key={country}
                onClick={() => handleSelectCountry(country)}
                className="w-full text-left p-4 bg-card rounded-xl hover:bg-secondary transition-colors flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary"
                role="listitem"
              >
                <span className="font-medium text-foreground">{country}</span>
                <Plane className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}

            {filteredCountries.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">
                {language === "pl" ? "Nie znaleziono kraju" : "No country found"}
              </p>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Back button and country name */}
          <button
            onClick={handleBack}
            className="mb-4 text-primary font-semibold flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary rounded p-2 -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
            {t("back")}
          </button>

          <div className="bg-card rounded-xl p-4 mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Plane className="w-5 h-5 text-primary" />
              {selectedCountry}
            </h2>
          </div>

          {/* Travel info sections */}
          {travelInfo && (
            <div className="space-y-3">
              {sections.map((section, idx) => (
                <div key={idx} className="bg-card rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <section.icon className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-foreground">{section.label}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NewTravelTab;
