import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Check, Crown, ExternalLink } from 'lucide-react'
import { useMyBilling, useCheckout, formatMoney } from '../../lib/billing'
import { useMyServers } from '../../lib/servers'
import { errorMessage } from '../../lib/api'
import { ErrorState } from '../../components/Async'
import { ContentSkeleton } from '../../components/Skeletons'
import type { GatewayId } from '../../lib/types'

const inputCls =
  'h-10 px-3 rounded-sm border-2 border-stone-400 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary'

const GATEWAYS: { id: GatewayId; label: string; hint: string }[] = [
  { id: 'contact', label: 'Contact / bank transfer', hint: 'We contact you to arrange payment, then activate Pro.' },
  { id: 'razorpay', label: 'Razorpay', hint: 'Pay online with UPI, cards or netbanking.' },
  { id: 'stripe', label: 'Stripe', hint: 'Pay online with card or Apple/Google Pay.' },
]

export function ProSubscriptionsPage() {
  const [params, setParams] = useSearchParams()
  const paid = params.get('paid') === '1'
  const billing = useMyBilling()
  const myServers = useMyServers()
  const checkout = useCheckout()

  const [serverId, setServerId] = useState('')
  const [gateway, setGateway] = useState<GatewayId>('contact')
  const [periodDays, setPeriodDays] = useState(30)
  const [order, setOrder] = useState<{ message: string } | null>(null)

  const proPlan = billing.data?.plans.find((p) => p.id === 'pro')
  const freePlan = billing.data?.plans.find((p) => p.id === 'free')

  const servers = myServers.data ?? []
  const proServers = billing.data?.proServers ?? []
  const sub = billing.data?.subscription ?? null
  const selectedServerId = serverId || servers[0]?.id || ''

  useEffect(() => {
    if (!paid) return
    const t = setTimeout(() => {
      setParams({}, { replace: true })
    }, 8000)
    return () => clearTimeout(t)
  }, [paid, setParams])

  const periodLabel = useMemo(() => {
    if (!proPlan || !proPlan.periodDays) return ''
    return formatMoney(proPlan.price * (periodDays / proPlan.periodDays), proPlan.currency)
  }, [proPlan, periodDays])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setOrder(null)
    checkout.mutate(
      { plan: 'pro', serverId: selectedServerId || undefined, gateway, periodDays },
      {
        onSuccess: (res) => {
          if (res.order?.url) {
            window.location.href = res.order.url
            return
          }
          setOrder({ message: res.order?.message ?? res.message ?? 'Order created.' })
        },
      }
    )
  }

  const statusBadge =
    sub === null ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-stone-400/20 text-stone-600 dark:text-stone-400">Free</span>
    ) : sub.isActive ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">
        <Crown className="size-3" /> Pro · active
      </span>
    ) : sub.status === 'pending' ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-blue-500/20 text-blue-700 dark:text-blue-400">Pro · pending</span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-stone-400/20 text-stone-600 dark:text-stone-400">Pro · {sub.status}</span>
    )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-minecraft text-xl text-stone-900 dark:text-stone-100">Pro Subscriptions</h2>
          {billing.data && statusBadge}
        </div>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Free is free forever. Upgrade to Pro to feature one of your servers in listings and climb the rankings.
        </p>
      </div>

      {billing.isLoading ? (
        <ContentSkeleton />
      ) : billing.error ? (
        <ErrorState error={billing.error} onRetry={() => void billing.refetch()} />
      ) : (
        <>
      {paid && (
        <div className="rounded-sm border border-lime-600/40 bg-lime-500/10 px-3 py-2 text-sm text-lime-700 dark:text-lime-400">
          Payment received — your Pro subscription is being activated. If it doesn't activate shortly, contact support.
        </div>
      )}
      {order && (
        <div className="rounded-sm border border-blue-600/40 bg-blue-500/10 px-3 py-2 text-sm text-blue-700 dark:text-blue-400">
          {order.message}{' '}
          <Link to="/pages/support" className="underline">Contact support</Link> if you need help.
        </div>
      )}
      {checkout.isError && (
        <p className="rounded-sm border border-red-600/40 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">{errorMessage(checkout.error)}</p>
      )}

      {/* Plan comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[freePlan, proPlan].filter(Boolean).map((p) => (
          <div key={p!.id} className={`rounded-sm border p-5 flex flex-col gap-3 ${p!.id === 'pro' ? 'border-yellow-500/60 dark:border-yellow-600/60 bg-yellow-500/5' : 'border-stone-400/60 dark:border-stone-600 bg-stone-200/50 dark:bg-stone-800/50'}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-minecraft text-lg text-stone-900 dark:text-stone-100">{p!.name}</h3>
              <span className="font-minecraft text-2xl text-stone-900 dark:text-stone-100">
                {p!.price === 0 ? 'Free' : formatMoney(p!.price, p!.currency)}
                {p!.price > 0 && <span className="text-xs text-stone-500 dark:text-stone-400"> / 30 days</span>}
              </span>
            </div>
            <ul className="flex flex-col gap-1.5 text-sm">
              {p!.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-stone-700 dark:text-stone-300">
                  <Check className="size-4 shrink-0 text-primary mt-0.5" /> {f}
                </li>
              ))}
            </ul>
            {p!.id === 'pro' && proServers.length > 0 && (
              <div className="text-xs text-stone-600 dark:text-stone-400">
                You currently have <strong>{proServers.length}</strong> pro server{proServers.length > 1 ? 's' : ''}.
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pro servers */}
      {proServers.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="font-minecraft text-sm text-stone-800 dark:text-stone-200">Your Pro servers</h3>
          <div className="rounded-sm border border-stone-400/60 dark:border-stone-600 overflow-hidden">
            {proServers.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-3 border-b border-stone-400/40 dark:border-stone-700 last:border-0">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={s.icon} alt="" className="size-10 rounded object-cover shrink-0" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                  <div className="flex flex-col min-w-0">
                    <span className="font-minecraft text-sm text-stone-900 dark:text-stone-100">{s.name}</span>
                    <span className="text-xs text-stone-500 dark:text-stone-400">
                      {s.proGrantedUntil ? `Pro until ${new Date(s.proGrantedUntil).toLocaleDateString()}` : 'Featured'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">
                    <Crown className="size-3" /> Featured
                  </span>
                  <a href={`/${s.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    <ExternalLink className="size-3" /> View
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checkout */}
      <form onSubmit={submit} className="flex flex-col gap-3 rounded-sm border border-stone-400/60 dark:border-stone-600 bg-stone-200/40 dark:bg-stone-800/40 p-4">
        <h3 className="font-minecraft text-sm text-stone-800 dark:text-stone-200">Start / renew Pro</h3>
        {myServers.isLoading ? (
          <ContentSkeleton />
        ) : servers.length === 0 ? (
          <div className="rounded-sm border border-stone-400/60 dark:border-stone-600 bg-stone-200/50 dark:bg-stone-800/50 p-6 text-center text-sm text-stone-500 dark:text-stone-400">
            You need a server to apply Pro to.{' '}
            <Link to="/dashboard/servers/add" className="text-primary hover:underline">Add your first server</Link>.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs font-medium text-stone-600 dark:text-stone-400">
              Server
              <select value={selectedServerId} onChange={(e) => setServerId(e.target.value)} className={inputCls} required>
                {servers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.slug})</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-stone-600 dark:text-stone-400">
              Period <span className="text-stone-500">({periodLabel} total)</span>
              <select value={periodDays} onChange={(e) => setPeriodDays(Number(e.target.value))} className={inputCls}>
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
                <option value={365}>1 year</option>
              </select>
            </label>
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <span className="text-xs font-medium text-stone-600 dark:text-stone-400">Payment method</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {GATEWAYS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGateway(g.id)}
                    className={`text-left rounded-sm border-2 px-3 py-2 text-sm transition-colors ${
                      gateway === g.id
                        ? 'border-primary bg-stone-100 dark:bg-stone-900'
                        : 'border-stone-400/60 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-900/50'
                    }`}
                  >
                    <span className="font-bold block">{g.label}</span>
                    <span className="text-xs text-stone-500 dark:text-stone-400">{g.hint}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {servers.length > 0 && (
          <div>
            <button type="submit" disabled={checkout.isPending} className="btn-accent btn-wrapper relative before:border rounded-md before:rounded-md h-11 before:h-11 inline-flex">
              <span className="btn-surface rounded-md font-bold border select-none w-full h-full px-6 inline-flex items-center justify-center gap-2 text-sm text-stone-900">
                <Crown className="size-4" />
                {checkout.isPending ? 'Creating order…' : `Get Pro — ${periodLabel}`}
              </span>
            </button>
          </div>
        )}
      </form>
        </>
      )}
    </div>
  )
}
