import { useState } from "react";
import { useApp, WalkBusiness } from "@/contexts/AppContext";
import { useLanguage } from "@/contexts/LanguageContext";
import dogHead from "@/assets/dog-head.png";
import { PawPrint, Check, Trash2, Home, Clock } from "lucide-react";
import DogAvatar from "@/components/DogAvatar";
import ConfirmDialog from "@/components/ConfirmDialog";

const today = () => new Date().toISOString().split("T")[0];
const now = () => new Date().toTimeString().slice(0, 5);

const WalksTab = () => {
  const { data, addWalk, removeWalk, addHomeAccident, removeHomeAccident } = useApp();
  const { t } = useLanguage();
  
  const [showForm, setShowForm] = useState(false);
  const [selectedDogs, setSelectedDogs] = useState<string[]>([]);
  const [duration, setDuration] = useState(30);
  const [business, setBusiness] = useState<WalkBusiness>("none");
  const [walkDate, setWalkDate] = useState(today());
  const [walkTime, setWalkTime] = useState(now());
  const [success, setSuccess] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteAccidentId, setDeleteAccidentId] = useState<string | null>(null);
  const [showHomeAccident, setShowHomeAccident] = useState(false);
  const [accidentDog, setAccidentDog] = useState("");
  const [accidentType, setAccidentType] = useState<"pee" | "poop">("pee");
  const [paws, setPaws] = useState<number[]>([]);

  const BUSINESS_OPTIONS: { value: WalkBusiness; icon: string; label: string }[] = [
    { value: "pee", icon: "💧", label: t("pee") },
    { value: "poop", icon: "💩", label: t("poop") },
    { value: "both", icon: "✅", label: t("both") },
    { value: "none", icon: "🚫", label: t("nothing") },
  ];

  const toggleDog = (id: string) => {
    setSelectedDogs((prev) => prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]);
  };

  const handleSubmit = () => {
    if (!selectedDogs.length) return;
    addWalk({ dogIds: selectedDogs, date: walkDate, time: walkTime, duration, userId: data.userName, business });
    setSuccess(true);
    setPaws((p) => [...p, Date.now()]);
    setTimeout(() => { 
      setSuccess(false); 
      setShowForm(false); 
      setSelectedDogs([]); 
      setDuration(30); 
      setBusiness("none"); 
      setWalkDate(today());
      setWalkTime(now());
    }, 1500);
  };

  const handleHomeAccident = () => {
    if (!accidentDog) return;
    addHomeAccident({ dogId: accidentDog, date: today(), time: now(), type: accidentType });
    setShowHomeAccident(false);
    setAccidentDog("");
  };

  const todayWalks = data.walks.filter((w) => w.date === today());
  const todayAccidents = data.homeAccidents.filter((a) => a.date === today());

  return (
    <div className="min-h-screen pb-24 px-4 pt-safe relative overflow-hidden">
      {paws.map((key) => (
        <div key={key} className="absolute animate-paw-appear text-3xl" style={{ left: `${Math.random() * 70 + 10}%`, top: `${Math.random() * 40 + 20}%` }}>
          🐾
        </div>
      ))}

      <div className="flex items-center justify-center gap-3 pt-4 mb-2">
        <h1 className="text-xl font-extrabold text-foreground">{t("walksTitle")}</h1>
      </div>
      <div className="flex justify-center mb-4">
        <img src={dogHead} alt="" className="w-24 h-24 animate-wiggle" />
      </div>

      {!showForm && !showHomeAccident && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setShowForm(true)}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-base transition-all active:scale-95 hover:scale-[1.02] animate-button-ready"
          >
            <PawPrint className="w-6 h-6" />
            <span className="text-xs">{t("newWalk")}</span>
          </button>
          <button
            onClick={() => setShowHomeAccident(true)}
            className="flex flex-col items-center justify-center gap-1 py-3 px-4 rounded-xl bg-destructive/20 text-destructive font-bold text-base transition-all active:scale-95 hover:scale-[1.02] animate-button-ready"
            title={t("atHome")}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">{t("atHome")}</span>
          </button>
        </div>
      )}

      {showHomeAccident && (
        <div className="bg-card rounded-xl p-4 mb-4 space-y-4 animate-slide-up-bounce">
          <h3 className="font-bold text-foreground">{t("homeEvent")}</h3>
          {data.dogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("addDogFirst")}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.dogs.map((dog) => (
                <button
                  key={dog.id}
                  onClick={() => setAccidentDog(dog.id)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl font-semibold text-sm transition-all ${
                    accidentDog === dog.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <DogAvatar dogId={dog.id} size="md" />
                  <span className="text-[10px]">{dog.name}</span>
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => setAccidentType("pee")}
              className={`flex-1 py-3 rounded-xl font-bold text-xl transition-all ${accidentType === "pee" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
            >
              💧
            </button>
            <button
              onClick={() => setAccidentType("poop")}
              className={`flex-1 py-3 rounded-xl font-bold text-xl transition-all ${accidentType === "poop" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
            >
              💩
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowHomeAccident(false)} className="flex-1 py-2 rounded-lg bg-muted text-muted-foreground font-semibold">{t("cancel")}</button>
            <button onClick={handleHomeAccident} disabled={!accidentDog} className="flex-1 py-2 rounded-lg bg-destructive text-destructive-foreground font-bold disabled:opacity-40">{t("save")}</button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-card rounded-xl p-4 mb-4 space-y-4 animate-slide-up-bounce">
          {success ? (
            <div className="text-center py-8 animate-pop-in">
              <Check className="w-12 h-12 mx-auto text-success mb-2" />
              <p className="font-bold text-foreground">{t("walkSaved")}</p>
            </div>
          ) : (
            <>
              <h3 className="font-bold text-foreground">{t("whoWent")}</h3>
              {data.dogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("addDogFirst")}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data.dogs.map((dog) => (
                    <button
                      key={dog.id}
                      onClick={() => toggleDog(dog.id)}
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl font-semibold text-sm transition-all ${
                        selectedDogs.includes(dog.id) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      <DogAvatar dogId={dog.id} size="md" />
                      <span className="text-[10px]">{dog.name}</span>
                    </button>
                  ))}
                </div>
              )}
              
              <div>
                <label className="text-sm font-semibold text-foreground">{t("whatDidTheyDo")}</label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {BUSINESS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setBusiness(opt.value)}
                      className={`flex flex-col items-center py-2 rounded-xl font-bold transition-all ${
                        business === opt.value ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                      title={opt.label}
                    >
                      <span className="text-xl">{opt.icon}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">⏱️ {t("duration")}: {duration} {t("min")}</label>
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>5</span>
                  <span>30</span>
                  <span>60</span>
                  <span>90</span>
                  <span>120</span>
                </div>
              </div>

              {/* Date/Time for backdating */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-semibold text-foreground flex items-center gap-1">
                    📅 {t("date")}
                  </label>
                  <input
                    type="date"
                    value={walkDate}
                    max={today()}
                    onChange={(e) => setWalkDate(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-border bg-background px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {t("time")}
                  </label>
                  <input
                    type="time"
                    value={walkTime}
                    onChange={(e) => setWalkTime(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-border bg-background px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg bg-muted text-muted-foreground font-semibold">{t("cancel")}</button>
                <button onClick={handleSubmit} disabled={!selectedDogs.length} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground font-bold disabled:opacity-40">✓</button>
              </div>
            </>
          )}
        </div>
      )}

      <div className="space-y-2">
        <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
          <PawPrint className="w-4 h-4" /> {t("today")}: {todayWalks.length}
        </h3>
        {todayWalks.length === 0 && <p className="text-sm text-muted-foreground">{t("noWalks")}</p>}
        {todayWalks.map((walk, i) => (
          <div key={walk.id} className="flex items-center justify-between gap-3 bg-card rounded-xl p-3 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {walk.dogIds.map((id) => {
                  const dog = data.dogs.find(d => d.id === id);
                  return (
                    <div key={id} className="flex flex-col items-center">
                      <DogAvatar dogId={id} size="md" />
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{walk.duration}′</span>
                <span className="text-lg">
                  {walk.business === "pee" && "💧"}
                  {walk.business === "poop" && "💩"}
                  {walk.business === "both" && "💧💩"}
                  {walk.business === "none" && ""}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">{walk.time}</span>
            </div>
            <button onClick={() => setDeleteId(walk.id)} className="p-2 text-muted-foreground active:scale-95">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {todayAccidents.length > 0 && (
        <div className="space-y-2 mt-4">
          <h3 className="font-bold text-destructive text-sm flex items-center gap-2">
            🏠 {todayAccidents.length}
          </h3>
          {todayAccidents.map((acc, i) => {
            const dog = data.dogs.find(d => d.id === acc.dogId);
            return (
              <div key={acc.id} className="flex items-center justify-between gap-3 bg-destructive/10 rounded-xl p-3 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <DogAvatar dogId={acc.dogId} size="md" />
                    <span className="text-[10px] font-medium">{dog?.name}</span>
                  </div>
                  <span className="text-lg">{acc.type === "pee" ? "💧" : "💩"}</span>
                  <span className="text-xs text-muted-foreground">{acc.time}</span>
                </div>
                <button onClick={() => setDeleteAccidentId(acc.id)} className="p-2 text-muted-foreground active:scale-95">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title={t("deleteWalk")}
        message={t("deleteWalkConfirm")}
        onConfirm={() => { if (deleteId) { removeWalk(deleteId); setDeleteId(null); } }}
        onCancel={() => setDeleteId(null)}
      />

      <ConfirmDialog
        open={!!deleteAccidentId}
        title={t("deleteEvent")}
        message={t("deleteEventConfirm")}
        onConfirm={() => { if (deleteAccidentId) { removeHomeAccident(deleteAccidentId); setDeleteAccidentId(null); } }}
        onCancel={() => setDeleteAccidentId(null)}
      />
    </div>
  );
};

export default WalksTab;
