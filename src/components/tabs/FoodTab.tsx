import { useState } from "react";
import { useApp, MealType } from "@/contexts/AppContext";
import dogPaws from "@/assets/dog-paws.png";
import { Utensils, Check, Trash2 } from "lucide-react";
import DogAvatar from "@/components/DogAvatar";
import ConfirmDialog from "@/components/ConfirmDialog";

const today = () => new Date().toISOString().split("T")[0];
const now = () => new Date().toTimeString().slice(0, 5);

const MEAL_TYPES: { value: MealType; icon: string; label: string }[] = [
  { value: "dry", icon: "🍖", label: "Suche" },
  { value: "wet", icon: "🍲", label: "Mokre" },
  { value: "mixed", icon: "🥣", label: "Mieszane" },
  { value: "treat", icon: "🦴", label: "Smaczek" },
  { value: "other", icon: "⭐", label: "Inne" },
];

const FoodTab = () => {
  const { data, addMeal, removeMeal } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [dogId, setDogId] = useState("");
  const [mealType, setMealType] = useState<MealType>("dry");
  const [success, setSuccess] = useState(false);
  const [hearts, setHearts] = useState<number[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!dogId) return;
    addMeal({ dogId, date: today(), time: now(), type: mealType, userId: data.userName });
    setSuccess(true);
    setHearts((h) => [...h, Date.now()]);
    setTimeout(() => { setSuccess(false); setShowForm(false); setDogId(""); }, 1500);
  };

  const todayMeals = data.meals.filter((m) => m.date === today());
  const getMealIcon = (type: MealType) => MEAL_TYPES.find((t) => t.value === type)?.icon || "🍽️";

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
          <Utensils className="w-5 h-5" />
          <span className="text-sm">Dodaj posiłek</span>
        </button>
      )}

      {showForm && (
        <div className="bg-card rounded-xl p-4 mb-4 space-y-4 animate-slide-up-bounce">
          {success ? (
            <div className="text-center py-8 animate-pop-in">
              <Check className="w-12 h-12 mx-auto text-success mb-2" />
              <p className="font-bold text-foreground">Zapisano! ❤️</p>
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
                      className={`flex items-center gap-2 px-3 py-2 rounded-full font-semibold text-sm transition-all ${
                        dogId === dog.id ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      <DogAvatar dogId={dog.id} size="sm" />
                    </button>
                  ))}
                </div>
              )}
              <div>
                <label className="text-sm font-semibold text-foreground">Typ</label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {MEAL_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setMealType(t.value)}
                      className={`flex flex-col items-center py-2 rounded-xl font-bold transition-all ${
                        mealType === t.value ? "bg-accent text-accent-foreground" : "bg-muted"
                      }`}
                      title={t.label}
                    >
                      <span className="text-xl">{t.icon}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg bg-muted text-muted-foreground font-semibold">Anuluj</button>
                <button onClick={handleSubmit} disabled={!dogId} className="flex-1 py-2 rounded-lg bg-accent text-accent-foreground font-bold disabled:opacity-40">✓</button>
              </div>
            </>
          )}
        </div>
      )}

      <div className="space-y-2">
        <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
          <Utensils className="w-4 h-4" /> Dziś: {todayMeals.length}
        </h3>
        {todayMeals.length === 0 && <p className="text-sm text-muted-foreground">Brak posiłków</p>}
        {todayMeals.map((meal, i) => (
          <div key={meal.id} className="flex items-center justify-between gap-3 bg-card rounded-xl p-3 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-center gap-3">
              <DogAvatar dogId={meal.dogId} size="sm" />
              <span className="text-xl">{getMealIcon(meal.type)}</span>
              <span className="text-xs text-muted-foreground">{meal.time}</span>
            </div>
            <button onClick={() => setDeleteId(meal.id)} className="p-2 text-muted-foreground active:scale-95">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Usuń posiłek?"
        message="Czy na pewno chcesz usunąć ten posiłek?"
        onConfirm={() => { if (deleteId) { removeMeal(deleteId); setDeleteId(null); } }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default FoodTab;
