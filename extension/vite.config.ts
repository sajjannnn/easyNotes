import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        side_panel: "index.html",
        background: "src/background/index.ts",
        content: "src/content/index.tsx",
      },
      output: {
        // Keep nice names for Chrome extension entry files
        entryFileNames: "[name].js",
        // Try to avoid shared chunks between entries (still builds as ESM).
        manualChunks: undefined,
      },
    },
    outDir: "dist",
  },
  plugins: [react(), tailwindcss()],
});
