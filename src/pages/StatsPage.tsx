import { Link } from 'react-router'
import { PageHero } from '../components/Shared'
import { useGlobalStats } from '../lib/servers'
import { ErrorState } from '../components/Async'
import { CardGridSkeleton } from '../components/Skeletons'

function StatSection({ id, title, subtext, children }: { id: string; title: string; subtext?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-sm border border-stone-400 dark:border-stone-600 bg-stone-200/50 dark:bg-stone-800/50 p-4 md:p-6" aria-labelledby={id}>
      <h2 id={id} className="font-minecraft text-lg md:text-xl text-stone-900 dark:text-stone-100 mb-2">{title}</h2>
      {subtext && <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">{subtext}</p>}
      <div className={subtext ? '' : 'mt-4'}>{children}</div>
    </section>
  )
}

function StatNum({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-3xl font-minecraft text-stone-900 dark:text-stone-100">{value.toLocaleString()}</span>
      <p className="text-sm text-stone-500 dark:text-stone-400">{label}</p>
    </div>
  )
}

export function StatsPage() {
  const stats = useGlobalStats()

  return (
    <>
      <PageHero
        crumbs={[{ to: '/', label: 'Home' }, { label: 'Statistics' }]}
        title="Minescout Statistics"
        subtext="Minecraft server list stats at a glance"
      />
      <div className="wrapper px-4 py-6 md:py-8 max-w-4xl">
        {stats.isLoading ? (
          <CardGridSkeleton count={5} className="flex flex-col gap-6 md:gap-8" />
        ) : stats.error ? (
          <ErrorState error={stats.error} onRetry={() => void stats.refetch()} />
        ) : stats.data ? (
          <div className="flex flex-col gap-6 md:gap-8">
            <StatSection id="stats-status-heading" title="Status">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <dl className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  <div className="flex items-center gap-2"><dt className="w-3 h-3 rounded-full shrink-0 bg-[#2fa72b]" aria-hidden="true" /><dd>Online ({stats.data.serversOnline})</dd></div>
                  <div className="flex items-center gap-2"><dt className="w-3 h-3 rounded-full shrink-0 bg-[#ca2830]" aria-hidden="true" /><dd>Offline ({stats.data.servers - stats.data.serversOnline})</dd></div>
                </dl>
              </div>
            </StatSection>
            <StatSection id="stats-gamemodes-heading" title="Top Gamemodes">
              <ul className="flex flex-col gap-2 list-none p-0 m-0">
                {stats.data.topGamemodes.map((g) => (
                  <li key={g.gamemode} className="flex items-center justify-between gap-2 text-sm">
                    <Link to={`/gamemodes/${g.gamemode.toLowerCase()}`} className="text-primary hover:underline font-medium capitalize">{g.gamemode}</Link>
                    <span className="text-stone-600 dark:text-stone-400 shrink-0">{g.servers} servers</span>
                  </li>
                ))}
              </ul>
            </StatSection>
            <StatSection id="stats-top-servers-heading" title="Top Servers">
              <ul className="flex flex-col gap-2 list-none p-0 m-0">
                {stats.data.topServers.map((s, i) => (
                  <li key={s.slug} className="flex items-center justify-between gap-2 text-sm">
                    <Link to={`/${s.slug}`} className="text-primary hover:underline font-medium">{i + 1}. {s.name}</Link>
                    <span className="text-stone-600 dark:text-stone-400 shrink-0">{s.weeklyVotes} votes · {s.playersOnline} players</span>
                  </li>
                ))}
              </ul>
            </StatSection>
            <StatSection id="stats-players-heading" title="Players online">
              <StatNum value={stats.data.playersOnline} label="Total players currently reported across all listed servers." />
            </StatSection>
            <StatSection id="stats-votes-heading" title="Votes">
              <div className="flex flex-col gap-2">
                <StatNum value={stats.data.votesAllTime} label="Total votes all time." />
                <p className="text-sm text-stone-500 dark:text-stone-400">Weekly: {stats.data.weeklyVotes} · Today: {stats.data.votesToday}</p>
              </div>
            </StatSection>
          </div>
        ) : null}
      </div>
    </>
  )
}
