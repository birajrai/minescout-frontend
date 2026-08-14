import { useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { PageHero } from '../components/Shared'
import { ListingCard } from '../components/ListingCard'
import { useFacets, slugifyName } from '../lib/servers'
import { ErrorState } from '../components/Async'
import { ListingCardSkeleton } from '../components/Skeletons'
import type { Server, ServerSort } from '../lib/types'
import { api } from '../lib/api'
import { queryKeys } from '../lib/queryKeys'
import { useApiQuery } from '../lib/hooks'

interface RouteMeta {
  title: string
  heading2: string
  crumb: string
  filters: Record<string, string | boolean | undefined>
}

const CATEGORY_META: Record<string, RouteMeta> = {
  'java-servers': {
    title: 'Java Minecraft Servers',
    heading2: 'Best Java Minecraft Servers by Voting',
    crumb: 'Java Servers',
    filters: { edition: 'java' },
  },
  'bedrock-servers': {
    title: 'Bedrock Minecraft Servers',
    heading2: 'Best Bedrock Minecraft Servers by Voting',
    crumb: 'Bedrock Servers',
    filters: { edition: 'bedrock' },
  },
  'crossplay-servers': {
    title: 'Crossplay Minecraft Servers',
    heading2: 'Best Crossplay Minecraft Servers by Voting',
    crumb: 'Crossplay Servers',
    filters: { edition: 'crossplay' },
  },
  'new-minecraft-servers': {
    title: 'New Minecraft Servers',
    heading2: 'Newest Minecraft Servers',
    crumb: 'New Servers',
    filters: { sort: 'newest' },
  },
  popular: {
    title: 'Popular Minecraft Servers',
    heading2: 'Most Popular Minecraft Servers',
    crumb: 'Popular',
    filters: {},
  },
  whitelist: {
    title: 'Whitelist Minecraft Servers',
    heading2: 'Whitelisted Minecraft Servers',
    crumb: 'Whitelist',
    filters: { whitelist: true },
  },
}

const SORT_MAP: Record<string, ServerSort> = {
  votes: 'weekly',
  players: 'online',
  newest: 'newest',
}

function sortLabel(sort: string): string {
  if (sort === 'online') return 'players'
  if (sort === 'newest') return 'newest'
  return 'votes'
}

export function ServerList() {
  const { pathname } = window.location
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const sort = SORT_MAP[searchParams.get('sort') ?? 'votes'] ?? 'weekly'
  const page = Number(searchParams.get('page')) || 1

  const category = Object.keys(CATEGORY_META).find((c) => pathname.startsWith(`/${c}`))

  const gamemodeSlug = pathname.startsWith('/gamemodes/') ? slug : undefined
  const versionSlug = pathname.startsWith('/versions/') ? slug : undefined
  const countrySlug = pathname.startsWith('/countries/') ? slug : undefined
  const tagSlug = pathname.startsWith('/tag/') ? slug : undefined

  const gamemodes = useFacets('gamemodes')
  const versions = useFacets('versions')
  const countries = useFacets('countries')

  const meta = useMemo<RouteMeta | null>(() => {
    if (category) return CATEGORY_META[category]
    if (gamemodeSlug) {
      const f = gamemodes.data?.find((g) => g.slug === gamemodeSlug)
      if (!f) return null
      return {
        title: `${f.name ?? gamemodeSlug} Minecraft Servers`,
        heading2: `Best ${f.name ?? gamemodeSlug} Minecraft Servers by Voting`,
        crumb: f.name ?? gamemodeSlug,
        filters: { gamemode: gamemodeSlug },
      }
    }
    if (versionSlug) {
      const f = versions.data?.find((v) => v.slug === versionSlug)
      if (!f) return null
      return {
        title: `Minecraft ${f.label ?? versionSlug} Servers`,
        heading2: `Best Minecraft ${f.label ?? versionSlug} Servers by Voting`,
        crumb: f.label ?? versionSlug,
        filters: { version: f.label },
      }
    }
    if (countrySlug) {
      const f = countries.data?.find((c) => slugifyName(c.name ?? '') === countrySlug || c.code?.toLowerCase() === countrySlug.toLowerCase())
      if (!f) return null
      return {
        title: `Minecraft Servers in ${f.name ?? countrySlug}`,
        heading2: `Best Minecraft Servers in ${f.name ?? countrySlug}`,
        crumb: f.name ?? countrySlug,
        filters: { country: f.code },
      }
    }
    if (tagSlug) {
      const f = gamemodes.data?.find((g) => g.slug === tagSlug)
      return {
        title: `${f?.name ?? tagSlug} Minecraft Servers`,
        heading2: `Best ${f?.name ?? tagSlug} Minecraft Servers`,
        crumb: f?.name ?? tagSlug,
        filters: { tag: tagSlug },
      }
    }
    return null
  }, [category, gamemodeSlug, versionSlug, countrySlug, tagSlug, gamemodes.data, versions.data, countries.data])

  const needsFacet = Boolean(gamemodeSlug || versionSlug || countrySlug)
  const facetLoading = needsFacet && (gamemodes.isLoading || versions.isLoading || countries.isLoading)
  const facetError = needsFacet && (gamemodes.error || versions.error || countries.error)

  const filters = useMemo<Record<string, string | number | boolean | undefined>>(
    () => ({ ...(meta?.filters ?? {}), sort, page }),
    [meta, sort, page]
  )

  const listQuery = useApiQuery(
    queryKeys.serverList({ ...filters }),
    () => api.get<{ results: Server[]; total: number; page: number; limit: number; totalPages: number }>('/servers', filters as Record<string, string | number | boolean>),
    { enabled: Boolean(meta) && !facetLoading }
  )

  if (facetError) return <ErrorState error={facetError} onRetry={() => undefined} />
  if (!meta) return null
  if (facetLoading || listQuery.isLoading) return <div className="flex flex-col gap-3">{Array.from({ length: 3 }).map((_, i) => <ListingCardSkeleton key={i} />)}</div>
  if (listQuery.error) return <ErrorState error={listQuery.error} onRetry={() => void listQuery.refetch()} />

  const sponsored = (listQuery.data?.results ?? []).filter((s) => s.featured)
  const ranked = (listQuery.data?.results ?? []).filter((s) => !s.featured)
  const totalPages = listQuery.data?.totalPages ?? 1
  const crumbs = [{ to: '/', label: 'Home' }, { label: meta.crumb }]
  const baseRank = (page - 1) * (listQuery.data?.limit ?? 10)

  return (
    <>
      <PageHero crumbs={crumbs} title={meta.title} />
      <section className="wrapper flex flex-col gap-4 px-3 py-4">
        {sponsored.length > 0 && (
          <div className="rounded-lg border border-stone-300 dark:border-stone-600 bg-stone-200/30 dark:bg-stone-800/30 p-3 flex flex-col gap-3">
            <h2 className="text-lg font-minecraft text-stone-800 dark:text-stone-200 flex items-center gap-2">
              <span className="inline-flex items-center rounded border border-yellow-600 bg-gradient-to-r from-yellow-500 to-amber-400 text-yellow-900 text-xs font-bold px-2 py-0.5">Sponsored</span>
              Sponsored servers
            </h2>
            <div className="flex flex-col gap-3">
              {sponsored.map((s) => (
                <ListingCard key={s.slug} server={s} sponsored />
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-minecraft text-stone-800 dark:text-stone-200">{meta.heading2}</h2>
          <div className="flex items-center gap-2">
            <label htmlFor="list-sort" className="text-xs font-minecraft text-stone-600 dark:text-stone-400">Sort</label>
            <select
              id="list-sort"
              value={sortLabel(sort)}
              onChange={(e) => {
                const next = new URLSearchParams(searchParams)
                const s = e.target.value
                if (s === 'votes') next.delete('sort')
                else next.set('sort', s)
                next.delete('page')
                setSearchParams(next)
              }}
              className="h-9 px-2 rounded-sm border-2 border-stone-400 dark:border-stone-600 bg-stone-100/60 dark:bg-stone-800/60 text-sm font-bold"
            >
              <option value="votes">Most Votes</option>
              <option value="players">Most Players</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {ranked.length === 0 ? (
            <div className="py-16 text-center text-stone-500 dark:text-stone-400">
              <p>No servers found. Try a different category.</p>
            </div>
          ) : (
            ranked.map((s, i) => <ListingCard key={s.slug} server={s} rank={`#${baseRank + i + 1}`} />)
          )}
        </div>
        {totalPages > 1 && (
          <div className="pagination-wrap relative flex flex-col items-center gap-4 py-4">
            <nav role="navigation" aria-label="pagination" className="mx-auto flex w-full max-w-full items-center justify-center gap-1">
              <ul className="flex min-w-0 flex-row flex-nowrap items-center gap-1 overflow-x-auto">
                {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 10).map((p) => (
                  <li key={p}>
                    <Link
                      to={p === 1 ? `.` : `?page=${p}${sort !== 'weekly' ? `&sort=${sortLabel(sort)}` : ''}`}
                      className={`inline-flex items-center justify-center whitespace-nowrap text-sm font-bold rounded-sm border-y-4 border-transparent h-9 w-9 ${
                        p === page ? 'bg-lime-500 text-lime-900 hover:bg-lime-400 border-b-lime-600 active:border-b-lime-500' : 'hover:bg-secondary/30 hover:text-secondary-foreground border-none active:bg-secondary/20'
                      }`}
                    >
                      {p}
                    </Link>
                  </li>
                ))}
              </ul>
              {page < totalPages && (
                <Link to={`?page=${page + 1}${sort !== 'weekly' ? `&sort=${sortLabel(sort)}` : ''}`} className="inline-flex items-center justify-center whitespace-nowrap text-sm font-bold rounded-sm border-y-4 border-transparent hover:bg-secondary/30 h-10 py-2 gap-1 px-2.5 cursor-pointer" aria-label="Go to next page">
                  <ChevronRight className="size-4" />
                </Link>
              )}
            </nav>
          </div>
        )}
      </section>
    </>
  )
}
