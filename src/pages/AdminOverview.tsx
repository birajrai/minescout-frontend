import { Server, Users, Hash, Layers, Globe, ShieldAlert, UserCheck, Vote, Activity } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, ApiError } from '../lib/api'
import { useAdminDashboard } from '../lib/admin-api'
import { useApiQuery } from '../lib/hooks'
import { useFacets } from '../lib/servers'
import { ErrorState } from '../components/Async'
import { PageHeader } from '../components/admin/PageHeader'
import { StatCard } from '../components/admin/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { CardGridSkeleton } from '../components/Skeletons'
import { Switch } from '../components/ui/switch'
import { Link } from 'react-router'

export function AdminOverview() {
  const dash = useAdminDashboard()
  const gamemodes = useFacets('gamemodes')
  const versions = useFacets('versions')
  const countries = useFacets('countries')
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
      toast.success('Updated')
    },
    onError: (err) => toast.error(err.message),
  })

  const stats = dash.data
    ? [
        { label: 'Verified servers', value: dash.data.servers, to: '/admin/servers', icon: Server },
        { label: 'Servers online', value: dash.data.serversOnline, icon: Activity },
        { label: 'Users', value: dash.data.users, to: '/admin/users', icon: Users },
        { label: 'Game modes', value: gamemodes.data?.length ?? 0, to: '/admin/gamemodes', icon: Hash },
        { label: 'Versions', value: versions.data?.length ?? 0, to: '/admin/versions', icon: Layers },
        { label: 'Countries', value: countries.data?.length ?? 0, to: '/admin/countries', icon: Globe },
        { label: 'Open reports', value: dash.data.openReports, to: '/admin/reports', icon: ShieldAlert },
        { label: 'Pending claims', value: dash.data.pendingClaims, to: '/admin/claims', icon: UserCheck },
        { label: 'Votes today', value: dash.data.votesToday, icon: Vote },
      ]
    : []

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Dashboard" description="Platform health at a glance." />

      {dash.isLoading ? (
        <CardGridSkeleton count={9} className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5" />
      ) : dash.error ? (
        <ErrorState error={dash.error} onRetry={() => void dash.refetch()} />
      ) : !dash.data ? null : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            {stats.map((s) => (
              <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} to={s.to} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

export default AdminOverview
