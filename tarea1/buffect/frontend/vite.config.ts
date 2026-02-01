import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    host: true, // equivalente a 0.0.0.0
    port: 5173,
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
});
