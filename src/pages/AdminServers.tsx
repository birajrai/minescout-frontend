import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, RefreshCw, Search, ArrowUp, ArrowDown, ExternalLink, Pencil, Star, StarOff, Trash2, RotateCcw, MoreHorizontal } from 'lucide-react'
import { api, ApiError } from '../lib/api'
import { useAdminServers, type AdminServerRow, type AdminServersParams } from '../lib/admin-api'
import { useFacets } from '../lib/servers'
import { PageHeader } from '../components/admin/PageHeader'
import { DataTable, type DataColumn, type SortState } from '../components/admin/DataTable'
import { FilterBar } from '../components/admin/FilterBar'
import { StatusDot } from '../components/admin/StatusDot'
import { ConfirmDialog } from '../components/admin/ConfirmDialog'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Checkbox } from '../components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' })
}

function TrendIcon({ trend }: { trend: AdminServerRow['rankTrend'] }) {
  if (trend === 'up') return <ArrowUp className="h-3 w-3 text-green-600 dark:text-green-400" aria-label="rank up" />
  if (trend === 'down') return <ArrowDown className="h-3 w-3 text-red-500 dark:text-red-400" aria-label="rank down" />
  if (trend === 'new') return <span className="text-[10px] font-semibold text-blue-500">NEW</span>
  return <span className="text-muted-foreground">–</span>
}

