import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useFacets } from '../lib/servers'
import { Loading, ErrorState } from '../components/Async'

export function AdminTags() {
  const [q, setQ] = useState('')
  const tags = useFacets('gamemodes')

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    const list = tags.data ?? []
    if (!query) return list
    return list.filter((t) => (t.name ?? t.slug).toLowerCase().includes(query) || t.slug.includes(query))
  }, [q, tags.data])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-minecraft text-xl text-stone-900 dark:text-stone-100">Tags ({tags.data?.length.toLocaleString() ?? 0})</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-500 pointer-events-none" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tags..."
            className="h-10 w-64 pl-9 pr-3 rounded-sm border-2 border-stone-400 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      {tags.isLoading ? (
        <Loading label="Loading tags…" />
      ) : tags.error ? (
        <ErrorState error={tags.error} onRetry={() => void tags.refetch()} />
      ) : (
        <div className="rounded-sm border border-stone-400/60 dark:border-stone-600 overflow-x-auto max-h-[65vh] overflow-y-auto">
          <table className="w-full text-sm caption-bottom">
            <thead className="sticky top-0">
              <tr className="border-b border-stone-400/60 dark:border-stone-600 bg-stone-200/70 dark:bg-stone-700/50 text-left">
                <th className="p-3 font-bold">Tag</th>
                <th className="p-3 font-bold whitespace-nowrap">Servers</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {filtered.map((t) => (
                <tr key={t.slug} className="border-b border-stone-400/40 dark:border-stone-700">
                  <td className="p-3 font-medium capitalize">{t.name ?? t.slug}</td>
                  <td className="p-3 text-stone-600 dark:text-stone-400 whitespace-nowrap">{t.serverCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-stone-500 dark:text-stone-400">Showing {filtered.length.toLocaleString()} of {tags.data?.length.toLocaleString() ?? 0} tags.</p>
    </div>
  )
}
