import { useState, useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import dogFull from "@/assets/dog-full.png";
import { ChevronLeft, ChevronRight, Footprints, UtensilsCrossed, HeartPulse } from "lucide-react";

const DAYS = ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"];
const MONTHS = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];

const fmt = (d: Date) => d.toISOString().split("T")[0];

const CalendarTab = () => {
  const { data } = useApp();
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(fmt(new Date()));

  const firstDay = new Date(year, month, 1);
  const startDow = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventsByDate = useMemo(() => {
    const map: Record<string, { walks: number; meals: number; health: number }> = {};
    const add = (date: string, type: "walks" | "meals" | "health") => {
      if (!map[date]) map[date] = { walks: 0, meals: 0, health: 0 };
      map[date][type]++;
    };
    data.walks.forEach((w) => add(w.date, "walks"));
    data.meals.forEach((m) => add(m.date, "meals"));
    data.healthEvents.forEach((h) => add(h.date, "health"));
    return map;
  }, [data]);

  const prev = () => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); };

  const todayStr = fmt(new Date());

  const selectedEvents = eventsByDate[selectedDate];
  const selectedWalks = data.walks.filter((w) => w.date === selectedDate);
  const selectedMeals = data.meals.filter((m) => m.date === selectedDate);
  const selectedHealth = data.healthEvents.filter((h) => h.date === selectedDate);

  return (
    <div className="min-h-screen pb-20 px-4 pt-safe">
      <div className="flex items-center justify-center gap-3 pt-4 mb-4">
        <img src={dogFull} alt="" className="w-10 h-10 animate-float" />
        <h1 className="text-xl font-extrabold text-foreground">Kalendarz</h1>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between bg-card rounded-xl p-3 mb-3 animate-fade-in-up">
        <button onClick={prev} className="p-2 text-muted-foreground"><ChevronLeft className="w-5 h-5" /></button>
        <span className="font-bold text-foreground">{MONTHS[month]} {year}</span>
        <button onClick={next} className="p-2 text-muted-foreground"><ChevronRight className="w-5 h-5" /></button>
      </div>

      {/* Calendar grid */}
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
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-semibold transition-all ${
                  isSelected ? "bg-primary text-primary-foreground" : isToday ? "bg-primary/15 text-primary" : "text-foreground"
                }`}
              >
                {day}
                {ev && (
                  <div className="flex gap-0.5 mt-0.5">
                    {ev.walks > 0 && <div className="w-1 h-1 rounded-full bg-primary" />}
                    {ev.meals > 0 && <div className="w-1 h-1 rounded-full bg-accent" />}
                    {ev.health > 0 && <div className="w-1 h-1 rounded-full bg-destructive" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day events */}
      <div className="space-y-2 animate-fade-in-up delay-200">
        <h3 className="font-bold text-foreground text-sm">{selectedDate === todayStr ? "Dzisiaj" : selectedDate}</h3>
        {!selectedEvents && <p className="text-sm text-muted-foreground">Brak wydarzeń</p>}
        {selectedWalks.map((w) => (
          <div key={w.id} className="flex items-center gap-2 bg-primary/10 rounded-lg p-3">
            <Footprints className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Spacer — {w.duration} min</span>
          </div>
        ))}
        {selectedMeals.map((m) => (
          <div key={m.id} className="flex items-center gap-2 bg-accent/10 rounded-lg p-3">
            <UtensilsCrossed className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold text-foreground">{m.type} — {data.dogs.find((d) => d.id === m.dogId)?.name}</span>
          </div>
        ))}
        {selectedHealth.map((h) => (
          <div key={h.id} className="flex items-center gap-2 bg-destructive/10 rounded-lg p-3">
            <HeartPulse className="w-4 h-4 text-destructive" />
            <span className="text-sm font-semibold text-foreground">{h.type}{h.note ? ` — ${h.note}` : ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarTab;
