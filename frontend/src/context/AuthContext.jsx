// PURPOSE: Provides local development login state while application features are built.
// USAGE: Wrap <App> with <AuthProvider>. Replace with production auth before deployment.

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { APP_STORAGE_KEYS } from "../utils/constants";

const AuthContext = createContext(null);
const ADMIN_EMAIL = (import.meta.env.VITE_DEV_ADMIN_EMAIL || "admin@lga.local").toLowerCase();
const ADMIN_PASSWORD = import.meta.env.VITE_DEV_ADMIN_PASSWORD || "admin123";
const ADMIN_PROFILE = {
  id: "dev-admin",
  full_name: "Local Admin",
  role: "admin",
  is_active: true,
};

function readSession() {
  try {
    return JSON.parse(window.localStorage.getItem(APP_STORAGE_KEYS.devSession)) || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSession(readSession());
    setLoading(false);
  }, []);

  const signIn = useCallback(async (email, password) => {
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      throw new Error("Incorrect email or password.");
    }

    const nextSession = {
      user: { id: ADMIN_PROFILE.id, email: ADMIN_EMAIL },
      profile: ADMIN_PROFILE,
    };
    window.localStorage.setItem(APP_STORAGE_KEYS.devSession, JSON.stringify(nextSession));
    setSession(nextSession);
    return nextSession;
  }, []);

  const signOut = useCallback(async () => {
    window.localStorage.removeItem(APP_STORAGE_KEYS.devSession);
    setSession(null);
  }, []);

  const profile = session?.profile ?? null;
  const user = session?.user ?? null;

  return (
    <AuthContext.Provider value={{
      user, profile, session, loading,
      signIn, signOut,
      isAdmin: profile?.role === "admin",
      isManager: profile?.role === "admin" || profile?.role === "manager",
      isCashier: Boolean(profile),
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
