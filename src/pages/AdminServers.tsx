import { useMemo, useState } from 'react'
import { Search, ExternalLink, Check } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api, errorMessage, ApiError } from '../lib/api'
import { useAdminServers } from '../lib/admin-api'
import { Loading } from '../components/Async'

export function AdminServers() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const queryClient = useQueryClient()
  const list = useAdminServers({ search: q || undefined, status: status === 'all' ? undefined : status, limit: 50 })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'servers'] })
    void queryClient.invalidateQueries({ queryKey: ['servers'] })
  }

  const toggleFlag = useMutation<{ id: string; slug: string }, ApiError, { slug: string; field: 'verified' | 'featured'; value: boolean }>({
    mutationFn: ({ slug, field, value }) => api.patch<{ id: string; slug: string }>(`/servers/${slug}`, { [field]: value }),
    onSuccess: invalidate,
  })

  const error = list.error ?? (toggleFlag.isError ? toggleFlag.error : null)
  const [confirming, setConfirming] = useState<string | null>(null)

  const rows = useMemo(() => list.data?.results ?? [], [list.data])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-minecraft text-xl text-stone-900 dark:text-stone-100">Servers ({list.data?.total ?? 0})</h2>
        <div className="flex flex-wrap items-center gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 px-2 rounded-sm border-2 border-stone-400 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 text-sm font-medium">
            <option value="all">All</option>
            <option value="pending">Pending verification</option>
            <option value="verified">Verified</option>
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-500 pointer-events-none" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search servers..."
              className="h-10 w-64 pl-9 pr-3 rounded-sm border-2 border-stone-400 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {error && <p className="rounded-sm border border-red-600/40 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">{errorMessage(error)}</p>}
      {list.isLoading ? (
        <Loading label="Loading servers…" />
      ) : rows.length === 0 ? (
        <div className="rounded-sm border border-stone-400/60 dark:border-stone-600 bg-stone-200/50 dark:bg-stone-800/50 p-8 text-center text-sm text-stone-500 dark:text-stone-400">No servers found.</div>
      ) : (
        <div className="rounded-sm border border-stone-400/60 dark:border-stone-600 overflow-x-auto">
          <table className="w-full text-sm caption-bottom">
            <thead>
              <tr className="border-b border-stone-400/60 dark:border-stone-600 bg-stone-200/70 dark:bg-stone-700/50 text-left">
                <th className="p-3 font-bold whitespace-nowrap">Server</th>
                <th className="p-3 font-bold">IP</th>
                <th className="p-3 font-bold">Verified</th>
                <th className="p-3 font-bold">Featured</th>
                <th className="p-3 font-bold">Votes</th>
                <th className="p-3 font-bold w-full">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {rows.map((s) => (
                <tr key={s.slug} className="border-b border-stone-400/40 dark:border-stone-700 align-top">
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <img src={s.icon} alt="" className="size-8 rounded object-cover shrink-0" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                      <div className="flex flex-col min-w-0">
                        <span className="font-minecraft text-sm">{s.name}</span>
                        <span className="text-xs text-stone-500 dark:text-stone-400">{s.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap">{s.ip}:{s.port}</td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => toggleFlag.mutate({ slug: s.slug, field: 'verified', value: !s.verified })}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold transition-colors ${
                        s.verified ? 'bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                      }`}
                      title="Toggle verified"
                    >
                      {s.verified ? <Check className="size-3" /> : null}
                      {s.verified ? 'Verified' : 'Pending'}
                    </button>
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => toggleFlag.mutate({ slug: s.slug, field: 'featured', value: !s.featured })}
                      className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${s.featured ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' : 'bg-stone-400/20 text-stone-600 dark:text-stone-400'}`}
                      title="Toggle featured"
                    >
                      {s.featured ? 'Featured' : 'Not featured'}
                    </button>
                  </td>
                  <td className="p-3">{s.totalVotes}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <a href={`/${s.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                        <ExternalLink className="size-3" /> View
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirming === s.slug) {
                            toggleFlag.mutate({ slug: s.slug, field: 'verified', value: false })
                            setConfirming(null)
                          } else {
                            setConfirming(s.slug)
                            setTimeout(() => setConfirming((cur) => (cur === s.slug ? null : cur)), 3000)
                          }
                        }}
                        className="text-xs text-red-600 hover:underline"
                      >
                        {confirming === s.slug ? 'Confirm unverify?' : 'Unverify'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
