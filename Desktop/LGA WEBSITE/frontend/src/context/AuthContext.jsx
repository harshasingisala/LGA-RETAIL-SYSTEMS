// PURPOSE: Provides real Supabase auth state, JWT session, and role to the entire app.
// USAGE: Wrap <App> with <AuthProvider>. Use useAuth() in any component.

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);   // supabase User object
  const [profile, setProfile] = useState(null);   // public.profiles row
  const [session, setSession] = useState(null);   // supabase Session (has access_token)
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, role, is_active")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Failed to fetch profile", error.message);
      return null;
    }
    return data;
  }, []);

  useEffect(() => {
    // Restore existing session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const p = await fetchProfile(session.user.id);
        setProfile(p);
      }
      setLoading(false);
    });

    // Subscribe to auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          const p = await fetchProfile(session.user.id);
          setProfile(p);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const isAdmin    = profile?.role === "admin";
  const isManager  = profile?.role === "admin" || profile?.role === "manager";
  const isCashier  = !!profile;

  return (
    <AuthContext.Provider value={{
      user, profile, session, loading,
      signIn, signOut,
      isAdmin, isManager, isCashier,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
