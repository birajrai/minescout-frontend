import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ExternalLink, ShieldX, Trash2, Check, UserCheck, ShieldAlert } from 'lucide-react'
import { api, errorMessage, ApiError } from '../lib/api'
import { useAdminClaims, useAdminReports } from '../lib/admin-api'
import { TableRowsSkeleton } from '../components/Skeletons'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Checkbox } from '../components/ui/checkbox'
import { Card, CardContent } from '../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { cn } from '../lib/utils'
import type { AdminClaim, AdminReport } from '../lib/admin-api'

const CLAIM_BADGE: Record<AdminClaim['status'], 'warning' | 'success' | 'destructive'> = {
  pending: 'warning',
  approved: 'success',
  denied: 'destructive',
}

const REPORT_BADGE: Record<AdminReport['status'], 'destructive' | 'success' | 'muted'> = {
  open: 'destructive',
  resolved: 'success',
  dismissed: 'muted',
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export function AdminModeration() {
  const [tab, setTab] = useState<'claims' | 'reports'>('claims')
  const [showResolved, setShowResolved] = useState(false)
  const queryClient = useQueryClient()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'claims'] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'servers'] })
    void queryClient.invalidateQueries({ queryKey: ['servers'] })
  }

  const claims = useAdminClaims()
  const reports = useAdminReports()

  const act = useMutation<{ success: boolean }, ApiError, { url: string }>({
    mutationFn: ({ url }) => api.post<{ success: boolean }>(url),
    onSuccess: invalidate,
  })

  const error = claims.error ?? reports.error ?? (act.isError ? act.error : null)

  const openClaims = (claims.data ?? []).filter((c) => c.status === 'pending')
  const visibleClaims = showResolved ? claims.data ?? [] : openClaims
  const openReports = (reports.data ?? []).filter((r) => r.status === 'open')
  const visibleReports = showResolved ? reports.data ?? [] : openReports

  const tabBtn = (id: 'claims' | 'reports', label: string, icon: React.ReactNode, count: number) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      className={cn(
        'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        tab === id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      {icon}
      {label}
      {count > 0 && <Badge variant="destructive" className="px-1.5">{count}</Badge>}
    </button>
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Moderation</h1>
        <p className="text-sm text-muted-foreground">Approve ownership claims and handle reports.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-md border bg-muted/40 p-1">
          {tabBtn('claims', 'Claims', <UserCheck className="h-4 w-4" />, openClaims.length)}
          {tabBtn('reports', 'Reports', <ShieldAlert className="h-4 w-4" />, openReports.length)}
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox checked={showResolved} onCheckedChange={(v) => setShowResolved(v === true)} />
          Show resolved
        </label>
      </div>

      {error && <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{errorMessage(error)}</p>}

      {claims.isLoading || reports.isLoading ? (
        <TableRowsSkeleton />
      ) : (
        <Card>
          <CardContent className="p-0">
            {tab === 'claims' ? (
              visibleClaims.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">No {showResolved ? '' : 'pending '}claims.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Server</TableHead>
                      <TableHead>Claimant</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-full">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleClaims.map((c) => (
                      <TableRow key={c.id} className="align-top">
                        <TableCell className="whitespace-nowrap">
                          <a href={`/${c.serverSlug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium hover:text-primary hover:underline">
                            {c.serverName} <ExternalLink className="h-3 w-3" />
                          </a>
                          <span className="block text-xs text-muted-foreground">{c.serverSlug}</span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {c.claimant}
                          <span className="block text-xs text-muted-foreground">Discord: {c.claimantDiscordId}</span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">{fmtDate(c.createdAt)}</TableCell>
                        <TableCell><Badge variant={CLAIM_BADGE[c.status]}>{c.status}</Badge></TableCell>
                        <TableCell>
                          {c.status === 'pending' ? (
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => act.mutate({ url: `/admin/claims/${c.id}/approve` })} disabled={act.isPending}>
                                <Check className="h-3.5 w-3.5" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => act.mutate({ url: `/admin/claims/${c.id}/deny` })} disabled={act.isPending}>
                                <ShieldX className="h-3.5 w-3.5" /> Deny
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )
            ) : visibleReports.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No {showResolved ? '' : 'open '}reports.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Server</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-full">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleReports.map((r) => (
                    <TableRow key={r.id} className="align-top">
                      <TableCell className="whitespace-nowrap">
                        <a href={`/${r.serverSlug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium hover:text-primary hover:underline">
                          {r.serverName} <ExternalLink className="h-3 w-3" />
                        </a>
                        <span className="block text-xs text-muted-foreground">{r.serverSlug}</span>
                      </TableCell>
                      <TableCell className="max-w-xs break-words">{r.reason}</TableCell>
                      <TableCell className="whitespace-nowrap">{r.reporter}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{fmtDate(r.createdAt)}</TableCell>
                      <TableCell><Badge variant={REPORT_BADGE[r.status]}>{r.status}</Badge></TableCell>
                      <TableCell>
                        {r.status === 'open' ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => act.mutate({ url: `/admin/reports/${r.id}/resolve` })} disabled={act.isPending}>
                              <Check className="h-3.5 w-3.5" /> Resolve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => act.mutate({ url: `/admin/reports/${r.id}/dismiss` })} disabled={act.isPending}>
                              <ShieldX className="h-3.5 w-3.5" /> Dismiss
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                if (window.confirm(`Delete server "${r.serverName}" and mark this report resolved? This cannot be undone.`)) {
                                  act.mutate({ url: `/admin/reports/${r.id}/delete-server` })
                                }
                              }}
                              disabled={act.isPending}
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete server
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AdminModeration
