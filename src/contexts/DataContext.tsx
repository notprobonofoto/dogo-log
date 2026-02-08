import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

export interface Dog {
  id: string;
  name: string;
  birth_date: string;
  sex: "male" | "female";
  breed?: string;
  photos: DogPhoto[];
}

export interface DogPhoto {
  id: string;
  data_url: string;
  created_at: string;
}

export type WalkBusiness = "pee" | "poop" | "both" | "none";

export interface Walk {
  id: string;
  dog_ids: string[];
  date: string;
  time: string;
  duration: number;
  profile_id: string | null;
  profile_name?: string;
  business: WalkBusiness;
}

export type HomeAccident = "pee" | "poop";

export interface HomeAccidentEvent {
  id: string;
  dog_id: string;
  date: string;
  time: string;
  type: HomeAccident;
}

export type MealType = "dry" | "wet" | "mixed" | "treat" | "other";

export interface Meal {
  id: string;
  dog_id: string;
  date: string;
  time: string;
  type: MealType;
  profile_id: string | null;
  profile_name?: string;
}

export interface HealthEvent {
  id: string;
  dog_id: string;
  date: string;
  type: "weterynarz" | "groomer" | "szczepienie" | "cieczka_start" | "cieczka_koniec" | "waga" | "inne";
  note?: string;
  next_visit?: string;
  weight?: number;
}

