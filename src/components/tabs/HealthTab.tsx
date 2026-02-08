import { useState } from "react";
import { useApp, HealthEvent } from "@/contexts/AppContext";
import { useLanguage } from "@/contexts/LanguageContext";
import dogFull from "@/assets/dog-full.png";
import { Heart, Check, Trash2 } from "lucide-react";
import DogAvatar from "@/components/DogAvatar";
import ConfirmDialog from "@/components/ConfirmDialog";

const today = () => new Date().toISOString().split("T")[0];

type EventType = HealthEvent["type"];

const HealthTab = () => {
  const { data, addHealthEvent, removeHealthEvent } = useApp();
  const { t } = useLanguage();
  
  const [showForm, setShowForm] = useState(false);
  const [dogId, setDogId] = useState("");
  const [eventType, setEventType] = useState<EventType>("weterynarz");
  const [note, setNote] = useState("");
  const [weight, setWeight] = useState("");
  const [eventDate, setEventDate] = useState(today());
  const [nextVisit, setNextVisit] = useState("");
  const [success, setSuccess] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const EVENT_TYPES: { value: EventType; icon: string; label: string }[] = [
    { value: "weterynarz", icon: "🩺", label: t("vet") },
    { value: "groomer", icon: "✂️", label: t("groomer") },
    { value: "szczepienie", icon: "💉", label: t("vaccination") },
    { value: "waga", icon: "⚖️", label: t("weight") },
    { value: "cieczka_start", icon: "🔴", label: t("heatStart") },
    { value: "cieczka_koniec", icon: "🟢", label: t("heatEnd") },
    { value: "inne", icon: "📝", label: t("otherEvent") },
  ];

  const handleSubmit = () => {
    if (!dogId) return;
    
    let finalNote = note;
    
    if (eventType === "waga" && weight) {
      finalNote = `${weight} kg${note ? ` · ${note}` : ""}`;
    }
    
    addHealthEvent({ 
      dogId, 
      date: eventDate, 
      type: eventType, 
      note: finalNote || undefined, 
      nextVisit: nextVisit || undefined 
    });
    
    setSuccess(true);
    setTimeout(() => { 
      setSuccess(false); 
      setShowForm(false); 
      setDogId(""); 
      setNote(""); 
      setWeight("");
      setEventDate(today());
      setNextVisit(""); 
    }, 1500);
  };

  const upcoming = data.healthEvents.filter((h) => h.nextVisit && h.nextVisit >= today()).sort((a, b) => (a.nextVisit! > b.nextVisit! ? 1 : -1));
  const activeHeats = data.healthEvents.filter((h) => h.type === "cieczka_start" && !data.healthEvents.some((e) => e.type === "cieczka_koniec" && e.dogId === h.dogId && e.date > h.date));

  const getEventIcon = (type: string) => EVENT_TYPES.find((et) => et.value === type)?.icon || "📝";

  return (
    <div className="min-h-screen pb-24 px-4 pt-safe">
      <div className="flex items-center justify-center gap-3 pt-4 mb-2">
        <h1 className="text-xl font-extrabold text-foreground">{t("healthTitle")}</h1>
      </div>
      <div className="flex justify-center mb-4">
        <img src={dogFull} alt="" className="w-24 h-24 animate-float" />
      </div>

      {activeHeats.length > 0 && (
        <div className="bg-destructive/10 rounded-xl p-3 mb-4 animate-pulse-soft">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔴</span>
            <div>
              {activeHeats.map((h) => {
                const dog = data.dogs.find(d => d.id === h.dogId);
                return (
                  <p key={h.id} className="text-sm text-foreground font-semibold flex items-center gap-2">
                    <DogAvatar dogId={h.dogId} size="sm" /> 
                    <span>{dog?.name}</span>
                    <span className="text-muted-foreground">· {h.date}</span>
                  </p>
                );
              })}
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
          <span className="text-xs">{t("newEvent")}</span>
        </button>
      )}

      {showForm && (
        <div className="bg-card rounded-xl p-4 mb-4 space-y-4 animate-slide-up-bounce">
          {success ? (
            <div className="text-center py-8 animate-pop-in">
              <Check className="w-12 h-12 mx-auto text-success mb-2" />
              <p className="font-bold text-foreground">{t("healthSaved")}</p>
            </div>
          ) : (
            <>
              <h3 className="font-bold text-foreground">{t("dog")}</h3>
              {data.dogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("addDogFirst")}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data.dogs.map((dog) => (
                    <button key={dog.id} onClick={() => setDogId(dog.id)}
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl font-semibold text-sm transition-all ${dogId === dog.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                      <DogAvatar dogId={dog.id} size="md" />
                      <span className="text-[10px]">{dog.name}</span>
                    </button>
                  ))}
                </div>
              )}
              <div>
                <label className="text-sm font-semibold text-foreground">{t("eventType")}</label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {EVENT_TYPES.map((et) => (
                    <button key={et.value} onClick={() => setEventType(et.value)}
                      className={`flex flex-col items-center py-2 rounded-xl font-bold transition-all ${eventType === et.value ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                      title={et.label}>
                      <span className="text-xl">{et.icon}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">{et.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {eventType === "waga" && (
                <div>
                  <label className="text-sm font-semibold text-foreground">⚖️ {t("weight")} (kg)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={weight} 
                    onChange={(e) => setWeight(e.target.value)} 
                    placeholder="np. 12.50"
                    className="w-full mt-1 rounded-lg border border-border bg-background px-4 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
                  />
                </div>
              )}
              
              {/* Date picker for all events (backdating) */}
              <div>
                <label className="text-sm font-semibold text-foreground">📅 {t("date")}</label>
                <input 
                  type="date" 
                  value={eventDate} 
                  max={today()}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full mt-1 rounded-lg border border-border bg-background px-4 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
                />
              </div>

              <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("noteOptional")}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              
              {(eventType === "weterynarz" || eventType === "groomer" || eventType === "szczepienie") && (
                <div>
                  <label className="text-sm font-semibold text-foreground">📅 {t("nextVisit")}</label>
                  <input type="date" value={nextVisit} onChange={(e) => setNextVisit(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-border bg-background px-4 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg bg-muted text-muted-foreground font-semibold">{t("cancel")}</button>
                <button onClick={handleSubmit} disabled={!dogId} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground font-bold disabled:opacity-40">✓</button>
              </div>
            </>
          )}
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="space-y-2 mb-4">
          <h3 className="font-bold text-foreground text-sm">📅 {t("upcoming")}</h3>
          {upcoming.map((ev) => {
            const dog = data.dogs.find(d => d.id === ev.dogId);
            return (
              <div key={ev.id} className="flex items-center justify-between bg-card rounded-xl p-3 animate-fade-in-up">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getEventIcon(ev.type)}</span>
                  <div className="flex flex-col items-center">
                    <DogAvatar dogId={ev.dogId} size="md" />
                    <span className="text-[10px] font-medium">{dog?.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{ev.nextVisit}</span>
                </div>
                <button onClick={() => setDeleteId(ev.id)} className="p-1 text-muted-foreground active:scale-95">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-2">
        <h3 className="font-bold text-foreground text-sm">{t("history")}</h3>
        {data.healthEvents.length === 0 && <p className="text-sm text-muted-foreground">{t("noEvents")}</p>}
        {data.healthEvents.slice(-10).reverse().map((ev, i) => {
          const dog = data.dogs.find(d => d.id === ev.dogId);
          return (
            <div key={ev.id} className="flex items-center justify-between bg-card rounded-xl p-3 animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{getEventIcon(ev.type)}</span>
                <div className="flex flex-col items-center">
                  <DogAvatar dogId={ev.dogId} size="md" />
                  <span className="text-[10px] font-medium">{dog?.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{ev.date}{ev.note ? ` · ${ev.note}` : ""}</span>
              </div>
              <button onClick={() => setDeleteId(ev.id)} className="p-1 text-muted-foreground active:scale-95">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title={t("deleteHealthEvent")}
        message={t("deleteHealthConfirm")}
        onConfirm={() => { if (deleteId) { removeHealthEvent(deleteId); setDeleteId(null); } }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default HealthTab;
