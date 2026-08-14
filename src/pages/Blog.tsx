import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { PageHero } from '../components/Shared'
import { useBlogList, useBlogPost, Markdown } from '../lib/cms'
import { Loading, ErrorState } from '../components/Async'
import { ApiError } from '../lib/api'
import { NotFound } from './NotFound'

export function BlogIndex() {
  const [q, setQ] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const tag = searchParams.get('tags') ?? ''
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1)
  const list = useBlogList(page, tag || undefined)

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return list.data?.results ?? []
    return (list.data?.results ?? []).filter(
      (c) => c.title.toLowerCase().includes(query) || (c.excerpt ?? '').toLowerCase().includes(query)
    )
  }, [q, list.data])

  const totalPages = list.data ? Math.max(1, Math.ceil(list.data.total / list.data.limit)) : 1
  const go = (next: number) => {
    const sp = new URLSearchParams(searchParams)
    if (next <= 1) sp.delete('page')
    else sp.set('page', String(next))
    setSearchParams(sp, { replace: true })
    window.scrollTo({ top: 0 })
  }

  return (
    <>
      <PageHero
        crumbs={[{ to: '/', label: 'Home' }, { label: 'Blog' }]}
        title="Minecraft News & Updates by Minescout Blog"
      />
      <div className="flex flex-col gap-4 wrapper px-4 md:px-0 py-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <form className="w-full relative text-stone-500 dark:text-stone-400" role="search" aria-label="Search blog posts" onSubmit={(e) => e.preventDefault()}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 pointer-events-none" />
            <input
              type="search"
              name="q"
              id="blog-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search blog posts..."
              className="w-full min-h-11 px-3 py-2 pl-10 text-sm rounded-md border-2 border-stone-400 dark:border-stone-600 bg-stone-100/80 dark:bg-stone-800/70 text-stone-900 dark:text-stone-100 outline-none transition-[border-color,box-shadow] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40 placeholder:text-stone-500/60"
            />
          </form>
          {tag && (
            <div className="inline-flex items-center gap-2 self-center px-3 py-1.5 rounded-sm border border-primary/40 bg-primary/10 text-sm font-bold text-primary">
              Tag: {tag}
              <button type="button" aria-label="Clear tag filter" onClick={() => { setSearchParams({}, { replace: true }) }} className="text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100">
                <X className="size-4" />
              </button>
            </div>
          )}
        </div>
        {list.isLoading ? (
          <Loading label="Loading posts…" />
        ) : list.error ? (
          <ErrorState error={list.error} onRetry={() => void list.refetch()} />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              {filtered.length === 0 ? (
                <div className="py-16 text-center text-stone-500 dark:text-stone-400 md:col-span-2">
                  <p>No posts found.</p>
                </div>
              ) : (
                filtered.map((c) => (
                  <Link
                    key={c.slug}
                    to={`/blog/${c.slug}`}
                    className="border border-stone-400 dark:border-stone-600 text-card-foreground shadow-sm flex flex-col h-full overflow-hidden text-center bg-stone-300/50 dark:bg-stone-600/30 group rounded-sm hover:bg-stone-400/40 dark:hover:bg-stone-500/30 transition-colors"
                  >
                    <div className="flex flex-col space-y-1.5 p-0">
                      <div className="overflow-hidden">
                        <img
                          src={c.coverUrl ?? ''}
                          alt={c.title}
                          loading="lazy"
                          width="500"
                          height="300"
                          className="w-full h-auto object-top object-cover pointer-events-none select-none group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => { e.currentTarget.style.display = 'none' }}
                        />
                      </div>
                    </div>
                    <div className="p-6 pt-6 flex flex-col flex-grow gap-4 text-foreground transition-colors">
                      <h2 className="text-xl md:text-2xl font-minecraft group-hover:text-foreground/80 group-hover:underline">{c.title}</h2>
                      {c.excerpt && <p className="text-sm text-stone-600 dark:text-stone-400">{c.excerpt}</p>}
                    </div>
                  </Link>
                ))
              )}
            </div>
            {totalPages > 1 && (
              <nav className="flex items-center justify-center gap-3 pt-4" aria-label="Blog pagination">
                <button type="button" disabled={page <= 1} onClick={() => go(page - 1)} className="inline-flex items-center gap-1 h-9 px-3 rounded-sm border-2 border-stone-400 dark:border-stone-600 text-sm font-bold disabled:opacity-40 disabled:pointer-events-none hover:bg-stone-200/60 dark:hover:bg-stone-700/60 transition-colors">
                  <ChevronLeft className="size-4" /> Previous
                </button>
                <span className="text-sm text-stone-600 dark:text-stone-400">Page {page} of {totalPages}</span>
                <button type="button" disabled={page >= totalPages} onClick={() => go(page + 1)} className="inline-flex items-center gap-1 h-9 px-3 rounded-sm border-2 border-stone-400 dark:border-stone-600 text-sm font-bold disabled:opacity-40 disabled:pointer-events-none hover:bg-stone-200/60 dark:hover:bg-stone-700/60 transition-colors">
                  Next <ChevronRight className="size-4" />
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </>
  )
}

export function BlogPost() {
  const { slug } = useParams()
  const query = useBlogPost(slug ?? '')

  if (query.isLoading) return <Loading label="Loading post…" />
  if (query.error) {
    if ((query.error as ApiError).status === 404) return <NotFound />
    return <ErrorState error={query.error} onRetry={() => void query.refetch()} />
  }
  const post = query.data
  if (!post) return <NotFound />

  return (
    <>
      <PageHero
        crumbs={[{ to: '/', label: 'Home' }, { to: '/blog', label: 'Blog' }, { label: post.title }]}
        title={post.title}
      />
      <article className="wrapper flex flex-col gap-6 max-w-4xl px-4 py-6 md:py-12">
        <div className="bg-stone-300/50 dark:bg-stone-900/50 p-6 md:p-10 rounded-sm border border-stone-400 dark:border-stone-600">
          <Markdown source={post.bodyMarkdown} />
        </div>
      </article>
    </>
  )
}
