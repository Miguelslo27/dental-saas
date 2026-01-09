import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5174,
      host: true,
    },
    preview: {
      port: 5174,
    },
    define: {
      __APP_URL__: JSON.stringify(env.VITE_APP_URL || "http://localhost:5173"),
    },
  };
});
