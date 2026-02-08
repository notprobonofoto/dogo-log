import { useState } from "react";
import { useApp, type WalkBusiness, type HomeAccident } from "@/contexts/AppContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { PawPrint, Plus, Trash2, Droplet, Circle, Home, AlertTriangle } from "lucide-react";
import DogAvatar from "@/components/DogAvatar";
import ConfirmDialog from "@/components/ConfirmDialog";

const today = () => new Date().toISOString().split("T")[0];
const now = () => new Date().toTimeString().slice(0, 5);

type FormMode = "walk" | "home";

const NewWalksTab = () => {
  const { dogs, walks, homeAccidents, addWalk, removeWalk, addHomeAccident, removeHomeAccident } = useApp();
  const { t } = useLanguage();

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("walk");
  const [selectedDogs, setSelectedDogs] = useState<string[]>([]);
  const [duration, setDuration] = useState(15);
  const [business, setBusiness] = useState<WalkBusiness>("none");
  const [homeAccidentType, setHomeAccidentType] = useState<HomeAccident>("pee");
  const [date, setDate] = useState(today());
  const [time, setTime] = useState(now());
  const [poopNote, setPoopNote] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteHomeId, setDeleteHomeId] = useState<string | null>(null);

  const toggleDog = (id: string) => {
    setSelectedDogs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAddWalk = async () => {
    if (selectedDogs.length === 0) return;
    await addWalk({ 
      dogIds: selectedDogs, 
      date, 
      time, 
      duration, 
      business,
      note: (business === "poop" || business === "both") && poopNote.trim() ? poopNote.trim() : undefined
    });
    resetForm();
  };

  const handleAddHomeAccident = async () => {
    if (selectedDogs.length === 0) return;
    for (const dogId of selectedDogs) {
      await addHomeAccident({
        dog_id: dogId,
        date,
        time,
        type: homeAccidentType,
      });
    }
    resetForm();
  };

  const resetForm = () => {
    setSelectedDogs([]);
    setDuration(15);
    setBusiness("none");
    setHomeAccidentType("pee");
    setDate(today());
    setTime(now());
    setPoopNote("");
    setShowForm(false);
    setFormMode("walk");
  };

  const todayStr = today();
  const todayWalks = walks.filter((w) => w.date === todayStr).sort((a, b) => b.time.localeCompare(a.time));
  const todayHomeAccidents = homeAccidents.filter((a) => a.date === todayStr).sort((a, b) => b.time.localeCompare(a.time));

  const getDogName = (dogId: string) => {
    return dogs.find((d) => d.id === dogId)?.name || "?";
  };

  // BUSINESS ORDER: 1. Siku, 2. Kupa, 3. Oba, 4. Nic
  const businessOptions: { value: WalkBusiness; icon: React.ReactNode; label: string }[] = [
    { value: "pee", icon: <Droplet className="w-4 h-4 text-warn" aria-hidden="true" />, label: t("pee") },
    { value: "poop", icon: <Circle className="w-4 h-4 text-primary fill-primary" aria-hidden="true" />, label: t("poop") },
    { value: "both", icon: <><Droplet className="w-3 h-3 text-warn" aria-hidden="true" /><Circle className="w-3 h-3 text-primary fill-primary" aria-hidden="true" /></>, label: t("both") },
    { value: "none", icon: null, label: t("noBusiness") },
  ];

  const businessIcons: Record<WalkBusiness, React.ReactNode> = {
    pee: <Droplet className="w-4 h-4 text-warn" aria-hidden="true" />,
    poop: <Circle className="w-4 h-4 text-primary fill-primary" aria-hidden="true" />,
    both: (
      <div className="flex gap-0.5">
        <Droplet className="w-3 h-3 text-warn" aria-hidden="true" />
        <Circle className="w-3 h-3 text-primary fill-primary" aria-hidden="true" />
      </div>
    ),
    none: null,
  };

  const homeAccidentIcons: Record<HomeAccident, React.ReactNode> = {
    pee: <Droplet className="w-4 h-4 text-warn" aria-hidden="true" />,
    poop: <Circle className="w-4 h-4 text-primary fill-primary" aria-hidden="true" />,
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-6" role="main" aria-label={t("walks")}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t("walks")}</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="p-3 rounded-full bg-primary text-primary-foreground active:scale-95 transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label={showForm ? t("cancel") : t("addWalk")}
          aria-expanded={showForm}
        >
          <Plus className="w-6 h-6" aria-hidden="true" />
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-xl p-4 mb-6 animate-fade-in-up space-y-4" role="form" aria-label={t("newWalk")}>
          {/* Mode toggle: Walk vs Home event */}
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Tryb">
            <button
              onClick={() => setFormMode("walk")}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
                formMode === "walk"
                  ? "border-2 border-primary bg-transparent text-primary"
                  : "bg-secondary text-secondary-foreground border-2 border-transparent"
              }`}
              role="radio"
              aria-checked={formMode === "walk"}
              aria-label={t("walks")}
            >
              <PawPrint className="w-5 h-5" aria-hidden="true" />
              <span>{t("walks")}</span>
            </button>
            <button
              onClick={() => setFormMode("home")}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
                formMode === "home"
                  ? "border-2 border-destructive bg-transparent text-destructive"
                  : "bg-secondary text-secondary-foreground border-2 border-transparent"
              }`}
              role="radio"
              aria-checked={formMode === "home"}
              aria-label={t("atHome")}
            >
              <Home className="w-5 h-5" aria-hidden="true" />
              <span>{t("atHome")}</span>
            </button>
          </div>

          {/* Dog selection - 2 per row */}
          <fieldset>
            <legend className="sr-only">{t("whoWent")}</legend>
            <div className="grid grid-cols-2 gap-3" role="group" aria-label={t("whoWent")}>
              {dogs.map((dog) => (
                <button
                  key={dog.id}
                  onClick={() => toggleDog(dog.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
                    selectedDogs.includes(dog.id)
                      ? "border-2 border-primary bg-transparent"
                      : "bg-secondary border-2 border-transparent"
                  }`}
                  role="checkbox"
                  aria-checked={selectedDogs.includes(dog.id)}
                  aria-label={dog.name}
                >
                  <DogAvatar dogId={dog.id} size="lg" />
                  <span className="font-semibold text-foreground">{dog.name}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* Date & Time */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label htmlFor="walk-date" className="sr-only">{t("date")}</label>
              <input
                id="walk-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={t("date")}
              />
            </div>
            <div className="flex-1">
              <label htmlFor="walk-time" className="sr-only">{t("time")}</label>
              <input
                id="walk-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={t("time")}
              />
            </div>
          </div>

          {formMode === "walk" && (
            <>
              {/* Duration slider */}
              <div>
                <label htmlFor="duration-slider" className="text-sm font-semibold text-foreground block mb-2">
                  {t("duration")}: {duration} min
                </label>
                <input
                  id="duration-slider"
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-primary"
                  aria-valuemin={5}
                  aria-valuemax={120}
                  aria-valuenow={duration}
                  aria-valuetext={`${duration} minut`}
                />
              </div>

              {/* Business buttons - FIXED ORDER: Siku, Kupa, Oba, Nic */}
              <fieldset>
                <legend className="text-sm font-semibold text-foreground block mb-2">{t("business")}</legend>
                <div className="grid grid-cols-2 gap-2" role="radiogroup">
                  {businessOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setBusiness(opt.value)}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
                        business === opt.value 
                          ? "border-2 border-primary bg-transparent text-primary" 
                          : "bg-secondary text-secondary-foreground border-2 border-transparent"
                      }`}
                      role="radio"
                      aria-checked={business === opt.value}
                      aria-label={opt.label}
                    >
                      <div className="flex items-center gap-1">{opt.icon}</div>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Poop note - shown for poop or both */}
              {(business === "poop" || business === "both") && (
                <div>
                  <label htmlFor="poop-note" className="text-sm font-semibold text-foreground block mb-2">
                    {t("optionalNote")}
                  </label>
                  <input
                    id="poop-note"
                    type="text"
                    value={poopNote}
                    onChange={(e) => setPoopNote(e.target.value)}
                    placeholder={t("poopNotePlaceholder")}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              <button
                onClick={handleAddWalk}
                disabled={selectedDogs.length === 0}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold disabled:opacity-50 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label={t("addWalk")}
              >
                <PawPrint className="w-5 h-5 inline-block mr-2" aria-hidden="true" />
                {t("addWalk")}
              </button>
            </>
          )}

          {formMode === "home" && (
            <>
              {/* Home accident type - Siku or Kupa only */}
              <fieldset>
                <legend className="text-sm font-semibold text-foreground block mb-2">{t("homeEvent")}</legend>
                <div className="grid grid-cols-2 gap-2" role="radiogroup">
                  <button
                    onClick={() => setHomeAccidentType("pee")}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
                      homeAccidentType === "pee"
                        ? "border-2 border-destructive bg-transparent text-destructive"
                        : "bg-secondary text-secondary-foreground border-2 border-transparent"
                    }`}
                    role="radio"
                    aria-checked={homeAccidentType === "pee"}
                    aria-label={`${t("pee")} w domu`}
                  >
                    <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                    <Droplet className="w-4 h-4 text-warn" aria-hidden="true" />
                    <span>{t("pee")}</span>
                  </button>
                  <button
                    onClick={() => setHomeAccidentType("poop")}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
                      homeAccidentType === "poop"
                        ? "border-2 border-destructive bg-transparent text-destructive"
                        : "bg-secondary text-secondary-foreground border-2 border-transparent"
                    }`}
                    role="radio"
                    aria-checked={homeAccidentType === "poop"}
                    aria-label={`${t("poop")} w domu`}
                  >
                    <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                    <Circle className="w-4 h-4 text-primary fill-primary" aria-hidden="true" />
                    <span>{t("poop")}</span>
                  </button>
                </div>
              </fieldset>

              <button
                onClick={handleAddHomeAccident}
                disabled={selectedDogs.length === 0}
                className="w-full py-3 rounded-lg bg-destructive text-destructive-foreground font-bold disabled:opacity-50 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label={t("addHomeEvent")}
              >
                <Home className="w-5 h-5 inline-block mr-2" aria-hidden="true" />
                {t("addHomeEvent")}
              </button>
            </>
          )}
        </div>
      )}

      {/* Today's walks */}
      <div className="space-y-3" role="list" aria-label={t("walks")}>
        {todayWalks.map((walk) => (
          <div 
            key={walk.id} 
            className="bg-card rounded-xl p-4 flex items-center gap-4 animate-fade-in-up"
            role="listitem"
            aria-label={`${t("walks")}: ${walk.dog_ids.map((id) => getDogName(id)).join(", ")} o ${walk.time}`}
          >
            <div className="flex -space-x-2">
              {walk.dog_ids.map((dogId) => (
                <DogAvatar key={dogId} dogId={dogId} size="lg" />
              ))}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">
                {walk.dog_ids.map((id) => getDogName(id)).join(", ")}
              </p>
              <p className="text-sm text-muted-foreground">
                {walk.time} • {walk.duration} min
                {walk.profile_name && ` • ${walk.profile_name}`}
              </p>
              {walk.note && (
                <p className="text-xs text-muted-foreground mt-1 italic">📝 {walk.note}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {businessIcons[walk.business]}
              <button
                onClick={() => setDeleteId(walk.id)}
                className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label={`${t("deleteWalk")}: ${getDogName(walk.dog_ids[0])} o ${walk.time}`}
              >
                <Trash2 className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}

        {/* Today's home accidents */}
        {todayHomeAccidents.map((accident) => (
          <div 
            key={accident.id} 
            className="bg-destructive/10 rounded-xl p-4 flex items-center gap-4 animate-fade-in-up border-2 border-destructive/30"
            role="listitem"
            aria-label={`Zdarzenie domowe: ${getDogName(accident.dog_id)} o ${accident.time}`}
          >
            <DogAvatar dogId={accident.dog_id} size="lg" />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-destructive" aria-hidden="true" />
                <span className="font-semibold text-foreground">{getDogName(accident.dog_id)}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {accident.time} • {t("atHome")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {homeAccidentIcons[accident.type]}
              <button
                onClick={() => setDeleteHomeId(accident.id)}
                className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label={`${t("deleteEvent")}: ${getDogName(accident.dog_id)}`}
              >
                <Trash2 className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}

        {todayWalks.length === 0 && todayHomeAccidents.length === 0 && (
          <div className="text-center py-12" role="status">
            <PawPrint className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" aria-hidden="true" />
            <p className="text-muted-foreground">{t("noWalksToday")}</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title={t("deleteWalk")}
        message={t("deleteWalkConfirm")}
        onConfirm={async () => {
          if (deleteId) await removeWalk(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />

      <ConfirmDialog
        open={!!deleteHomeId}
        title={t("deleteEvent")}
        message={t("deleteEventConfirm")}
        onConfirm={async () => {
          if (deleteHomeId) await removeHomeAccident(deleteHomeId);
          setDeleteHomeId(null);
        }}
        onCancel={() => setDeleteHomeId(null)}
      />
    </div>
  );
};

export default NewWalksTab;
