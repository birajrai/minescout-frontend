import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const API_TARGET = process.env.API_TARGET || 'http://localhost:3001'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-router') || id.includes('node_modules/react-dom')) return 'vendor-react'
          if (id.includes('node_modules/@tanstack')) return 'vendor-query'
          if (id.includes('node_modules/lucide-react')) return 'vendor-ui'
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: API_TARGET,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
      '/auth': API_TARGET,
    },
  },
})
