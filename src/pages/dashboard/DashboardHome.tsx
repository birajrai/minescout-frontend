import { Link } from 'react-router'
import { ExternalLink, Plus, Pencil, Server as ServerIcon } from 'lucide-react'
import { useMyServers } from '../../lib/servers'
import { useGlobalStats } from '../../lib/servers'
import { Loading, ErrorState } from '../../components/Async'
import type { Server } from '../../lib/types'

export function DashboardHome() {
  const myServers = useMyServers()
  const stats = useGlobalStats()

  if (myServers.isLoading) return <Loading label="Loading your servers…" />
  if (myServers.error) return <ErrorState error={myServers.error} onRetry={() => void myServers.refetch()} />

  const servers = myServers.data ?? []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="font-minecraft text-xl md:text-2xl text-stone-900 dark:text-stone-100">Dashboard</h2>
        <Link to="/dashboard/servers/add" className="btn-accent btn-wrapper relative before:border rounded-md before:rounded-md h-11 before:h-11 inline-flex shrink-0">
          <span className="btn-surface rounded-md font-bold border select-none w-full h-full px-5 inline-flex items-center justify-center gap-2 text-sm text-stone-900">
            <Plus className="size-4" />
            Add server
          </span>
        </Link>
      </div>
      <div className="shrink-0 h-px w-full bg-stone-400/40 dark:bg-stone-600/50" />

      {stats.data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ['Total servers', stats.data.servers],
            ['Online', stats.data.serversOnline],
            ['Players online', stats.data.playersOnline],
            ['Votes', stats.data.votesAllTime],
          ].map(([label, value]) => (
            <div key={label} className="rounded-sm border border-stone-300 dark:border-stone-600 bg-stone-200/50 dark:bg-stone-800/50 p-4">
              <div className="font-minecraft text-2xl text-stone-900 dark:text-stone-100">{value.toLocaleString()}</div>
              <div className="text-xs text-stone-500 dark:text-stone-400">{label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h3 className="font-minecraft text-lg text-stone-800 dark:text-stone-200">Your servers ({servers.length})</h3>
        {servers.length === 0 ? (
          <div className="bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-center p-4 rounded-sm border border-stone-300 dark:border-stone-600">
            <ServerIcon className="size-8 mx-auto mb-2 text-stone-400" aria-hidden="true" />
            <p className="text-sm">You don't have any servers yet.</p>
            <Link to="/dashboard/servers/add" className="text-primary hover:underline text-sm">Add your first server here</Link>.
          </div>
        ) : (
          <div className="rounded-sm border border-stone-400/60 dark:border-stone-600 overflow-x-auto">
            <table className="w-full text-sm caption-bottom">
              <thead>
                <tr className="border-b border-stone-400/60 dark:border-stone-600 bg-stone-200/70 dark:bg-stone-700/50 text-left">
                  <th className="p-3 font-bold">Server</th>
                  <th className="p-3 font-bold">IP</th>
                  <th className="p-3 font-bold">Status</th>
                  <th className="p-3 font-bold">Votes</th>
                  <th className="p-3 font-bold">Verified</th>
                  <th className="p-3 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {servers.map((s: Server) => (
                  <tr key={s.slug} className="border-b border-stone-400/40 dark:border-stone-700">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <img src={s.icon} alt="" className="size-8 rounded object-cover shrink-0" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                        <div className="flex flex-col min-w-0">
                          <span className="font-minecraft text-sm">{s.name}</span>
                          <span className="text-xs text-stone-500 dark:text-stone-400">{s.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">{s.ip}:{s.port}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold ${s.online ? 'text-green-600' : 'text-red-600'}`}>
                        <span className={`size-1.5 rounded-full ${s.online ? 'bg-green-500' : 'bg-red-500'}`} />
                        {s.online ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td className="p-3">{s.totalVotes}</td>
                    <td className="p-3">
                      {s.verified ? (
                        <span className="text-xs font-bold text-green-600">Verified</span>
                      ) : (
                        <span className="text-xs font-bold text-amber-600">Pending</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Link to={`/dashboard/servers/${s.slug}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                          <Pencil className="size-3" /> Edit
                        </Link>
                        <a href={`/${s.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                          <ExternalLink className="size-3" /> View
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
