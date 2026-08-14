import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const API_TARGET = env.API_TARGET || 'https://minescout-api.bharosilo.com'

  return {
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
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/api/, ''),
        configure: (proxy) => proxy.on('proxyReq', (req) => req.removeHeader('origin')),
      },
      '/auth': {
        target: API_TARGET,
        changeOrigin: true,
        secure: false,
        configure: (proxy) => proxy.on('proxyReq', (req) => req.removeHeader('origin')),
      },
      },
    },
  }
})
