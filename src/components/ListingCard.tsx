import { useState } from 'react'
import { Copy, Vote, Box, Star, Activity, Hash, MessageCircle } from 'lucide-react'
import type { Server } from '../lib/types'
import { playersText, firstTag } from '../lib/servers'
import { isSaved, useChestActions } from '../lib/chest'

const VersionIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
)

export function ListingCard({
  server,
  rank,
  sponsored,
}: {
  server: Server
  rank?: string | null
  sponsored?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(() => isSaved(server.slug))
  const { toggle } = useChestActions()

  const toggleSaveChest = () => {
    const nowSaved = toggle({
      slug: server.slug,
      name: server.name,
      ip: server.ip,
      icon: server.icon,
      url: `/${server.slug}`,
      voteUrl: `/${server.slug}/vote`,
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

  const isSponsored = sponsored ?? server.featured
  const gamemode = firstTag(server)
  const text = playersText(server)

  const rankCell = isSponsored ? (
    <span className="cursor-default select-none group-hover:-translate-y-1 transition-all duration-300 text-yellow-500 dark:text-yellow-400" aria-hidden="true" title="Sponsored">
      <Star className="w-8 h-8 md:w-9 md:h-9" fill="currentColor" />
    </span>
  ) : (
    <span className="font-minecraft text-3xl md:text-4xl cursor-default select-none group-hover:-translate-y-1 transition-all duration-300">{rank}</span>
  )

  const titleSize = isSponsored ? 'text-2xl lg:text-3xl' : 'text-2xl'
  const titleAlign = isSponsored ? 'items-center' : 'items-center lg:items-start'
  const statusWrap = isSponsored ? 'mt-1.5' : ''

  return (
    <div id="listing-card" className="listing-card flex flex-col lg:flex-row rounded-sm overflow-hidden">
      <div className="lg:aspect-square bg-stone-300 dark:bg-stone-900 p-2 px-3 lg:p-4 lg:w-[130px] flex lg:flex-col items-center justify-between lg:justify-center gap-2 group">
        {rankCell}
      </div>
      <div className="flex-1 flex flex-col lg:flex-row gap-4 bg-stone-300/50 dark:bg-stone-900/50 p-3 lg:p-4 justify-between">
        <div className="flex-1 flex flex-col gap-2 md:gap-3">
          <div className={`flex gap-2 lg:gap-4 flex-col lg:flex-row ${titleAlign}`}>
            <a className="listing-banner-link block shrink-0 w-full min-w-0 lg:w-[468px] lg:min-w-[468px] h-[50px] lg:h-[60px] rounded-xs overflow-hidden" href={`/${server.slug}`} title={`Visit ${server.name} Minecraft Server Page`}>
              {server.bannerUrl ? (
                <img src={server.bannerUrl} alt={`${server.name} Minecraft Server banner`} width="468" height="60" loading="lazy" decoding="async" className="listing-banner-media rounded-xs w-full h-full object-cover select-none pointer-events-none" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-500 dark:text-stone-400 text-xs font-minecraft bg-stone-400 dark:bg-stone-800">No Banner</div>
              )}
              <span className="sr-only">{server.name} Server Details</span>
            </a>
            <div className="flex flex-col items-center lg:items-start justify-center lg:gap-1">
              <a className="flex gap-2 lg:gap-3 items-center" href={`/${server.slug}`} title={`Visit ${server.name} Minecraft Server Page`}>
                <img
                  src={server.icon}
                  alt={`${server.name} Minecraft Server Icon`}
                  className={`aspect-square select-none rounded object-cover shrink-0 ${isSponsored ? 'size-10 lg:size-12' : 'size-6 lg:size-8'}`}
                  width={isSponsored ? 48 : 32}
                  height={isSponsored ? 48 : 32}
                  loading="lazy"
                  decoding="async"
                  data-placeholder="/assets/placeholder-server-icon.svg"
                  onError={(e) => {
                    const el = e.currentTarget
                    el.onerror = null
                    el.src = el.dataset.placeholder || ''
                  }}
                />
                <h2 className={`font-minecraft break-words min-w-0 text-left ${titleSize}`}>{server.name}</h2>
              </a>
              <div className={`flex gap-1 items-center ${statusWrap}`}>
                {server.online ? (
                  <>
                    <Activity className="w-5 h-5 text-primary shrink-0" />
                    <p className="font-sans text-sm font-bold line-clamp-1">{text}</p>
                  </>
                ) : (
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex gap-1 items-center">
                      <span className="inline-block rounded-full h-2 w-2 bg-stone-400 dark:bg-stone-500 shrink-0" aria-hidden="true" />
                      <span className="font-sans text-sm font-bold text-stone-600 dark:text-stone-400">Offline</span>
                    </div>
                    <span className="font-sans text-xs font-normal text-stone-500 dark:text-stone-500 pl-3">{text}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-start overflow-x-auto no-scrollbar">
            <a className="inline-flex items-center justify-center rounded-md border border-transparent bg-stone-400/50 dark:bg-stone-600/50 text-stone-800 dark:text-stone-200 text-xs font-medium px-2 py-0.5 gap-1 shrink-0" href={`/gamemodes/${gamemode}`}>
              <Hash className="size-3.5" />
              <span className="capitalize">{gamemode}</span>
            </a>
            {server.edition === 'crossplay' && (
              <a href="/crossplay-servers" title="Browse Bedrock & Java crossplay servers" className="inline-flex items-center justify-center rounded-md border border-transparent bg-stone-400/50 dark:bg-stone-600/50 text-stone-800 dark:text-stone-200 text-xs font-medium px-2 py-0.5 gap-1 shrink-0 hover:bg-stone-500/50 dark:hover:bg-stone-500/50 transition-colors">
                <MessageCircle className="size-3.5" />
                <span>Crossplay</span>
              </a>
            )}
            {server.version && (
              <a href="/versions" className="inline-flex items-center justify-center rounded-md border border-transparent bg-stone-400/50 dark:bg-stone-600/50 text-stone-800 dark:text-stone-200 text-xs font-medium px-2 py-0.5 gap-1 shrink-0 max-w-[220px] hover:bg-stone-500/50 dark:hover:bg-stone-500/50 transition-colors">
                <VersionIcon className="size-3.5" />
                <span className="truncate">{server.version}</span>
              </a>
            )}
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-2 items-center justify-start max-w-full lg:max-w-[200px] xl:max-w-[220px]">
          <button type="button" onClick={copyIp} className="copy-ip btn-accent btn-wrapper relative rounded-md disabled:pointer-events-none disabled:opacity-50 h-8 w-full before:h-8 before:rounded-md before:border-2 before:border-b-[3px]" data-ip={server.ip} data-server-slug={server.slug} data-source="list" title={`Copy ${server.name} server IP address`}>
            <div className="btn-surface rounded-md font-bold border-2 border-b-[3px] px-2 py-1 text-xs w-full h-full flex items-center justify-center gap-2">
              <span className="copy-ip-text font-bold line-clamp-1">{copied ? 'Copied!' : server.ip}</span>
              <Copy className="copy-ip-icon shrink-0 size-4" />
            </div>
          </button>
          <div className="flex gap-2 w-full">
            <a href={`/${server.slug}/vote`} className="btn-wrapper flex-1 relative rounded-md h-8 before:h-8 before:rounded-md before:border-2 before:border-b-[3px] before:border-stone-500/80 before:bg-stone-400/80 text-stone-900" title={`Vote for ${server.name}`}>
              <div className="btn-surface rounded-md font-bold border-2 border-b-[3px] border-stone-500 bg-stone-300 dark:bg-stone-400 px-2 py-1 text-xs w-full h-full flex items-center justify-center gap-2">
                <Vote className="size-4" />
                <span>Vote</span>
              </div>
            </a>
            <button
              type="button"
              onClick={toggleSaveChest}
              className="save-to-chest btn-wrapper relative rounded-md size-8 before:size-8 before:rounded-md before:border-2 before:border-b-[3px] before:border-yellow-900 before:bg-yellow-600 text-yellow-900"
              title={saved ? `Remove ${server.name} from chest` : `Save ${server.name} to chest`}
              data-server-slug={server.slug}
              data-server-name={server.name}
              data-server-ip={server.ip}
              data-server-icon={server.icon}
              data-server-url={`/${server.slug}`}
              data-server-vote-url={`/${server.slug}/vote`}
              data-saved={saved ? '1' : '0'}
            >
              <div className="btn-surface rounded-md font-bold border-2 border-b-[3px] border-yellow-900 bg-yellow-500 px-2 py-2 w-full h-full flex items-center justify-center">
                <Box className="save-to-chest-icon size-4" fill={saved ? 'currentColor' : 'none'} />
                <span className="save-to-chest-label sr-only">Save to chest</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
