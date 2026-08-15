import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ExternalLink, ShieldX, Check, Trash2 } from 'lucide-react'
import { api, ApiError } from '../lib/api'
import { useAdminReports, type AdminReport } from '../lib/admin-api'
import { PageHeader } from '../components/admin/PageHeader'
import { DataTable, type DataColumn } from '../components/admin/DataTable'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Checkbox } from '../components/ui/checkbox'
import { ConfirmDialog } from '../components/admin/ConfirmDialog'
import { StatusDot } from '../components/admin/StatusDot'

const REPORT_BADGE: Record<AdminReport['status'], 'destructive' | 'success' | 'muted'> = {
  open: 'destructive',
  resolved: 'success',
  dismissed: 'muted',
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export function AdminReports() {
  const [showResolved, setShowResolved] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<AdminReport | null>(null)
  const queryClient = useQueryClient()
  const reports = useAdminReports()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'servers'] })
    void queryClient.invalidateQueries({ queryKey: ['servers'] })
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
    const all = reports.data ?? []
    return showResolved ? all : all.filter((r) => r.status === 'open')
  }, [reports.data, showResolved])

  const openCount = useMemo(() => (reports.data ?? []).filter((r) => r.status === 'open').length, [reports.data])

  const columns: DataColumn<AdminReport>[] = [
    {
      key: 'server',
      header: 'Server',
      cell: (r) => (
        <div className="flex flex-col">
          <a href={`/${r.serverSlug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium hover:text-primary hover:underline">
            {r.serverName} <ExternalLink className="h-3 w-3" />
          </a>
          <span className="text-xs text-muted-foreground">{r.serverSlug}</span>
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      className: 'max-w-xs whitespace-normal break-words',
      cell: (r) => <span className="text-sm">{r.reason || '—'}</span>,
    },
    {
      key: 'reporter',
      header: 'Reporter',
      cell: (r) => <span>{r.reporter}</span>,
    },
    {
      key: 'date',
      header: 'Date',
      cell: (r) => <span className="text-muted-foreground">{fmtDate(r.createdAt)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (r) => <Badge variant={REPORT_BADGE[r.status]}>{r.status}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-full',
      cell: (r) =>
        r.status === 'open' ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              disabled={act.isPending}
              onClick={() => act.mutate({ url: `/admin/reports/${r.id}/resolve`, label: 'Report resolved' })}
            >
              <Check className="h-3.5 w-3.5" /> Resolve
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={act.isPending}
              onClick={() => act.mutate({ url: `/admin/reports/${r.id}/dismiss`, label: 'Report dismissed' })}
            >
              <ShieldX className="h-3.5 w-3.5" /> Dismiss
            </Button>
            <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => setConfirmDelete(r)}>
              <Trash2 className="h-3.5 w-3.5" /> Delete server
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
        title="Reports"
        description={`${openCount} open reports.`}
      >
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox checked={showResolved} onCheckedChange={(v) => setShowResolved(v === true)} />
          Show resolved
        </label>
      </PageHeader>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        isLoading={reports.isLoading}
        error={reports.error}
        onRetry={() => void reports.refetch()}
        empty={
          <div className="flex flex-col items-center gap-2 rounded-lg border bg-card p-10 text-center">
            <StatusDot tone="success" label="" />
            <p className="text-sm font-medium">All clear</p>
            <p className="text-sm text-muted-foreground">No {showResolved ? '' : 'open '}reports.</p>
          </div>
        }
      />

      <ConfirmDialog
        open={confirmDelete !== null}
        onOpenChange={(open) => setConfirmDelete(open ? confirmDelete : null)}
        title={`Delete server "${confirmDelete?.serverName}"?`}
        description="The server and its report are removed. This cannot be undone."
        confirmLabel="Delete server"
        destructive
        onConfirm={() => {
          if (confirmDelete) act.mutate({ url: `/admin/reports/${confirmDelete.id}/delete-server`, label: 'Server deleted' })
        }}
      />
    </div>
  )
}
