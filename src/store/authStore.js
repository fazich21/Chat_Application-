import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user:    null,
      profile: null,
      setUser:    (user)    => set({ user }),
      setProfile: (profile) => set({ profile }),
      clear:      ()        => set({ user: null, profile: null }),
    }),
    { name: "pulse-auth-store", partialize: (s) => ({ profile: s.profile }) }
  )
);
