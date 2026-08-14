import { useState } from 'react'
import { NavLink, Outlet, useParams, Link } from 'react-router'
import { Copy, Box, Activity, Info, X } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { useServer } from '../lib/servers'
import { ApiError, api, errorMessage } from '../lib/api'
import { useAuth } from '../lib/auth'
import { formatPlayers } from '../lib/servers'
import { serverUrl } from '../lib/servers'
import { isSaved, useChestActions } from '../lib/chest'
import { Loading, ErrorState } from '../components/Async'
import { NotFound } from './NotFound'
import type { Server } from '../lib/types'

const TABS = [
  { to: '', label: 'Overview', end: true },
  { to: 'reviews', label: 'Reviews', end: false },
  { to: 'stats', label: 'Stats', end: false },
  { to: 'vote', label: 'Vote', end: false },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const pct = Math.max(0, Math.min(1, rating - (n - 1))) * 100
        return (
          <div key={n} className="relative size-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3 text-stone-400">
              <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
            </svg>
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="size-3 text-yellow-400">
                <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
              </svg>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function ServerLayout() {
  const { slug } = useParams<{ slug: string }>()
  const query = useServer(slug ?? '')
  const [copied, setCopied] = useState(false)
  const [bedrockCopied, setBedrockCopied] = useState(false)
  const [saved, setSaved] = useState(() => (slug ? isSaved(slug) : false))
  const { toggle } = useChestActions()
  const { user } = useAuth()
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')

  const report = useMutation<{ success: boolean }, ApiError, string>({
    mutationFn: (reason) => api.post<{ success: boolean }>(`/servers/${slug}/report`, { reason }),
    onSuccess: () => {
      setReportOpen(false)
      setReportReason('')
    },
  })

  if (query.isLoading) return <Loading label="Loading server…" />
  if (query.error) {
    if ((query.error as ApiError).status === 404) return <NotFound />
    return <ErrorState error={query.error} onRetry={() => void query.refetch()} />
  }
  const server = query.data as Server

  const toggleSaveChest = () => {
    if (!slug) return
    const nowSaved = toggle({
      slug,
      name: server.name,
      ip: server.ip,
      icon: server.icon,
      url: `/${slug}`,
      voteUrl: `/${slug}/vote`,
    })
    setSaved(nowSaved)
  }

  const copyIp = () => {
    try {
      navigator.clipboard.writeText(server.ip)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  const copyBedrock = () => {
    if (!server.bedrockIp) return
    try {
      navigator.clipboard.writeText(server.bedrockIp.split(':')[0])
      setBedrockCopied(true)
      setTimeout(() => setBedrockCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  const players = server.online
    ? formatPlayers(server.playersOnline, server.playersMax)
    : `${server.playersOnline}/${server.playersMax}`

  return (
    <>
      <header className="server-hero relative flex flex-col w-full overflow-hidden border-b border-stone-300 dark:border-stone-700">
        <div className="server-hero__media-spacer" aria-hidden="true" />
        <video className="server-hero__brand-video" width="1200" height="240" autoPlay loop muted playsInline preload="metadata" poster="/brand/minelist_banner_poster.webp?v=1786293318" src="/brand/minelist_banner.webm?v=1786293318" />
        <div className="server-hero__overlay">
          <div className="server-hero__brand">
            <span className="font-minecraft text-2xl md:text-3xl text-stone-100">Minescout</span>
          </div>
          <h1 className="server-hero__title font-minecraft text-stone-100">
            <span>
              {server.name} <br className="server-hero__title-break" />{' '}
              <span className="server-hero__subtitle">Server IP, Website Link, Reviews and Vote Link</span>
            </span>
          </h1>
          <nav aria-label="Breadcrumb" className="server-hero__crumbs">
            <ol className="text-stone-300 flex flex-wrap items-center justify-center gap-1.5 text-xs md:text-sm font-medium">
              <li>
                <Link className="hover:text-stone-100 transition-colors" to="/" title="Minescout Home">Home</Link>
              </li>
              <li aria-hidden="true"><span className="text-stone-500">/</span></li>
              <li><span className="text-stone-100">{server.name}</span></li>
            </ol>
          </nav>
        </div>
      </header>

      <div className="wrapper flex flex-col gap-4 xl:p-0 px-3">
        <section className="grid grid-cols-1 md:grid-cols-8 lg:grid-cols-4 md:border rounded-sm overflow-hidden border-border">
          <aside className="col-span-1 md:col-span-3 lg:col-span-1 bg-stone-300 dark:bg-stone-900 m-4 md:m-0 p-4 md:border-r dark:border-r-0">
            <div className="flex flex-col gap-4">
              <div className="flex gap-2 items-center cursor-help min-w-0">
                <img src={server.icon} alt={`${server.name} Minecraft Server Icon`} className="size-8 aspect-square rounded pointer-events-none select-none object-cover" width="32" height="32" loading="lazy" data-placeholder="/assets/placeholder-server-icon.svg" onError={(e) => { const el = e.currentTarget; el.onerror = null; el.src = el.dataset.placeholder || '' }} />
                <span className="text-2xl text-left font-minecraft break-words min-w-0">{server.name}</span>
              </div>
              <div className="flex flex-col gap-2 items-center justify-center">
                <button type="button" onClick={copyIp} className="copy-ip btn-wrapper relative before:border rounded-md before:rounded-md disabled:pointer-events-none disabled:opacity-50 disabled:grayscale-50 before:bg-lime-600 before:border-lime-900 text-lime-900 h-10 before:h-10 w-full" data-ip={server.ip} data-server-slug={slug} data-source="page" aria-label="Copy server IP" title={`Copy ${server.name} server IP address`}>
                  <span className="btn-surface rounded-md text-sm font-bold border select-none w-full h-full bg-lime-500 border-lime-900 px-3 inline-flex items-center justify-center gap-2">
                    <span className="copy-ip-text font-bold line-clamp-1">{copied ? 'Copied!' : server.ip}</span>
                    <Copy className="size-4 shrink-0" />
                  </span>
                </button>
                {server.edition !== 'java' && server.bedrockIp && (
                  <button type="button" onClick={copyBedrock} className="copy-bedrock btn-wrapper relative before:border rounded-md before:rounded-md before:bg-stone-700 before:border-stone-900 text-stone-100 h-10 before:h-10 w-full" data-bedrock-addr={server.bedrockIp} data-server-slug={slug} data-source="page" title={`Add ${server.name} to Bedrock client`} aria-label={`Add ${server.name} to Bedrock client`}>
                    <span className="btn-surface rounded-md text-sm font-bold border select-none w-full h-full bg-stone-600 border-stone-900 px-3 inline-flex items-center justify-center gap-2 text-current">
                      <span className="copy-bedrock-text" data-label="Add to Bedrock Client">{bedrockCopied ? 'Copied!' : 'Add to Bedrock Client'}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><path d="m3.27 6.96 8.73 4.73 8.73-4.73" /><path d="M12 22.08V11" /></svg>
                    </span>
                  </button>
                )}
                <div className="flex gap-2 w-full">
                  <a href={`/${slug}/vote#vote-now`} className="btn-wrapper flex-1 relative before:border rounded-md before:rounded-md before:bg-stone-400/80 before:border-stone-500/80 text-stone-900 h-10 before:h-10" title={`Vote for ${server.name}`}>
                    <span className="btn-surface rounded-md text-sm font-bold border select-none w-full h-full bg-stone-300 dark:bg-stone-400 border-stone-500 px-3 inline-flex items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden="true"><path d="m9 12 2 2 4-4" /><path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z" /><path d="M22 19H2" /></svg>
                      <span>Vote</span>
                    </span>
                  </a>
                  <button type="button" onClick={toggleSaveChest} className="save-to-chest btn-wrapper relative before:border rounded-md before:rounded-md before:bg-yellow-600 before:border-yellow-900 text-yellow-900 h-10 before:h-10 w-12" title={`${saved ? 'Remove' : 'Save'} ${server.name} ${saved ? 'from' : 'to'} chest`} aria-label="Save to chest" data-server-slug={slug} data-server-name={server.name} data-server-ip={server.ip} data-server-icon={server.icon} data-server-url={`/${slug}`} data-server-vote-url={`/${slug}/vote`} data-saved={saved ? '1' : '0'}>
                    <span className="btn-surface rounded-md text-sm font-bold border select-none w-full h-full bg-yellow-500 border-yellow-900 px-3 flex items-center justify-center">
                      <Box className="save-to-chest-icon size-4" fill={saved ? 'currentColor' : 'none'} />
                      <span className="save-to-chest-label sr-only">Save to chest</span>
                    </span>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 pointer-events-none select-none">
                  <span className="flex h-3 w-3 relative">
                    <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${server.online ? 'bg-primary animate-ping' : 'bg-stone-500'}`} />
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${server.online ? 'bg-accent' : 'bg-stone-500'}`} />
                  </span>
                  <span className="font-sans text-sm font-bold">{server.online ? 'Online' : 'Offline'}</span>
                </div>
                {server.version && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-transparent bg-stone-400/50 dark:bg-stone-600/50 text-stone-800 dark:text-stone-200 text-xs font-medium px-2 py-0.5 max-w-[220px] truncate" title={`Server version ${server.version}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 shrink-0" aria-hidden="true"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>
                    <span className="truncate">{server.version}</span>
                  </span>
                )}
              </div>
              <div className="flex gap-1 items-center justify-center">
                <Activity className="size-5 text-primary shrink-0" />
                <p className="text-sm font-bold line-clamp-1">{players} <span className="text-stone-500">playing now</span></p>
              </div>
              <div className="shrink-0 h-px w-full bg-stone-400/50 dark:bg-stone-600/50" />
              <div className="flex flex-col items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md border border-transparent bg-stone-400/50 dark:bg-stone-600/50 text-stone-800 dark:text-stone-200 text-xs font-medium px-2 py-0.5 pointer-events-none select-none">
                  <Info className="size-4" />
                  <span>Global Rank</span>
                </span>
                <div className="flex p-2 font-minecraft text-5xl">{server.rank ? `#${server.rank}` : '—'}</div>
                <div className="flex flex-col items-center gap-1">
                  {server.rating > 0 && <StarRating rating={server.rating} />}
                  <a href={`/${slug}/reviews`} className="text-sm font-bold hover:underline underline-offset-4">{server.reviewCount} review{server.reviewCount === 1 ? '' : 's'}</a>
                </div>
              </div>
              <div className="shrink-0 h-px w-full bg-stone-400/50 dark:bg-stone-600/50" />
              <div className="flex flex-col gap-2 w-full share-this-server" data-server-slug={slug}>
                <span className="font-sans text-sm font-bold">Share this server</span>
                <div className="relative h-8 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1 shrink-0">
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(serverUrl(slug!))}`} target="_blank" rel="noreferrer nofollow" className="st-btn st-remove-label inline-flex items-center justify-center size-8 rounded-md bg-[#3B5998] text-white hover:opacity-90 transition-opacity share-trigger" data-network="facebook" aria-label="Share on Facebook" title={`Share ${server.name} on Facebook`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="pointer-events-none" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                      <span className="st-label sr-only">Share on Facebook</span>
                    </a>
                    <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${server.name} - ${server.ip}`)}&url=${encodeURIComponent(serverUrl(slug!))}`} target="_blank" rel="noreferrer nofollow" className="st-btn st-remove-label inline-flex items-center justify-center size-8 rounded-md bg-black text-white hover:opacity-90 transition-opacity share-trigger" data-network="twitter" aria-label="Share on Twitter" title={`Share ${server.name} on Twitter`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="pointer-events-none" aria-hidden="true"><path d="M23 4.9c-.8.4-1.7.6-2.6.8.9-.6 1.6-1.5 2-2.6-.9.5-1.8.9-2.9 1.1A4.5 4.5 0 0 0 12 8.6c0 .4 0 .7.1 1.1A12.8 12.8 0 0 1 1.6 3.7a4.5 4.5 0 0 0 1.4 6 4.5 4.5 0 0 1-2-.6v.1a4.5 4.5 0 0 0 3.6 4.4c-.4.1-.8.2-1.2.2-.3 0-.6 0-.9-.1a4.5 4.5 0 0 0 4.2 3.1A9 9 0 0 1 1 19.1 12.7 12.7 0 0 0 7.9 21c8.4 0 13-7 13-13v-.6c.9-.7 1.7-1.4 2.1-2.5z" /></svg>
                      <span className="st-label sr-only">Share on Twitter</span>
                    </a>
                    <a href={`https://www.reddit.com/submit?url=${encodeURIComponent(serverUrl(slug!))}&title=${encodeURIComponent(server.name)}`} target="_blank" rel="noreferrer nofollow" className="st-btn st-remove-label inline-flex items-center justify-center size-8 rounded-md bg-[#FF4500] text-white hover:opacity-90 transition-opacity share-trigger" data-network="reddit" aria-label="Share on Reddit" title={`Share ${server.name} on Reddit`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="pointer-events-none" aria-hidden="true"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.5 15.6c.3.3.3.7 0 .9-.9.9-2.9 1.5-5.5 1.5s-4.6-.6-5.5-1.5c-.3-.3-.3-.7 0-.9.3-.3.7-.3.9 0 .6.6 2.4 1 4.6 1s4-.4 4.6-1c.2-.2.6-.2.9 0zm-8.7-4.5c0-.8.6-1.4 1.4-1.4s1.4.6 1.4 1.4-.6 1.4-1.4 1.4-1.4-.6-1.4-1.4zm8.1 0c0-.8.6-1.4 1.4-1.4s1.4.6 1.4 1.4-.6 1.4-1.4 1.4-1.4-.6-1.4-1.4zm1.8-5.6c.8 0 1.4.6 1.4 1.4 0 .8-.6 1.4-1.4 1.4s-1.4-.6-1.4-1.4c0-.8.6-1.4 1.4-1.4z" /></svg>
                      <span className="st-label sr-only">Share on Reddit</span>
                    </a>
                    <button type="button" onClick={() => { try { navigator.clipboard.writeText(serverUrl(slug!)) } catch { /* ignore */ } }} className="st-btn st-remove-label share-copy share-trigger inline-flex items-center justify-center size-8 rounded-md bg-stone-400/50 dark:bg-stone-600/50 text-stone-800 dark:text-stone-200 hover:opacity-90 transition-opacity" data-network="copy" aria-label="Copy link" title={`Copy ${server.name} link`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                      <span className="st-label sr-only">Copy link</span>
                    </button>
                  </div>
                </div>
              </div>
              {server.tags.length > 0 && (
                <div className="flex flex-col gap-2 px-2">
                  <span className="font-sans text-sm font-bold">Game Modes</span>
                  <div className="flex flex-wrap gap-2">
                    {server.tags.map((g) => (
                      <Link key={g} to={`/gamemodes/${g.toLowerCase()}`} className="inline-flex items-center justify-center rounded-md border border-transparent bg-stone-400/50 dark:bg-stone-600/50 text-stone-800 dark:text-stone-200 text-xs font-medium px-2 py-0.5 hover:bg-stone-500/50 dark:hover:bg-stone-500/50 capitalize">{g}</Link>
                    ))}
                  </div>
                </div>
              )}
              {server.supportedVersions.length > 0 && (
                <div className="flex flex-col gap-2 px-2">
                  <span className="font-sans text-sm font-bold">Supported Versions</span>
                  <div className="flex flex-wrap gap-2">
                    {server.supportedVersions.map((v) => (
                      <span key={v} className="inline-flex items-center justify-center rounded-md border border-transparent bg-stone-400/50 dark:bg-stone-600/50 text-stone-800 dark:text-stone-200 text-xs font-medium px-2 py-0.5" title={`Minecraft ${v}`}>{v}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-4">
                <button type="button" id="report-server-button" onClick={() => { if (!user) { window.location.href = '/login?next=' + encodeURIComponent(`/${slug}`); return } setReportOpen(true) }} className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold rounded-sm border border-red-700 dark:border-red-500 bg-red-600 text-white hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true"><path d="M10.29 3.86 1.82 18a1 1 0 0 0 .86 1.5h18.64a1 1 0 0 0 .86-1.5L13.71 3.86a1 1 0 0 0-1.72 0Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                  <span>Report this server</span>
                </button>
              </div>
            </div>
          </aside>
          <main id="vote-now" className="col-span-1 md:col-span-5 lg:col-span-3 bg-stone-300/50 dark:bg-stone-900/50 p-0 md:p-4 flex flex-col mt-2 md:mt-0">
            <div className="md:mt-0 flex flex-col flex-1 min-h-0">
              <nav id="server-tabs" aria-label="Server sections" data-server-tabs data-slot="tabs" className="server-tabs-nav font-minecraft">
                {TABS.map((t) => (
                  <NavLink
                    key={t.to}
                    to={t.to}
                    end={t.end}
                    className={({ isActive }) => `server-tab-link ${isActive ? 'is-active' : ''}`}
                    title={
                      t.to === ''
                        ? `${server.name} Minecraft Server Info`
                        : `${t.label} for ${server.name}`
                    }
                  >
                    {t.label}
                  </NavLink>
                ))}
              </nav>
              <div id="server-tab-panel" className="server-tab-panel bg-stone-300 dark:bg-stone-900 p-4 md:p-4 flex-1 min-h-0 flex flex-col -mt-px">
                <Outlet context={{ server, slug }} />
              </div>
            </div>
          </main>
        </section>
      </div>

      {reportOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="report-title">
          <div className="absolute inset-0 bg-stone-900/60 dark:bg-stone-950/80" aria-hidden="true" onClick={() => setReportOpen(false)} />
          <div className="relative w-full max-w-md rounded-sm border border-stone-400 dark:border-stone-600 bg-stone-100 dark:bg-stone-900 p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 id="report-title" className="font-minecraft text-lg text-stone-900 dark:text-stone-100">Report {server.name}</h2>
              <button type="button" onClick={() => setReportOpen(false)} className="inline-flex items-center justify-center size-8 rounded-sm text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800" aria-label="Close">
                <X className="size-4" />
              </button>
            </div>
            {report.isError && <p className="rounded-sm border border-red-600/40 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">{errorMessage(report.error)}</p>}
            {report.isSuccess && <p className="rounded-sm border border-lime-600/40 bg-lime-500/10 px-3 py-2 text-sm text-lime-700 dark:text-lime-400">Thanks — your report was submitted.</p>}
            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault()
                report.mutate(reportReason)
              }}
            >
              <label htmlFor="report-reason" className="text-xs font-medium text-stone-600 dark:text-stone-400">Reason</label>
              <textarea id="report-reason" value={reportReason} maxLength={500} rows={4} required onChange={(e) => setReportReason(e.target.value)} className="px-3 py-2 rounded-sm border-2 border-stone-400 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 resize-y" />
              <button type="submit" disabled={report.isPending || !reportReason.trim()} className="btn-accent btn-wrapper relative before:border rounded-md before:rounded-md h-11 before:h-11 inline-flex">
                <span className="btn-surface rounded-md font-bold border select-none w-full h-full px-6 inline-flex items-center justify-center text-sm text-stone-900">
                  {report.isPending ? 'Submitting…' : 'Submit report'}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
