import { Link } from 'react-router'
import { Server, Users, Hash, Layers, Globe, ShieldAlert, Tags, Vote, Box } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api, errorMessage, ApiError } from '../lib/api'
import { useAdminDashboard } from '../lib/admin-api'
import { useApiQuery } from '../lib/hooks'
import { useFacets } from '../lib/servers'
import { useChest } from '../lib/chest'
import { ErrorState } from '../components/Async'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { CardGridSkeleton } from '../components/Skeletons'
import { Switch } from '../components/ui/switch'
import { cn } from '../lib/utils'

export function AdminOverview() {
  const dash = useAdminDashboard()
  const gamemodes = useFacets('gamemodes')
  const versions = useFacets('versions')
  const countries = useFacets('countries')
  const chest = useChest()
  const queryClient = useQueryClient()

  const settingsQuery = useApiQuery<{ guestVotingEnabled: boolean }>(
    ['settings'],
    () => api.get<{ guestVotingEnabled: boolean }>('/settings'),
    { staleTime: 60_000 }
  )

  const guestVotingMutation = useMutation<{ success: boolean }, ApiError, boolean>({
    mutationFn: (enabled) => api.post<{ success: boolean }>('/settings/guest-voting', { enabled }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })

  const stats = dash.data
    ? [
        { label: 'Verified servers', value: dash.data.servers, to: '/admin/servers', icon: Server },
        { label: 'Servers online', value: dash.data.serversOnline, icon: Server },
        { label: 'Users', value: dash.data.users, to: '/admin/users', icon: Users },
        { label: 'Game modes', value: gamemodes.data?.length ?? 0, to: '/admin/tags', icon: Hash },
        { label: 'Versions', value: versions.data?.length ?? 0, to: '/admin/tags', icon: Layers },
        { label: 'Countries', value: countries.data?.length ?? 0, to: '/admin/tags', icon: Globe },
        { label: 'Open reports', value: dash.data.openReports, to: '/admin/moderation', icon: ShieldAlert },
        { label: 'Pending claims', value: dash.data.pendingClaims, to: '/admin/moderation', icon: Tags },
        { label: 'Votes today', value: dash.data.votesToday, icon: Vote },
        { label: 'Saved in chests', value: chest.length, to: '/admin/chest', icon: Box },
      ]
    : []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">Platform health at a glance.</p>
      </div>

      {dash.isLoading ? (
        <CardGridSkeleton count={10} className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4" />
      ) : dash.error ? (
        <ErrorState error={dash.error} onRetry={() => void dash.refetch()} />
      ) : !dash.data ? null : (
        <>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((s) => {
          const inner = (
            <>
              <s.icon className="h-5 w-5 text-muted-foreground" />
              <span className="flex flex-col min-w-0">
                <span className="text-2xl font-semibold tabular-nums">{s.value.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </span>
            </>
          )
          const cls = 'flex items-center gap-3 p-4'
          return s.to ? (
            <Link
              key={s.label}
              to={s.to}
              className={cn(cls, 'rounded-lg border bg-card text-card-foreground shadow-sm transition-colors hover:border-primary/50 hover:no-underline')}
            >
              {inner}
            </Link>
          ) : (
            <Card key={s.label} className={cls}>
              <CardContent className="p-0 flex items-center gap-3">{inner}</CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Guest voting</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">
                  Allow signed-out visitors to vote. When off, voting requires login.
                </p>
                {guestVotingMutation.isError && (
                  <p className="text-xs text-destructive">{errorMessage(guestVotingMutation.error)}</p>
                )}
              </div>
              <Switch
                checked={settingsQuery.data?.guestVotingEnabled ?? false}
                disabled={settingsQuery.isLoading || guestVotingMutation.isPending}
                onCheckedChange={(v) => guestVotingMutation.mutate(v)}
                aria-label="Toggle guest voting"
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Newest servers</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="flex flex-col divide-y">
              {dash.data.newestServers.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <Link to={`/${s.slug}`} className="font-medium text-primary hover:underline">{s.name}</Link>
                  <span className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Newest users</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="flex flex-col divide-y">
              {dash.data.newestUsers.map((u) => (
                <li key={u.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <span className="font-medium">{u.username}</span>
                  <span className="text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
        </>
      )}
    </div>
  )
}
