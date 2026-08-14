import { useMemo, useState } from 'react'
import { Search, ExternalLink, Tags } from 'lucide-react'
import { useApiQuery } from '../lib/hooks'
import { api } from '../lib/api'
import { useFacets } from '../lib/servers'
import { Loading, ErrorState } from '../components/Async'
import type { BlogListResult, CmsPage } from '../lib/types'

function useBlogAdminList() {
  return useApiQuery(['blog', 'admin'], () => api.get<BlogListResult[]>('/blog/admin/posts'))
}

export function AdminContent() {
  const [q, setQ] = useState('')
  const posts = useBlogAdminList()
  const pages = useApiQuery(['cms', 'admin'], () => api.get<CmsPage[]>('/admin/pages'))
  const tags = useFacets('gamemodes')

  const filteredPosts = useMemo(() => {
    const query = q.trim().toLowerCase()
    const entries = posts.data ?? []
    if (!query) return entries
    return entries.filter((p) => p.slug.includes(query) || p.title.toLowerCase().includes(query))
  }, [q, posts.data])

  if (posts.isLoading || pages.isLoading) return <Loading label="Loading content…" />
  if (posts.error) return <ErrorState error={posts.error} onRetry={() => void posts.refetch()} />
  if (pages.error) return <ErrorState error={pages.error} onRetry={() => void pages.refetch()} />

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-minecraft text-xl text-stone-900 dark:text-stone-100">Content</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-500 pointer-events-none" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search posts & pages..."
            className="h-10 w-64 pl-9 pr-3 rounded-sm border-2 border-stone-400 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h3 className="font-minecraft text-lg text-stone-800 dark:text-stone-200">Blog posts ({filteredPosts.length})</h3>
        <div className="flex flex-col gap-2">
          {filteredPosts.map((p) => (
            <div key={p.slug} className="flex items-center justify-between gap-3 rounded-sm border border-stone-400/60 dark:border-stone-600 bg-stone-200/50 dark:bg-stone-800/50 px-3 py-2">
              <div className="flex flex-col min-w-0">
                <span className="font-medium text-sm break-words">{p.title}</span>
                <span className="text-xs text-stone-500 dark:text-stone-400">{p.slug}</span>
              </div>
              <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline shrink-0">
                <ExternalLink className="size-3" /> View
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-minecraft text-lg text-stone-800 dark:text-stone-200">CMS pages ({pages.data?.length ?? 0})</h3>
        <div className="flex flex-wrap gap-2">
          {(pages.data ?? []).map((p) => (
            <a key={p.slug} href={`/pages/${p.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-sm border border-stone-400/60 dark:border-stone-600 bg-stone-200/50 dark:bg-stone-800/50 px-3 py-1.5 text-xs hover:border-primary/60 transition-colors">
              {p.title}
              <ExternalLink className="size-3" />
            </a>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-minecraft text-lg text-stone-800 dark:text-stone-200 flex items-center gap-2">
          <Tags className="size-5 text-primary" />
          Tags ({tags.data?.length ?? 0})
        </h3>
        <div className="flex flex-wrap gap-2">
          {(tags.data ?? []).slice(0, 24).map((t) => (
            <span key={t.slug} className="inline-flex items-center gap-1.5 rounded-sm border border-stone-400/60 dark:border-stone-600 bg-stone-200/50 dark:bg-stone-800/50 px-2.5 py-1 text-xs capitalize">
              {t.name ?? t.slug}
              <span className="text-stone-500 dark:text-stone-400">{t.serverCount}</span>
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}
