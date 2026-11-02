import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 3000,
    proxy: {
      "/api": "http://127.0.0.1:8000"
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./client"),
      "@shared": path.resolve(process.cwd(), "./shared")
    }
  }
});
