import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// Client-only SPA for /admin + /dashboard. Built separately from the public
// SSR app (react-router) and emitted into build/client/spa so Vercel serves
// it statically. Never server-rendered.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const API_TARGET = env.API_TARGET || 'https://minescout-api.bharosilo.com'

  return {
    plugins: [tailwindcss()],
    base: '/spa/',
    build: {
      outDir: 'build/client/spa',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          index: fileURLToPath(new URL('./app.html', import.meta.url)),
        },
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-router') || id.includes('node_modules/react-dom')) return 'vendor-react'
            if (id.includes('node_modules/@tanstack')) return 'vendor-query'
            if (id.includes('node_modules/lucide-react')) return 'vendor-ui'
            if (id.includes('node_modules/@tiptap') || id.includes('node_modules/marked')) return 'vendor-editor'
          },
        },
      },
    },
    server: {
      port: 3001,
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
