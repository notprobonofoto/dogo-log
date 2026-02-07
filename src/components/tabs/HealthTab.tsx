import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import dogFull from "@/assets/dog-full.png";
import { Heart, Check, Trash2 } from "lucide-react";
import DogAvatar from "@/components/DogAvatar";
import ConfirmDialog from "@/components/ConfirmDialog";

const today = () => new Date().toISOString().split("T")[0];

const EVENT_TYPES = [
  { value: "weterynarz" as const, icon: "🩺" },
  { value: "groomer" as const, icon: "✂️" },
  { value: "szczepienie" as const, icon: "💉" },
  { value: "waga" as const, icon: "⚖️" },
  { value: "cieczka_start" as const, icon: "🔴" },
  { value: "cieczka_koniec" as const, icon: "🟢" },
  { value: "inne" as const, icon: "📝" },
];

const HealthTab = () => {
  const { data, addHealthEvent, removeHealthEvent } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [dogId, setDogId] = useState("");
  const [eventType, setEventType] = useState(EVENT_TYPES[0].value);
  const [note, setNote] = useState("");
  const [nextVisit, setNextVisit] = useState("");
  const [success, setSuccess] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!dogId) return;
    addHealthEvent({ dogId, date: today(), type: eventType, note: note || undefined, nextVisit: nextVisit || undefined });
    setSuccess(true);
    setTimeout(() => { setSuccess(false); setShowForm(false); setDogId(""); setNote(""); setNextVisit(""); }, 1500);
  };

  const upcoming = data.healthEvents.filter((h) => h.nextVisit && h.nextVisit >= today()).sort((a, b) => (a.nextVisit! > b.nextVisit! ? 1 : -1));
  const activeHeats = data.healthEvents.filter((h) => h.type === "cieczka_start" && !data.healthEvents.some((e) => e.type === "cieczka_koniec" && e.dogId === h.dogId && e.date > h.date));

  const getEventIcon = (type: string) => EVENT_TYPES.find((t) => t.value === type)?.icon || "📝";

  return (
    <div className="min-h-screen pb-20 px-4 pt-safe">
      <div className="flex items-center justify-center gap-3 pt-4 mb-2">
        <h1 className="text-xl font-extrabold text-foreground">Zdrowie</h1>
      </div>
      <div className="flex justify-center mb-4">
        <img src={dogFull} alt="" className="w-20 h-20 animate-float" />
      </div>

      {activeHeats.length > 0 && (
        <div className="bg-destructive/10 rounded-xl p-3 mb-4 animate-pulse-soft">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔴</span>
            <div>
              {activeHeats.map((h) => (
                <p key={h.id} className="text-sm text-foreground font-semibold">
                  <DogAvatar dogId={h.dogId} size="sm" className="inline-block mr-1" /> {h.date}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex flex-col items-center justify-center gap-1 py-3 rounded-xl bg-destructive/80 text-destructive-foreground font-bold text-lg transition-all active:scale-95 hover:scale-[1.02] animate-button-ready mb-4"
        >
          <Heart className="w-6 h-6" />
          <span className="text-xs">Nowe zdarzenie</span>
        </button>
      )}

      {showForm && (
        <div className="bg-card rounded-xl p-4 mb-4 space-y-4 animate-slide-up-bounce">
          {success ? (
            <div className="text-center py-8 animate-pop-in">
              <Check className="w-12 h-12 mx-auto text-success mb-2" />
              <p className="font-bold text-foreground">Zapisano! 💚</p>
            </div>
          ) : (
            <>
              <h3 className="font-bold text-foreground">Piesek</h3>
              {data.dogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Najpierw dodaj pieska</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data.dogs.map((dog) => (
                    <button key={dog.id} onClick={() => setDogId(dog.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-full font-semibold text-sm transition-all ${dogId === dog.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                      <DogAvatar dogId={dog.id} size="sm" />
                    </button>
                  ))}
                </div>
              )}
              <div>
                <label className="text-sm font-semibold text-foreground">Rodzaj</label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {EVENT_TYPES.map((t) => (
                    <button key={t.value} onClick={() => setEventType(t.value)}
                      className={`py-3 rounded-xl font-bold text-xl transition-all ${eventType === t.value ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                      title={t.value}>
                      {t.icon}
                    </button>
                  ))}
                </div>
              </div>
              <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Notatka"
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              {(eventType === "weterynarz" || eventType === "groomer" || eventType === "szczepienie") && (
                <div>
                  <label className="text-sm font-semibold text-foreground">📅 Następna</label>
                  <input type="date" value={nextVisit} onChange={(e) => setNextVisit(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-border bg-background px-4 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg bg-muted text-muted-foreground font-semibold">Anuluj</button>
                <button onClick={handleSubmit} disabled={!dogId} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground font-bold disabled:opacity-40">✓</button>
              </div>
            </>
          )}
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="space-y-2 mb-4">
          <h3 className="font-bold text-foreground text-sm">📅</h3>
          {upcoming.map((ev) => (
            <div key={ev.id} className="flex items-center justify-between bg-card rounded-xl p-3 animate-fade-in-up">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getEventIcon(ev.type)}</span>
                <DogAvatar dogId={ev.dogId} size="sm" />
                <span className="text-xs text-muted-foreground">{ev.nextVisit}</span>
              </div>
              <button onClick={() => setDeleteId(ev.id)} className="p-1 text-muted-foreground active:scale-95">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <h3 className="font-bold text-foreground text-sm">Historia</h3>
        {data.healthEvents.length === 0 && <p className="text-sm text-muted-foreground">Brak zdarzeń</p>}
        {data.healthEvents.slice(-10).reverse().map((ev, i) => (
          <div key={ev.id} className="flex items-center justify-between bg-card rounded-xl p-3 animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{getEventIcon(ev.type)}</span>
              <DogAvatar dogId={ev.dogId} size="sm" />
              <span className="text-xs text-muted-foreground">{ev.date}{ev.note ? ` · ${ev.note}` : ""}</span>
            </div>
            <button onClick={() => setDeleteId(ev.id)} className="p-1 text-muted-foreground active:scale-95">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Usuń zdarzenie?"
        message="Czy na pewno chcesz usunąć to zdarzenie zdrowotne?"
        onConfirm={() => { if (deleteId) { removeHealthEvent(deleteId); setDeleteId(null); } }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default HealthTab;
