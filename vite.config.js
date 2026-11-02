import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { sessionServerPlugin } from './src/server/sessionPlugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), sessionServerPlugin()],
  server: {
    host: true
  }
})
