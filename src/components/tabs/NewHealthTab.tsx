import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Heart, Plus, Trash2, Stethoscope, Scissors, Syringe, Calendar, Scale, MoreHorizontal } from "lucide-react";
import DogAvatar from "@/components/DogAvatar";
import ConfirmDialog from "@/components/ConfirmDialog";
import type { HealthEvent } from "@/contexts/DataContext";

const today = () => new Date().toISOString().split("T")[0];

type HealthType = HealthEvent["type"];

const NewHealthTab = () => {
  const { dogs, healthEvents, addHealthEvent, removeHealthEvent } = useData();
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
    weterynarz: <Stethoscope className="w-5 h-5" />,
    groomer: <Scissors className="w-5 h-5" />,
    szczepienie: <Syringe className="w-5 h-5" />,
    cieczka_start: <Heart className="w-5 h-5 text-destructive" />,
    cieczka_koniec: <Heart className="w-5 h-5" />,
    waga: <Scale className="w-5 h-5" />,
    inne: <MoreHorizontal className="w-5 h-5" />,
  };

  const healthTypeLabels: Record<HealthType, string> = {
    weterynarz: t("vet"),
    groomer: t("groomer"),
    szczepienie: t("vaccination"),
    cieczka_start: t("heatStart"),
    cieczka_koniec: t("heatEnd"),
    waga: t("weight"),
    inne: t("other"),
  };

  const sortedEvents = [...healthEvents].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Events that need date picker (heat cycle)
  const needsDatePicker = eventType === "cieczka_start" || eventType === "cieczka_koniec";

  return (
    <div className="min-h-screen pb-24 px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t("health")}</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="p-3 rounded-full bg-destructive text-destructive-foreground active:scale-95 transition-all shadow-lg"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-xl p-4 mb-6 animate-fade-in-up space-y-4">
          {/* Dog selection - 2 per row */}
          <div className="grid grid-cols-2 gap-3">
            {dogs.map((dog) => (
              <button
                key={dog.id}
                onClick={() => setSelectedDog(dog.id)}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  selectedDog === dog.id ? "bg-destructive/20 ring-2 ring-destructive" : "bg-secondary"
                }`}
              >
                <DogAvatar dogId={dog.id} size="lg" />
                <span className="font-semibold text-foreground">{dog.name}</span>
              </button>
            ))}
          </div>

          {/* Event type - 2 per row */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">{t("eventType")}</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(healthTypeLabels) as HealthType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setEventType(type)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl font-semibold transition-all ${
                    eventType === type ? "bg-destructive text-destructive-foreground" : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {healthTypeIcons[type]}
                  <span className="text-sm">{healthTypeLabels[type]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">{t("date")}</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-destructive"
            />
          </div>

          {/* Weight input for weight type */}
          {eventType === "waga" && (
            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">{t("weight")} (kg)</label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="25.5"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-destructive"
              />
            </div>
          )}

          {/* Next visit for vet/groomer/vaccination */}
          {(eventType === "weterynarz" || eventType === "groomer" || eventType === "szczepienie") && (
            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">{t("nextVisit")}</label>
              <input
                type="date"
                value={nextVisit}
                onChange={(e) => setNextVisit(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-destructive"
              />
            </div>
          )}

          {/* Note */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">{t("note")}</label>
            <textarea
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
            className="w-full py-3 rounded-lg bg-destructive text-destructive-foreground font-bold disabled:opacity-50 active:scale-95 transition-all"
          >
            <Heart className="w-5 h-5 inline-block mr-2" />
            {t("addEvent")}
          </button>
        </div>
      )}

      {/* Health events list */}
      <div className="space-y-3">
        {sortedEvents.map((event) => (
          <div key={event.id} className="bg-card rounded-xl p-4 flex items-start gap-4 animate-fade-in-up">
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
                  <Calendar className="w-3 h-3" />
                  {t("nextVisit")}: {event.next_visit}
                </p>
              )}
            </div>

            <button
              onClick={() => setDeleteId(event.id)}
              className="p-2 rounded-lg bg-destructive/10 text-destructive flex-shrink-0"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}

        {sortedEvents.length === 0 && (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
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
