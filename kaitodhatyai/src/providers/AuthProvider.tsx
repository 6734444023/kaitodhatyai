/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  signOut as firebaseSignOut,
  getIdTokenResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  type User,
} from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase-config";
import { Outlet } from "react-router-dom";
/* ----------------- Types ----------------- */
type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

/* ----------------- Auth Context + Hook ----------------- */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children?: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setIsAdmin(null);
      if (u) {
        try {
          const idTokenResult = await getIdTokenResult(u, false);
          const claims = idTokenResult.claims as Record<string, any>;
          if (claims && (claims.admin === true || claims.admin === "true")) {
            setIsAdmin(true);
          } else {
            // fallback allowlist (replace with your admin emails or check in your DB)
            const allowlist = ["admin@example.com"];
            setIsAdmin(allowlist.includes(u.email ?? ""));
          }
        } catch (err) {
          console.error("failed to read token claims", err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signIn, signOut }}>
      {children ?? <Outlet />}
    </AuthContext.Provider>
  );
};
