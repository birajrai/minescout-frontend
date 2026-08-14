import { useOutletContext, Link } from 'react-router'
import { useServerHistory, useServerRankHistory } from '../lib/servers'
import { Loading, ErrorState } from '../components/Async'
import type { Server } from '../lib/types'

export function ServerStats() {
  const { server, slug } = useOutletContext<{ server: Server; slug: string }>()
  const history = useServerHistory(slug, 48)
  const rank = useServerRankHistory(slug, '7d')

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3" aria-labelledby="server-stats-heading">
        <h2 id="server-stats-heading" className="font-minecraft text-lg md:text-xl text-stone-800 dark:text-stone-200">Server status</h2>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Latest status details for {server.name}. Player counts change throughout the day.
        </p>
      </section>

      <section className="rounded-sm border border-stone-300 dark:border-stone-600 bg-stone-100/50 dark:bg-stone-800/50 overflow-hidden">
        <table className="w-full text-sm caption-bottom">
          <tbody className="[&_tr:last-child]:border-0">
            {[
              ['Status', server.online ? 'Online' : 'Offline'],
              ['Players', `${server.playersOnline}/${server.playersMax}`],
              ['Version', server.version || '—'],
              ['IP', server.ip],
              ['Port', String(server.port)],
              ['Global rank', server.rank ? `#${server.rank}` : '—'],
              ['Rating', server.rating > 0 ? `${server.rating.toFixed(1)} / 5` : '—'],
              ['Uptime', server.uptimePct > 0 ? `${server.uptimePct}%` : '—'],
              ['Last checked', server.lastChecked ? new Date(server.lastChecked).toLocaleString() : '—'],
            ].map(([k, v]) => (
              <tr key={k} className="border-b border-stone-200 dark:border-stone-700">
                <td className="p-3 font-bold whitespace-nowrap align-middle">{k}</td>
                <td className="p-3 align-middle break-words">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {server.description && (
        <section className="flex flex-col gap-2" aria-labelledby="server-stats-history-heading">
          <h2 id="server-stats-history-heading" className="font-minecraft text-lg md:text-xl text-stone-800 dark:text-stone-200">About</h2>
          <p className="text-sm text-stone-600 dark:text-stone-400">{server.description}</p>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-minecraft text-lg md:text-xl text-stone-800 dark:text-stone-200">Player history (last 48 checks)</h2>
        {history.isLoading ? (
          <Loading label="Loading history…" />
        ) : history.error ? (
          <ErrorState error={history.error} onRetry={() => void history.refetch()} />
        ) : history.data && history.data.length > 0 ? (
          <div className="rounded-sm border border-stone-300 dark:border-stone-600 bg-stone-100/50 dark:bg-stone-800/50 overflow-x-auto">
            <table className="w-full text-sm caption-bottom">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-700 text-left">
                  <th className="p-3 font-bold">Time</th>
                  <th className="p-3 font-bold">Online</th>
                  <th className="p-3 font-bold">Max</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {[...history.data].reverse().slice(-24).map((p, i) => (
                  <tr key={i} className="border-b border-stone-200 dark:border-stone-700">
                    <td className="p-2">{new Date(p.timestamp).toLocaleString()}</td>
                    <td className="p-2">{p.online}</td>
                    <td className="p-2">{p.max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-stone-500 dark:text-stone-400">No history recorded yet.</p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-minecraft text-lg md:text-xl text-stone-800 dark:text-stone-200">Rank history (last 7 days)</h2>
        {rank.isLoading ? (
          <Loading label="Loading rank…" />
        ) : rank.error ? (
          <ErrorState error={rank.error} onRetry={() => void rank.refetch()} />
        ) : rank.data && rank.data.length > 0 ? (
          <div className="rounded-sm border border-stone-300 dark:border-stone-600 bg-stone-100/50 dark:bg-stone-800/50 overflow-x-auto">
            <table className="w-full text-sm caption-bottom">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-700 text-left">
                  <th className="p-3 font-bold">Time</th>
                  <th className="p-3 font-bold">Rank</th>
                  <th className="p-3 font-bold">Votes</th>
                  <th className="p-3 font-bold">Players</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {[...rank.data].reverse().map((p, i) => (
                  <tr key={i} className="border-b border-stone-200 dark:border-stone-700">
                    <td className="p-2">{new Date(p.timestamp).toLocaleString()}</td>
                    <td className="p-2">#{p.rank}</td>
                    <td className="p-2">{p.votes}</td>
                    <td className="p-2">{p.players}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-stone-500 dark:text-stone-400">No rank history yet.</p>
        )}
      </section>

      <p className="text-sm text-stone-600 dark:text-stone-400">
        Use the{' '}
        <Link to={`/pages/server-status-checker?address=${encodeURIComponent(server.ip)}&check=1&slug=${slug}`} className="text-primary hover:underline">Server Status Checker</Link>{' '}
        for a live probe of the same address.
      </p>
    </div>
  )
}
