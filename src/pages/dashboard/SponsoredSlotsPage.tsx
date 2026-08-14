import { Link } from 'react-router'
import { Megaphone } from 'lucide-react'
import { useMyPlacements } from '../../lib/billing'
import { Loading, ErrorState } from '../../components/Async'

const TYPE_LABEL: Record<string, string> = {
  featured: 'Featured',
  sponsored: 'Sponsored',
  pro: 'Pro',
}

export function SponsoredSlotsPage() {
  const q = useMyPlacements()

  if (q.isLoading) return <Loading label="Loading placements…" />
  if (q.error) return <ErrorState error={q.error} onRetry={() => void q.refetch()} />

  const slots = q.data ?? []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-minecraft text-xl text-stone-900 dark:text-stone-100">Sponsored Slots</h2>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Sponsored and featured placements put your server in front of more players across the listing pages.
        </p>
      </div>

      {slots.length === 0 ? (
        <div className="rounded-sm border border-stone-400/60 dark:border-stone-600 bg-stone-200/50 dark:bg-stone-800/50 p-8 text-center text-sm text-stone-500 dark:text-stone-400 flex flex-col items-center gap-3">
          <Megaphone className="size-8 text-stone-400" aria-hidden="true" />
          <p>You don't have any sponsored or featured placements yet.</p>
          <p className="text-xs">
            Check out our <Link to="/sponsored-slots" className="text-primary hover:underline">Sponsored Slots</Link> and{' '}
            <Link to="/pro-pricing" className="text-primary hover:underline">Pro Pricing</Link> pages, or contact us to book a slot.
          </p>
        </div>
      ) : (
        <div className="rounded-sm border border-stone-400/60 dark:border-stone-600 overflow-hidden">
          {slots.map((s) => {
            const active = s.active && (!s.endsAt || new Date(s.endsAt).getTime() > Date.now())
            return (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-3 border-b border-stone-400/40 dark:border-stone-700 last:border-0">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={s.serverIcon} alt="" className="size-10 rounded object-cover shrink-0" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                  <div className="flex flex-col min-w-0">
                    <Link to={`/${s.serverSlug}`} className="font-minecraft text-sm hover:underline text-stone-900 dark:text-stone-100">{s.serverName}</Link>
                    <span className="text-xs text-stone-500 dark:text-stone-400">
                      {TYPE_LABEL[s.type] ?? s.type} · slot #{s.slot}
                      {s.gamemodes.length > 0 && ` · ${s.gamemodes.join(', ')}`}
                    </span>
                    <span className="text-xs text-stone-500 dark:text-stone-400">
                      {s.startsAt ? `${new Date(s.startsAt).toLocaleDateString()}` : 'Immediate'}
                      {s.endsAt ? ` → ${new Date(s.endsAt).toLocaleDateString()}` : ' → ongoing'}
                    </span>
                  </div>
                </div>
                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${active ? 'bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-stone-400/20 text-stone-600 dark:text-stone-400'}`}>
                  {active ? 'Active' : s.active ? 'Scheduled' : 'Inactive'}
                </span>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-stone-500 dark:text-stone-400">
        Slots are managed by our team. To book a sponsored slot, see the{' '}
        <Link to="/sponsored-slots" className="text-primary hover:underline">Sponsored Slots</Link> page or{' '}
        <Link to="/pages/support" className="text-primary hover:underline">contact support</Link>.
      </p>
    </div>
  )
}
