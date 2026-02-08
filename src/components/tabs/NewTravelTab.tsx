import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Plane, Search, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

const COUNTRIES = [
  "Niemcy", "Francja", "Włochy", "Hiszpania", "Portugalia", "Holandia", "Belgia", "Austria",
  "Szwajcaria", "Czechy", "Słowacja", "Węgry", "Chorwacja", "Słowenia", "Grecja", "Turcja",
  "Wielka Brytania", "Irlandia", "Szwecja", "Norwegia", "Dania", "Finlandia", "Estonia",
  "Łotwa", "Litwa", "Rumunia", "Bułgaria", "Serbia", "Czarnogóra", "Albania", "Macedonia Północna",
  "Ukraina", "Mołdawia", "Rosja", "Białoruś",
  "Stany Zjednoczone", "Kanada", "Meksyk", "Brazylia", "Argentyna", "Chile", "Kolumbia", "Peru",
  "Australia", "Nowa Zelandia", "Japonia", "Korea Południowa", "Chiny", "Tajlandia", "Wietnam",
  "Indonezja", "Malezja", "Singapur", "Filipiny", "Indie", "Zjednoczone Emiraty Arabskie",
  "Egipt", "Maroko", "Tunezja", "RPA", "Kenia", "Tanzania"
];

const NewTravelTab = () => {
  const { t, language } = useLanguage();
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [travelInfo, setTravelInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredCountries = COUNTRIES.filter(country =>
    country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchTravelInfo = async (country: string) => {
    setLoading(true);
    setError(null);
    setTravelInfo(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("travel-info", {
        body: { country, language },
      });

      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);

      setTravelInfo(data.info);
    } catch (err) {
      console.error("Error fetching travel info:", err);
      setError(err instanceof Error ? err.message : "Wystąpił błąd");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCountry = (country: string) => {
    setSelectedCountry(country);
    setSearchQuery("");
    fetchTravelInfo(country);
  };

  const handleBack = () => {
    setSelectedCountry("");
    setTravelInfo(null);
    setError(null);
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-6" role="main" aria-label="Podróże">
      <div className="flex items-center gap-3 mb-6">
        <Plane className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">{language === "pl" ? "Podróże" : "Travel"}</h1>
      </div>

      {/* AI Disclaimer */}
      <div className="bg-warn/10 border border-warn/30 rounded-xl p-4 mb-6 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-warn flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          {language === "pl"
            ? "Informacje są generowane przez AI i mogą być nieaktualne. Zawsze sprawdź oficjalne źródła przed podróżą."
            : "Information is AI-generated and may be outdated. Always verify with official sources before traveling."}
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

          {/* Country list */}
          <div className="space-y-2" role="list" aria-label={language === "pl" ? "Lista krajów" : "Country list"}>
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
            className="mb-4 text-primary font-semibold flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary rounded"
          >
            ← {t("back")}
          </button>

          <div className="bg-card rounded-xl p-4 mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Plane className="w-5 h-5 text-primary" />
              {selectedCountry}
            </h2>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">
                {language === "pl" ? "Pobieranie informacji..." : "Loading information..."}
              </p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4">
              <p className="text-destructive font-medium">{error}</p>
              <button
                onClick={() => fetchTravelInfo(selectedCountry)}
                className="mt-3 text-sm text-primary underline"
              >
                {language === "pl" ? "Spróbuj ponownie" : "Try again"}
              </button>
            </div>
          )}

          {/* Travel info */}
          {travelInfo && (
            <div className="bg-card rounded-xl p-4 prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-lg font-bold text-foreground mb-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base font-bold text-foreground mt-4 mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-bold text-foreground mt-3 mb-1">{children}</h3>,
                  p: ({ children }) => <p className="text-sm text-muted-foreground mb-2">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside text-sm text-muted-foreground mb-2">{children}</ul>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
                }}
              >
                {travelInfo}
              </ReactMarkdown>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NewTravelTab;
