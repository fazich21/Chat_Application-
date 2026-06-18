import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigError =
  !supabaseUrl || !supabaseKey
    ? "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example → .env.local and fill in your project credentials, then restart the dev server."
    : null;

if (supabaseConfigError) {
  // Log loudly instead of throwing — a thrown error at module scope with no
  // error boundary in the tree would unmount the whole app to a blank screen.
  console.error(`[Supabase] ${supabaseConfigError}`);
}

// Fall back to placeholder values so createClient doesn't throw; every real
// request will fail until .env.local is fixed, but the app still renders
// and can show a helpful banner instead of a blank screen.
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseKey || "placeholder-anon-key",
  {
    auth: {
      persistSession:      true,
      autoRefreshToken:    true,
      detectSessionInUrl:  true,
      storageKey:          "pulse-auth",
    },
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  }
);

/** Typed table helpers — usage: db("profiles").select("*") */
export const db = (table) => supabase.from(table);
