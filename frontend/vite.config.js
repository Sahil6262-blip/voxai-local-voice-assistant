
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    allowedHosts: [
      "sampling-discs-operate-promotes.trycloudflare.com",
    ],
    proxy: {
      "/api": "http://127.0.0.1:8000",
    },
  },
  preview: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": "http://127.0.0.1:8000",
    },
  },
});