interface DataContextType {
  dogs: Dog[];
  walks: Walk[];
  meals: Meal[];
  healthEvents: HealthEvent[];
  homeAccidents: HomeAccidentEvent[];
  loading: boolean;
  addDog: (dog: Omit<Dog, "id" | "photos">) => Promise<void>;
  removeDog: (id: string) => Promise<void>;
  addDogPhoto: (dogId: string, dataUrl: string) => Promise<void>;
  removeDogPhoto: (dogId: string, photoId: string) => Promise<void>;
  addWalk: (walk: { dogIds: string[]; date: string; time: string; duration: number; business: WalkBusiness }) => Promise<void>;
  removeWalk: (id: string) => Promise<void>;
  addMeal: (meal: Omit<Meal, "id" | "profile_id" | "profile_name">) => Promise<void>;
  removeMeal: (id: string) => Promise<void>;
  addHealthEvent: (event: Omit<HealthEvent, "id">) => Promise<void>;
  removeHealthEvent: (id: string) => Promise<void>;
  addHomeAccident: (event: Omit<HomeAccidentEvent, "id">) => Promise<void>;
  removeHomeAccident: (id: string) => Promise<void>;
  getDogAvatar: (dogId: string) => string | null;
  getDogLatestWeight: (dogId: string) => number | null;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, householdId } = useAuth();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [walks, setWalks] = useState<Walk[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [healthEvents, setHealthEvents] = useState<HealthEvent[]>([]);
  const [homeAccidents, setHomeAccidents] = useState<HomeAccidentEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDogs = useCallback(async () => {
    if (!householdId) return [];

    const { data: dogsData, error } = await supabase
      .from("dogs")
      .select("*")
      .eq("household_id", householdId);

    if (error) {
      console.error("Error fetching dogs:", error);
      return [];
    }

    // Fetch photos for each dog
    const dogsWithPhotos = await Promise.all(
      (dogsData || []).map(async (dog) => {
        const { data: photos } = await supabase
          .from("dog_photos")
          .select("*")
          .eq("dog_id", dog.id)
          .order("created_at", { ascending: true });

        return {
          id: dog.id,
          name: dog.name,
          birth_date: dog.birth_date,
          sex: dog.sex as "male" | "female",
          breed: dog.breed,
          photos: (photos || []).map(p => ({
            id: p.id,
            data_url: p.data_url,
            created_at: p.created_at,
          })),
        };
      })
    );

    return dogsWithPhotos;
  }, [householdId]);

  const fetchWalks = useCallback(async () => {
    if (!householdId) return [];

    const { data: walksData, error } = await supabase
      .from("walks")
      .select(`
        *,
        profiles:profile_id (name),
        walk_dogs (dog_id)
      `)
      .eq("household_id", householdId);

    if (error) {
      console.error("Error fetching walks:", error);
      return [];
    }

    return (walksData || []).map((w: any) => ({
      id: w.id,
      dog_ids: w.walk_dogs?.map((wd: any) => wd.dog_id) || [],
      date: w.date,
      time: w.time,
      duration: w.duration,
      profile_id: w.profile_id,
      profile_name: w.profiles?.name,
      business: w.business as WalkBusiness,
    }));
  }, [householdId]);

  const fetchMeals = useCallback(async () => {
    if (!householdId) return [];

    const { data, error } = await supabase
      .from("meals")
      .select(`
        *,
        profiles:profile_id (name)
      `)
      .eq("household_id", householdId);

    if (error) {
      console.error("Error fetching meals:", error);
      return [];
    }

    return (data || []).map((m: any) => ({
      id: m.id,
      dog_id: m.dog_id,
      date: m.date,
      time: m.time,
      type: m.type as MealType,
      profile_id: m.profile_id,
      profile_name: m.profiles?.name,
    }));
  }, [householdId]);

  const fetchHealthEvents = useCallback(async () => {
    if (!householdId) return [];

    const { data, error } = await supabase
      .from("health_events")
      .select("*")
      .eq("household_id", householdId);

    if (error) {
      console.error("Error fetching health events:", error);
      return [];
    }

    return (data || []).map((h: any) => ({
      id: h.id,
      dog_id: h.dog_id,
      date: h.date,
      type: h.type,
      note: h.note,
      next_visit: h.next_visit,
      weight: h.weight ? Number(h.weight) : undefined,
    }));
  }, [householdId]);

  const fetchHomeAccidents = useCallback(async () => {
    if (!householdId) return [];

    const { data, error } = await supabase
      .from("home_accidents")
      .select("*")
      .eq("household_id", householdId);

    if (error) {
      console.error("Error fetching home accidents:", error);
      return [];
    }

    return (data || []).map((a: any) => ({
      id: a.id,
      dog_id: a.dog_id,
      date: a.date,
      time: a.time,
      type: a.type as HomeAccident,
    }));
  }, [householdId]);

  const refreshData = useCallback(async () => {
    if (!householdId) {
      setDogs([]);
      setWalks([]);
      setMeals([]);
      setHealthEvents([]);
      setHomeAccidents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const [d, w, m, h, a] = await Promise.all([
      fetchDogs(),
      fetchWalks(),
      fetchMeals(),
      fetchHealthEvents(),
      fetchHomeAccidents(),
    ]);

    setDogs(d);
    setWalks(w);
    setMeals(m);
    setHealthEvents(h);
    setHomeAccidents(a);
    setLoading(false);
  }, [householdId, fetchDogs, fetchWalks, fetchMeals, fetchHealthEvents, fetchHomeAccidents]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addDog = async (dog: Omit<Dog, "id" | "photos">) => {
    if (!householdId) return;

    const { error } = await supabase.from("dogs").insert({
      household_id: householdId,
      name: dog.name,
      birth_date: dog.birth_date,
      sex: dog.sex,
      breed: dog.breed,
    });

    if (error) {
      console.error("Error adding dog:", error);
      return;
    }

    await refreshData();
  };

  const removeDog = async (id: string) => {
    const { error } = await supabase.from("dogs").delete().eq("id", id);
    if (error) {
      console.error("Error removing dog:", error);
      return;
    }
    await refreshData();
  };

  const addDogPhoto = async (dogId: string, dataUrl: string) => {
    const { error } = await supabase.from("dog_photos").insert({
      dog_id: dogId,
      data_url: dataUrl,
    });

    if (error) {
      console.error("Error adding photo:", error);
      return;
    }
    await refreshData();
  };

  const removeDogPhoto = async (dogId: string, photoId: string) => {
    const { error } = await supabase.from("dog_photos").delete().eq("id", photoId);
    if (error) {
      console.error("Error removing photo:", error);
      return;
    }
    await refreshData();
  };

  const addWalk = async (walk: { dogIds: string[]; date: string; time: string; duration: number; business: WalkBusiness }) => {
    if (!householdId || !profile) return;

    const { data: walkData, error: walkError } = await supabase
      .from("walks")
      .insert({
        household_id: householdId,
        profile_id: profile.id,
        date: walk.date,
        time: walk.time,
        duration: walk.duration,
        business: walk.business,
      })
      .select()
      .single();

    if (walkError) {
      console.error("Error adding walk:", walkError);
      return;
    }

    // Add walk_dogs entries
    if (walk.dogIds.length > 0) {
      const { error: dogsError } = await supabase.from("walk_dogs").insert(
        walk.dogIds.map(dogId => ({ walk_id: walkData.id, dog_id: dogId }))
      );

      if (dogsError) {
        console.error("Error adding walk dogs:", dogsError);
      }
    }

    await refreshData();
  };

  const removeWalk = async (id: string) => {
    const { error } = await supabase.from("walks").delete().eq("id", id);
    if (error) {
      console.error("Error removing walk:", error);
      return;
    }
    await refreshData();
  };

  const addMeal = async (meal: Omit<Meal, "id" | "profile_id" | "profile_name">) => {
    if (!householdId || !profile) return;

    const { error } = await supabase.from("meals").insert({
      household_id: householdId,
      dog_id: meal.dog_id,
      profile_id: profile.id,
      date: meal.date,
      time: meal.time,
      type: meal.type,
    });

    if (error) {
      console.error("Error adding meal:", error);
      return;
    }
    await refreshData();
  };

  const removeMeal = async (id: string) => {
    const { error } = await supabase.from("meals").delete().eq("id", id);
    if (error) {
      console.error("Error removing meal:", error);
      return;
    }
    await refreshData();
  };

  const addHealthEvent = async (event: Omit<HealthEvent, "id">) => {
    if (!householdId) return;

    const { error } = await supabase.from("health_events").insert({
      household_id: householdId,
      dog_id: event.dog_id,
      date: event.date,
      type: event.type,
      note: event.note,
      next_visit: event.next_visit,
      weight: event.weight,
    });

    if (error) {
      console.error("Error adding health event:", error);
      return;
    }
    await refreshData();
  };

  const removeHealthEvent = async (id: string) => {
    const { error } = await supabase.from("health_events").delete().eq("id", id);
    if (error) {
      console.error("Error removing health event:", error);
      return;
    }
    await refreshData();
  };

  const addHomeAccident = async (event: Omit<HomeAccidentEvent, "id">) => {
    if (!householdId) return;

    const { error } = await supabase.from("home_accidents").insert({
      household_id: householdId,
      dog_id: event.dog_id,
      date: event.date,
      time: event.time,
      type: event.type,
    });

    if (error) {
      console.error("Error adding home accident:", error);
      return;
    }
    await refreshData();
  };

  const removeHomeAccident = async (id: string) => {
    const { error } = await supabase.from("home_accidents").delete().eq("id", id);
    if (error) {
      console.error("Error removing home accident:", error);
      return;
    }
    await refreshData();
  };

  const getDogAvatar = (dogId: string): string | null => {
    const dog = dogs.find(d => d.id === dogId);
    if (dog && dog.photos.length > 0) {
      return dog.photos[0].data_url;
    }
    return null;
  };

  const getDogLatestWeight = (dogId: string): number | null => {
    const weightEvents = healthEvents
      .filter(e => e.dog_id === dogId && e.type === "waga" && e.weight)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return weightEvents.length > 0 ? weightEvents[0].weight! : null;
  };

  return (
    <DataContext.Provider value={{
      dogs,
      walks,
      meals,
      healthEvents,
      homeAccidents,
      loading,
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
      getDogLatestWeight,
      refreshData,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be within DataProvider");
  return ctx;
};
