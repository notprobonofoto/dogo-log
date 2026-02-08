import { useMemo } from "react";
import { useApp } from "@/contexts/AppContext";

export interface DogHappiness {
  dogId: string;
  score: number;
  emoji: string;
  color: string;
}

const today = () => new Date().toISOString().split("T")[0];

export const useHappiness = (): DogHappiness[] => {
  const { dogs, walks, meals, homeAccidents } = useApp();
  
  return useMemo(() => {
    const todayStr = today();
    const currentHour = new Date().getHours();
    
    return dogs.map((dog) => {
      let score = 50; // Base score
      
      // === WALKS (max 40 points) ===
      const todayWalks = walks.filter(
        (w) => w.date === todayStr && w.dog_ids.includes(dog.id)
      );
      const walkCount = todayWalks.length;
      
      if (walkCount >= 3) {
        score += 40;
      } else if (walkCount === 2) {
        score += 30;
      } else if (walkCount === 1) {
        score += 15;
      } else if (currentHour >= 18) {
        // No walk by 6 PM penalty
        score -= 10;
      }
      
      // === WALK REGULARITY (max 20 points) ===
      // Get all walks for this dog in the past week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split("T")[0];
      
      const recentWalks = walks.filter(
        (w) => w.date >= weekAgoStr && w.dog_ids.includes(dog.id)
      );
      
      if (recentWalks.length >= 3) {
        // Calculate average walk time
        const walkTimes = recentWalks.map((w) => {
          const [hours, minutes] = w.time.split(":").map(Number);
          return hours * 60 + minutes;
        });
        const avgTime = walkTimes.reduce((a, b) => a + b, 0) / walkTimes.length;
        
        // Check today's walks regularity
        const todayWalkTimes = todayWalks.map((w) => {
          const [hours, minutes] = w.time.split(":").map(Number);
          return hours * 60 + minutes;
        });
        
        if (todayWalkTimes.length > 0) {
          const closestDeviation = Math.min(
            ...todayWalkTimes.map((t) => Math.abs(t - avgTime))
          );
          
          if (closestDeviation <= 30) {
            score += 20;
          } else if (closestDeviation <= 60) {
            score += 10;
          }
        }
      }
      
      // === HOME ACCIDENTS (max -30 points) ===
      const todayAccidents = homeAccidents.filter(
        (a) => a.date === todayStr && a.dog_id === dog.id
      );
      
      const hasPee = todayAccidents.some((a) => a.type === "pee");
      const hasPoop = todayAccidents.some((a) => a.type === "poop");
      
      if (hasPee && hasPoop) {
        score -= 30;
      } else if (hasPoop) {
        score -= 20;
      } else if (hasPee) {
        score -= 10;
      }
      
      // === FOOD (max 20 points) ===
      const todayMeals = meals.filter(
        (m) => m.date === todayStr && m.dog_ids.includes(dog.id)
      );
      const mealCount = todayMeals.length;
      
      if (mealCount >= 2) {
        score += 20;
      } else if (mealCount === 1) {
        score += 10;
      } else if (currentHour >= 19) {
        // No food by evening penalty
        score -= 10;
      }
      
      // Clamp score to 0-100
      score = Math.max(0, Math.min(100, score));
      
      // Determine emoji and color based on score
      let emoji: string;
      let color: string;
      
      if (score >= 80) {
        emoji = "😄";
        color = "hsl(var(--success))";
      } else if (score >= 50) {
        emoji = "🙂";
        color = "hsl(var(--primary))";
      } else if (score >= 30) {
        emoji = "😐";
        color = "hsl(var(--warning))";
      } else {
        emoji = "😞";
        color = "hsl(var(--destructive))";
      }
      
      return {
        dogId: dog.id,
        score,
        emoji,
        color,
      };
    });
  }, [dogs, walks, meals, homeAccidents]);
};
