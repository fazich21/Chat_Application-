import { supabase, db } from "./supabase.js";

/** Sign up with email + password, then upsert a profile row */
export async function signUp({ email, password, username }) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  if (data.user) {
    // upsert so duplicate signups don't error if profile already exists
    const { error: profileError } = await db("profiles").upsert({
      id:       data.user.id,
      username: username.trim(),
    });
    if (profileError) throw profileError;
  }
  return data;
}

/** Sign in with email + password */
export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/** Sign out (clears local session storage automatically) */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** Send a password reset email */
export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${import.meta.env.VITE_APP_URL ?? window.location.origin}/reset-password`,
  });
  if (error) throw error;
}

/** Update password after clicking the reset link */
export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

/** Read the current session from storage */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/** Get the authenticated user object (null if not signed in) */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user ?? null;
}
