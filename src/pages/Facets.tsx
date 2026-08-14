import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { PageHero } from '../components/Shared'
import { useFacets } from '../lib/servers'
import { ErrorState } from '../components/Async'
import { CardGridSkeleton } from '../components/Skeletons'

function SearchBox({ q, setQ, placeholder }: { q: string; setQ: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative w-full">
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="flex h-12 min-w-0 px-3 py-1 text-base bg-stone-300/50 dark:bg-stone-700/50 placeholder:text-stone-500/50 rounded-sm border-2 border-stone-400/50 dark:border-stone-600/50 shadow-xs outline-none transition-[color,box-shadow] w-full md:w-1/3 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/80"
        placeholder={placeholder}
        aria-label="Search"
      />
    </div>
  )
}

function FacetGrid({
  items,
  to,
  countLabel,
}: {
  items: { key: string; label: string; count?: number }[]
  to: (key: string) => string
  countLabel?: (count: number) => string
}) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 w-full">
      {items.map((g) => (
        <Link
          key={g.key}
          to={to(g.key)}
          className="gamemode-card flex flex-col aspect-square justify-center items-center gap-2 bg-stone-300/50 dark:bg-stone-600/30 hover:bg-stone-400/50 dark:hover:bg-stone-500/40 rounded-sm transition-all duration-300 p-2 text-center"
          data-name={g.key}
        >
          <span className="font-minecraft text-sm md:text-base font-medium text-stone-700 dark:text-stone-200">{g.label}</span>
          {g.count !== undefined && countLabel && (
            <span className="text-xs text-stone-500 dark:text-stone-400">{countLabel(g.count)}</span>
          )}
        </Link>
      ))}
    </div>
  )
}

export function GameModes() {
  const [q, setQ] = useState('')
  const { data, isLoading, error, refetch } = useFacets('gamemodes')
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return data ?? []
    return (data ?? []).filter((g) => (g.name ?? g.slug).toLowerCase().includes(query))
  }, [q, data])

  return (
    <>
      <PageHero
        crumbs={[{ to: '/', label: 'Home' }, { label: 'Game modes' }]}
        title="Explore All Minecraft Servers by Game Modes"
      />
      <div className="flex flex-col gap-4 min-h-screen wrapper px-3 xl:px-0 py-6">
        <SearchBox q={q} setQ={setQ} placeholder={'Search Gamemodes, eg. "Skyblock"'} />
        {isLoading ? (
          <CardGridSkeleton count={10} className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 w-full" />
        ) : error ? (
          <ErrorState error={error} onRetry={() => void refetch()} />
        ) : (
          <div id="gamemodes-grid">
            <FacetGrid
              items={filtered.map((g) => ({ key: g.slug, label: g.name ?? g.slug, count: g.serverCount }))}
              to={(key) => `/gamemodes/${key}`}
              countLabel={(n) => `${n.toLocaleString()} servers`}
            />
          </div>
        )}
      </div>
    </>
  )
}

export function Versions() {
  const [q, setQ] = useState('')
  const { data, isLoading, error, refetch } = useFacets('versions')
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return data ?? []
    return (data ?? []).filter((v) => (v.label ?? v.slug).toLowerCase().includes(query))
  }, [q, data])

  return (
    <>
      <PageHero
        crumbs={[{ to: '/', label: 'Home' }, { label: 'Versions' }]}
        title="All Versions"
      />
      <div className="flex flex-col gap-4 min-h-screen wrapper px-3 xl:px-0 py-6">
        <SearchBox q={q} setQ={setQ} placeholder="Search versions..." />
        {isLoading ? (
          <CardGridSkeleton count={6} className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-2" />
        ) : error ? (
          <ErrorState error={error} onRetry={() => void refetch()} />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-2">
            {filtered.map((v) => (
              <Link
                key={v.slug}
                to={`/versions/${v.slug}`}
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-stone-400/50 dark:bg-stone-600/50 text-stone-800 dark:text-stone-200 text-sm font-medium px-4 py-2 gap-2 hover:bg-stone-500/50 dark:hover:bg-stone-500/50 transition-colors"
              >
                {v.label ?? v.slug}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export function Countries() {
  const [q, setQ] = useState('')
  const { data, isLoading, error, refetch } = useFacets('countries')
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return data ?? []
    return (data ?? []).filter((c) => (c.name ?? c.slug).toLowerCase().includes(query))
  }, [q, data])

  return (
    <>
      <PageHero
        crumbs={[{ to: '/', label: 'Home' }, { label: 'Countries' }]}
        title="Minecraft Servers by Country"
      />
      <div className="flex flex-col gap-4 min-h-screen wrapper px-3 xl:px-0 py-6">
        <SearchBox q={q} setQ={setQ} placeholder="Search countries..." />
        {isLoading ? (
          <CardGridSkeleton count={6} className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-2" />
        ) : error ? (
          <ErrorState error={error} onRetry={() => void refetch()} />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-2">
            {filtered.map((c) => (
              <Link
                key={c.code ?? c.slug}
                to={`/countries/${c.slug}`}
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-stone-400/50 dark:bg-stone-600/50 text-stone-800 dark:text-stone-200 text-sm font-medium px-4 py-2 gap-2 hover:bg-stone-500/50 dark:hover:bg-stone-500/50 transition-colors"
              >
                {c.name ?? c.slug}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export function Tags() {
  const { data, isLoading, error, refetch } = useFacets('gamemodes')
  return (
    <>
      <PageHero
        crumbs={[{ to: '/', label: 'Home' }, { label: 'Tags' }]}
        title="Explore Minecraft Servers by Tags"
      />
      <div className="wrapper px-3 xl:px-0 py-6 flex flex-col gap-6">
        {isLoading ? (
          <CardGridSkeleton count={8} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2" />
        ) : error ? (
          <ErrorState error={error} onRetry={() => void refetch()} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {(data ?? []).map((t) => (
              <Link
                key={t.slug}
                to={`/tag/${t.slug}`}
                title={`Find ${t.name ?? t.slug} tagged Minecraft Servers`}
                className="flex items-center gap-3 rounded border border-stone-300/60 dark:border-stone-700/60 bg-stone-200/60 dark:bg-stone-800/60 px-3 py-2 hover:bg-stone-300/60 dark:hover:bg-stone-700/60 transition"
              >
                <img
                  src="/assets/placeholder-server-icon.svg"
                  alt=""
                  className="w-6 h-6 object-contain rounded bg-stone-100 dark:bg-stone-900 p-0.5 shrink-0"
                  loading="lazy"
                />
                <span className="font-minecraft text-stone-900 dark:text-stone-100 text-sm truncate capitalize">{t.name ?? t.slug}</span>
                <span className="ml-auto text-xs text-stone-500 dark:text-stone-400 whitespace-nowrap">{t.serverCount}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
