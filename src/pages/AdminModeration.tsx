import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ExternalLink, ShieldX, Trash2, Check, UserCheck, ShieldAlert } from 'lucide-react'
import { api, errorMessage, ApiError } from '../lib/api'
import { useAdminClaims, useAdminReports } from '../lib/admin-api'
import { Loading } from '../components/Async'
import type { AdminClaim, AdminReport } from '../lib/admin-api'

const CLAIM_BADGE: Record<AdminClaim['status'], { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-500/20 text-amber-700 dark:text-amber-400' },
  approved: { label: 'Approved', className: 'bg-green-500/20 text-green-700 dark:text-green-400' },
  denied: { label: 'Denied', className: 'bg-red-500/20 text-red-700 dark:text-red-400' },
}

const REPORT_BADGE: Record<AdminReport['status'], { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-red-500/20 text-red-700 dark:text-red-400' },
  resolved: { label: 'Resolved', className: 'bg-green-500/20 text-green-700 dark:text-green-400' },
  dismissed: { label: 'Dismissed', className: 'bg-stone-400/20 text-stone-600 dark:text-stone-400' },
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab('claims')}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-sm text-sm font-bold transition-colors ${
              tab === 'claims' ? 'bg-primary text-stone-900' : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-300/70 dark:hover:bg-stone-600/70'
            }`}
          >
            <UserCheck className="size-4" />
            Claims
            {openClaims.length > 0 && <span className="rounded-sm bg-red-600 text-white px-1.5 text-xs">{openClaims.length}</span>}
          </button>
          <button
            type="button"
            onClick={() => setTab('reports')}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-sm text-sm font-bold transition-colors ${
              tab === 'reports' ? 'bg-primary text-stone-900' : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-300/70 dark:hover:bg-stone-600/70'
            }`}
          >
            <ShieldAlert className="size-4" />
            Reports
            {openReports.length > 0 && <span className="rounded-sm bg-red-600 text-white px-1.5 text-xs">{openReports.length}</span>}
          </button>
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
          <input type="checkbox" checked={showResolved} onChange={(e) => setShowResolved(e.target.checked)} className="size-4 accent-primary" />
          Show resolved
        </label>
      </div>

      {error && <p className="rounded-sm border border-red-600/40 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">{errorMessage(error)}</p>}

      {claims.isLoading || reports.isLoading ? (
        <Loading label="Loading moderation queue…" />
      ) : tab === 'claims' ? (
        visibleClaims.length === 0 ? (
          <div className="rounded-sm border border-stone-400/60 dark:border-stone-600 bg-stone-200/50 dark:bg-stone-800/50 p-8 text-center text-sm text-stone-500 dark:text-stone-400">No {showResolved ? '' : 'pending '}claims.</div>
        ) : (
          <div className="rounded-sm border border-stone-400/60 dark:border-stone-600 overflow-x-auto">
            <table className="w-full text-sm caption-bottom">
              <thead>
                <tr className="border-b border-stone-400/60 dark:border-stone-600 bg-stone-200/70 dark:bg-stone-700/50 text-left">
                  <th className="p-3 font-bold">Server</th>
                  <th className="p-3 font-bold">Claimant</th>
                  <th className="p-3 font-bold">Date</th>
                  <th className="p-3 font-bold">Status</th>
                  <th className="p-3 font-bold w-full">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {visibleClaims.map((c) => (
                  <tr key={c.id} className="border-b border-stone-400/40 dark:border-stone-700 align-top">
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <a href={`/${c.serverSlug}`} target="_blank" rel="noreferrer" className="font-minecraft text-sm text-stone-900 dark:text-stone-100 hover:text-primary inline-flex items-center gap-1">
                          {c.serverName} <ExternalLink className="size-3" />
                        </a>
                      </div>
                      <span className="text-xs text-stone-500 dark:text-stone-400">{c.serverSlug}</span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {c.claimant}
                      <span className="block text-xs text-stone-500 dark:text-stone-400">Discord: {c.claimantDiscordId}</span>
                    </td>
                    <td className="p-3 whitespace-nowrap text-stone-600 dark:text-stone-400">{fmtDate(c.createdAt)}</td>
                    <td className="p-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${CLAIM_BADGE[c.status].className}`}>{CLAIM_BADGE[c.status].label}</span>
                    </td>
                    <td className="p-3">
                      {c.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => act.mutate({ url: `/admin/claims/${c.id}/approve` })} disabled={act.isPending} className="inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-green-600 text-white text-xs font-bold hover:bg-green-500 disabled:opacity-50">
                            <Check className="size-3" /> Approve
                          </button>
                          <button type="button" onClick={() => act.mutate({ url: `/admin/claims/${c.id}/deny` })} disabled={act.isPending} className="inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-red-600 text-white text-xs font-bold hover:bg-red-500 disabled:opacity-50">
                            <ShieldX className="size-3" /> Deny
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-stone-500 dark:text-stone-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : visibleReports.length === 0 ? (
        <div className="rounded-sm border border-stone-400/60 dark:border-stone-600 bg-stone-200/50 dark:bg-stone-800/50 p-8 text-center text-sm text-stone-500 dark:text-stone-400">No {showResolved ? '' : 'open '}reports.</div>
      ) : (
        <div className="rounded-sm border border-stone-400/60 dark:border-stone-600 overflow-x-auto">
          <table className="w-full text-sm caption-bottom">
            <thead>
              <tr className="border-b border-stone-400/60 dark:border-stone-600 bg-stone-200/70 dark:bg-stone-700/50 text-left">
                <th className="p-3 font-bold">Server</th>
                <th className="p-3 font-bold">Reason</th>
                <th className="p-3 font-bold">Reporter</th>
                <th className="p-3 font-bold">Date</th>
                <th className="p-3 font-bold">Status</th>
                <th className="p-3 font-bold w-full">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {visibleReports.map((r) => (
                <tr key={r.id} className="border-b border-stone-400/40 dark:border-stone-700 align-top">
                  <td className="p-3 whitespace-nowrap">
                    <a href={`/${r.serverSlug}`} target="_blank" rel="noreferrer" className="font-minecraft text-sm text-stone-900 dark:text-stone-100 hover:text-primary inline-flex items-center gap-1">
                      {r.serverName} <ExternalLink className="size-3" />
                    </a>
                    <span className="block text-xs text-stone-500 dark:text-stone-400">{r.serverSlug}</span>
                  </td>
                  <td className="p-3 max-w-xs break-words text-stone-700 dark:text-stone-300">{r.reason}</td>
                  <td className="p-3 whitespace-nowrap">{r.reporter}</td>
                  <td className="p-3 whitespace-nowrap text-stone-600 dark:text-stone-400">{fmtDate(r.createdAt)}</td>
                  <td className="p-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${REPORT_BADGE[r.status].className}`}>{REPORT_BADGE[r.status].label}</span>
                  </td>
                  <td className="p-3">
                    {r.status === 'open' ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <button type="button" onClick={() => act.mutate({ url: `/admin/reports/${r.id}/resolve` })} disabled={act.isPending} className="inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-green-600 text-white text-xs font-bold hover:bg-green-500 disabled:opacity-50">
                          <Check className="size-3" /> Resolve
                        </button>
                        <button type="button" onClick={() => act.mutate({ url: `/admin/reports/${r.id}/dismiss` })} disabled={act.isPending} className="inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-stone-500 text-white text-xs font-bold hover:bg-stone-400 disabled:opacity-50">
                          <ShieldX className="size-3" /> Dismiss
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete server "${r.serverName}" and mark this report resolved? This cannot be undone.`)) {
                              act.mutate({ url: `/admin/reports/${r.id}/delete-server` })
                            }
                          }}
                          disabled={act.isPending}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-red-600 text-white text-xs font-bold hover:bg-red-500 disabled:opacity-50"
                        >
                          <Trash2 className="size-3" /> Delete server
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-stone-500 dark:text-stone-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}