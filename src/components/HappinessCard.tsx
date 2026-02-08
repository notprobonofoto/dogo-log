import { useHappiness } from "@/hooks/useHappiness";
import { useApp } from "@/contexts/AppContext";
import { useLanguage } from "@/contexts/LanguageContext";
import DogAvatar from "./DogAvatar";

const HappinessCard = () => {
  const happiness = useHappiness();
  const { dogs } = useApp();
  const { t } = useLanguage();

  if (dogs.length === 0) return null;

  return (
    <div className="bg-card rounded-2xl p-4 mb-4 animate-fade-in-up">
      <h2 className="text-sm font-bold text-muted-foreground mb-3 text-center">
        {t("dogHappiness")}
      </h2>
      <div className="grid gap-3">
        {dogs.map((dog) => {
          const dogHappiness = happiness.find((h) => h.dogId === dog.id);
          if (!dogHappiness) return null;

          const { emoji, color, score } = dogHappiness;

          return (
            <div
              key={dog.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-background/50"
            >
              <DogAvatar dogId={dog.id} size="lg" />
              <div className="flex-1">
                <p className="font-bold text-foreground text-sm">{dog.name}</p>
                <div className="mt-1.5 relative h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${score}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
              <span className="text-2xl" role="img" aria-label="happiness">
                {emoji}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HappinessCard;
