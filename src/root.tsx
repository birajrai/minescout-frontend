/* oxlint-disable react/only-export-components -- framework root route exports links + components */
import type { ReactNode } from 'react'
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './lib/auth'
import { ThemeProvider } from './lib/theme'
import { LayoutWidthProvider } from './lib/layout-width'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const status = (error as { status?: number }).status
        if (typeof status === 'number' && status >= 400 && status < 500) return false
        return failureCount < 2
      },
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})

export function links() {
  return [
    { rel: 'preload', href: '/assets/fonts/MinecraftTen-VGORe.ttf', as: 'font', type: 'font/ttf', crossOrigin: 'anonymous' },
    { rel: 'preload', href: '/assets/fonts/noto-sans.css', as: 'style' },
    { rel: 'stylesheet', href: '/assets/fonts/noto-sans.css' },
    { rel: 'stylesheet', href: '/assets/fonts/jetbrains-mono.css' },
    { rel: 'stylesheet', href: '/assets/css/tailwind.css' },
    { rel: 'stylesheet', href: '/assets/css/main.min.css' },
    { rel: 'icon', href: '/uploads/brand/favicon-32x32.png?v=1786293313', type: 'image/png', sizes: '32x32' },
    { rel: 'icon', href: '/uploads/brand/favicon.ico?v=1786293313', sizes: 'any' },
    { rel: 'apple-touch-icon', href: '/uploads/brand/apple-touch-icon.png?v=1786293313', type: 'image/png', sizes: '180x180' },
  ]
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="content-language" content="en" />
        <title>Minescout — Minecraft Server List</title>
        <meta name="description" content="Discover the best Minecraft servers to join in 2026. Find 10,000+ ranked mc servers with live player counts, uptime tracking, and gamemode filters on this Minecraft Server List." />
        <meta property="og:title" content="Minescout — Minecraft Server List" />
        <meta property="og:description" content="Discover the best Minecraft servers to join in 2026." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og.png" />
        <Meta />
        <Links />
        <script
          dangerouslySetInnerHTML={{
            __html: `;(function () {
              var storageKey = 'theme'
              var defaultTheme = 'system'
              var stored = localStorage.getItem(storageKey) || defaultTheme
              var resolved = stored === 'system'
                ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                : stored
              document.documentElement.classList.add(resolved)
              document.documentElement.style.colorScheme = resolved
            })()`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export function HydrateFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <span className="font-minecraft text-2xl text-stone-500 dark:text-stone-400">Minescout</span>
      <span className="size-6 animate-spin rounded-full border-2 border-stone-400 border-t-transparent" aria-hidden="true" />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <LayoutWidthProvider>
            <Outlet />
          </LayoutWidthProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
