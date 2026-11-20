import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
server: {
    // While running locally, send any request starting with /api to the
    // real backend to avoid the browser's CORS block on localhost.
    proxy: {
      '/api': {
        // set VITE_API_TARGET=http://127.0.0.1:8000 to test with a local backend
        target: process.env.VITE_API_TARGET || 'https://wesal-backend-gy8a.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})