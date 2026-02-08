import { useMemo, useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";

const REMINDER_KEY = "dogolog_walk_reminders";
const NOTIFICATION_PREFS_KEY = "dogolog_notification_prefs";

interface NotificationPrefs {
  ignoredCount: number;
  lastShownDate: string;
  todayCount: number;
}

const today = () => new Date().toISOString().split("T")[0];

const getNotificationPrefs = (): NotificationPrefs => {
  try {
    const saved = localStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (saved) {
      const prefs = JSON.parse(saved);
      // Reset daily count if it's a new day
      if (prefs.lastShownDate !== today()) {
        return { ...prefs, todayCount: 0, lastShownDate: today() };
      }
      return prefs;
    }
  } catch {}
  return { ignoredCount: 0, lastShownDate: today(), todayCount: 0 };
};

const saveNotificationPrefs = (prefs: NotificationPrefs) => {
  localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
};

export interface WalkReminderData {
  shouldShow: boolean;
  averageTime: string | null;
  dismiss: () => void;
  message: string;
}

export const useWalkReminder = (): WalkReminderData => {
  const { data } = useApp();
  const [dismissed, setDismissed] = useState(false);
  const [prefs, setPrefs] = useState(getNotificationPrefs);

  // Calculate average walk time per day of week
  const averageWalkTimesByDay = useMemo(() => {
    const dayTimes: Record<number, number[]> = {};
    
    data.walks.forEach((walk) => {
      const walkDate = new Date(walk.date);
      const dayOfWeek = walkDate.getDay();
      const [hours, minutes] = walk.time.split(":").map(Number);
      const timeInMinutes = hours * 60 + minutes;
      
      if (!dayTimes[dayOfWeek]) {
        dayTimes[dayOfWeek] = [];
      }
      dayTimes[dayOfWeek].push(timeInMinutes);
    });
    
    const averages: Record<number, number> = {};
    Object.entries(dayTimes).forEach(([day, times]) => {
      if (times.length >= 2) {
        averages[Number(day)] = times.reduce((a, b) => a + b, 0) / times.length;
      }
    });
    
    return averages;
  }, [data.walks]);

  const todayStr = today();
  const currentDayOfWeek = new Date().getDay();
  const currentHour = new Date().getHours();
  const currentMinutes = new Date().getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinutes;

  const averageTimeForToday = averageWalkTimesByDay[currentDayOfWeek];
  
  // Check if there was a walk today
  const hadWalkToday = data.walks.some((w) => w.date === todayStr);

  // Anti-spam rules
  const isQuietHours = currentHour < 7 || currentHour >= 21;
  const exceededDailyLimit = prefs.todayCount >= 2;
  const shouldReduceFrequency = prefs.ignoredCount >= 3;

  const shouldShow = useMemo(() => {
    if (!averageTimeForToday) return false;
    if (hadWalkToday) return false;
    if (dismissed) return false;
    if (isQuietHours) return false;
    if (exceededDailyLimit) return false;
    
    // Check if current time is within ±15 minutes of average
    const timeDiff = Math.abs(currentTimeInMinutes - averageTimeForToday);
    
    // If user has been ignoring, only show every 3rd time
    if (shouldReduceFrequency && prefs.ignoredCount % 3 !== 0) {
      return false;
    }
    
    return timeDiff <= 15;
  }, [
    averageTimeForToday,
    hadWalkToday,
    dismissed,
    isQuietHours,
    exceededDailyLimit,
    currentTimeInMinutes,
    shouldReduceFrequency,
    prefs.ignoredCount,
  ]);

  // Play notification sound when showing
  useEffect(() => {
    if (shouldShow) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 600;
        oscillator.type = "sine";
        gainNode.gain.value = 0.08;
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.15);
        
        setTimeout(() => {
          const osc2 = audioContext.createOscillator();
          osc2.connect(gainNode);
          osc2.frequency.value = 800;
          osc2.type = "sine";
          osc2.start();
          osc2.stop(audioContext.currentTime + 0.15);
        }, 180);
      } catch {}
      
      // Update prefs
      const newPrefs = {
        ...prefs,
        todayCount: prefs.todayCount + 1,
        lastShownDate: todayStr,
      };
      setPrefs(newPrefs);
      saveNotificationPrefs(newPrefs);
    }
  }, [shouldShow]);

  const dismiss = () => {
    setDismissed(true);
    const newPrefs = {
      ...prefs,
      ignoredCount: prefs.ignoredCount + 1,
    };
    setPrefs(newPrefs);
    saveNotificationPrefs(newPrefs);
  };

  const formatTime = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  return {
    shouldShow,
    averageTime: averageTimeForToday ? formatTime(averageTimeForToday) : null,
    dismiss,
    message: "Z reguły wychodzisz o tej godzinie z psem — może warto się zbierać?",
  };
};
