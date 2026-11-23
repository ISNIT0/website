import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  build: {
    // `out/` keeps the Netlify publish dir unchanged; Cloudflare will serve it as static assets.
    outDir: "out",
    // Keep font files as files (not inlined) so they can be preloaded and cached.
    assetsInlineLimit: 0,
  },
});
