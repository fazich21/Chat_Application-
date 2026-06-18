import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUIStore = create(
  persist(
    (set) => ({
      sidebarOpen:  true,
      activeModal:  null,  // null | "newChat" | "newGroup" | "imagePreview"
      modalPayload: null,

      setSidebarOpen:  (v)       => set({ sidebarOpen: v }),
      toggleSidebar:   ()        => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      openModal:       (id, data) => set({ activeModal: id, modalPayload: data ?? null }),
      closeModal:      ()        => set({ activeModal: null, modalPayload: null }),
    }),
    { name: "pulse-ui-store", partialize: (s) => ({ sidebarOpen: s.sidebarOpen }) }
  )
);
