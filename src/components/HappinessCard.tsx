import { useState } from "react";
import { useHappinessDetails } from "@/hooks/useHappinessDetails";
import { useApp } from "@/contexts/AppContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PawPrint, Utensils, Clock, Home, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryBarProps {
  icon: React.ReactNode;
  label: string;
  points: number;
  max: number;
  isNegative?: boolean;
}

const CategoryBar = ({ icon, label, points, max, isNegative = false }: CategoryBarProps) => {
  const { t } = useLanguage();
  const percentage = isNegative
    ? Math.max(0, 100 + (points / Math.abs(max)) * 100)
    : (points / max) * 100;

  const displayPoints = isNegative && points < 0 ? points : `+${points}`;

  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="text-muted-foreground w-5 flex-shrink-0">{icon}</div>
      <span className="text-sm text-foreground w-24 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${Math.min(100, Math.max(0, percentage))}%`,
            backgroundColor: isNegative
              ? points < 0 ? "hsl(var(--destructive))" : "hsl(var(--happiness-ecstatic))"
              : "hsl(var(--happiness-ecstatic))",
          }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-16 text-right flex-shrink-0">
        {displayPoints} {t("points")}
      </span>
    </div>
  );
};

interface DogHappinessCardProps {
  dogId: string;
  dogName: string;
  totalScore: number;
  gradientColor: string;
  breakdown: {
    walks: { points: number; max: number; count: number };
    meals: { points: number; max: number; count: number };
    regularity: { points: number; max: number };
    accidents: { points: number; min: number; hasPee: boolean; hasPoop: boolean };
  };
}

const DogHappinessCard = ({
  dogName,
  totalScore,
  gradientColor,
  breakdown,
}: DogHappinessCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button className="w-full p-3 rounded-xl bg-background/50 text-left hover:bg-background/70 transition-colors group">
          <div className="flex items-center justify-between mb-2">
            <p className="font-bold text-foreground text-sm">{dogName}</p>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
          </div>
          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${totalScore}%`,
                backgroundColor: gradientColor,
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 text-center font-medium">
            {totalScore}%
          </p>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="px-3 pb-3 pt-2 space-y-1">
          <CategoryBar
            icon={<PawPrint className="h-4 w-4" />}
            label={t("walksCategory")}
            points={breakdown.walks.points}
            max={breakdown.walks.max}
          />
          <CategoryBar
            icon={<Utensils className="h-4 w-4" />}
            label={t("mealsCategory")}
            points={breakdown.meals.points}
            max={breakdown.meals.max}
          />
          <CategoryBar
            icon={<Clock className="h-4 w-4" />}
            label={t("regularityCategory")}
            points={breakdown.regularity.points}
            max={breakdown.regularity.max}
          />
          <CategoryBar
            icon={<Home className="h-4 w-4" />}
            label={t("accidentsCategory")}
            points={breakdown.accidents.points}
            max={Math.abs(breakdown.accidents.min)}
            isNegative
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

const HappinessCard = () => {
  const happinessDetails = useHappinessDetails();
  const { dogs } = useApp();
  const { t } = useLanguage();

  if (dogs.length === 0) return null;

  const gridCols = dogs.length === 1 ? "grid-cols-1" : "grid-cols-2";

  return (
    <div className="bg-card rounded-2xl p-4 mb-4 animate-fade-in-up">
      <h2 className="text-sm font-bold text-muted-foreground mb-3 text-center">
        {t("dogHappiness")}
      </h2>
      <div className={cn("grid gap-3", gridCols)}>
        {happinessDetails.map((details) => (
          <DogHappinessCard
            key={details.dogId}
            dogId={details.dogId}
            dogName={details.dogName}
            totalScore={details.totalScore}
            gradientColor={details.gradientColor}
            breakdown={details.breakdown}
          />
        ))}
      </div>
    </div>
  );
};

export default HappinessCard;
