import { useState } from 'react'
import { useAdminLogs, useAdminLogActions, type AuditLogEntry } from '../lib/admin-api'
import { PageHeader } from '../components/admin/PageHeader'
import { DataTable, type DataColumn } from '../components/admin/DataTable'
import { FilterBar } from '../components/admin/FilterBar'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export function AdminLogs() {
  const [search, setSearch] = useState('')
  const [action, setAction] = useState('all')
  const [page, setPage] = useState(1)
  const [applied, setApplied] = useState<{ search?: string; action?: string }>({})

  const actions = useAdminLogActions()
  const logs = useAdminLogs({ ...applied, page, limit: 50 })

  const apply = () => {
    setPage(1)
    setApplied({
      search: search.trim() || undefined,
      action: action === 'all' ? undefined : action,
    })
  }

  const columns: DataColumn<AuditLogEntry>[] = [
    { key: 'when', header: 'When', cell: (e) => <span className="whitespace-nowrap text-xs text-muted-foreground">{fmtDate(e.createdAt)}</span> },
    { key: 'actor', header: 'Actor', cell: (e) => <span className="font-medium">{e.actorName || 'system'}</span> },
    { key: 'action', header: 'Action', cell: (e) => <Badge variant="outline" className="font-mono text-[11px]">{e.action}</Badge> },
    { key: 'entity', header: 'Entity', cell: (e) => <span className="font-mono text-xs text-muted-foreground">{e.entityType ? `${e.entityType}:${e.entityId}` : '—'}</span> },
    {
      key: 'meta',
      header: 'Details',
      className: 'max-w-md whitespace-normal',
      cell: (e) => {
        const meta = Object.entries(e.meta)
          .filter(([, v]) => v !== undefined && v !== null && v !== '')
          .map(([k, v]) => `${k}=${String(v)}`)
          .join(' · ')
        return meta ? <span className="text-xs text-muted-foreground">{meta}</span> : <span className="text-muted-foreground">—</span>
      },
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Logs" description="Audit trail of admin actions." />
      <FilterBar>
        <Input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Actor, entity, action…" className="w-64" />
        <Select value={action} onValueChange={setAction}>
          <SelectTrigger className="w-52"><SelectValue placeholder="Action" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            {(actions.data ?? []).map((a) => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={apply}>Filter</Button>
      </FilterBar>
      <DataTable
        columns={columns}
        rows={logs.data?.results ?? []}
        rowKey={(e) => e.id}
        isLoading={logs.isLoading}
        error={logs.error}
        onRetry={() => void logs.refetch()}
        pagination={logs.data ? { page: logs.data.page, totalPages: logs.data.totalPages, total: logs.data.total, onPageChange: setPage } : undefined}
      />
    </div>
  )
}
