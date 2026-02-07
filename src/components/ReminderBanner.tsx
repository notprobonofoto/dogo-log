import { useMemo, useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Bell, X } from "lucide-react";
import DogAvatar from "./DogAvatar";

const ReminderBanner = () => {
  const { data } = useApp();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [playSound, setPlaySound] = useState(false);

  const upcomingReminders = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const reminders: { id: string; dogId: string; type: string; date: string; daysLeft: number }[] = [];
    
    data.healthEvents.forEach((event) => {
      if (!event.nextVisit) return;
      if (event.type !== "weterynarz" && event.type !== "groomer") return;
      
      const visitDate = new Date(event.nextVisit);
      visitDate.setHours(0, 0, 0, 0);
      const diffTime = visitDate.getTime() - today.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (daysLeft === 1 || daysLeft === 2) {
        reminders.push({
          id: event.id,
          dogId: event.dogId,
          type: event.type,
          date: event.nextVisit,
          daysLeft,
        });
      }
    });
    
    return reminders.filter((r) => !dismissed.includes(r.id));
  }, [data.healthEvents, dismissed]);

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
  const getTypeName = (type: string) => (type === "weterynarz" ? "Weterynarz" : "Groomer");

  return (
    <div className="space-y-2 mb-4 animate-fade-in-up">
      {upcomingReminders.map((reminder) => (
        <div
          key={reminder.id}
          className={`relative flex items-center gap-3 p-3 rounded-xl ${
            reminder.daysLeft === 1
              ? "bg-destructive/20 border-2 border-destructive animate-pulse-soft"
              : "bg-warning/20 border-2 border-warning"
          }`}
        >
          <Bell className={`w-5 h-5 ${reminder.daysLeft === 1 ? "text-destructive" : "text-warning"}`} />
          <DogAvatar dogId={reminder.dogId} size="sm" />
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">
              {getTypeIcon(reminder.type)} {getTypeName(reminder.type)}
            </p>
            <p className="text-xs text-muted-foreground">
              {reminder.daysLeft === 1 ? "Jutro!" : "Za 2 dni"} · {reminder.date}
            </p>
          </div>
          <button
            onClick={() => setDismissed((d) => [...d, reminder.id])}
            className="p-1 text-muted-foreground active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ReminderBanner;
