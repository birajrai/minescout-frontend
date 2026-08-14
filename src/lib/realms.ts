import { api } from './api'
import { useApiQuery } from './hooks'
import { queryKeys } from './queryKeys'

export interface Realm {
  id: string
  code: string
  name: string
  description: string
  region: string
  imageUrl: string
  edition: 'java' | 'bedrock'
  ownerId: string
  createdAt: string
}

export function useRealms(params?: { search?: string; edition?: string; page?: number; limit?: number }) {
  return useApiQuery(queryKeys.realms(params as Record<string, string | number | undefined>), () =>
    api.get<{ results: Realm[]; total: number; page: number; limit: number }>('/realms', params as Record<string, string | number | undefined>)
  )
}

export function useRealm(code: string) {
  return useApiQuery(queryKeys.realm(code), () => api.get<Realm>(`/realms/${encodeURIComponent(code)}`))
}
