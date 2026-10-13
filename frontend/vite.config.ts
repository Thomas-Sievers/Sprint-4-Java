import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // The API only allows CORS from http://localhost:5500, so the dev server must run there.
  server: { port: 5500, strictPort: true },
  preview: { port: 5500, strictPort: true },
})
