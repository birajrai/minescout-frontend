import { Link } from 'react-router'
import { Server, Newspaper, Tags, Globe, Hash, Box, Users, Layers } from 'lucide-react'
import { useAdminDashboard } from '../lib/admin-api'
import { useFacets } from '../lib/servers'
import { useChest } from '../lib/chest'
import { Loading, ErrorState } from '../components/Async'

export function AdminOverview() {
  const dash = useAdminDashboard()
  const gamemodes = useFacets('gamemodes')
  const versions = useFacets('versions')
  const countries = useFacets('countries')
  const chest = useChest()

  if (dash.isLoading) return <Loading label="Loading overview…" />
  if (dash.error) return <ErrorState error={dash.error} onRetry={() => void dash.refetch()} />
  if (!dash.data) return null

  const stats = [
    { label: 'Verified servers', value: dash.data.servers, to: '/admin/servers', icon: Server },
    { label: 'Servers online', value: dash.data.serversOnline, icon: Server },
    { label: 'Users', value: dash.data.users, icon: Users },
    { label: 'Game modes', value: gamemodes.data?.length ?? 0, icon: Hash },
    { label: 'Versions', value: versions.data?.length ?? 0, icon: Layers },
    { label: 'Countries', value: countries.data?.length ?? 0, icon: Globe },
    { label: 'Open reports', value: dash.data.openReports, icon: Newspaper },
    { label: 'Pending claims', value: dash.data.pendingClaims, icon: Tags },
    { label: 'Votes today', value: dash.data.votesToday, icon: Box },
    { label: 'Saved in chests', value: chest.length, to: '/admin/chest', icon: Box },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-minecraft text-xl text-stone-900 dark:text-stone-100">Overview</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {stats.map((s) => {
          const inner = (
            <>
              <s.icon className="size-5 text-primary shrink-0" />
              <span className="flex flex-col min-w-0">
                <span className="font-minecraft text-2xl text-stone-900 dark:text-stone-100">{s.value.toLocaleString()}</span>
                <span className="text-xs text-stone-600 dark:text-stone-400">{s.label}</span>
              </span>
            </>
          )
          const cls = 'flex items-center gap-3 rounded-sm border border-stone-400/60 dark:border-stone-600 bg-stone-200/50 dark:bg-stone-800/50 p-4 transition-colors'
          return s.to ? (
            <Link key={s.label} to={s.to} className={`${cls} hover:border-primary/60 hover:no-underline`}>{inner}</Link>
          ) : (
            <div key={s.label} className={cls}>{inner}</div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="rounded-sm border border-stone-400/60 dark:border-stone-600 bg-stone-200/50 dark:bg-stone-800/50 p-4">
          <h3 className="font-minecraft text-lg text-stone-900 dark:text-stone-100 mb-2">Newest servers</h3>
          <ul className="flex flex-col gap-1">
            {dash.data.newestServers.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 text-sm">
                <Link to={`/${s.slug}`} className="text-primary hover:underline">{s.name}</Link>
                <span className="text-xs text-stone-500 dark:text-stone-400">{new Date(s.createdAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-sm border border-stone-400/60 dark:border-stone-600 bg-stone-200/50 dark:bg-stone-800/50 p-4">
          <h3 className="font-minecraft text-lg text-stone-900 dark:text-stone-100 mb-2">Newest users</h3>
          <ul className="flex flex-col gap-1">
            {dash.data.newestUsers.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-2 text-sm">
                <span>{u.username}</span>
                <span className="text-xs text-stone-500 dark:text-stone-400">{new Date(u.createdAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
