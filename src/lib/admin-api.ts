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

/** Admin server row: public fields + rank/views/deleted extras. */
export interface AdminServerRow extends Server {
  views: number
  rank: number
  prevRank: number | null
  rankTrend: 'up' | 'down' | 'same' | 'new'
  deletedAt: string | null
}

export interface AdminServersParams {
  search?: string
  status?: string
  gamemode?: string
  includeDeleted?: boolean
  sort?: string
  page?: number
  limit?: number
}

export function useAdminServers(params: AdminServersParams) {
  const q: Record<string, string | number | boolean | undefined> = {
    search: params.search || undefined,
    status: params.status || undefined,
    gamemode: params.gamemode || undefined,
    includeDeleted: params.includeDeleted || undefined,
    sort: params.sort || undefined,
    page: params.page || undefined,
    limit: params.limit || undefined,
  }
  return useApiQuery(['admin', 'servers', params], () => api.get<Paged<AdminServerRow>>('/admin/servers', q))
}

export function useAdminLogs(params: { page?: number; limit?: number; action?: string; entityType?: string; search?: string }) {
  return useApiQuery(['admin', 'logs', params], () =>
    api.get<Paged<AuditLogEntry>>('/admin/logs', {
      page: params.page ?? undefined,
      limit: params.limit ?? undefined,
      action: params.action || undefined,
      entityType: params.entityType || undefined,
      search: params.search || undefined,
    })
  )
}

export function useAdminLogActions() {
  return useApiQuery(['admin', 'logs', 'actions'], () => api.get<string[]>('/admin/logs/actions'))
}

export interface AuditLogEntry {
  id: string
  actorId: string | null
  actorName: string
  action: string
  entityType: string
  entityId: string
  meta: Record<string, unknown>
  createdAt: string
}

export interface AdminRealm {
  id: string
  code: string
  name: string
  description: string
  region: string
  edition: 'java' | 'bedrock'
  imageUrl: string
  ownerName: string | null
  createdAt: string
  updatedAt: string
}

export function useAdminRealms() {
  return useApiQuery(['admin', 'realms'], () => api.get<AdminRealm[]>('/admin/realms'))
}

export function useAdminBlogTags() {
  return useApiQuery(['admin', 'blog-tags'], () => api.get<{ id: string; slug: string; name: string }[]>('/admin/blog-tags'))
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
