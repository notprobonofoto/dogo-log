import { useState } from "react";
import { useApp, type MealType } from "@/contexts/AppContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Utensils, Plus, Trash2 } from "lucide-react";
import DogAvatar from "@/components/DogAvatar";
import ConfirmDialog from "@/components/ConfirmDialog";

const today = () => new Date().toISOString().split("T")[0];
const now = () => new Date().toTimeString().slice(0, 5);

const NewFoodTab = () => {
  const { dogs, meals, addMeal, removeMeal } = useApp();
  const { t } = useLanguage();

  const [showForm, setShowForm] = useState(false);
  const [selectedDog, setSelectedDog] = useState<string | null>(null);
  const [mealType, setMealType] = useState<MealType>("dry");
  const [date, setDate] = useState(today());
  const [time, setTime] = useState(now());
  const [otherNote, setOtherNote] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!selectedDog) return;
    await addMeal({ 
      dog_id: selectedDog, 
      date, 
      time, 
      type: mealType,
      note: mealType === "other" && otherNote.trim() ? otherNote.trim() : undefined
    });
    setSelectedDog(null);
    setMealType("dry");
    setDate(today());
    setTime(now());
    setOtherNote("");
    setShowForm(false);
  };

  const todayStr = today();
  const todayMeals = meals.filter((m) => m.date === todayStr).sort((a, b) => b.time.localeCompare(a.time));

  const getDogName = (dogId: string) => {
    return dogs.find((d) => d.id === dogId)?.name || "?";
  };

  const mealIcons: Record<MealType, string> = {
    dry: "🥣",
    wet: "🥫",
    mixed: "🍽️",
    treat: "🦴",
    other: "🍖",
  };

  const mealLabels: Record<MealType, string> = {
    dry: t("dryFood"),
    wet: t("wetFood"),
    mixed: t("mixedFood"),
    treat: t("treat"),
    other: t("other"),
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-6" role="main" aria-label={t("meals")}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t("meals")}</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="p-3 rounded-full bg-accent text-accent-foreground active:scale-95 transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label={showForm ? t("cancel") : t("addMeal")}
          aria-expanded={showForm}
        >
          <Plus className="w-6 h-6" aria-hidden="true" />
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-xl p-4 mb-6 animate-fade-in-up space-y-4" role="form" aria-label={t("addMeal")}>
          {/* Dog selection - 2 per row */}
          <fieldset>
            <legend className="sr-only">{t("whoEats")}</legend>
            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label={t("whoEats")}>
              {dogs.map((dog) => (
                <button
                  key={dog.id}
                  onClick={() => setSelectedDog(dog.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
                    selectedDog === dog.id 
                      ? "border-2 border-accent bg-transparent" 
                      : "bg-secondary border-2 border-transparent"
                  }`}
                  role="radio"
                  aria-checked={selectedDog === dog.id}
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
              <label htmlFor="meal-date" className="sr-only">{t("date")}</label>
              <input
                id="meal-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label={t("date")}
              />
            </div>
            <div className="flex-1">
              <label htmlFor="meal-time" className="sr-only">{t("time")}</label>
              <input
                id="meal-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label={t("time")}
              />
            </div>
          </div>

          {/* Meal type - 2 per row */}
          <fieldset>
            <legend className="text-sm font-semibold text-foreground block mb-2">{t("mealType")}</legend>
            <div className="grid grid-cols-2 gap-2" role="radiogroup">
              {(["dry", "wet", "mixed", "treat", "other"] as MealType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setMealType(type)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
                    mealType === type 
                      ? "border-2 border-accent bg-transparent text-accent" 
                      : "bg-secondary text-secondary-foreground border-2 border-transparent"
                  }`}
                  role="radio"
                  aria-checked={mealType === type}
                  aria-label={mealLabels[type]}
                >
                  <span className="text-xl" aria-hidden="true">{mealIcons[type]}</span>
                  <span>{mealLabels[type]}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* Note field for "other" meal type */}
          {mealType === "other" && (
            <div>
              <label htmlFor="other-meal-note" className="text-sm font-semibold text-foreground block mb-2">
                {t("otherFoodPlaceholder")}
              </label>
              <input
                id="other-meal-note"
                type="text"
                value={otherNote}
                onChange={(e) => setOtherNote(e.target.value)}
                placeholder={t("otherFoodPlaceholder")}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          )}

          <button
            onClick={handleAdd}
            disabled={!selectedDog}
            className="w-full py-3 rounded-lg bg-accent text-accent-foreground font-bold disabled:opacity-50 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label={t("addMeal")}
          >
            <Utensils className="w-5 h-5 inline-block mr-2" aria-hidden="true" />
            {t("addMeal")}
          </button>
        </div>
      )}

      {/* Today's meals */}
      <div className="space-y-3" role="list" aria-label={t("meals")}>
        {todayMeals.map((meal) => (
          <div 
            key={meal.id} 
            className="bg-card rounded-xl p-4 flex items-center gap-4 animate-fade-in-up"
            role="listitem"
            aria-label={`${t("meals")}: ${getDogName(meal.dog_id)} o ${meal.time}`}
          >
            <DogAvatar dogId={meal.dog_id} size="lg" />

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{getDogName(meal.dog_id)}</p>
              <p className="text-sm text-muted-foreground">
                {meal.time} • <span aria-hidden="true">{mealIcons[meal.type]}</span> {mealLabels[meal.type]}
                {meal.profile_name && ` • ${meal.profile_name}`}
              </p>
              {meal.note && (
                <p className="text-xs text-muted-foreground mt-1 italic">📝 {meal.note}</p>
              )}
            </div>

            <button
              onClick={() => setDeleteId(meal.id)}
              className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label={`${t("deleteMeal")}: ${getDogName(meal.dog_id)} o ${meal.time}`}
            >
              <Trash2 className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        ))}

        {todayMeals.length === 0 && (
          <div className="text-center py-12" role="status">
            <Utensils className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" aria-hidden="true" />
            <p className="text-muted-foreground">{t("noMealsToday")}</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title={t("deleteMeal")}
        message={t("deleteMealConfirm")}
        onConfirm={async () => {
          if (deleteId) await removeMeal(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default NewFoodTab;
