import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Tab = "home" | "calendar" | "walks" | "food" | "health" | "dogs";

export interface Dog {
  id: string;
  name: string;
  birthDate: string;
  sex: "male" | "female";
  breed?: string;
}

export interface Walk {
  id: string;
  dogIds: string[];
  date: string;
  time: string;
  duration: number;
  userId: string;
}

export interface Meal {
  id: string;
  dogId: string;
  date: string;
  time: string;
  type: "śniadanie" | "obiad" | "kolacja" | "przekąska";
  userId: string;
}

export interface HealthEvent {
  id: string;
  dogId: string;
  date: string;
  type: "weterynarz" | "groomer" | "szczepienie" | "cieczka_start" | "cieczka_koniec" | "inne";
  note?: string;
  nextVisit?: string;
}

export interface AppData {
  userName: string;
  householdCode: string;
  dogs: Dog[];
  walks: Walk[];
  meals: Meal[];
  healthEvents: HealthEvent[];
}

const defaultData: AppData = {
  userName: "",
  householdCode: "",
  dogs: [],
  walks: [],
  meals: [],
  healthEvents: [],
};

interface AppContextType {
  data: AppData;
  isOnboarded: boolean;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  completeOnboarding: (name: string, code: string) => void;
  addDog: (dog: Omit<Dog, "id">) => void;
  removeDog: (id: string) => void;
  addWalk: (walk: Omit<Walk, "id">) => void;
  addMeal: (meal: Omit<Meal, "id">) => void;
  addHealthEvent: (event: Omit<HealthEvent, "id">) => void;
  removeHealthEvent: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);
const STORAGE_KEY = "dogolog_data";

const load = (): AppData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultData, ...JSON.parse(raw) } : defaultData;
  } catch {
    return defaultData;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(load);
  const [activeTab, setActiveTab] = useState<Tab>("home");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const isOnboarded = !!data.userName && !!data.householdCode;

  const completeOnboarding = useCallback((name: string, code: string) => {
    setData((d) => ({ ...d, userName: name, householdCode: code }));
  }, []);

  const addDog = useCallback((dog: Omit<Dog, "id">) => {
    setData((d) => ({ ...d, dogs: [...d.dogs, { ...dog, id: uid() }] }));
  }, []);

  const removeDog = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      dogs: d.dogs.filter((x) => x.id !== id),
      walks: d.walks.filter((w) => !w.dogIds.includes(id) || w.dogIds.length > 1).map((w) => ({ ...w, dogIds: w.dogIds.filter((did) => did !== id) })),
      meals: d.meals.filter((m) => m.dogId !== id),
      healthEvents: d.healthEvents.filter((h) => h.dogId !== id),
    }));
  }, []);

  const addWalk = useCallback((walk: Omit<Walk, "id">) => {
    setData((d) => ({ ...d, walks: [...d.walks, { ...walk, id: uid() }] }));
  }, []);

  const addMeal = useCallback((meal: Omit<Meal, "id">) => {
    setData((d) => ({ ...d, meals: [...d.meals, { ...meal, id: uid() }] }));
  }, []);

  const addHealthEvent = useCallback((event: Omit<HealthEvent, "id">) => {
    setData((d) => ({ ...d, healthEvents: [...d.healthEvents, { ...event, id: uid() }] }));
  }, []);

  const removeHealthEvent = useCallback((id: string) => {
    setData((d) => ({ ...d, healthEvents: d.healthEvents.filter((h) => h.id !== id) }));
  }, []);

  return (
    <AppContext.Provider value={{ data, isOnboarded, activeTab, setActiveTab, completeOnboarding, addDog, removeDog, addWalk, addMeal, addHealthEvent, removeHealthEvent }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be within AppProvider");
  return ctx;
};
