import { useState, useMemo } from "react";
import { useApp, MealType } from "@/contexts/AppContext";
import dogFull from "@/assets/dog-full.png";
import { ChevronLeft, ChevronRight, PawPrint, Trash2 } from "lucide-react";
import DogAvatar from "@/components/DogAvatar";
import ConfirmDialog from "@/components/ConfirmDialog";

const DAYS = ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"];
const MONTHS = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];

const fmt = (d: Date) => d.toISOString().split("T")[0];

const MEAL_ICONS: Record<MealType, string> = {
  dry: "🍖",
  wet: "🍲",
  mixed: "🥣",
  treat: "🦴",
  other: "⭐",
};

const CalendarTab = () => {
  const { data, removeWalk, removeMeal, removeHealthEvent, removeHomeAccident } = useApp();
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(fmt(new Date()));
  const [deleteItem, setDeleteItem] = useState<{ type: string; id: string } | null>(null);

  const firstDay = new Date(year, month, 1);
  const startDow = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventsByDate = useMemo(() => {
    const map: Record<string, { walks: number; meals: number; health: number; accidents: number }> = {};
    const add = (date: string, type: "walks" | "meals" | "health" | "accidents") => {
      if (!map[date]) map[date] = { walks: 0, meals: 0, health: 0, accidents: 0 };
      map[date][type]++;
    };
    data.walks.forEach((w) => add(w.date, "walks"));
    data.meals.forEach((m) => add(m.date, "meals"));
    data.healthEvents.forEach((h) => add(h.date, "health"));
    data.homeAccidents.forEach((a) => add(a.date, "accidents"));
    return map;
  }, [data]);

  const prev = () => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); };

  const todayStr = fmt(new Date());

  const selectedEvents = eventsByDate[selectedDate];
  const selectedWalks = data.walks.filter((w) => w.date === selectedDate);
  const selectedMeals = data.meals.filter((m) => m.date === selectedDate);
  const selectedHealth = data.healthEvents.filter((h) => h.date === selectedDate);
  const selectedAccidents = data.homeAccidents.filter((a) => a.date === selectedDate);

  const handleDelete = () => {
    if (!deleteItem) return;
    if (deleteItem.type === "walk") removeWalk(deleteItem.id);
    if (deleteItem.type === "meal") removeMeal(deleteItem.id);
    if (deleteItem.type === "health") removeHealthEvent(deleteItem.id);
    if (deleteItem.type === "accident") removeHomeAccident(deleteItem.id);
    setDeleteItem(null);
  };

  const getHealthIcon = (type: string) => {
    const icons: Record<string, string> = {
      weterynarz: "🩺",
      groomer: "✂️",
      szczepienie: "💉",
      waga: "⚖️",
      cieczka_start: "🔴",
      cieczka_koniec: "🟢",
      inne: "📝",
    };
    return icons[type] || "📝";
  };

  return (
    <div className="min-h-screen pb-20 px-4 pt-safe">
      <div className="flex items-center justify-center gap-3 pt-4 mb-4">
        <img src={dogFull} alt="" className="w-12 h-12 animate-float" />
        <h1 className="text-xl font-extrabold text-foreground">Kalendarz</h1>
      </div>

      <div className="flex items-center justify-between bg-card rounded-xl p-3 mb-3 animate-fade-in-up">
        <button onClick={prev} className="p-2 text-muted-foreground active:scale-95"><ChevronLeft className="w-5 h-5" /></button>
        <span className="font-bold text-foreground">{MONTHS[month]} {year}</span>
        <button onClick={next} className="p-2 text-muted-foreground active:scale-95"><ChevronRight className="w-5 h-5" /></button>
      </div>

      <div className="bg-card rounded-xl p-3 mb-4 animate-fade-in-up delay-100">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-muted-foreground">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startDow }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const ev = eventsByDate[dateStr];
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dateStr)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-semibold transition-all active:scale-95 ${
                  isSelected ? "bg-primary text-primary-foreground" : isToday ? "bg-primary/15 text-primary" : "text-foreground"
                }`}
              >
                {day}
                {ev && (
                  <div className="flex gap-0.5 mt-0.5">
                    {ev.walks > 0 && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    {ev.meals > 0 && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
                    {ev.health > 0 && <div className="w-1.5 h-1.5 rounded-full bg-destructive" />}
                    {ev.accidents > 0 && <div className="w-1.5 h-1.5 rounded-full bg-warning" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2 animate-fade-in-up delay-200">
        <h3 className="font-bold text-foreground text-sm">{selectedDate === todayStr ? "Dzisiaj" : selectedDate}</h3>
        {!selectedEvents && <p className="text-sm text-muted-foreground">Brak wydarzeń</p>}
        
        {selectedWalks.map((w) => (
          <div key={w.id} className="flex items-center justify-between bg-primary/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <PawPrint className="w-4 h-4 text-primary" />
              <div className="flex -space-x-1">
                {w.dogIds.map((id) => <DogAvatar key={id} dogId={id} size="sm" />)}
              </div>
              <span className="text-sm font-semibold">{w.duration}′</span>
              <span className="text-lg">
                {w.business === "pee" && "💧"}
                {w.business === "poop" && "💩"}
                {w.business === "both" && "💧💩"}
              </span>
            </div>
            <button onClick={() => setDeleteItem({ type: "walk", id: w.id })} className="p-1 text-muted-foreground active:scale-95">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        {selectedMeals.map((m) => (
          <div key={m.id} className="flex items-center justify-between bg-accent/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{MEAL_ICONS[m.type]}</span>
              <DogAvatar dogId={m.dogId} size="sm" />
              <span className="text-xs text-muted-foreground">{m.time}</span>
            </div>
            <button onClick={() => setDeleteItem({ type: "meal", id: m.id })} className="p-1 text-muted-foreground active:scale-95">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        {selectedHealth.map((h) => (
          <div key={h.id} className="flex items-center justify-between bg-destructive/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getHealthIcon(h.type)}</span>
              <DogAvatar dogId={h.dogId} size="sm" />
              {h.note && <span className="text-xs text-muted-foreground">{h.note}</span>}
            </div>
            <button onClick={() => setDeleteItem({ type: "health", id: h.id })} className="p-1 text-muted-foreground active:scale-95">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {selectedAccidents.map((a) => (
          <div key={a.id} className="flex items-center justify-between bg-warning/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏠{a.type === "pee" ? "💧" : "💩"}</span>
              <DogAvatar dogId={a.dogId} size="sm" />
              <span className="text-xs text-muted-foreground">{a.time}</span>
            </div>
            <button onClick={() => setDeleteItem({ type: "accident", id: a.id })} className="p-1 text-muted-foreground active:scale-95">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteItem}
        title="Usuń?"
        message="Czy na pewno chcesz usunąć to zdarzenie?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteItem(null)}
      />
    </div>
  );
};

export default CalendarTab;
