// PURPOSE: Configures Vite for the React frontend build and local development server.
// USAGE: Vite reads this file for `npm run dev`, `npm run build`, and preview commands.

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Keep local development isolated from stale dependency bundles after major service changes.
  cacheDir: "node_modules/.vite-lga-local",
  build: {
    outDir: "dist",
    rollupOptions: {
      // BrowserRouter requires deployment rewrites so deep links serve index.html.
      // Vercel uses frontend/vercel.json; Render static sites need an equivalent rewrite rule.
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
