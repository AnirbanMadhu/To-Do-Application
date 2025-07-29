// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // forward any /api/* request to port 4001
      '/api': {
        target: 'http://localhost:4001',
        changeOrigin: true,
      },
      // and socket.io too
      '/socket.io': {
        target: 'http://localhost:4001',
        ws: true,
      },
    },
  },
})
