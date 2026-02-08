import { useState, useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Users, Trash2, PawPrint, Utensils, Heart, Calendar } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";

interface MemberStats {
  walks: number;
  meals: number;
  healthEvents: number;
}

const HouseholdMembersPanel = () => {
  const { 
    householdMembers, 
    profileId, 
    walks, 
    meals, 
    healthEvents,
    removeMember 
  } = useApp();
  const { t } = useLanguage();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Calculate stats for each member (last 7 days)
  const memberStats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekAgoStr = weekAgo.toISOString().split("T")[0];

    const stats: Record<string, MemberStats> = {};

    householdMembers.forEach(member => {
      stats[member.id] = { walks: 0, meals: 0, healthEvents: 0 };
    });

    walks.forEach(w => {
      if (w.profile_id && w.date >= weekAgoStr && stats[w.profile_id]) {
        stats[w.profile_id].walks++;
      }
    });

    meals.forEach(m => {
      if (m.profile_id && m.date >= weekAgoStr && stats[m.profile_id]) {
        stats[m.profile_id].meals++;
      }
    });

    return stats;
  }, [householdMembers, walks, meals]);

  const handleDelete = async () => {
    if (deleteId && removeMember) {
      await removeMember(deleteId);
      setDeleteId(null);
    }
  };

  const memberToDelete = householdMembers.find(m => m.id === deleteId);

  return (
    <div className="space-y-3" role="region" aria-label={t("householdMembers")}>
      <div className="flex items-center gap-2 mb-2">
        <Users className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
        <span className="text-sm font-semibold text-foreground">{t("householdMembers")}</span>
      </div>

      <div className="space-y-2">
        {householdMembers.map((member) => {
          const stats = memberStats[member.id] || { walks: 0, meals: 0, healthEvents: 0 };
          const isCurrentUser = member.id === profileId;

          return (
            <div
              key={member.id}
              className={`p-3 rounded-xl transition-all ${
                isCurrentUser
                  ? "border-2 border-primary bg-primary/5"
                  : "bg-secondary"
              }`}
              role="listitem"
              aria-label={`${member.name}${isCurrentUser ? ` (${t("you")})` : ""}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground truncate">
                      {member.name}
                    </span>
                    {isCurrentUser && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                        {t("you")}
                      </span>
                    )}
                  </div>
                  
                  {/* Member stats */}
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1" aria-label={`${stats.walks} ${t("walks")}`}>
                      <PawPrint className="w-3 h-3" aria-hidden="true" />
                      {stats.walks}
                    </span>
                    <span className="flex items-center gap-1" aria-label={`${stats.meals} ${t("meals")}`}>
                      <Utensils className="w-3 h-3" aria-hidden="true" />
                      {stats.meals}
                    </span>
                  </div>
                </div>

                {/* Delete button - only show for other members, not current user */}
                {!isCurrentUser && removeMember && (
                  <button
                    onClick={() => setDeleteId(member.id)}
                    className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                    aria-label={`${t("removeMember")}: ${member.name}`}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title={t("removeMember")}
        message={`${t("removeMemberConfirm")} ${memberToDelete?.name}?`}
        confirmLabel={t("delete")}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default HouseholdMembersPanel;
