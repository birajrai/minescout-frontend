import { useEffect, useRef, useState } from 'react'
import { Plus, Play, ChevronDown } from 'lucide-react'
import { Link, useSearchParams } from 'react-router'
import { FAQ_ITEMS } from '../data/faq'
import { WELCOME_INTRO, WELCOME_SECTIONS } from '../data/welcome'
import { ListingCard } from '../components/ListingCard'
import { ListingCardSkeleton } from '../components/Skeletons'
import { useServers, useGlobalStats } from '../lib/servers'
import { useAds } from '../lib/ads'
import { ErrorState } from '../components/Async'
import type { Server } from '../lib/types'

const FAQ_ORDER = [
  'What’s the best Minecraft server to join in 2026?',
  'How do I join a Minecraft server using the server IP?',
  'What features does MineScout offer for Minecraft players?',
  'How can Minecraft server owners benefit from MineScout?',
  'Do I need a premium (paid) Minecraft account to join these servers?',
  'Can I join from Bedrock (mobile, Xbox, PlayStation) or only Java?',
  'A server says it supports many Minecraft versions—will gameplay still feel normal?',
  'What does “Server is full” mean and what can I do?',
  'How can server owners promote their server on MineScout?',
  'Which Votifier protocols does MineScout support for in-game vote rewards?',
  'How do I get more players on my Minecraft server?',
  'Why can’t I connect to a server even though it looks online on MineScout?',
  'Are Minecraft servers on MineScout safe to join?',
  'How do I know if a Minecraft server is really active or just looks active?',
  'Can I play with friends on the same Minecraft server?',
  'Do Minecraft servers reset their worlds?',
  'What’s the fastest way to find a Minecraft server I’ll actually like?',
  'Are Minecraft servers down—or is it just one server / my login?',
  'Is there a Minecraft server status checker or MC server tester on MineScout?',
  'How do I make a Minecraft server, pick ports, or host on a laptop?',
  'Where can I find modded Minecraft servers or modded server ideas?',
  'Where are Java SMP servers or Minecraft Java SMP servers listed?',
  'Where can I find survival Minecraft servers, creative servers, or PvP servers?',
  'How do I find Factions servers, Bedwars servers, or Hunger Games style servers?',
  'Can I browse Minecraft servers by version (1.21.8, 1.8.8, 1.20, etc.)?',
  'Where are Minecraft PE servers, MCPE servers, or Bedrock servers?',
  'What is a Minecraft proxy or Geyser crossplay server?',
  'How does Minecraft server ranking work on MineScout?',
  'What is a Minecraft server IP address—and where do I paste it?',
  'Are there Skyblock, Prison, Skywars, or economy Minecraft servers here?',
  'What are Minecraft server jars—and do I need one to join a list server?',
  'What are Minecraft ranks on multiplayer servers?',
  'Where can I find OneBlock, Lifesteal, Towny, or Skywars servers?',
  'How do I find new Minecraft servers or horror / spooky themed worlds?',
  'Is MineScout a Minecraft server host (free server, Aternos, etc.)?',
  'How do I search the whole Minecraft server list (advanced search)?',
]

const STEPS = [
  {
    img: '/brand/copy_ip_domain_minecraft_server.webp',
    overlay: 'step-card-overlay--lime',
    bg: 'bg-lime-900',
    num: 'Step 1',
    title: 'Copy <br>Server IP',
    desc: 'Find a server you want to play on',
    decos: [
      ['top-10 right-0 w-10', ''],
      ['top-0 right-10 w-10', ''],
      ['top-10 right-20 w-10', ''],
    ],
  },
  {
    img: '/brand/open_minecraft.webp',
    overlay: 'step-card-overlay--red',
    bg: 'bg-red-900',
    num: 'Step 2',
    title: 'Open <br>Minecraft',
    desc: 'Open Minecraft and click on Multiplayer',
    decos: [
      ['bottom-8 right-0 size-8', ''],
      ['bottom-0 right-8 size-8', ''],
      ['bottom-0 right-24 size-8', ''],
      ['bottom-8 right-16 size-8', ''],
      ['bottom-24 right-0 size-8', ''],
    ],
  },
  {
    img: '/brand/paste_the_minecraft_server_ip.webp',
    overlay: 'step-card-overlay--sky',
    bg: 'bg-sky-900',
    num: 'Step 3',
    title: 'Paste the<br>Server IP',
    desc: 'Paste the IP, click done and join server',
    decos: [
      ['top-0 left-0 size-8 xl:size-10', ''],
      ['top-8 xl:top-10 left-8 xl:left-10 size-8 xl:size-10 md:hidden xl:block', ''],
      ['top-0 left-16 xl:left-20 size-8 xl:size-10', ''],
      ['top-8 xl:top-10 left-24 xl:left-[7.5rem] size-8 xl:size-10', ''],
    ],
  },
]

