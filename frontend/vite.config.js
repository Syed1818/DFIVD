import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const apiTarget = env.VITE_API_URL || "http://127.0.0.1:8000";

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(".", "src"),
      },
      dedupe: ["react", "react-dom"],
    },
    optimizeDeps: {
      include: ["motion/react"],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/three') || id.includes('node_modules/@react-three')) {
              return 'three-vendor';
            }
          }
        }
      }
    },
    server: {
      allowedHosts: [
        'unpersonalised-clay-traditive.ngrok-free.dev'
      ],
      port: 5173,
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
