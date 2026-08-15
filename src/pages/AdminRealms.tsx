import * as React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ExternalLink, Trash2 } from 'lucide-react'
import { api, ApiError } from '../lib/api'
import { useAdminRealms, type AdminRealm } from '../lib/admin-api'
import { PageHeader } from '../components/admin/PageHeader'
import { DataTable, type DataColumn } from '../components/admin/DataTable'
import { EmptyState } from '../components/admin/EmptyState'
import { ConfirmDialog } from '../components/admin/ConfirmDialog'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString()
}

export function AdminRealms() {
  const queryClient = useQueryClient()
  const realms = useAdminRealms()
  const [confirmDelete, setConfirmDelete] = React.useState<AdminRealm | null>(null)

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'realms'] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'logs'] })
  }

  const remove = useMutation<{ success: boolean }, ApiError, string>({
    mutationFn: (code) => api.delete<{ success: boolean }>(`/admin/realms/${code}`),
    onSuccess: () => {
      toast.success('Realm deleted')
      invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  const columns: DataColumn<AdminRealm>[] = [
    {
      key: 'name',
      header: 'Realm',
      cell: (r) => (
        <div className="flex flex-col">
          <span className="font-medium">{r.name}</span>
          <a href={`/realm/${r.code}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline">
            {r.code} <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      ),
    },
    { key: 'edition', header: 'Edition', cell: (r) => <Badge variant="outline" className="capitalize">{r.edition}</Badge> },
    { key: 'region', header: 'Region', cell: (r) => <span className="text-muted-foreground">{r.region || '—'}</span> },
    { key: 'owner', header: 'Owner', cell: (r) => <span>{r.ownerName ?? '—'}</span> },
    { key: 'date', header: 'Created', cell: (r) => <span className="text-muted-foreground">{fmtDate(r.createdAt)}</span> },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-full',
      cell: (r) => (
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setConfirmDelete(r)} aria-label="Delete realm">
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Realms" description={`${realms.data?.length ?? 0} realms on the platform.`} />
      <DataTable
        columns={columns}
        rows={realms.data ?? []}
        rowKey={(r) => r.code}
        isLoading={realms.isLoading}
        error={realms.error}
        onRetry={() => void realms.refetch()}
        empty={<EmptyState title="No realms yet" description="Realms created in user dashboards appear here." />}
      />
      <ConfirmDialog
        open={confirmDelete !== null}
        onOpenChange={(open) => setConfirmDelete(open ? confirmDelete : null)}
        title={`Delete realm "${confirmDelete?.name}"?`}
        description="The realm and its public page are removed permanently."
        confirmLabel="Delete realm"
        destructive
        onConfirm={() => confirmDelete && remove.mutate(confirmDelete.code)}
      />
    </div>
  )
}
