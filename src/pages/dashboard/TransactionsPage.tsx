import { Link } from 'react-router'
import { Receipt } from 'lucide-react'
import { useMyTransactions, formatMoney } from '../../lib/billing'
import { ErrorState } from '../../components/Async'
import { TableRowsSkeleton } from '../../components/Skeletons'

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Pending', cls: 'bg-blue-500/20 text-blue-700 dark:text-blue-400' },
  paid: { label: 'Paid', cls: 'bg-green-500/20 text-green-700 dark:text-green-400' },
  failed: { label: 'Failed', cls: 'bg-red-500/20 text-red-700 dark:text-red-400' },
  refunded: { label: 'Refunded', cls: 'bg-amber-500/20 text-amber-700 dark:text-amber-400' },
  cancelled: { label: 'Cancelled', cls: 'bg-stone-400/20 text-stone-600 dark:text-stone-400' },
}

export function TransactionsPage() {
  const q = useMyTransactions()

  if (q.isLoading) return <TableRowsSkeleton />
  if (q.error) return <ErrorState error={q.error} onRetry={() => void q.refetch()} />

  const txs = q.data ?? []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-minecraft text-xl text-stone-900 dark:text-stone-100">Transactions</h2>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Your payment history across all gateways — Pro subscriptions and sponsored slots.
        </p>
      </div>

      {txs.length === 0 ? (
        <div className="rounded-sm border border-stone-400/60 dark:border-stone-600 bg-stone-200/50 dark:bg-stone-800/50 p-8 text-center text-sm text-stone-500 dark:text-stone-400 flex flex-col items-center gap-3">
          <Receipt className="size-8 text-stone-400" aria-hidden="true" />
          <p>No transactions yet.</p>
          <p className="text-xs">
            When you buy a <Link to="/dashboard/pro-subscriptions" className="text-primary hover:underline">Pro subscription</Link> or{' '}
            <Link to="/dashboard/sponsored-slots" className="text-primary hover:underline">sponsored slot</Link>, your receipts appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-sm border border-stone-400/60 dark:border-stone-600 overflow-x-auto">
          <table className="w-full text-sm caption-bottom">
            <thead>
              <tr className="border-b border-stone-400/60 dark:border-stone-600 bg-stone-200/70 dark:bg-stone-700/50 text-left">
                <th className="p-3 font-bold">Date</th>
                <th className="p-3 font-bold">Description</th>
                <th className="p-3 font-bold">Gateway</th>
                <th className="p-3 font-bold">Amount</th>
                <th className="p-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {txs.map((t) => {
                const badge = STATUS_BADGE[t.status] ?? { label: t.status, cls: 'bg-stone-400/20 text-stone-600' }
                return (
                  <tr key={t.id} className="border-b border-stone-400/40 dark:border-stone-700 align-top">
                    <td className="p-3 whitespace-nowrap text-xs">{new Date(t.createdAt).toLocaleString()}</td>
                    <td className="p-3">{t.description || `${t.kind} payment`}</td>
                    <td className="p-3 capitalize">{t.gateway}</td>
                    <td className="p-3 font-mono font-medium">{formatMoney(t.amount, t.currency)}</td>
                    <td className="p-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${badge.cls}`}>{badge.label}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
