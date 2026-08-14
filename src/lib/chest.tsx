import { useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import { useAuth } from './auth'
import { queryKeys } from './queryKeys'
import type { SavedServer } from './types'

export interface ChestItem {
  slug: string
  name: string
  ip: string
  icon: string
  url: string
  voteUrl: string
}

const KEY = 'mine_chest'

function load(): ChestItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function save(items: ChestItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items))
  } catch {
    // ignore
  }
}

function toChestItem(s: SavedServer): ChestItem {
  return {
    slug: s.slug,
    name: s.name,
    ip: s.ip,
    icon: s.icon,
    url: `/${s.slug}`,
    voteUrl: `/${s.slug}/vote`,
  }
}

export function isSaved(slug: string): boolean {
  return load().some((i) => i.slug === slug)
}

/** Optimistic local-only toggle; returns the new saved state. */
export function toggleSave(item: ChestItem): boolean {
  const items = load()
  const idx = items.findIndex((i) => i.slug === item.slug)
  let nowSaved: boolean
  if (idx >= 0) {
    items.splice(idx, 1)
    nowSaved = false
  } else {
    items.unshift(item)
    nowSaved = true
  }
  save(items)
  notifyChestUpdated()
  return nowSaved
}

export function clearChest() {
  save([])
  notifyChestUpdated()
}

export function notifyChestUpdated() {
  window.dispatchEvent(new Event('chest-updated'))
}

/** Chest contents: localStorage (instant) reconciled with the server when authed. */
export function useChest(): ChestItem[] {
  const [items, setItems] = useState<ChestItem[]>(load)
  const { user } = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    const update = () => setItems(load())
    update()
    window.addEventListener('storage', update)
    window.addEventListener('chest-updated', update)
    return () => {
      window.removeEventListener('storage', update)
      window.removeEventListener('chest-updated', update)
    }
  }, [])

  // Pull the authoritative saved list from the server and reconcile.
  useEffect(() => {
    if (!user) return
    void queryClient
      .fetchQuery({ queryKey: queryKeys.saved, queryFn: () => api.get<SavedServer[]>('/me/saved') })
      .then((remote) => {
        const map = new Map(remote.map((s) => [s.slug, toChestItem(s)]))
        const reconciled = load().filter((m) => map.has(m.slug))
        for (const item of map.values()) {
          const i = reconciled.findIndex((m) => m.slug === item.slug)
          if (i >= 0) reconciled[i] = item
          else reconciled.push(item)
        }
        save(reconciled)
        setItems(reconciled)
        notifyChestUpdated()
      })
      .catch(() => undefined)
  }, [user, queryClient])

  return items
}

/** Toggle save with optimistic UI + server sync (no-op server call when guest). */
export function useChestActions() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const toggle = useCallback(
    (item: ChestItem): boolean => {
      const nowSaved = toggleSave(item)
      if (user) {
        const sync = nowSaved
          ? () => api.post<{ success: boolean }>(`/servers/${item.slug}/save`)
          : () => api.delete<{ success: boolean }>(`/servers/${item.slug}/save`)
        sync()
          .then(() => void queryClient.invalidateQueries({ queryKey: queryKeys.saved }))
          .catch(() => {
            // Revert optimistic update on server failure.
            toggleSave(item)
          })
      }
      return nowSaved
    },
    [user, queryClient]
  )

  return { toggle }
}
