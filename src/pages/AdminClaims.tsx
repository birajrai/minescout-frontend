import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ExternalLink, ShieldX, Check } from 'lucide-react'
import { api, ApiError } from '../lib/api'
import { useAdminClaims, type AdminClaim } from '../lib/admin-api'
import { PageHeader } from '../components/admin/PageHeader'
import { DataTable, type DataColumn } from '../components/admin/DataTable'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Checkbox } from '../components/ui/checkbox'
import { StatusDot } from '../components/admin/StatusDot'

const CLAIM_BADGE: Record<AdminClaim['status'], 'warning' | 'success' | 'destructive'> = {
  pending: 'warning',
  approved: 'success',
  denied: 'destructive',
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export function AdminClaims() {
  const [showProcessed, setShowProcessed] = useState(false)
  const queryClient = useQueryClient()
  const claims = useAdminClaims()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'claims'] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'servers'] })
  }

  const act = useMutation<{ success: boolean }, ApiError, { url: string; label: string }>({
    mutationFn: ({ url }) => api.post<{ success: boolean }>(url),
    onSuccess: (_data, vars) => {
      toast.success(vars.label)
      invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  const rows = useMemo(() => {
    const all = claims.data ?? []
    return showProcessed ? all : all.filter((c) => c.status === 'pending')
  }, [claims.data, showProcessed])

  const pendingCount = useMemo(() => (claims.data ?? []).filter((c) => c.status === 'pending').length, [claims.data])

  const columns: DataColumn<AdminClaim>[] = [
    {
      key: 'server',
      header: 'Server',
      cell: (c) => (
        <div className="flex flex-col">
          <a href={`/${c.serverSlug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium hover:text-primary hover:underline">
            {c.serverName} <ExternalLink className="h-3 w-3" />
          </a>
          <span className="text-xs text-muted-foreground">{c.serverSlug}</span>
        </div>
      ),
    },
    {
      key: 'claimant',
      header: 'Claimant',
      cell: (c) => (
        <div className="flex flex-col">
          <span className="font-medium">{c.claimant}</span>
          <span className="text-xs text-muted-foreground">Discord: {c.claimantDiscordId}</span>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      cell: (c) => <span className="text-muted-foreground">{fmtDate(c.createdAt)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (c) => <Badge variant={CLAIM_BADGE[c.status]}>{c.status}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-full',
      cell: (c) =>
        c.status === 'pending' ? (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              disabled={act.isPending}
              onClick={() => act.mutate({ url: `/admin/claims/${c.id}/approve`, label: 'Claim approved' })}
            >
              <Check className="h-3.5 w-3.5" /> Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-destructive hover:text-destructive"
              disabled={act.isPending}
              onClick={() => act.mutate({ url: `/admin/claims/${c.id}/deny`, label: 'Claim denied' })}
            >
              <ShieldX className="h-3.5 w-3.5" /> Deny
            </Button>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Claims"
        description={`${pendingCount} pending ownership claims.`}
      >
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox checked={showProcessed} onCheckedChange={(v) => setShowProcessed(v === true)} />
          Show processed
        </label>
      </PageHeader>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(c) => c.id}
        isLoading={claims.isLoading}
        error={claims.error}
        onRetry={() => void claims.refetch()}
        empty={
          <div className="flex flex-col items-center gap-2 rounded-lg border bg-card p-10 text-center">
            <StatusDot tone="success" label="" />
            <p className="text-sm font-medium">All caught up</p>
            <p className="text-sm text-muted-foreground">No {showProcessed ? '' : 'pending '}claims.</p>
          </div>
        }
      />
    </div>
  )
}
