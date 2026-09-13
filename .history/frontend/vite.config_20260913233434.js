import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://unpersonalised-clay-traditive.ngrok-free.dev',
        changeOrigin: true,
        secure: false,
        headers: {
          // Add this so ngrok's interstitial doesn't intercept proxied calls
          'ngrok-skip-browser-warning': 'true'
        }
      }
    }
  }
})