import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import dogHead from "@/assets/dog-head.png";
import { Footprints, Plus, Check } from "lucide-react";

const today = () => new Date().toISOString().split("T")[0];
const now = () => new Date().toTimeString().slice(0, 5);

const WalksTab = () => {
  const { data, addWalk } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [selectedDogs, setSelectedDogs] = useState<string[]>([]);
  const [duration, setDuration] = useState("30");
  const [success, setSuccess] = useState(false);

  // Paw prints animation
  const [paws, setPaws] = useState<number[]>([]);

  const toggleDog = (id: string) => {
    setSelectedDogs((prev) => prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]);
  };

  const handleSubmit = () => {
    if (!selectedDogs.length || !duration) return;
    addWalk({ dogIds: selectedDogs, date: today(), time: now(), duration: parseInt(duration), userId: data.userName });
    setSuccess(true);
    setPaws((p) => [...p, Date.now()]);
    setTimeout(() => { setSuccess(false); setShowForm(false); setSelectedDogs([]); setDuration("30"); }, 1500);
  };

  const todayWalks = data.walks.filter((w) => w.date === today());

  return (
    <div className="min-h-screen pb-20 px-4 pt-safe relative overflow-hidden">
      {/* Floating paw prints */}
      {paws.map((key) => (
        <div key={key} className="absolute animate-paw-appear text-3xl" style={{ left: `${Math.random() * 70 + 10}%`, top: `${Math.random() * 40 + 20}%` }}>
          🐾
        </div>
      ))}

      {/* Header + hero */}
      <div className="flex items-center justify-center gap-3 pt-4 mb-2">
        <h1 className="text-xl font-extrabold text-foreground">Spacery</h1>
      </div>
      <div className="flex justify-center mb-4">
        <img src={dogHead} alt="" className="w-20 h-20 animate-wiggle" />
      </div>

      {/* Add walk button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-lg transition-all active:scale-95 hover:scale-[1.02] animate-button-ready mb-4"
        >
          <Plus className="w-5 h-5" /> Zapisz spacer
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-card rounded-xl p-4 mb-4 space-y-4 animate-slide-up-bounce">
          {success ? (
            <div className="text-center py-8 animate-pop-in">
              <Check className="w-12 h-12 mx-auto text-success mb-2" />
              <p className="font-bold text-foreground">Spacer zapisany! 🐾</p>
            </div>
          ) : (
            <>
              <h3 className="font-bold text-foreground">Kto szedł na spacer?</h3>
              {data.dogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Najpierw dodaj pieska w zakładce Pieski</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data.dogs.map((dog) => (
                    <button
                      key={dog.id}
                      onClick={() => toggleDog(dog.id)}
                      className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                        selectedDogs.includes(dog.id) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      🐕 {dog.name}
                    </button>
                  ))}
                </div>
              )}
              <div>
                <label className="text-sm font-semibold text-foreground">Czas trwania (min)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full mt-1 rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  inputMode="numeric"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg bg-muted text-muted-foreground font-semibold">Anuluj</button>
                <button onClick={handleSubmit} disabled={!selectedDogs.length} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground font-bold disabled:opacity-40">Zapisz</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Today's walks */}
      <div className="space-y-2">
        <h3 className="font-bold text-foreground text-sm">Dzisiejsze spacery ({todayWalks.length})</h3>
        {todayWalks.length === 0 && <p className="text-sm text-muted-foreground">Jeszcze żadnego spaceru dziś</p>}
        {todayWalks.map((walk, i) => (
          <div key={walk.id} className="flex items-center gap-3 bg-card rounded-xl p-3 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
            <Footprints className="w-5 h-5 text-primary" />
            <div>
              <p className="font-semibold text-foreground text-sm">{walk.duration} min</p>
              <p className="text-xs text-muted-foreground">{walk.time} — {walk.dogIds.map((id) => data.dogs.find((d) => d.id === id)?.name).join(", ")}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WalksTab;
