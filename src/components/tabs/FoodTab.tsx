import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import dogPaws from "@/assets/dog-paws.png";
import { UtensilsCrossed, Plus, Check } from "lucide-react";

const today = () => new Date().toISOString().split("T")[0];
const now = () => new Date().toTimeString().slice(0, 5);

const MEAL_TYPES = ["śniadanie", "obiad", "kolacja", "przekąska"] as const;

const FoodTab = () => {
  const { data, addMeal } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [dogId, setDogId] = useState("");
  const [mealType, setMealType] = useState<typeof MEAL_TYPES[number]>("śniadanie");
  const [success, setSuccess] = useState(false);
  const [hearts, setHearts] = useState<number[]>([]);

  const handleSubmit = () => {
    if (!dogId) return;
    addMeal({ dogId, date: today(), time: now(), type: mealType, userId: data.userName });
    setSuccess(true);
    setHearts((h) => [...h, Date.now()]);
    setTimeout(() => { setSuccess(false); setShowForm(false); setDogId(""); }, 1500);
  };

  const todayMeals = data.meals.filter((m) => m.date === today());

  return (
    <div className="min-h-screen pb-20 px-4 pt-safe relative overflow-hidden">
      {hearts.map((key) => (
        <div key={key} className="absolute animate-heart-float text-2xl" style={{ left: `${Math.random() * 60 + 20}%`, top: "40%" }}>
          ❤️
        </div>
      ))}

      <div className="flex items-center justify-center gap-3 pt-4 mb-2">
        <h1 className="text-xl font-extrabold text-foreground">Jedzenie</h1>
      </div>
      <div className="flex justify-center mb-4">
        <img src={dogPaws} alt="" className="w-20 h-20 animate-breathe" />
      </div>

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-accent-foreground font-bold text-lg transition-all active:scale-95 hover:scale-[1.02] animate-button-ready mb-4"
        >
          <Plus className="w-5 h-5" /> Zapisz posiłek
        </button>
      )}

      {showForm && (
        <div className="bg-card rounded-xl p-4 mb-4 space-y-4 animate-slide-up-bounce">
          {success ? (
            <div className="text-center py-8 animate-pop-in">
              <Check className="w-12 h-12 mx-auto text-success mb-2" />
              <p className="font-bold text-foreground">Posiłek zapisany! ❤️</p>
            </div>
          ) : (
            <>
              <h3 className="font-bold text-foreground">Kto jada?</h3>
              {data.dogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Najpierw dodaj pieska</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data.dogs.map((dog) => (
                    <button
                      key={dog.id}
                      onClick={() => setDogId(dog.id)}
                      className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                        dogId === dog.id ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      🐕 {dog.name}
                    </button>
                  ))}
                </div>
              )}
              <div>
                <label className="text-sm font-semibold text-foreground">Rodzaj posiłku</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {MEAL_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setMealType(t)}
                      className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                        mealType === t ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg bg-muted text-muted-foreground font-semibold">Anuluj</button>
                <button onClick={handleSubmit} disabled={!dogId} className="flex-1 py-2 rounded-lg bg-accent text-accent-foreground font-bold disabled:opacity-40">Zapisz</button>
              </div>
            </>
          )}
        </div>
      )}

      <div className="space-y-2">
        <h3 className="font-bold text-foreground text-sm">Dzisiejsze posiłki ({todayMeals.length})</h3>
        {todayMeals.length === 0 && <p className="text-sm text-muted-foreground">Brak posiłków dziś</p>}
        {todayMeals.map((meal, i) => (
          <div key={meal.id} className="flex items-center gap-3 bg-card rounded-xl p-3 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
            <UtensilsCrossed className="w-5 h-5 text-accent" />
            <div>
              <p className="font-semibold text-foreground text-sm">{meal.type}</p>
              <p className="text-xs text-muted-foreground">{meal.time} — {data.dogs.find((d) => d.id === meal.dogId)?.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FoodTab;
