import { useAdminTransactions, useAdminSetTxStatus, useAdminBillingSweep, formatMoney } from '../lib/billing'
import { ErrorState } from '../components/Async'
import { TableRowsSkeleton } from '../components/Skeletons'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Card, CardContent } from '../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'

const STATUS_BADGE: Record<string, 'info' | 'success' | 'destructive' | 'warning' | 'muted'> = {
  pending: 'info',
  paid: 'success',
  failed: 'destructive',
  refunded: 'warning',
  cancelled: 'muted',
}

export function AdminBilling() {
  const list = useAdminTransactions()
  const setStatus = useAdminSetTxStatus()
  const sweep = useAdminBillingSweep()

  const txs = list.data ?? []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground">{txs.length} latest · mark contact/bank-transfer orders paid to activate Pro.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => sweep.mutate()} disabled={sweep.isPending}>
          {sweep.isPending ? 'Sweeping…' : sweep.data ? `Swept ${sweep.data.expired} expired` : 'Expire overdue Pro'}
        </Button>
      </div>

      {list.isLoading ? (
        <TableRowsSkeleton />
      ) : list.error ? (
        <ErrorState error={list.error} onRetry={() => void list.refetch()} />
      ) : txs.length === 0 ? (
        <div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">No transactions yet.</div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Gateway</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-full">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {txs.map((t) => (
                  <TableRow key={t.id} className="align-top">
                    <TableCell className="text-xs whitespace-nowrap text-muted-foreground">{new Date(t.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="whitespace-nowrap font-medium">{t.username}</TableCell>
                    <TableCell>
                      {t.description || `${t.kind} payment`}
                      {t.serverSlug && <span className="block text-xs text-muted-foreground">/{t.serverSlug}</span>}
                    </TableCell>
                    <TableCell className="capitalize">{t.gateway}</TableCell>
                    <TableCell className="font-mono font-medium">{formatMoney(t.amount, t.currency)}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE[t.status] ?? 'muted'}>{t.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 flex-wrap">
                        {t.status === 'pending' && (
                          <>
                            <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => setStatus.mutate({ id: t.id, action: 'mark-paid' })} disabled={setStatus.isPending}>
                              Mark paid
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setStatus.mutate({ id: t.id, action: 'cancel' })} disabled={setStatus.isPending}>
                              Cancel
                            </Button>
                          </>
                        )}
                        {t.status === 'paid' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              if (window.confirm('Refund this transaction? The Pro grant is revoked immediately.')) setStatus.mutate({ id: t.id, action: 'refund' })
                            }}
                            disabled={setStatus.isPending}
                          >
                            Refund
                          </Button>
                        )}
                        {t.status === 'failed' && (
                          <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => setStatus.mutate({ id: t.id, action: 'mark-paid' })} disabled={setStatus.isPending}>
                            Retry / mark paid
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
