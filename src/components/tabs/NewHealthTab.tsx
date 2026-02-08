import { useState } from "react";
import { useApp, type HealthEvent } from "@/contexts/AppContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Heart, Plus, Trash2, Stethoscope, Scissors, Syringe, Calendar, Scale, MoreHorizontal, Flower2 } from "lucide-react";
import DogAvatar from "@/components/DogAvatar";
import ConfirmDialog from "@/components/ConfirmDialog";

const today = () => new Date().toISOString().split("T")[0];

type HealthType = HealthEvent["type"];

// FIXED ORDER: 1. Weterynarz, 2. Szczepienie, 3. Groomer, 4. Waga, 5. Cieczka start, 6. Cieczka stop, 7. Inne
const HEALTH_TYPE_ORDER: HealthType[] = [
  "weterynarz",
  "szczepienie", 
  "groomer",
  "waga",
  "cieczka_start",
  "cieczka_koniec",
  "inne",
];

const NewHealthTab = () => {
  const { dogs, healthEvents, addHealthEvent, removeHealthEvent } = useApp();
  const { t } = useLanguage();

  const [showForm, setShowForm] = useState(false);
  const [selectedDog, setSelectedDog] = useState<string | null>(null);
  const [eventType, setEventType] = useState<HealthType>("weterynarz");
  const [date, setDate] = useState(today());
  const [note, setNote] = useState("");
  const [nextVisit, setNextVisit] = useState("");
  const [weight, setWeight] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!selectedDog) return;
    await addHealthEvent({
      dog_id: selectedDog,
      date,
      type: eventType,
      note: note.trim() || undefined,
      next_visit: nextVisit || undefined,
      weight: weight ? Number(weight) : undefined,
    });
    setSelectedDog(null);
    setEventType("weterynarz");
    setDate(today());
    setNote("");
    setNextVisit("");
    setWeight("");
    setShowForm(false);
  };

  const getDogName = (dogId: string) => {
    return dogs.find((d) => d.id === dogId)?.name || "?";
  };

  const healthTypeIcons: Record<HealthType, React.ReactNode> = {
    weterynarz: <Stethoscope className="w-5 h-5" aria-hidden="true" />,
    szczepienie: <Syringe className="w-5 h-5" aria-hidden="true" />,
    groomer: <Scissors className="w-5 h-5" aria-hidden="true" />,
    waga: <Scale className="w-5 h-5" aria-hidden="true" />,
    cieczka_start: <Flower2 className="w-5 h-5 text-destructive" aria-hidden="true" />,
    cieczka_koniec: <Flower2 className="w-5 h-5" aria-hidden="true" />,
    inne: <MoreHorizontal className="w-5 h-5" aria-hidden="true" />,
  };

  const healthTypeLabels: Record<HealthType, string> = {
    weterynarz: t("vet"),
    szczepienie: t("vaccination"),
    groomer: t("groomer"),
    waga: t("weight"),
    cieczka_start: t("heatStart"),
    cieczka_koniec: t("heatEnd"),
    inne: t("other"),
  };

  const sortedEvents = [...healthEvents].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen pb-24 px-4 pt-6" role="main" aria-label={t("health")}>
      <h1 className="text-2xl font-bold text-foreground text-center mb-4">{t("health")}</h1>
      
      {/* Centered add button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-destructive text-destructive-foreground active:scale-95 transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-semibold"
          aria-label={showForm ? t("cancel") : t("addEvent")}
          aria-expanded={showForm}
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
          {showForm ? t("cancel") : t("addEvent")}
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-xl p-4 mb-6 animate-fade-in-up space-y-4" role="form" aria-label={t("newEvent")}>
          {/* Dog selection - dynamic layout */}
          <fieldset>
            <legend className="sr-only">{t("dog")}</legend>
            {(() => {
              const hasLongNames = dogs.some(d => d.name.length > 8);
              const useSingleColumn = hasLongNames || dogs.length > 4;
              return (
                <div className={`grid gap-3 ${useSingleColumn ? 'grid-cols-1' : 'grid-cols-2'}`} role="radiogroup" aria-label={t("dog")}>
                  {dogs.map((dog) => (
                    <button
                      key={dog.id}
                      onClick={() => setSelectedDog(dog.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
                        selectedDog === dog.id 
                          ? "border-2 border-destructive bg-transparent" 
                          : "bg-secondary border-2 border-transparent"
                      }`}
                      role="radio"
                      aria-checked={selectedDog === dog.id}
                      aria-label={dog.name}
                    >
                      <DogAvatar dogId={dog.id} size="lg" className="flex-shrink-0" />
                      <span className="font-semibold text-foreground text-left">{dog.name}</span>
                    </button>
                  ))}
                </div>
              );
            })()}
          </fieldset>

          {/* Event type - FIXED ORDER - 2 per row */}
          <fieldset>
            <legend className="text-sm font-semibold text-foreground block mb-2">{t("eventType")}</legend>
            <div className="grid grid-cols-2 gap-2" role="radiogroup">
              {HEALTH_TYPE_ORDER.map((type) => (
                <button
                  key={type}
                  onClick={() => setEventType(type)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
                    eventType === type 
                      ? "border-2 border-destructive bg-transparent text-destructive" 
                      : "bg-secondary text-secondary-foreground border-2 border-transparent"
                  }`}
                  role="radio"
                  aria-checked={eventType === type}
                  aria-label={healthTypeLabels[type]}
                >
                  {healthTypeIcons[type]}
                  <span className="text-sm">{healthTypeLabels[type]}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* Date */}
          <div>
            <label htmlFor="health-date" className="text-sm font-semibold text-foreground block mb-2">{t("date")}</label>
            <input
              id="health-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-destructive"
            />
          </div>

          {/* Weight input for weight type */}
          {eventType === "waga" && (
            <div>
              <label htmlFor="weight-input" className="text-sm font-semibold text-foreground block mb-2">{t("weight")} (kg)</label>
              <input
                id="weight-input"
                type="number"
                step="0.01"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="25.50"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-destructive"
                aria-label={`${t("weight")} w kilogramach`}
              />
            </div>
          )}

          {/* Next visit for vet/groomer/vaccination */}
          {(eventType === "weterynarz" || eventType === "groomer" || eventType === "szczepienie") && (
            <div>
              <label htmlFor="next-visit" className="text-sm font-semibold text-foreground block mb-2">{t("nextVisit")}</label>
              <input
                id="next-visit"
                type="date"
                value={nextVisit}
                onChange={(e) => setNextVisit(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-destructive"
              />
            </div>
          )}

          {/* Note */}
          <div>
            <label htmlFor="health-note" className="text-sm font-semibold text-foreground block mb-2">{t("note")}</label>
            <textarea
              id="health-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("optionalNote")}
              rows={2}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-destructive resize-none"
            />
          </div>

          <button
            onClick={handleAdd}
            disabled={!selectedDog}
            className="w-full py-3 rounded-lg bg-destructive text-destructive-foreground font-bold disabled:opacity-50 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label={t("addEvent")}
          >
            <Heart className="w-5 h-5 inline-block mr-2" aria-hidden="true" />
            {t("addEvent")}
          </button>
        </div>
      )}

      {/* Health events list */}
      <div className="space-y-3" role="list" aria-label={t("health")}>
        {sortedEvents.map((event) => (
          <div 
            key={event.id} 
            className="bg-card rounded-xl p-4 flex items-start gap-4 animate-fade-in-up"
            role="listitem"
            aria-label={`${healthTypeLabels[event.type]}: ${getDogName(event.dog_id)} - ${event.date}`}
          >
            <DogAvatar dogId={event.dog_id} size="lg" />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {healthTypeIcons[event.type]}
                <span className="font-semibold text-foreground">{healthTypeLabels[event.type]}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {getDogName(event.dog_id)} • {event.date}
              </p>
              {event.weight && (
                <p className="text-sm text-primary font-semibold">{event.weight} kg</p>
              )}
              {event.note && (
                <p className="text-sm text-muted-foreground mt-1">{event.note}</p>
              )}
              {event.next_visit && (
                <p className="text-xs text-accent mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" aria-hidden="true" />
                  {t("nextVisit")}: {event.next_visit}
                </p>
              )}
            </div>

            <button
              onClick={() => setDeleteId(event.id)}
              className="p-2 rounded-lg bg-destructive/10 text-destructive flex-shrink-0 hover:bg-destructive/20 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label={`${t("deleteHealthEvent")}: ${healthTypeLabels[event.type]} - ${getDogName(event.dog_id)}`}
            >
              <Trash2 className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        ))}

        {sortedEvents.length === 0 && (
          <div className="text-center py-12" role="status">
            <Heart className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" aria-hidden="true" />
            <p className="text-muted-foreground">{t("noHealthEvents")}</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title={t("deleteEvent")}
        message={t("deleteEventConfirm")}
        onConfirm={async () => {
          if (deleteId) await removeHealthEvent(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default NewHealthTab;
