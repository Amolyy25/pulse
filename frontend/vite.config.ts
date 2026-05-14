import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      injectRegister: "auto",
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
      },
      manifest: {
        name: "Pulse",
        short_name: "Pulse",
        description: "Ton tracker d'habitudes gamifié",
        theme_color: "#f9a8d4",
        background_color: "#fdf4ff",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/pulse-icon.svg",
            sizes: "192x192 512x512 any",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "/pulse-icon-maskable.svg",
            sizes: "192x192 512x512 any",
            type: "image/svg+xml",
            purpose: "maskable",
          },
        ],
      },
      devOptions: {
        enabled: false,
        type: "module",
      },
    }),
  ],
  server: {
    port: 5173,
  },
});
