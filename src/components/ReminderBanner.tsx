import { useMemo, useEffect, useState } from "react";
import { useData } from "@/contexts/DataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Bell, X } from "lucide-react";
import DogAvatar from "./DogAvatar";

const ReminderBanner = () => {
  const { dogs, healthEvents } = useData();
  const { t } = useLanguage();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [playSound, setPlaySound] = useState(false);

  const upcomingReminders = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const reminders: { id: string; dogId: string; type: string; date: string; daysLeft: number }[] = [];
    
    healthEvents.forEach((event) => {
      if (!event.next_visit) return;
      if (event.type !== "weterynarz" && event.type !== "groomer") return;
      
      const visitDate = new Date(event.next_visit);
      visitDate.setHours(0, 0, 0, 0);
      const diffTime = visitDate.getTime() - today.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (daysLeft === 1 || daysLeft === 2) {
        reminders.push({
          id: event.id,
          dogId: event.dog_id,
          type: event.type,
          date: event.next_visit,
          daysLeft,
        });
      }
    });
    
    return reminders.filter((r) => !dismissed.includes(r.id));
  }, [healthEvents, dismissed]);

  useEffect(() => {
    if (upcomingReminders.length > 0 && !playSound) {
      setPlaySound(true);
      // Play a simple notification sound using Web Audio API
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = "sine";
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
        
        setTimeout(() => {
          const osc2 = audioContext.createOscillator();
          osc2.connect(gainNode);
          osc2.frequency.value = 1000;
          osc2.type = "sine";
          osc2.start();
          osc2.stop(audioContext.currentTime + 0.2);
        }, 250);
      } catch (e) {
        // Audio not supported
      }
    }
  }, [upcomingReminders.length, playSound]);

  if (upcomingReminders.length === 0) return null;

  const getTypeIcon = (type: string) => (type === "weterynarz" ? "🩺" : "✂️");
  const getTypeName = (type: string) => (type === "weterynarz" ? t("vet") : t("groomer"));

  return (
    <div className="space-y-2 mb-4 animate-fade-in-up">
      {upcomingReminders.map((reminder) => {
        const dog = dogs.find(d => d.id === reminder.dogId);
        return (
          <div
            key={reminder.id}
            className={`relative flex items-center gap-3 p-3 rounded-xl ${
              reminder.daysLeft === 1
                ? "bg-destructive/20 border-2 border-destructive animate-pulse-soft"
                : "bg-warning/20 border-2 border-warning"
            }`}
          >
            <Bell className={`w-5 h-5 ${reminder.daysLeft === 1 ? "text-destructive" : "text-warning"}`} />
            <div className="flex flex-col items-center">
              <DogAvatar dogId={reminder.dogId} size="md" />
              <span className="text-[10px] font-medium">{dog?.name}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">
                {getTypeIcon(reminder.type)} {getTypeName(reminder.type)}
              </p>
              <p className="text-xs text-muted-foreground">
                {reminder.daysLeft === 1 ? t("tomorrow") : t("inTwoDays")} · {reminder.date}
              </p>
            </div>
            <button
              onClick={() => setDismissed((d) => [...d, reminder.id])}
              className="p-1 text-muted-foreground active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ReminderBanner;
