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
    { value: "pee", icon: <Droplet className="w-4 h-4 text-warn" />, label: t("pee") },
    { value: "poop", icon: <Circle className="w-4 h-4 text-primary fill-primary" />, label: t("poop") },
    { value: "both", icon: <><Droplet className="w-3 h-3 text-warn" /><Circle className="w-3 h-3 text-primary fill-primary" /></>, label: t("both") },
    { value: "none", icon: null, label: t("noBusiness") },
  ];

  const businessIcons: Record<WalkBusiness, React.ReactNode> = {
    pee: <Droplet className="w-4 h-4 text-warn" />,
    poop: <Circle className="w-4 h-4 text-primary fill-primary" />,
    both: (
      <div className="flex gap-0.5">
        <Droplet className="w-3 h-3 text-warn" />
        <Circle className="w-3 h-3 text-primary fill-primary" />
      </div>
    ),
    none: null,
  };

  const homeAccidentIcons: Record<HomeAccident, React.ReactNode> = {
    pee: <Droplet className="w-4 h-4 text-warn" />,
    poop: <Circle className="w-4 h-4 text-primary fill-primary" />,
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t("walks")}</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="p-3 rounded-full bg-primary text-primary-foreground active:scale-95 transition-all shadow-lg"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-xl p-4 mb-6 animate-fade-in-up space-y-4">
          {/* Mode toggle: Walk vs Home event */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setFormMode("walk")}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl font-semibold transition-all ${
                formMode === "walk"
                  ? "border-2 border-primary bg-transparent text-primary"
                  : "bg-secondary text-secondary-foreground border-2 border-transparent"
              }`}
            >
              <PawPrint className="w-5 h-5" />
              <span>{t("walks")}</span>
            </button>
            <button
              onClick={() => setFormMode("home")}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl font-semibold transition-all ${
                formMode === "home"
                  ? "border-2 border-destructive bg-transparent text-destructive"
                  : "bg-secondary text-secondary-foreground border-2 border-transparent"
              }`}
            >
              <Home className="w-5 h-5" />
              <span>{t("atHome")}</span>
            </button>
          </div>

          {/* Dog selection - 2 per row */}
          <div className="grid grid-cols-2 gap-3">
            {dogs.map((dog) => (
              <button
                key={dog.id}
                onClick={() => toggleDog(dog.id)}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  selectedDogs.includes(dog.id)
                    ? "border-2 border-primary bg-transparent"
                    : "bg-secondary border-2 border-transparent"
                }`}
              >
                <DogAvatar dogId={dog.id} size="lg" />
                <span className="font-semibold text-foreground">{dog.name}</span>
              </button>
            ))}
          </div>

          {/* Date & Time */}
          <div className="flex gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {formMode === "walk" && (
            <>
              {/* Duration slider */}
              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">
                  {t("duration")}: {duration} min
                </label>
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Business buttons - FIXED ORDER: Siku, Kupa, Oba, Nic */}
              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">{t("business")}</label>
                <div className="grid grid-cols-2 gap-2">
                  {businessOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setBusiness(opt.value)}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl font-semibold transition-all ${
                        business === opt.value 
                          ? "border-2 border-primary bg-transparent text-primary" 
                          : "bg-secondary text-secondary-foreground border-2 border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-1">{opt.icon}</div>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Poop note - shown for poop or both */}
              {(business === "poop" || business === "both") && (
                <div>
                  <label className="text-sm font-semibold text-foreground block mb-2">
                    {t("optionalNote")}
                  </label>
                  <input
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
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold disabled:opacity-50 active:scale-95 transition-all"
              >
                <PawPrint className="w-5 h-5 inline-block mr-2" />
                {t("addWalk")}
              </button>
            </>
          )}

          {formMode === "home" && (
            <>
              {/* Home accident type - Siku or Kupa only */}
              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">{t("homeEvent")}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setHomeAccidentType("pee")}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl font-semibold transition-all ${
                      homeAccidentType === "pee"
                        ? "border-2 border-destructive bg-transparent text-destructive"
                        : "bg-secondary text-secondary-foreground border-2 border-transparent"
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <Droplet className="w-4 h-4 text-warn" />
                    <span>{t("pee")}</span>
                  </button>
                  <button
                    onClick={() => setHomeAccidentType("poop")}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl font-semibold transition-all ${
                      homeAccidentType === "poop"
                        ? "border-2 border-destructive bg-transparent text-destructive"
                        : "bg-secondary text-secondary-foreground border-2 border-transparent"
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <Circle className="w-4 h-4 text-primary fill-primary" />
                    <span>{t("poop")}</span>
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddHomeAccident}
                disabled={selectedDogs.length === 0}
                className="w-full py-3 rounded-lg bg-destructive text-destructive-foreground font-bold disabled:opacity-50 active:scale-95 transition-all"
              >
                <Home className="w-5 h-5 inline-block mr-2" />
                {t("addHomeEvent")}
              </button>
            </>
          )}
        </div>
      )}

      {/* Today's walks */}
      <div className="space-y-3">
        {todayWalks.map((walk) => (
          <div key={walk.id} className="bg-card rounded-xl p-4 flex items-center gap-4 animate-fade-in-up">
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
                className="p-2 rounded-lg bg-destructive/10 text-destructive"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {/* Today's home accidents */}
        {todayHomeAccidents.map((accident) => (
          <div key={accident.id} className="bg-destructive/10 rounded-xl p-4 flex items-center gap-4 animate-fade-in-up border-2 border-destructive/30">
            <DogAvatar dogId={accident.dog_id} size="lg" />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-destructive" />
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
                className="p-2 rounded-lg bg-destructive/10 text-destructive"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {todayWalks.length === 0 && todayHomeAccidents.length === 0 && (
          <div className="text-center py-12">
            <PawPrint className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
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
