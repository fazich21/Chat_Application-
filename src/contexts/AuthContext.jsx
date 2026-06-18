import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase, db } from "../services/supabase.js";
import {
  signIn as svcSignIn,
  signUp as svcSignUp,
  signOut as svcSignOut,
  resetPassword as svcResetPassword,
  updatePassword as svcUpdatePassword,
} from "../services/authService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session,  setSession]  = useState(undefined); // undefined = bootstrapping
  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [authError, setAuthError] = useState(null);

  /* ── fetch profile row ── */
  const fetchProfile = useCallback(async (userId) => {
    const { data } = await db("profiles").select("*").eq("id", userId).single();
    setProfile(data ?? null);
  }, []);

  /* ── bootstrap: read persisted session ── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setAuthError(null);

        if (event === "SIGNED_IN" && session?.user) {
          await fetchProfile(session.user.id);
        }
        if (event === "SIGNED_OUT") {
          setProfile(null);
        }
        if (event === "PASSWORD_RECOVERY") {
          // handled in ResetPasswordPage
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  /* ── actions ── */
  const login = useCallback(async ({ email, password }) => {
    setAuthError(null);
    try {
      await svcSignIn({ email, password });
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  }, []);

  const register = useCallback(async ({ email, password, username }) => {
    setAuthError(null);
    try {
      await svcSignUp({ email, password, username });
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    await svcSignOut();
  }, []);

  const forgotPassword = useCallback(async (email) => {
    setAuthError(null);
    try {
      await svcResetPassword(email);
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  }, []);

  const changePassword = useCallback(async (newPassword) => {
    setAuthError(null);
    try {
      await svcUpdatePassword(newPassword);
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  }, []);

  const value = {
    session,
    user:            session?.user ?? null,
    profile,
    loading,
    authError,
    isAuthenticated: !!session,
    // actions
    login,
    register,
    logout,
    forgotPassword,
    changePassword,
    refreshProfile:  () => session?.user && fetchProfile(session.user.id),
    clearAuthError:  () => setAuthError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