export function AdminServers() {
  const queryClient = useQueryClient()
  const gamemodes = useFacets('gamemodes')

  // filter state (committed via Filter button)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [gamemode, setGamemode] = useState('all')
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const [applied, setApplied] = useState<AdminServersParams>({})
  const [sort, setSort] = useState<SortState | null>({ key: 'rank', dir: 'desc' })
  const [page, setPage] = useState(1)

  const list = useAdminServers({
    ...applied,
    page,
    limit: 25,
    sort: sort?.key,
  })

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [sponsoredFor, setSponsoredFor] = useState<AdminServerRow | null>(null)
  const [sponsoredDays, setSponsoredDays] = useState(7)
  const [deleteFor, setDeleteFor] = useState<AdminServerRow | null>(null)

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'servers'] })
    void queryClient.invalidateQueries({ queryKey: ['servers'] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'logs'] })
  }

  const run = useMutation<{ success: boolean }, ApiError, { url: string; method?: 'post' | 'delete'; body?: Record<string, unknown>; label: string }>({
    mutationFn: ({ url, method = 'post', body }) =>
      method === 'delete' ? api.delete<{ success: boolean }>(url) : api.post<{ success: boolean }>(url, body),
    onSuccess: (_d, vars) => {
      toast.success(vars.label)
      invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  const applyFilters = () => {
    setPage(1)
    setApplied({
      search: search.trim() || undefined,
      status: status === 'all' ? undefined : status,
      gamemode: gamemode === 'all' ? undefined : gamemode,
      includeDeleted,
    })
  }

  const resetFilters = () => {
    setSearch('')
    setStatus('all')
    setGamemode('all')
    setIncludeDeleted(false)
    setPage(1)
    setApplied({})
  }

  const rows = useMemo(() => list.data?.results ?? [], [list.data])

  const bulkAction = (action: string) => {
    run.mutate(
      { url: '/admin/servers/bulk', body: { ids: [...selected], action }, label: `Bulk ${action} applied` },
      { onSuccess: () => setSelected(new Set()) }
    )
  }

  const columns: DataColumn<AdminServerRow>[] = [
    {
      key: 'rank',
      header: 'Rank',
      sortable: true,
      sortKey: 'rank',
      cell: (s) => (
        <span className="inline-flex items-center gap-1 tabular-nums">
          <span className="font-semibold">#{s.rank}</span>
          <TrendIcon trend={s.rankTrend} />
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (s) =>
        s.deletedAt ? (
          <Badge variant="outline" className="text-muted-foreground">Deleted</Badge>
        ) : (
          <div className="flex flex-col gap-1">
            <StatusDot tone={s.online ? 'success' : 'muted'} pulse={s.online} label={s.online ? 'Online' : 'Offline'} />
            <Badge variant={s.verified ? 'success' : 'warning'} className="w-fit">{s.verified ? 'Verified' : 'Pending'}</Badge>
          </div>
        ),
    },
    {
      key: 'slug',
      header: 'Slug',
      cell: (s) => (
        <a href={`/${s.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-mono text-primary hover:underline">
          {s.slug} <ExternalLink className="h-3 w-3" />
        </a>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      sortKey: 'name',
      cell: (s) => (
        <div className="flex items-center gap-2">
          <img src={s.icon} alt="" className="h-7 w-7 shrink-0 rounded object-cover" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none' }} />
          <span className="max-w-[180px] truncate font-medium">{s.name}</span>
        </div>
      ),
    },
    {
      key: 'ip',
      header: 'IP',
      cell: (s) => <span className="font-mono text-xs">{s.ip}:{s.port}</span>,
    },
    {
      key: 'gamemode',
      header: 'Gamemode',
      cell: (s) => <span className="text-sm capitalize">{s.tags[0] ?? '—'}</span>,
    },
    {
      key: 'players',
      header: 'Players',
      sortable: true,
      sortKey: 'players',
      cell: (s) => (
        <span className="tabular-nums">
          <span className={s.online ? 'font-medium text-green-600 dark:text-green-400' : 'text-muted-foreground'}>{s.playersOnline}</span>
          <span className="text-muted-foreground">/{s.playersMax}</span>
        </span>
      ),
    },
    {
      key: 'views',
      header: 'Views',
      sortable: true,
      sortKey: 'views',
      cell: (s) => <span className="tabular-nums text-muted-foreground">{s.views.toLocaleString()}</span>,
    },
    {
      key: 'rating',
      header: 'Rating',
      sortable: true,
      sortKey: 'rating',
      cell: (s) => <span className="tabular-nums">{s.rating > 0 ? s.rating.toFixed(1) : '—'}</span>,
    },
    {
      key: 'uptime',
      header: 'Up',
      sortable: true,
      sortKey: 'uptime',
      cell: (s) => (
        <span className="tabular-nums text-muted-foreground">{s.uptimePct > 0 ? `${s.uptimePct.toFixed(1)}%` : '—'}</span>
      ),
    },
    {
      key: 'ping',
      header: 'Ping',
      sortable: true,
      sortKey: 'ping',
      cell: (s) => <span className="tabular-nums text-muted-foreground">{s.latencyMs > 0 ? `${s.latencyMs}ms` : '—'}</span>,
    },
    {
      key: 'sponsored',
      header: 'Sponsored',
      cell: (s) =>
        s.proGrantedUntil ? (
          <Badge variant="default">Pro {new Date(s.proGrantedUntil).toLocaleDateString()}</Badge>
        ) : s.featured ? (
          <Badge variant="warning">Featured</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'date',
      header: 'Date added',
      sortable: true,
      sortKey: 'createdAt',
      cell: (s) => <span className="whitespace-nowrap text-muted-foreground">{fmtDate(s.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-full',
      cell: (s) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Row actions">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>{s.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={`/admin/servers/${s.slug}/edit`}><Pencil className="h-4 w-4" /> Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={`/${s.slug}`} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> View public</a>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSponsoredFor(s)}>
              <Star className="h-4 w-4" /> Sponsored…
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => run.mutate({ url: `/admin/servers/${s.slug}/reping`, label: `Reping queued for ${s.name}` })}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {s.deletedAt ? (
              <DropdownMenuItem onClick={() => run.mutate({ url: `/admin/servers/${s.slug}/restore`, label: `${s.name} restored` })}>
                <RotateCcw className="h-4 w-4" /> Restore
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteFor(s)}>
                <Trash2 className="h-4 w-4" /> Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Servers" description={`${list.data?.total ?? 0} total servers.`}>
        <Button asChild>
          <Link to="/admin/servers/new"><Plus className="h-4 w-4" /> Add server</Link>
        </Button>
      </PageHeader>

      <FilterBar>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, slug, IP…" className="w-64 pl-8" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
          </SelectContent>
        </Select>
        <Select value={gamemode} onValueChange={setGamemode}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Gamemode" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All gamemodes</SelectItem>
            {(gamemodes.data ?? []).map((g) => (
              <SelectItem key={g.slug} value={g.name ?? g.slug}>{g.name ?? g.slug}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox checked={includeDeleted} onCheckedChange={(v) => setIncludeDeleted(v === true)} />
          Include deleted
        </label>
        <Button onClick={applyFilters}>Filter</Button>
        <Button variant="ghost" onClick={resetFilters}>Reset</Button>
      </FilterBar>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-accent/40 px-3 py-2">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <Button size="sm" onClick={() => bulkAction('verify')}>Verify</Button>
          <Button size="sm" variant="outline" onClick={() => bulkAction('unverify')}>Unverify</Button>
          <Button size="sm" onClick={() => bulkAction('feature')}>Feature</Button>
          <Button size="sm" variant="outline" onClick={() => bulkAction('unfeature')}>Unfeature</Button>
          <Button size="sm" onClick={() => bulkAction('reping')}>Reping</Button>
          {includeDeleted ? (
            <Button size="sm" variant="outline" onClick={() => bulkAction('restore')}>Restore</Button>
          ) : (
            <Button size="sm" variant="destructive" onClick={() => bulkAction('delete')}>Delete</Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Clear</Button>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(s) => s.slug}
        isLoading={list.isLoading}
        error={list.error}
        onRetry={() => void list.refetch()}
        sort={sort ?? undefined}
        onSortChange={(s) => { setSort(s); setPage(1) }}
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        pagination={list.data ? { page: list.data.page, totalPages: list.data.totalPages, total: list.data.total, onPageChange: setPage } : undefined}
        rowClassName={(s) => (s.deletedAt ? 'opacity-50' : undefined)}
        empty={<div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">No servers match the current filters.</div>}
      />

      {/* Sponsored dialog */}
      <Dialog open={sponsoredFor !== null} onOpenChange={(open) => { if (!open) setSponsoredFor(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sponsored: {sponsoredFor?.name}</DialogTitle>
            <DialogDescription>Grant Pro placement (featured) to this server.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            {[3, 7, 30].map((days) => (
              <label key={days} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer has-[:checked]:border-primary">
                <input type="radio" name="sponsored-days" className="accent-primary" checked={sponsoredDays === days} onChange={() => setSponsoredDays(days)} />
                {days} days
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSponsoredFor(null)}>Cancel</Button>
            {sponsoredFor?.proGrantedUntil && (
              <Button variant="outline" className="text-destructive hover:text-destructive" disabled={run.isPending}
                onClick={() => run.mutate({ url: `/admin/servers/${sponsoredFor.slug}/pro`, method: 'delete', label: `Sponsored revoked for ${sponsoredFor.name}` })}>
                <StarOff className="h-4 w-4" /> Revoke
              </Button>
            )}
            <Button disabled={run.isPending} onClick={() => sponsoredFor && run.mutate(
              { url: `/admin/servers/${sponsoredFor.slug}/pro`, body: { days: sponsoredDays }, label: `Pro ${sponsoredDays}d granted to ${sponsoredFor.name}` },
              { onSuccess: () => setSponsoredFor(null) }
            )}>
              <Star className="h-4 w-4" /> Grant Pro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteFor !== null}
        onOpenChange={(open) => setDeleteFor(open ? deleteFor : null)}
        title={`Delete "${deleteFor?.name}"?`}
        description="The server is soft-deleted (hidden from the public site) and can be restored later."
        confirmLabel="Soft delete"
        destructive
        onConfirm={() => deleteFor && run.mutate({ url: `/admin/servers/${deleteFor.slug}/delete`, label: `${deleteFor.name} deleted` })}
      />
    </div>
  )
}
