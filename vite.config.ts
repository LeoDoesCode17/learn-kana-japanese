import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        exercise: resolve(__dirname, "kana_exercise_1.html"),
        staytuned: resolve(__dirname, "stay-tuned.html"),
      },
    },
  },
});