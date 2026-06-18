import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("@supabase"))       return "supabase";
            if (id.includes("react-router"))    return "router";
            if (id.includes("react-dom") || id.includes("react/")) return "react";
            if (id.includes("zustand"))         return "zustand";
          }
        },
      },
    },
  },
});
