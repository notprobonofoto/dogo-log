import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { PawPrint, Plus, Trash2, Droplet, Circle } from "lucide-react";
import DogAvatar from "@/components/DogAvatar";
import ConfirmDialog from "@/components/ConfirmDialog";
import type { WalkBusiness } from "@/contexts/DataContext";

const today = () => new Date().toISOString().split("T")[0];
const now = () => new Date().toTimeString().slice(0, 5);

const NewWalksTab = () => {
  const { dogs, walks, addWalk, removeWalk } = useData();
  const { t } = useLanguage();

  const [showForm, setShowForm] = useState(false);
  const [selectedDogs, setSelectedDogs] = useState<string[]>([]);
  const [duration, setDuration] = useState(15);
  const [business, setBusiness] = useState<WalkBusiness>("none");
  const [date, setDate] = useState(today());
  const [time, setTime] = useState(now());
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const toggleDog = (id: string) => {
    setSelectedDogs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAdd = async () => {
    if (selectedDogs.length === 0) return;
    await addWalk({ dogIds: selectedDogs, date, time, duration, business });
    setSelectedDogs([]);
    setDuration(15);
    setBusiness("none");
    setDate(today());
    setTime(now());
    setShowForm(false);
  };

  const todayStr = today();
  const todayWalks = walks.filter((w) => w.date === todayStr).sort((a, b) => b.time.localeCompare(a.time));

  const getDogName = (dogId: string) => {
    return dogs.find((d) => d.id === dogId)?.name || "?";
  };

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
          {/* Dog selection - 2 per row */}
          <div className="grid grid-cols-2 gap-3">
            {dogs.map((dog) => (
              <button
                key={dog.id}
                onClick={() => toggleDog(dog.id)}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  selectedDogs.includes(dog.id)
                    ? "bg-primary/20 ring-2 ring-primary"
                    : "bg-secondary"
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

          {/* Business buttons - 2 per row */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">{t("business")}</label>
            <div className="grid grid-cols-2 gap-2">
              {(["none", "pee", "poop", "both"] as WalkBusiness[]).map((b) => (
                <button
                  key={b}
                  onClick={() => setBusiness(b)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl font-semibold transition-all ${
                    business === b ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {businessIcons[b]}
                  <span>
                    {b === "none" && t("noBusiness")}
                    {b === "pee" && t("pee")}
                    {b === "poop" && t("poop")}
                    {b === "both" && t("both")}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={selectedDogs.length === 0}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold disabled:opacity-50 active:scale-95 transition-all"
          >
            <PawPrint className="w-5 h-5 inline-block mr-2" />
            {t("addWalk")}
          </button>
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

        {todayWalks.length === 0 && (
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
    </div>
  );
};

export default NewWalksTab;
