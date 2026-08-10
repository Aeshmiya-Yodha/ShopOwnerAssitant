import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // FastAPI serves this folder as static files
    outDir: '../static',
    emptyOutDir: true,
  },
  server: {
    // /api calls go to uvicorn during local development
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
