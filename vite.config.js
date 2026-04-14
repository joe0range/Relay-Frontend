import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Dev-only proxy — in production, VITE_API_URL points directly to Render
    proxy: {
      '/translate': 'http://localhost:8000',
      '/languages':  'http://localhost:8000',
    },
  },
})
