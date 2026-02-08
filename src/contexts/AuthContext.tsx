import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface Profile {
  id: string;
  user_id: string;
  household_id: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  householdCode: string | null;
  householdId: string | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, householdCode?: string) => Promise<{ error: string | null; needsVerification?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  joinHousehold: (code: string, name: string) => Promise<{ error: string | null }>;
  createHousehold: (name: string) => Promise<{ error: string | null; code?: string }>;
  householdMembers: Profile[];
  refreshHouseholdMembers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [householdCode, setHouseholdCode] = useState<string | null>(null);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [householdMembers, setHouseholdMembers] = useState<Profile[]>([]);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    return data as Profile | null;
  }, []);

  const fetchHouseholdCode = useCallback(async (hId: string) => {
    const { data, error } = await supabase
      .from("households")
      .select("code")
      .eq("id", hId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching household code:", error);
      return null;
    }
    return data?.code || null;
  }, []);

  const refreshHouseholdMembers = useCallback(async () => {
    if (!householdId) {
      setHouseholdMembers([]);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("household_id", householdId);

    if (error) {
      console.error("Error fetching household members:", error);
      return;
    }

    setHouseholdMembers(data as Profile[]);
  }, [householdId]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          // Defer profile fetch to avoid deadlock
          setTimeout(async () => {
            const p = await fetchProfile(newSession.user.id);
            setProfile(p);
            if (p?.household_id) {
              setHouseholdId(p.household_id);
              const code = await fetchHouseholdCode(p.household_id);
              setHouseholdCode(code);
            }
          }, 0);
        } else {
          setProfile(null);
          setHouseholdCode(null);
          setHouseholdId(null);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      if (existingSession?.user) {
        setSession(existingSession);
        setUser(existingSession.user);
        fetchProfile(existingSession.user.id).then(p => {
          setProfile(p);
          if (p?.household_id) {
            setHouseholdId(p.household_id);
            fetchHouseholdCode(p.household_id).then(code => {
              setHouseholdCode(code);
            });
          }
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, fetchHouseholdCode]);

  useEffect(() => {
    refreshHouseholdMembers();
  }, [householdId, refreshHouseholdMembers]);

  const signUp = async (email: string, password: string, name: string, code?: string): Promise<{ error: string | null; needsVerification?: boolean }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      }
    });

    if (error) {
      return { error: error.message };
    }

    // Check if email confirmation is required
    if (data.user && !data.session) {
      // User needs to verify email
      return { error: null, needsVerification: true };
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setHouseholdCode(null);
    setHouseholdId(null);
    setHouseholdMembers([]);
  };

  const createHousehold = async (name: string): Promise<{ error: string | null; code?: string }> => {
    if (!user) return { error: "Musisz być zalogowany" };

    // Generate unique code
    const { data: codeData, error: codeError } = await supabase.rpc("generate_unique_household_code");
    if (codeError) return { error: codeError.message };

    const newCode = codeData as string;

    // Create household
    const { data: household, error: householdError } = await supabase
      .from("households")
      .insert({ code: newCode })
      .select()
      .single();

    if (householdError) return { error: householdError.message };

    // Create profile
    const { data: newProfile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        user_id: user.id,
        household_id: household.id,
        name
      })
      .select()
      .single();

    if (profileError) return { error: profileError.message };

    setProfile(newProfile as Profile);
    setHouseholdId(household.id);
    setHouseholdCode(newCode);

    return { error: null, code: newCode };
  };

  const joinHousehold = async (code: string, name: string): Promise<{ error: string | null }> => {
    if (!user) return { error: "Musisz być zalogowany" };

    // Check if code exists
    const { data: exists, error: checkError } = await supabase.rpc("household_code_exists", { code_to_check: code });
    if (checkError) return { error: checkError.message };
    if (!exists) return { error: "Błędny kod gospodarstwa" };

    // Get household id
    const { data: hId, error: idError } = await supabase.rpc("get_household_id_by_code", { code_to_check: code });
    if (idError) return { error: idError.message };
    if (!hId) return { error: "Błędny kod gospodarstwa" };

    // Create profile
    const { data: newProfile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        user_id: user.id,
        household_id: hId,
        name
      })
      .select()
      .single();

    if (profileError) return { error: profileError.message };

    setProfile(newProfile as Profile);
    setHouseholdId(hId);
    setHouseholdCode(code);

    return { error: null };
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      householdCode,
      householdId,
      loading,
      signUp,
      signIn,
      signOut,
      joinHousehold,
      createHousehold,
      householdMembers,
      refreshHouseholdMembers,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be within AuthProvider");
  return ctx;
};
