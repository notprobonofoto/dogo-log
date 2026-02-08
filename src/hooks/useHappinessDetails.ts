import { useMemo } from "react";
import { useApp } from "@/contexts/AppContext";

export interface HappinessBreakdown {
  walks: { points: number; max: number; count: number };
  meals: { points: number; max: number; count: number };
  regularity: { points: number; max: number };
  accidents: { points: number; min: number; hasPee: boolean; hasPoop: boolean };
}

export interface HappinessDetails {
  dogId: string;
  dogName: string;
  totalScore: number;
  breakdown: HappinessBreakdown;
  gradientColor: string;
}

const today = () => new Date().toISOString().split("T")[0];

const getGradientColor = (score: number): string => {
  if (score >= 80) return "hsl(20, 60%, 40%)";  // ciemny brąz - szczęśliwy
  if (score >= 50) return "hsl(25, 55%, 55%)";  // karmelowy - zadowolony
  if (score >= 30) return "hsl(30, 45%, 70%)";  // piaskowy - neutralny
  return "hsl(35, 40%, 85%)";                    // jasny beż - smutny
};

export const useHappinessDetails = (): HappinessDetails[] => {
  const { dogs, walks, meals, homeAccidents } = useApp();

  return useMemo(() => {
    const todayStr = today();
    const currentHour = new Date().getHours();

    return dogs.map((dog) => {
      // === WALKS (max 40 points) ===
      const todayWalks = walks.filter(
        (w) => w.date === todayStr && w.dog_ids.includes(dog.id)
      );
      const walkCount = todayWalks.length;

      let walkPoints = 0;
      if (walkCount >= 3) {
        walkPoints = 40;
      } else if (walkCount === 2) {
        walkPoints = 30;
      } else if (walkCount === 1) {
        walkPoints = 15;
      } else if (currentHour >= 18) {
        walkPoints = -10;
      }

      // === WALK REGULARITY (max 20 points) ===
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split("T")[0];

      const recentWalks = walks.filter(
        (w) => w.date >= weekAgoStr && w.dog_ids.includes(dog.id)
      );

      let regularityPoints = 0;
      if (recentWalks.length >= 3) {
        const walkTimes = recentWalks.map((w) => {
          const [hours, minutes] = w.time.split(":").map(Number);
          return hours * 60 + minutes;
        });
        const avgTime = walkTimes.reduce((a, b) => a + b, 0) / walkTimes.length;

        const todayWalkTimes = todayWalks.map((w) => {
          const [hours, minutes] = w.time.split(":").map(Number);
          return hours * 60 + minutes;
        });

        if (todayWalkTimes.length > 0) {
          const closestDeviation = Math.min(
            ...todayWalkTimes.map((t) => Math.abs(t - avgTime))
          );

          if (closestDeviation <= 30) {
            regularityPoints = 20;
          } else if (closestDeviation <= 60) {
            regularityPoints = 10;
          }
        }
      }

      // === HOME ACCIDENTS (max -30 points) ===
      const todayAccidents = homeAccidents.filter(
        (a) => a.date === todayStr && a.dog_id === dog.id
      );

      const hasPee = todayAccidents.some((a) => a.type === "pee");
      const hasPoop = todayAccidents.some((a) => a.type === "poop");

      let accidentPoints = 0;
      if (hasPee && hasPoop) {
        accidentPoints = -30;
      } else if (hasPoop) {
        accidentPoints = -20;
      } else if (hasPee) {
        accidentPoints = -10;
      }

      // === FOOD (max 20 points) ===
      const todayMeals = meals.filter(
        (m) => m.date === todayStr && m.dog_id === dog.id
      );
      const mealCount = todayMeals.length;

      let mealPoints = 0;
      if (mealCount >= 2) {
        mealPoints = 20;
      } else if (mealCount === 1) {
        mealPoints = 10;
      } else if (currentHour >= 19) {
        mealPoints = -10;
      }

      // Calculate total score (base 50)
      const totalScore = Math.max(0, Math.min(100, 50 + walkPoints + regularityPoints + accidentPoints + mealPoints));

      return {
        dogId: dog.id,
        dogName: dog.name,
        totalScore,
        breakdown: {
          walks: { points: Math.max(0, walkPoints), max: 40, count: walkCount },
          meals: { points: Math.max(0, mealPoints), max: 20, count: mealCount },
          regularity: { points: regularityPoints, max: 20 },
          accidents: { points: accidentPoints, min: -30, hasPee, hasPoop },
        },
        gradientColor: getGradientColor(totalScore),
      };
    });
  }, [dogs, walks, meals, homeAccidents]);
};
