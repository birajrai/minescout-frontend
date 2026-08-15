import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './auth'
import { ThemeProvider } from './theme'
import { LayoutWidthProvider } from './layout-width'

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

/** Shared provider stack for the public (SSR) app and the admin/dashboard SPA. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <LayoutWidthProvider>{children}</LayoutWidthProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
