/* oxlint-disable react/only-export-components -- provider + hook in one file is intentional */
import { createContext, useContext, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import { queryKeys } from './queryKeys'
import type { AuthMe } from './types'

interface AuthContextValue {
  user: AuthMe | null
  isLoading: boolean
  isAdmin: boolean
  refetch: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const query = useQuery<AuthMe | null>({
    queryKey: queryKeys.authMe,
    queryFn: async () => {
      try {
        return await api.get<AuthMe>('/auth/me')
      } catch (err) {
        if ((err as { status?: number }).status === 401) return null
        throw err
      }
    },
    retry: false,
    staleTime: 5 * 60_000,
  })

  const value: AuthContextValue = {
    user: query.data ?? null,
    isLoading: query.isPending,
    isAdmin: query.data?.isAdmin === true,
    refetch: () => {
      void query.refetch()
      void queryClient.invalidateQueries({ queryKey: queryKeys.me })
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function loginWithDiscord() {
  window.location.href = '/api/auth/discord'
}

export function loginWithGoogle() {
  window.location.href = '/api/auth/google'
}

export async function logout() {
  await api.post('/auth/logout').catch(() => undefined)
  window.location.href = '/'
}

export function RequireAuth({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const { user, isLoading, isAdmin } = useAuth()
  const location = useLocation()
  if (isLoading) return null
  if (!user) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`)
    return <Navigate to={`/login?next=${next}`} replace />
  }
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
