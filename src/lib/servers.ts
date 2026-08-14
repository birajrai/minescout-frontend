import { api } from './api'
import { useApiQuery } from './hooks'
import { queryKeys } from './queryKeys'
import type {
  Facet,
  GlobalStats,
  HistoryPoint,
  Paged,
  RankPoint,
  Review,
  Server,
  ServerListParams,
} from './types'

export function useServers(params: ServerListParams) {
  return useApiQuery(queryKeys.serverList(params), () =>
    api.get<Paged<Server>>(`/servers`, params as Record<string, string | number | boolean>)
  )
}

export function useServer(slug: string, enabled = true) {
  return useApiQuery(
    queryKeys.server(slug),
    () => api.get<Server>(`/servers/${encodeURIComponent(slug)}`),
    { enabled }
  )
}

export function useServerHistory(slug: string, points = 48) {
  return useApiQuery(queryKeys.serverHistory(slug), () =>
    api.get<HistoryPoint[]>(`/servers/${encodeURIComponent(slug)}/history`, { points })
  )
}

export function useServerRankHistory(slug: string, range: '24h' | '7d' | '30d' = '7d') {
  return useApiQuery(queryKeys.serverRankHistory(slug), () =>
    api.get<RankPoint[]>(`/servers/${encodeURIComponent(slug)}/rank-history`, { range })
  )
}

export function useServerReviews(slug: string) {
  return useApiQuery(queryKeys.serverReviews(slug), () =>
    api.get<Review[]>(`/servers/${encodeURIComponent(slug)}/reviews`)
  )
}

export function useMyServers(enabled = true) {
  return useApiQuery(queryKeys.meServers, () => api.get<Server[]>('/me/servers'), { enabled })
}

export function useFacets(kind: 'gamemodes' | 'versions' | 'countries') {
  return useApiQuery(queryKeys.facets(kind), () => api.get<Facet[]>(`/${kind}`))
}

export function useGlobalStats() {
  return useApiQuery(queryKeys.stats, () => api.get<GlobalStats>('/stats'))
}

// ---- formatting helpers (mirror the static-port output) ----

export function formatPlayers(online: number, max: number): string {
  const fmt = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}k` : String(n))
  return `${online}/${fmt(max)} playing now`
}

export function playersText(server: Server): string {
  if (server.online) return formatPlayers(server.playersOnline, server.playersMax)
  if (server.playersOnline > 0 || server.playersMax > 0) {
    return `Stale snapshot · ${server.playersOnline}/${server.playersMax} (when last reachable)`
  }
  return 'Player counts update when our ping succeeds.'
}

export function firstTag(server: Server): string {
  return server.tags[0] ?? 'survival'
}

export function serverUrl(slug: string): string {
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  return `${base}/${slug}`
}

export function slugifyName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export { api }
