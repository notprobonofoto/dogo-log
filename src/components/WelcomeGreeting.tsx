import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface WelcomeGreetingProps {
  onComplete: () => void;
}

const WelcomeGreeting = ({ onComplete }: WelcomeGreetingProps) => {
  const { data } = useApp();
  const { t } = useLanguage();
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setFadeOut(true);
    }, 1500);

    const timer2 = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background transition-all duration-500 ${
        fadeOut ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}
    >
      <div className="text-center animate-greeting">
        <h1 
          className="text-4xl font-black text-foreground"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          {t("greeting")}, {data.userName}! 
          <span className="inline-block animate-wave ml-2">👋</span>
        </h1>
      </div>
    </div>
  );
};

export default WelcomeGreeting;
