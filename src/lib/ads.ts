import { api } from './api'
import { useApiQuery } from './hooks'
import { queryKeys } from './queryKeys'

export interface Ad {
  id: string
  slot: string
  placement: string
  placementValue: string
  imageUrl: string
  targetUrl: string
  active: boolean
  startsAt: string | null
  endsAt: string | null
  createdAt: string
}

export function useAds(slot?: string, enabled = true) {
  return useApiQuery(
    queryKeys.ads(slot),
    () => api.get<Ad[]>('/ads', slot ? { slot } : undefined),
    { enabled }
  )
}
