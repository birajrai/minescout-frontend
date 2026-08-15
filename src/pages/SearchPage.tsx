import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Search } from 'lucide-react'
import { PageHero } from '../components/Shared'
import { ListingCard } from '../components/ListingCard'
import { useServers, useFacets } from '../lib/servers'
import { ErrorState } from '../components/Async'
import { ListingCardSkeleton } from '../components/Skeletons'
import type { ServerSort } from '../lib/types'

const SORT_API: Record<string, ServerSort> = {
  votes: 'weekly',
  players: 'online',
  newest: 'newest',
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [input, setInput] = useState(searchParams.get('q') ?? '')

  const q = searchParams.get('q') ?? ''
  const gamemode = searchParams.get('gamemode') ?? 'all'
  const version = searchParams.get('version') ?? 'all'
  const country = searchParams.get('country') ?? 'all'
  const sort = SORT_API[searchParams.get('sort') ?? 'votes'] ?? 'weekly'

  const facets = useFacets('gamemodes')
  const versions = useFacets('versions')
  const countries = useFacets('countries')

  const listQuery = useServers(
    useMemo(
      () => ({
        search: q || undefined,
        gamemode: gamemode === 'all' ? undefined : gamemode,
        version: version === 'all' ? undefined : version,
        country: country === 'all' ? undefined : country,
        sort,
      }),
      [q, gamemode, version, country, sort]
    )
  )

  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(searchParams)
    for (const [k, v] of Object.entries(patch)) {
      if (v && v !== 'all') next.set(k, v)
      else next.delete(k)
    }
    setSearchParams(next)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    update({ q: input.trim() })
  }

  return (
    <>
      <PageHero crumbs={[{ to: '/', label: 'Home' }, { label: 'Search' }]} title="Search Minecraft Servers" />
      <div className="wrapper flex flex-col gap-4 px-3 xl:px-0 py-4">
        <section className="search-panel bg-stone-300/50 dark:bg-stone-900/50 p-5 sm:p-6 md:p-8 md:rounded-md md:border md:border-stone-400 dark:md:border-stone-600" aria-label="Search filters">
          <form method="get" action="/search" className="flex flex-col gap-5" id="search-form" onSubmit={submit}>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 min-w-0">
                <label htmlFor="search-q" className="sr-only">Search Minecraft servers</label>
                <Search className="ml-input-icon" aria-hidden="true" />
                <input
                  id="search-q"
                  type="search"
                  name="q"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Search Minecraft servers…"
                  maxLength={200}
                  autoComplete="off"
                  enterKeyHint="search"
                  className="search-panel__field w-full min-h-11 px-3 py-2 text-sm rounded-md border-2 border-stone-400 dark:border-stone-600 bg-stone-100/80 dark:bg-stone-800/70 text-stone-900 dark:text-stone-100 outline-none transition-[border-color,box-shadow] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40 ml-input-with-icon placeholder:text-stone-500/60"
                />
              </div>
              <button type="submit" className="btn-accent btn-wrapper relative before:border rounded-md before:rounded-md h-12 before:h-12 w-full sm:w-auto shrink-0 inline-flex">
                <span className="btn-surface rounded-md font-bold border select-none w-full h-full px-5 sm:px-6 py-3 inline-flex items-center justify-center gap-2 text-base">
                  <Search className="size-5" />
                  Search
                </span>
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="search-gamemode" className="text-xs font-medium text-stone-600 dark:text-stone-400">Game mode</label>
                <select id="search-gamemode" value={gamemode} onChange={(e) => update({ gamemode: e.target.value })} className="h-10 px-2 rounded-sm border-2 border-stone-400 dark:border-stone-600 bg-stone-100/80 dark:bg-stone-800/70 text-sm font-medium">
                  <option value="all">All gamemodes</option>
                  {facets.data?.map((g) => <option key={g.slug} value={g.slug}>{g.name ?? g.slug}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="search-version" className="text-xs font-medium text-stone-600 dark:text-stone-400">Version</label>
                <select id="search-version" value={version} onChange={(e) => update({ version: e.target.value })} className="h-10 px-2 rounded-sm border-2 border-stone-400 dark:border-stone-600 bg-stone-100/80 dark:bg-stone-800/70 text-sm font-medium">
                  <option value="all">All versions</option>
                  {versions.data?.map((v) => <option key={v.slug} value={v.label ?? v.slug}>Minecraft {v.label ?? v.slug}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="search-country" className="text-xs font-medium text-stone-600 dark:text-stone-400">Country</label>
                <select id="search-country" value={country} onChange={(e) => update({ country: e.target.value })} className="h-10 px-2 rounded-sm border-2 border-stone-400 dark:border-stone-600 bg-stone-100/80 dark:bg-stone-800/70 text-sm font-medium">
                  <option value="all">All countries</option>
                  {countries.data?.map((c) => <option key={c.code ?? c.slug} value={c.code ?? c.slug}>{c.name ?? c.slug}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="search-sort" className="text-xs font-medium text-stone-600 dark:text-stone-400">Sort</label>
                <select id="search-sort" value={searchParams.get('sort') ?? 'votes'} onChange={(e) => update({ sort: e.target.value })} className="h-10 px-2 rounded-sm border-2 border-stone-400 dark:border-stone-600 bg-stone-100/80 dark:bg-stone-800/70 text-sm font-medium">
                  <option value="votes">Most Votes</option>
                  <option value="players">Most Players</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>
          </form>
        </section>
        {listQuery.isLoading ? (
          <div className="flex flex-col gap-3">{Array.from({ length: 3 }).map((_, i) => <ListingCardSkeleton key={i} />)}</div>
        ) : listQuery.error ? (
          <ErrorState error={listQuery.error} onRetry={() => void listQuery.refetch()} />
        ) : (
          <div className="flex flex-col gap-3">
            {listQuery.data?.results.length === 0 ? (
              <div className="py-16 text-center text-stone-500 dark:text-stone-400">
                <p>No servers found. Try a different search.</p>
              </div>
            ) : (
              listQuery.data?.results.map((s, i) => <ListingCard key={s.slug} server={s} rank={`#${i + 1}`} />)
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default SearchPage
