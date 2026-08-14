import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { api, errorMessage, ApiError } from '../lib/api'
import { useApiQuery } from '../lib/hooks'
import { queryKeys } from '../lib/queryKeys'
import { Loading } from '../components/Async'
import type { Ad } from '../lib/ads'

const inputCls =
  'h-10 px-3 rounded-sm border-2 border-stone-400 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary'

const EMPTY = { slot: 'leaderboard', placement: 'global', placementValue: '', imageUrl: '', targetUrl: '', active: true }

export function AdminAds() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState<string | null>(null)

  const list = useApiQuery(queryKeys.ads(), () => api.get<Ad[]>('/admin/ads'))
  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['ads'] })

  const create = useMutation<{ id: string }, ApiError>({
    mutationFn: () =>
      api.post<{ id: string }>('/admin/ads', {
        slot: form.slot,
        placement: form.placement,
        placementValue: form.placementValue,
        imageUrl: form.imageUrl,
        targetUrl: form.targetUrl,
        active: form.active,
      }),
    onSuccess: () => {
      invalidate()
      setForm(EMPTY)
      setError(null)
    },
    onError: (e) => setError(errorMessage(e)),
  })

  const toggle = useMutation<{ success: boolean }, ApiError, Ad>({
    mutationFn: (ad) => api.patch<{ success: boolean }>(`/admin/ads/${ad.id}`, { active: !ad.active }),
    onSuccess: () => invalidate(),
  })

  const remove = useMutation<{ success: boolean }, ApiError, string>({
    mutationFn: (id) => api.delete<{ success: boolean }>(`/admin/ads/${id}`),
    onSuccess: () => invalidate(),
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    create.mutate()
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-minecraft text-xl text-stone-900 dark:text-stone-100">Ads ({list.data?.length ?? 0})</h2>
      {list.isLoading ? (
        <Loading label="Loading ads…" />
      ) : (
        <div className="rounded-sm border border-stone-400/60 dark:border-stone-600 overflow-x-auto">
          <table className="w-full text-sm caption-bottom">
            <thead>
              <tr className="border-b border-stone-400/60 dark:border-stone-600 bg-stone-200/70 dark:bg-stone-700/50 text-left">
                <th className="p-3 font-bold">Preview</th>
                <th className="p-3 font-bold">Slot</th>
                <th className="p-3 font-bold">Placement</th>
                <th className="p-3 font-bold">Target</th>
                <th className="p-3 font-bold">Status</th>
                <th className="p-3 font-bold w-full">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {(list.data ?? []).map((ad) => (
                <tr key={ad.id} className="border-b border-stone-400/40 dark:border-stone-700 align-top">
                  <td className="p-3">
                    <img src={ad.imageUrl} alt="" className="h-10 max-w-40 object-cover rounded-sm border border-stone-400/50 dark:border-stone-600" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                  </td>
                  <td className="p-3 font-mono text-xs">{ad.slot}</td>
                  <td className="p-3">
                    {ad.placement}
                    {ad.placementValue && <span className="block text-xs text-stone-500 dark:text-stone-400">{ad.placementValue}</span>}
                  </td>
                  <td className="p-3 text-xs text-primary break-all max-w-56"><a href={ad.targetUrl} target="_blank" rel="noreferrer" className="hover:underline">{ad.targetUrl}</a></td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => toggle.mutate(ad)}
                      className={`inline-flex px-2 py-0.5 rounded text-xs font-bold transition-colors ${ad.active ? 'bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-stone-400/20 text-stone-600 dark:text-stone-400'}`}
                    >
                      {ad.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Delete this ad?')) remove.mutate(ad.id)
                      }}
                      disabled={remove.isPending}
                      className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline disabled:opacity-50"
                    >
                      <Trash2 className="size-3" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {(list.data ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-stone-500 dark:text-stone-400">No ads yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <form onSubmit={submit} className="flex flex-col gap-3 rounded-sm border border-stone-400/60 dark:border-stone-600 bg-stone-200/40 dark:bg-stone-800/40 p-4">
        <h3 className="font-minecraft text-sm text-stone-800 dark:text-stone-200">Create ad</h3>
        {error && <p className="rounded-sm border border-red-600/40 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs font-medium text-stone-600 dark:text-stone-400">
            Slot
            <select value={form.slot} onChange={(e) => setForm((f) => ({ ...f, slot: e.target.value }))} className={inputCls}>
              <option value="leaderboard">leaderboard</option>
              <option value="sidebar">sidebar</option>
              <option value="server-banner">server-banner</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-stone-600 dark:text-stone-400">
            Placement
            <input value={form.placement} onChange={(e) => setForm((f) => ({ ...f, placement: e.target.value }))} className={inputCls} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-stone-600 dark:text-stone-400 md:col-span-2">
            Placement value <span className="text-stone-500">(e.g. a gamemode or server slug — optional)</span>
            <input value={form.placementValue} onChange={(e) => setForm((f) => ({ ...f, placementValue: e.target.value }))} className={inputCls} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-stone-600 dark:text-stone-400 md:col-span-2">
            Image URL
            <input required type="url" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="https://…" className={inputCls} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-stone-600 dark:text-stone-400 md:col-span-2">
            Target URL
            <input required type="url" value={form.targetUrl} onChange={(e) => setForm((f) => ({ ...f, targetUrl: e.target.value }))} placeholder="https://…" className={inputCls} />
          </label>
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="size-4 rounded border-stone-400 text-primary" />
            Active immediately
          </label>
        </div>
        <div>
          <button type="submit" disabled={create.isPending} className="btn-accent btn-wrapper relative before:border rounded-md before:rounded-md h-11 before:h-11 inline-flex">
            <span className="btn-surface rounded-md font-bold border select-none w-full h-full px-6 inline-flex items-center justify-center text-sm text-stone-900">
              {create.isPending ? 'Creating…' : 'Create ad'}
            </span>
          </button>
        </div>
      </form>
    </div>
  )
}
