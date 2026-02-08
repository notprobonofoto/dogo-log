import { useApp } from "@/contexts/AppContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { PawPrint, Utensils, Stethoscope, Scissors } from "lucide-react";

const UserStatsCard = () => {
  const { householdMembers, walks, meals, healthEvents, profileId } = useApp();
  const { t } = useLanguage();

  // Get stats for last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

  const getStatsForProfile = (pId: string) => {
    const recentWalks = walks.filter(w => w.profile_id === pId && w.date >= sevenDaysAgoStr).length;
    const recentMeals = meals.filter(m => m.profile_id === pId && m.date >= sevenDaysAgoStr).length;
    const recentVet = healthEvents.filter(h => 
      h.date >= sevenDaysAgoStr && 
      (h.type === "weterynarz" || h.type === "szczepienie")
    ).length;
    const recentGroomer = healthEvents.filter(h => 
      h.date >= sevenDaysAgoStr && 
      h.type === "groomer"
    ).length;
    
    return { walks: recentWalks, meals: recentMeals, vet: recentVet, groomer: recentGroomer };
  };

  if (householdMembers.length === 0) return null;

  return (
    <div className="bg-card rounded-xl p-4 mb-4 animate-fade-in-up">
      <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        📊 {t("userStats")}
        <span className="text-xs font-normal text-muted-foreground">({t("thisWeek")})</span>
      </h3>
      
      <div className="space-y-3">
        {householdMembers.map((member) => {
          const stats = getStatsForProfile(member.id);
          const isCurrentUser = member.id === profileId;
          
          return (
            <div 
              key={member.id} 
              className={`flex items-center gap-3 p-2 rounded-lg ${
                isCurrentUser ? "bg-primary/10" : "bg-secondary/50"
              }`}
            >
              <div className="flex-1 min-w-0">
                <span className={`text-sm font-semibold truncate ${
                  isCurrentUser ? "text-primary" : "text-foreground"
                }`}>
                  {member.name}
                  {isCurrentUser && <span className="text-xs ml-1">(Ty)</span>}
                </span>
              </div>
              
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 text-muted-foreground" title={t("walks")}>
                  <PawPrint className="w-3.5 h-3.5" />
                  <span className="font-bold text-foreground">{stats.walks}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground" title={t("meals")}>
                  <Utensils className="w-3.5 h-3.5" />
                  <span className="font-bold text-foreground">{stats.meals}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground" title={t("vet")}>
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span className="font-bold text-foreground">{stats.vet}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground" title={t("groomer")}>
                  <Scissors className="w-3.5 h-3.5" />
                  <span className="font-bold text-foreground">{stats.groomer}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserStatsCard;