const SORT_API: Record<string, 'weekly' | 'online' | 'newest'> = {
  votes: 'weekly',
  players: 'online',
  newest: 'newest',
}

export function Home() {
  const [readMore, setReadMore] = useState(false)
  const [openFaq, setOpenFaq] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const sortParam = searchParams.get('sort') ?? 'votes'
  const sort = SORT_API[sortParam] ?? 'weekly'

  const [page, setPage] = useState(1)
  const [items, setItems] = useState<Server[]>([])
  const lastPage = useRef(0)
  const serversQuery = useServers({ sort, limit: 20, page })
  const statsQuery = useGlobalStats()
  const adsQuery = useAds('leaderboard')
  const leaderboardAd = adsQuery.data?.[0]

  useEffect(() => {
    if (!serversQuery.data) return
    if (serversQuery.data.page === lastPage.current) return
    lastPage.current = serversQuery.data.page
    setItems((prev) => (serversQuery.data!.page === 1 ? serversQuery.data!.results : [...prev, ...serversQuery.data!.results]))
  }, [serversQuery.data])

  const changeSort = (v: string) => {
    setPage(1)
    lastPage.current = 0
    setItems([])
    const next = new URLSearchParams(searchParams)
    if (v === 'votes') next.delete('sort')
    else next.set('sort', v)
    setSearchParams(next)
  }

  const loadMore = () => {
    setPage((p) => p + 1)
  }

  const toggleFaq = (q: string) => setOpenFaq((cur) => (cur === q ? null : q))

  const sponsored = items.filter((s) => s.featured)
  const top = items.filter((s) => !s.featured)
  const totalPages = serversQuery.data ? Math.max(1, Math.ceil(serversQuery.data.total / serversQuery.data.limit)) : 1
  const hasMore = page < totalPages
  const heroStats = statsQuery.data
    ? [
        { num: statsQuery.data.serversOnline.toLocaleString(), label: 'Servers Online' },
        { num: statsQuery.data.playersOnline.toLocaleString(), label: 'Players Online' },
      ]
    : []

  const setSort = (v: string) => {
    changeSort(v)
  }

  if (serversQuery.isLoading || statsQuery.isLoading)
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    )
  if (serversQuery.error) return <ErrorState error={serversQuery.error} onRetry={() => void serversQuery.refetch()} />

  return (
    <>
      <header className="home-hero">
        <video
          className="home-hero__video"
          width="1200"
          height="240"
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          poster="/brand/minescout_banner_poster.webp?v=1786293318"
          aria-hidden="true"
        >
          <source src="/brand/minescout_banner.webm?v=1786293318" type="video/webm" />
        </video>
        <div className="home-hero__overlay" aria-hidden="true" />
        <div className="home-hero__inner wrapper">
          <a href="/" className="home-hero__brand" aria-label="Minescout home">
            <img
              src="/brand/b072db9f-1f7d-40e8-8d80-316f80554afb.webp?v=1786293318"
              alt=""
              className="home-hero__art"
              width="480"
              height="640"
              decoding="async"
              fetchPriority="high"
            />
          </a>
          <div className="home-hero__content">
            <h1 className="home-hero__title">Best Minecraft Servers to Join in 2026</h1>
            <p className="home-hero__subtitle">Find free Minecraft servers (Java and Bedrock) that are active, verified, and community-ranked on our Minecraft Server List. Browse the most popular mc servers today!</p>
            <div className="home-hero__actions">
              <a href="/dashboard/servers/add" className="btn-accent btn-wrapper relative before:border rounded-md before:rounded-md h-11 before:h-11 border-0 home-hero__cta">
                <span className="btn-surface rounded-md text-sm font-bold border select-none w-full h-full inline-flex items-center justify-center gap-2 text-stone-900 px-5">
                  <span className="home-hero__cta-plus" aria-hidden="true">
                    <Plus className="size-3.5" />
                  </span>
                  Add My Server
                </span>
              </a>
              <div className="home-hero__stats" aria-label="Live network stats">
                {heroStats.map((s) => (
                  <div key={s.label} className="home-hero__stat">
                    <span className="home-hero__stat-num">{s.num}</span>
                    <span className="home-hero__stat-label">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col mt-4 gap-4">
        <section className="wrapper flex flex-col gap-4 px-3">
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

          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-minecraft text-stone-800 dark:text-stone-200">Most Voted Minecraft Servers</h2>
            <div className="flex items-center gap-2">
              <label htmlFor="home-sort" className="text-xs font-minecraft text-stone-600 dark:text-stone-400">Sort</label>
              <select
                id="home-sort"
                value={sortParam}
                onChange={(e) => setSort(e.target.value)}
                className="h-9 px-2 rounded-sm border-2 border-stone-400 dark:border-stone-600 bg-stone-100/60 dark:bg-stone-800/60 text-sm font-bold"
              >
                <option value="votes">Most Votes</option>
                <option value="players">Most Players</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          <div className="ml-sc">
            {leaderboardAd ? (
              <a href={leaderboardAd.targetUrl} className="ml-sc-wrap" rel="nofollow noopener sponsored" target="_blank">
                <img src={leaderboardAd.imageUrl} alt={leaderboardAd.placement || 'Sponsored'} loading="lazy" decoding="async" className="ml-sc-img" />
              </a>
            ) : (
              <a href="https://billing.sparkedhost.com/aff.php?aff=3299" className="ml-sc-wrap" rel="nofollow noopener noreferrer" target="_blank">
                <img src="/i/il-d.png?v=1781461087" alt="sparked host minecraft hosting provider partner" loading="lazy" decoding="async" className="ml-sc-img" />
              </a>
            )}
          </div>

          <div id="servers-list" className="flex flex-col gap-3">
            {top.map((s, i) => (
              <ListingCard key={s.slug} server={s} rank={`#${i + 1}`} />
            ))}
          </div>

          <div className="flex justify-center pt-2 pb-4">
            {serversQuery.isFetching ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <ListingCardSkeleton key={i} />
                ))}
              </div>
            ) : hasMore ? (
              <button type="button" onClick={loadMore} className="btn-wrapper relative rounded-md h-12 before:h-12 before:rounded-md before:border-2 before:border-b-[3px] before:border-stone-500/80 before:bg-stone-400/80 text-stone-900 show-more-btn">
                <div className="btn-surface rounded-md font-bold border-2 border-b-[3px] border-stone-500 bg-stone-300 dark:bg-stone-400 px-4 py-3 text-base flex items-center gap-2">
                  <ChevronDown className="size-5" />
                  Load more
                </div>
              </button>
            ) : (
              <Link to="/java-servers" className="btn-wrapper relative rounded-md h-12 before:h-12 before:rounded-md before:border-2 before:border-b-[3px] before:border-stone-500/80 before:bg-stone-400/80 text-stone-900 show-more-btn">
                <div className="btn-surface rounded-md font-bold border-2 border-b-[3px] border-stone-500 bg-stone-300 dark:bg-stone-400 px-4 py-3 text-base flex items-center gap-2">
                  Browse all servers <ChevronDown className="size-5" />
                </div>
              </Link>
            )}
          </div>
        </section>

        <section className="wrapper">
          <img
            src="/brand/minescout_landing_banner-1280.webp?v=1786293318"
            srcSet="/brand/minescout_landing_banner-640.webp?v=1786293318 640w, /brand/minescout_landing_banner-1280.webp?v=1786293318 1280w"
            sizes="(max-width: 1280px) 100vw, 1280px"
            alt="minescout banner"
            width="1280"
            height="266"
            loading="lazy"
            decoding="async"
            className="w-full h-auto rounded-sm"
          />
        </section>

        <section className="wrapper flex flex-col gap-4">
          <div className="flex flex-col gap-4 p-4 lg:p-12 bg-stone-300/50 dark:bg-stone-900/50 rounded-sm">
            <div className="flex flex-col md:flex-row gap-2 items-center justify-between">
              <h2 className="font-minecraft text-lg md:text-xl">
                <span>Don't know </span>
                <br />
                <span className="text-5xl">
                  <span className="text-primary">how</span> to start playing?{' '}
                </span>
                <br />
                <span>It's only 3 steps</span>
              </h2>
              <a href="#steps" className="btn-wrapper relative before:border rounded-md before:rounded-md disabled:pointer-events-none disabled:opacity-50 disabled:grayscale-50 before:bg-yellow-600 before:border-yellow-900 before:h-10 px-0 h-16 w-full md:w-auto text-yellow-900 group justify-start inline-flex items-center">
                <div className="btn-surface rounded-md text-sm font-bold border select-none w-full h-full bg-yellow-500 border-yellow-900 px-4 -translate-y-[2px] flex items-center gap-2">
                  <Play className="size-5 mr-2 group-hover:translate-x-[2px] group-active:scale-90 transition-all duration-300" />
                  <span className="text-left font-minecraft font-normal text-lg leading-5">
                    How to start <br />
                    in 30 seconds
                  </span>
                </div>
              </a>
            </div>
            <div id="steps" className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {STEPS.map((s) => (
                <div key={s.num} className="step-card">
                  <div className={`step-card-image ${s.bg} flex items-center justify-center overflow-hidden`}>
                    <img alt={s.num} src={s.img} width="240" height="240" loading="lazy" decoding="async" className="object-cover w-full h-full opacity-40" />
                  </div>
                  <div className={`step-card-overlay ${s.overlay}`}>
                    <span className="step-number">{s.num}</span>
                    <span className="step-title" dangerouslySetInnerHTML={{ __html: s.title }} />
                    <span className="step-description">{s.desc}</span>
                  </div>
                  {s.decos.map((d, i) => (
                    <div key={i} className={`step-decoration ${d[0]}`} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-stone-300/50 dark:bg-stone-900/50">
          <div className="wrapper p-4 py-8 md:p-12">
            <article className="flex flex-col gap-12 text-stone-500 dark:text-stone-400 max-w-4xl mx-auto">
              <div>
                <h2 className="font-minecraft text-xl md:text-3xl text-center text-stone-800 dark:text-stone-200 mb-4">The Best Minecraft Server List in the World</h2>
                {WELCOME_INTRO.map((p, i) => (
                  <p key={i} className="mb-3">
                    {p}
                  </p>
                ))}

                <div
                  id="welcome-read-more"
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{ maxHeight: readMore ? '10000px' : '0' }}
                  aria-hidden={!readMore}
                >
                  {WELCOME_SECTIONS.map((s) => (
                    <div key={s.heading}>
                      <h3 className="font-minecraft text-lg md:text-xl text-stone-800 dark:text-stone-200 mt-6 mb-2">{s.heading}</h3>
                      {s.paras.map((p, i) => (
                        <p key={i} className={i === s.paras.length - 1 ? 'mb-0' : 'mb-3'}>
                          {p}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="flex justify-center mt-4">
                  <button
                    type="button"
                    id="welcome-read-more-btn"
                    onClick={() => setReadMore((v) => !v)}
                    className="btn-wrapper relative rounded-md h-12 before:h-12 before:rounded-md before:border-2 before:border-b-[3px] before:border-stone-500/80 before:bg-stone-400/80 text-stone-900 inline-flex items-center justify-center"
                    aria-expanded={readMore}
                    aria-controls="welcome-read-more"
                  >
                    <span className="btn-surface rounded-md font-bold border-2 border-b-[3px] border-stone-500 bg-stone-300 dark:bg-stone-400 px-4 py-3 text-base -translate-y-[2px] inline-block">
                      {readMore ? 'Read less' : 'Read more'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="ml-faq-section">
                <h2 className="ml-faq-title font-minecraft">
                  Minecraft Servers <br />
                  Frequently Asked Questions
                </h2>
                <div className="ml-faq">
                  {FAQ_ORDER.map((q) => {
                    const item = FAQ_ITEMS.find((f) => f.q === q)
                    if (!item) return null
                    const open = openFaq === q
                    return (
                      <div key={q} className={`ml-faq__item ${open ? 'active' : ''}`}>
                        <button
                          type="button"
                          className="ml-faq__q"
                          aria-expanded={open}
                          onClick={() => toggleFaq(q)}
                        >
                          <span className="ml-faq__q-text">{item.q}</span>
                          <span className="ml-faq__icon" aria-hidden="true">
                            {open ? '−' : '+'}
                          </span>
                        </button>
                        <div className="ml-faq__a" dangerouslySetInnerHTML={{ __html: item.a }} />
                      </div>
                    )
                  })}
                </div>
              </div>

              <section className="home-owner-cta" aria-label="Add your Minecraft server">
                <div className="home-owner-cta__copy">
                  <h2 className="home-owner-cta__title font-minecraft">Do you run a Minecraft server?</h2>
                  <p className="home-owner-cta__text">Add it for free on Minescout and start reaching new players today.</p>
                </div>
                <a href="/dashboard/servers/add" className="btn-accent btn-wrapper relative before:border rounded-md before:rounded-md h-12 before:h-12 w-full sm:w-auto shrink-0 inline-flex home-owner-cta__btn">
                  <span className="btn-surface rounded-md font-bold border select-none w-full h-full px-6 py-3 inline-flex items-center justify-center gap-2 text-base text-stone-900">
                    <span aria-hidden="true">
                      <Plus className="size-4" />
                    </span>
                    Add My Server
                  </span>
                </a>
              </section>
            </article>
          </div>
        </section>
      </div>
    </>
  )
}