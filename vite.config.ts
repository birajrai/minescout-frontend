import { defineConfig, loadEnv } from 'vite'
import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const API_TARGET = env.API_TARGET || 'https://minescout-api.bharosilo.com'

  return {
    plugins: [tailwindcss(), reactRouter()],
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
