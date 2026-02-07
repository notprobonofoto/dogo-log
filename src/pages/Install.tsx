import { useState, useEffect } from "react";
import { Download, Check, Smartphone, Share } from "lucide-react";
import logo from "@/assets/logo.png";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Listen for successful install
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <img src={logo} alt="DogoLog" className="w-32 h-auto mb-6 animate-fade-in-up" />
      
      {isInstalled ? (
        <div className="animate-pop-in space-y-4">
          <div className="w-16 h-16 mx-auto bg-success/20 rounded-full flex items-center justify-center">
            <Check className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Zainstalowano!</h1>
          <p className="text-muted-foreground">
            DogoLog jest już na Twoim urządzeniu. Możesz go teraz zamknąć i otworzyć z ekranu głównego.
          </p>
          <a href="/" className="inline-block mt-4 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl active:scale-95 transition-all">
            Otwórz aplikację
          </a>
        </div>
      ) : isIOS ? (
        <div className="space-y-4 animate-fade-in-up">
          <Smartphone className="w-12 h-12 mx-auto text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Zainstaluj DogoLog</h1>
          <p className="text-muted-foreground">
            Aby zainstalować aplikację na iPhone/iPad:
          </p>
          <div className="bg-card rounded-xl p-4 text-left space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">1</div>
              <p className="text-sm">Kliknij <Share className="w-4 h-4 inline text-primary" /> na dole przeglądarki</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">2</div>
              <p className="text-sm">Wybierz „Dodaj do ekranu początkowego"</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">3</div>
              <p className="text-sm">Kliknij „Dodaj" w prawym górnym rogu</p>
            </div>
          </div>
        </div>
      ) : deferredPrompt ? (
        <div className="space-y-4 animate-fade-in-up">
          <Download className="w-12 h-12 mx-auto text-primary animate-bounce" />
          <h1 className="text-2xl font-bold text-foreground">Zainstaluj DogoLog</h1>
          <p className="text-muted-foreground">
            Dodaj aplikację do ekranu głównego, aby mieć szybki dostęp do dziennika pieska.
          </p>
          <button
            onClick={handleInstall}
            className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl text-lg active:scale-95 transition-all"
          >
            Zainstaluj teraz
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in-up">
          <Smartphone className="w-12 h-12 mx-auto text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Zainstaluj DogoLog</h1>
          <p className="text-muted-foreground">
            Użyj menu przeglądarki, aby zainstalować aplikację na swoim urządzeniu.
          </p>
          <div className="bg-card rounded-xl p-4 text-sm text-muted-foreground">
            Szukaj opcji „Zainstaluj aplikację" lub „Dodaj do ekranu początkowego" w menu przeglądarki.
          </div>
          <a href="/" className="inline-block mt-4 px-6 py-3 bg-secondary text-secondary-foreground font-semibold rounded-xl active:scale-95 transition-all">
            Wróć do aplikacji
          </a>
        </div>
      )}
    </div>
  );
};

export default Install;
