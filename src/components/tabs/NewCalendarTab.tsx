import { useState, useMemo } from "react";
import { useData } from "@/contexts/DataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar } from "@/components/ui/calendar";
import { PawPrint, Utensils, Heart, X, ChevronLeft } from "lucide-react";
import DogAvatar from "@/components/DogAvatar";

const NewCalendarTab = () => {
  const { dogs, walks, meals, healthEvents } = useData();
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

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

  // Custom day render with event indicators
  const renderDay = (day: Date) => {
    const dateStr = day.toISOString().split("T")[0];
    const dayEvents = eventDates[dateStr];

    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <span>{day.getDate()}</span>
        {dayEvents && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-0.5">
            {dayEvents.walks > 0 && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
            {dayEvents.meals > 0 && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
            {dayEvents.health > 0 && <div className="w-1.5 h-1.5 rounded-full bg-destructive" />}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-6">
      <h1 className="text-2xl font-bold text-foreground mb-4 text-center">{t("calendar")}</h1>

      {/* Legend */}
      <div className="flex justify-center gap-4 mb-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-muted-foreground">{t("walks")}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-accent" />
          <span className="text-muted-foreground">{t("meals")}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-destructive" />
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
        <div className="bg-card rounded-xl p-4 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">
              {selectedDate.toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" })}
            </h2>
            <button onClick={() => setSelectedDate(undefined)} className="p-1 text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          {allEvents.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">{t("noEventsForDay")}</p>
          ) : (
            <div className="space-y-3">
              {allEvents.map((event, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-background rounded-lg">
                  {event.type === "walk" && (
                    <>
                      <div className="p-2 rounded-full bg-primary/20">
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
                    </>
                  )}

                  {event.type === "meal" && (
                    <>
                      <div className="p-2 rounded-full bg-accent/20">
                        <Utensils className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <DogAvatar dogId={event.data.dog_id} size="sm" />
                          <span className="text-sm font-semibold text-foreground">{getDogName(event.data.dog_id)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {event.data.time} • {mealTypeLabels[event.data.type]}
                          {event.data.profile_name && ` • ${event.data.profile_name}`}
                        </p>
                      </div>
                    </>
                  )}

                  {event.type === "health" && (
                    <>
                      <div className="p-2 rounded-full bg-destructive/20">
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
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NewCalendarTab;
