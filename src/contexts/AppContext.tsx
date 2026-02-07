import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Tab = "home" | "calendar" | "walks" | "food" | "health" | "dogs";

export interface DogPhoto {
  id: string;
  dataUrl: string;
  createdAt: string;
}

export interface Dog {
  id: string;
  name: string;
  birthDate: string;
  sex: "male" | "female";
  breed?: string;
  photos: DogPhoto[];
}

export type WalkBusiness = "pee" | "poop" | "both" | "none";

export interface Walk {
  id: string;
  dogIds: string[];
  date: string;
  time: string;
  duration: number;
  userId: string;
  business: WalkBusiness;
}

export type HomeAccident = "pee" | "poop";

export interface HomeAccidentEvent {
  id: string;
  dogId: string;
  date: string;
  time: string;
  type: HomeAccident;
}

export type MealType = "dry" | "wet" | "mixed" | "treat" | "other";

export interface Meal {
  id: string;
  dogId: string;
  date: string;
  time: string;
  type: MealType;
  userId: string;
}

export interface HealthEvent {
  id: string;
  dogId: string;
  date: string;
  type: "weterynarz" | "groomer" | "szczepienie" | "cieczka_start" | "cieczka_koniec" | "waga" | "inne";
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
  homeAccidents: HomeAccidentEvent[];
}

const defaultData: AppData = {
  userName: "",
  householdCode: "",
  dogs: [],
  walks: [],
  meals: [],
  healthEvents: [],
  homeAccidents: [],
};

interface AppContextType {
  data: AppData;
  isOnboarded: boolean;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  completeOnboarding: (name: string, code: string) => void;
  addDog: (dog: Omit<Dog, "id" | "photos">) => void;
  removeDog: (id: string) => void;
  addDogPhoto: (dogId: string, dataUrl: string) => void;
  removeDogPhoto: (dogId: string, photoId: string) => void;
  addWalk: (walk: Omit<Walk, "id">) => void;
  removeWalk: (id: string) => void;
  addMeal: (meal: Omit<Meal, "id">) => void;
  removeMeal: (id: string) => void;
  addHealthEvent: (event: Omit<HealthEvent, "id">) => void;
  removeHealthEvent: (id: string) => void;
  addHomeAccident: (event: Omit<HomeAccidentEvent, "id">) => void;
  removeHomeAccident: (id: string) => void;
  getDogAvatar: (dogId: string) => string | null;
}

const AppContext = createContext<AppContextType | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);
const STORAGE_KEY = "dogolog_data";

const load = (): AppData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw);
    // Migrate old data
    return {
      ...defaultData,
      ...parsed,
      dogs: (parsed.dogs || []).map((d: any) => ({ ...d, photos: d.photos || [] })),
      walks: (parsed.walks || []).map((w: any) => ({ ...w, business: w.business || "none" })),
      meals: (parsed.meals || []).map((m: any) => {
        // Migrate old meal types to new
        const typeMap: Record<string, MealType> = {
          "śniadanie": "dry",
          "obiad": "wet",
          "kolacja": "mixed",
          "przekąska": "treat",
        };
        return { ...m, type: typeMap[m.type] || m.type || "dry" };
      }),
      homeAccidents: parsed.homeAccidents || [],
    };
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

  const addDog = useCallback((dog: Omit<Dog, "id" | "photos">) => {
    setData((d) => ({ ...d, dogs: [...d.dogs, { ...dog, id: uid(), photos: [] }] }));
  }, []);

  const removeDog = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      dogs: d.dogs.filter((x) => x.id !== id),
      walks: d.walks.filter((w) => !w.dogIds.includes(id) || w.dogIds.length > 1).map((w) => ({ ...w, dogIds: w.dogIds.filter((did) => did !== id) })),
      meals: d.meals.filter((m) => m.dogId !== id),
      healthEvents: d.healthEvents.filter((h) => h.dogId !== id),
      homeAccidents: d.homeAccidents.filter((a) => a.dogId !== id),
    }));
  }, []);

  const addDogPhoto = useCallback((dogId: string, dataUrl: string) => {
    setData((d) => ({
      ...d,
      dogs: d.dogs.map((dog) =>
        dog.id === dogId
          ? { ...dog, photos: [...dog.photos, { id: uid(), dataUrl, createdAt: new Date().toISOString() }] }
          : dog
      ),
    }));
  }, []);

  const removeDogPhoto = useCallback((dogId: string, photoId: string) => {
    setData((d) => ({
      ...d,
      dogs: d.dogs.map((dog) =>
        dog.id === dogId
          ? { ...dog, photos: dog.photos.filter((p) => p.id !== photoId) }
          : dog
      ),
    }));
  }, []);

  const addWalk = useCallback((walk: Omit<Walk, "id">) => {
    setData((d) => ({ ...d, walks: [...d.walks, { ...walk, id: uid() }] }));
  }, []);

  const removeWalk = useCallback((id: string) => {
    setData((d) => ({ ...d, walks: d.walks.filter((w) => w.id !== id) }));
  }, []);

  const addMeal = useCallback((meal: Omit<Meal, "id">) => {
    setData((d) => ({ ...d, meals: [...d.meals, { ...meal, id: uid() }] }));
  }, []);

  const removeMeal = useCallback((id: string) => {
    setData((d) => ({ ...d, meals: d.meals.filter((m) => m.id !== id) }));
  }, []);

  const addHealthEvent = useCallback((event: Omit<HealthEvent, "id">) => {
    setData((d) => ({ ...d, healthEvents: [...d.healthEvents, { ...event, id: uid() }] }));
  }, []);

  const removeHealthEvent = useCallback((id: string) => {
    setData((d) => ({ ...d, healthEvents: d.healthEvents.filter((h) => h.id !== id) }));
  }, []);

  const addHomeAccident = useCallback((event: Omit<HomeAccidentEvent, "id">) => {
    setData((d) => ({ ...d, homeAccidents: [...d.homeAccidents, { ...event, id: uid() }] }));
  }, []);

  const removeHomeAccident = useCallback((id: string) => {
    setData((d) => ({ ...d, homeAccidents: d.homeAccidents.filter((a) => a.id !== id) }));
  }, []);

  const getDogAvatar = useCallback((dogId: string): string | null => {
    const dog = data.dogs.find((d) => d.id === dogId);
    if (dog && dog.photos.length > 0) {
      return dog.photos[0].dataUrl;
    }
    return null;
  }, [data.dogs]);

  return (
    <AppContext.Provider value={{
      data,
      isOnboarded,
      activeTab,
      setActiveTab,
      completeOnboarding,
      addDog,
      removeDog,
      addDogPhoto,
      removeDogPhoto,
      addWalk,
      removeWalk,
      addMeal,
      removeMeal,
      addHealthEvent,
      removeHealthEvent,
      addHomeAccident,
      removeHomeAccident,
      getDogAvatar,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be within AppProvider");
  return ctx;
};
