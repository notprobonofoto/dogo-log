import { useState, useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar } from "@/components/ui/calendar";
import { PawPrint, Utensils, Heart, X, Trash2 } from "lucide-react";
import DogAvatar from "@/components/DogAvatar";
import ConfirmDialog from "@/components/ConfirmDialog";

type DeleteTarget = {
  type: "walk" | "meal" | "health";
  id: string;
} | null;

const NewCalendarTab = () => {
  const { dogs, walks, meals, healthEvents, removeWalk, removeMeal, removeHealthEvent } = useApp();
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  // Get all dates with events
  const eventDates = useMemo(() => {
    const dates: Record<string, { walks: number; meals: number; health: number }> = {};

    walks.forEach(w => {
      if (!dates[w.date]) dates[w.date] = { walks: 0, meals: 0, health: 0 };
      dates[w.date].walks++;
    });

    meals.forEach(m => {
      if (!dates[m.date]) dates[m.date] = { walks: 0, meals: 0, health: 0 };
      dates[m.date].meals++;
    });

    healthEvents.forEach(h => {
      if (!dates[h.date]) dates[h.date] = { walks: 0, meals: 0, health: 0 };
      dates[h.date].health++;
    });

    return dates;
  }, [walks, meals, healthEvents]);

  // Get events for selected date
  const selectedDateStr = selectedDate?.toISOString().split("T")[0];
  const dayWalks = selectedDateStr ? walks.filter(w => w.date === selectedDateStr) : [];
  const dayMeals = selectedDateStr ? meals.filter(m => m.date === selectedDateStr) : [];
  const dayHealth = selectedDateStr ? healthEvents.filter(h => h.date === selectedDateStr) : [];

  // All events sorted by time
  const allEvents = useMemo(() => {
    const events: Array<{ type: "walk" | "meal" | "health"; time: string; data: any }> = [];

    dayWalks.forEach(w => events.push({ type: "walk", time: w.time, data: w }));
    dayMeals.forEach(m => events.push({ type: "meal", time: m.time, data: m }));
    dayHealth.forEach(h => events.push({ type: "health", time: "00:00", data: h }));

    return events.sort((a, b) => a.time.localeCompare(b.time));
  }, [dayWalks, dayMeals, dayHealth]);

  const getDogName = (dogId: string) => {
    const dog = dogs.find(d => d.id === dogId);
    return dog?.name || "?";
  };

  const healthTypeLabels: Record<string, string> = {
    weterynarz: t("vet"),
    groomer: t("groomer"),
    szczepienie: t("vaccination"),
    cieczka_start: t("heatStart"),
    cieczka_koniec: t("heatEnd"),
    waga: t("weight"),
    inne: t("other"),
  };

  const mealTypeLabels: Record<string, string> = {
    dry: t("dryFood"),
    wet: t("wetFood"),
    mixed: t("mixedFood"),
    treat: t("treat"),
    other: t("other"),
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    switch (deleteTarget.type) {
      case "walk":
        await removeWalk(deleteTarget.id);
        break;
      case "meal":
        await removeMeal(deleteTarget.id);
        break;
      case "health":
        await removeHealthEvent(deleteTarget.id);
        break;
    }
    setDeleteTarget(null);
  };

  const getDeleteDialogTitle = () => {
    if (!deleteTarget) return "";
    switch (deleteTarget.type) {
      case "walk": return t("deleteWalk");
      case "meal": return t("deleteMeal");
      case "health": return t("deleteHealthEvent");
    }
  };

  const getDeleteDialogMessage = () => {
    if (!deleteTarget) return "";
    switch (deleteTarget.type) {
      case "walk": return t("deleteWalkConfirm");
      case "meal": return t("deleteMealConfirm");
      case "health": return t("deleteHealthConfirm");
    }
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-6" role="main" aria-label={t("calendar")}>
      <h1 className="text-2xl font-bold text-foreground mb-4 text-center">{t("calendar")}</h1>

      {/* Legend */}
      <div className="flex justify-center gap-4 mb-4 text-xs" role="list" aria-label="Legenda">
        <div className="flex items-center gap-1" role="listitem">
          <div className="w-3 h-3 rounded-full bg-primary" aria-hidden="true" />
          <span className="text-muted-foreground">{t("walks")}</span>
        </div>
        <div className="flex items-center gap-1" role="listitem">
          <div className="w-3 h-3 rounded-full bg-accent" aria-hidden="true" />
          <span className="text-muted-foreground">{t("meals")}</span>
        </div>
        <div className="flex items-center gap-1" role="listitem">
          <div className="w-3 h-3 rounded-full bg-destructive" aria-hidden="true" />
          <span className="text-muted-foreground">{t("health")}</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-card rounded-xl p-4 mb-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="w-full"
          modifiers={{
            hasEvents: (date) => {
              const dateStr = date.toISOString().split("T")[0];
              return !!eventDates[dateStr];
            },
          }}
          modifiersStyles={{
            hasEvents: {
              fontWeight: "bold",
            },
          }}
        />
      </div>

      {/* Selected day events */}
      {selectedDate && (
        <div className="bg-card rounded-2xl p-4 animate-fade-in-up aspect-square max-w-md mx-auto" role="region" aria-label={`Zdarzenia z dnia ${selectedDate.toLocaleDateString("pl-PL")}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">
              {selectedDate.toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" })}
            </h2>
            <button 
              onClick={() => setSelectedDate(undefined)} 
              className="p-1 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded"
              aria-label="Zamknij widok dnia"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {allEvents.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">{t("noEventsForDay")}</p>
          ) : (
            <div className="space-y-3" role="list" aria-label="Lista zdarzeń">
              {allEvents.map((event, idx) => (
                <div 
                  key={idx} 
                  className="flex items-start gap-3 p-3 bg-background rounded-lg"
                  role="listitem"
                >
                  {event.type === "walk" && (
                    <>
                      <div className="p-2 rounded-full bg-primary/20" aria-hidden="true">
                        <PawPrint className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {event.data.dog_ids.map((dogId: string) => (
                            <div key={dogId} className="flex items-center gap-1">
                              <DogAvatar dogId={dogId} size="sm" />
                              <span className="text-sm font-semibold text-foreground">{getDogName(dogId)}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {event.data.time} • {event.data.duration} min
                          {event.data.profile_name && ` • ${event.data.profile_name}`}
                        </p>
                      </div>
                      <button
                        onClick={() => setDeleteTarget({ type: "walk", id: event.data.id })}
                        className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                        aria-label={`${t("deleteWalk")}: ${event.data.time}`}
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </>
                  )}

                  {event.type === "meal" && (
                    <>
                      <div className="p-2 rounded-full bg-accent/20" aria-hidden="true">
                        <Utensils className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {event.data.dog_ids.map((dogId: string) => (
                            <div key={dogId} className="flex items-center gap-1">
                              <DogAvatar dogId={dogId} size="sm" />
                              <span className="text-sm font-semibold text-foreground">{getDogName(dogId)}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {event.data.time} • {mealTypeLabels[event.data.type]}
                          {event.data.profile_name && ` • ${event.data.profile_name}`}
                        </p>
                      </div>
                      <button
                        onClick={() => setDeleteTarget({ type: "meal", id: event.data.id })}
                        className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                        aria-label={`${t("deleteMeal")}: ${event.data.time}`}
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </>
                  )}

                  {event.type === "health" && (
                    <>
                      <div className="p-2 rounded-full bg-destructive/20" aria-hidden="true">
                        <Heart className="w-5 h-5 text-destructive" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <DogAvatar dogId={event.data.dog_id} size="sm" />
                          <span className="text-sm font-semibold text-foreground">{getDogName(event.data.dog_id)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {healthTypeLabels[event.data.type]}
                          {event.data.weight && ` • ${event.data.weight} kg`}
                        </p>
                        {event.data.note && (
                          <p className="text-xs text-muted-foreground mt-1">{event.data.note}</p>
                        )}
                      </div>
                      <button
                        onClick={() => setDeleteTarget({ type: "health", id: event.data.id })}
                        className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                        aria-label={`${t("deleteHealthEvent")}: ${healthTypeLabels[event.data.type]}`}
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={getDeleteDialogTitle()}
        message={getDeleteDialogMessage()}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default NewCalendarTab;
