import { api } from './api'
import { useApiQuery } from './hooks'
import type { Server, Paged } from './types'

export interface AdminDashboard {
  users: number
  servers: number
  serversOnline: number
  pendingClaims: number
  openReports: number
  votesToday: number
  newestUsers: { id: string; username: string; createdAt: string }[]
  newestServers: { id: string; name: string; slug: string; createdAt: string }[]
}

export function useAdminDashboard() {
  return useApiQuery(['admin', 'dashboard'], () => api.get<AdminDashboard>('/admin/dashboard'))
}

export function useAdminServers(params: { search?: string; status?: string; page?: number; limit?: number }) {
  return useApiQuery(['admin', 'servers', params], () =>
    api.get<Paged<Server>>('/admin/servers', params as Record<string, string | number | boolean>)
  )
}

export interface AdminClaim {
  id: string
  status: 'pending' | 'approved' | 'denied'
  createdAt: string
  serverName: string
  serverSlug: string
  claimant: string
  claimantDiscordId: string
}

export interface AdminReport {
  id: string
  status: 'open' | 'resolved' | 'dismissed'
  reason: string
  createdAt: string
  serverName: string
  serverSlug: string
  reporter: string
}

export function useAdminClaims() {
  return useApiQuery(['admin', 'claims'], () => api.get<AdminClaim[]>('/admin/claims'))
}

export function useAdminReports() {
  return useApiQuery(['admin', 'reports'], () => api.get<AdminReport[]>('/admin/reports'))
}
