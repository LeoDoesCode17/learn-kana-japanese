import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        exercise: resolve(__dirname, "kana_exercise_1.html"),
        staytuned: resolve(__dirname, "stay-tuned.html"),
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://learn-kana-japanese.vercel.app",
        changeOrigin: true,
      },
    },
  },
});
