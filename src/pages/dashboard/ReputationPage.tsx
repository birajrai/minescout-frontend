import { Link } from 'react-router'
import { MessageSquare, Vote, Star } from 'lucide-react'
import { useMyReputation } from '../../lib/billing'
import { ErrorState } from '../../components/Async'
import { ContentSkeleton } from '../../components/Skeletons'

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`size-3.5 ${n <= Math.round(rating) ? 'fill-current text-yellow-500' : 'text-stone-400'}`} />
      ))}
    </span>
  )
}

export function ReputationPage() {
  const q = useMyReputation()

  const rep = q.data!
  const stats = q.data
    ? [
        { label: 'Reviews received', value: rep.received.count, icon: MessageSquare },
        { label: 'Average rating', value: rep.received.count ? rep.received.avgRating.toFixed(2) : '—', icon: Star },
        { label: 'Votes received', value: rep.received.votes, icon: Vote },
        { label: 'Reviews written', value: rep.written.count, icon: MessageSquare },
      ]
    : []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-minecraft text-xl text-stone-900 dark:text-stone-100">Reputation</h2>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          How the community rates your servers and reviews. Ratings refresh as players leave reviews.
        </p>
      </div>

      {q.isLoading ? (
        <ContentSkeleton />
      ) : q.error ? (
        <ErrorState error={q.error} onRetry={() => void q.refetch()} />
      ) : (
        <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-sm border border-stone-300 dark:border-stone-600 bg-stone-200/50 dark:bg-stone-800/50 p-4">
            <s.icon className="size-4 text-stone-500 dark:text-stone-400 mb-2" />
            <div className="font-minecraft text-2xl text-stone-900 dark:text-stone-100">{s.value}</div>
            <div className="text-xs text-stone-500 dark:text-stone-400">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-minecraft text-sm text-stone-800 dark:text-stone-200">Per server</h3>
        {rep.servers.length === 0 ? (
          <div className="rounded-sm border border-stone-400/60 dark:border-stone-600 bg-stone-200/50 dark:bg-stone-800/50 p-6 text-center text-sm text-stone-500 dark:text-stone-400">
            No servers yet. <Link to="/dashboard/servers/add" className="text-primary hover:underline">Add your first server</Link> to start building reputation.
          </div>
        ) : (
          <div className="rounded-sm border border-stone-400/60 dark:border-stone-600 overflow-x-auto">
            <table className="w-full text-sm caption-bottom">
              <thead>
                <tr className="border-b border-stone-400/60 dark:border-stone-600 bg-stone-200/70 dark:bg-stone-700/50 text-left">
                  <th className="p-3 font-bold">Server</th>
                  <th className="p-3 font-bold">Rating</th>
                  <th className="p-3 font-bold">Reviews</th>
                  <th className="p-3 font-bold">Votes</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {rep.servers.map((s) => (
                  <tr key={s.slug} className="border-b border-stone-400/40 dark:border-stone-700">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <img src={s.icon} alt="" className="size-8 rounded object-cover shrink-0" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                        <Link to={`/${s.slug}`} className="font-minecraft text-sm hover:underline">{s.name}</Link>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-2">
                        <Stars rating={s.rating} />
                        <span className="text-xs text-stone-500 dark:text-stone-400">{s.rating.toFixed(2)}</span>
                      </span>
                    </td>
                    <td className="p-3">{s.reviewCount}</td>
                    <td className="p-3">{s.totalVotes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-minecraft text-sm text-stone-800 dark:text-stone-200">Recent reviews on your servers</h3>
        {rep.recent.length === 0 ? (
          <div className="rounded-sm border border-stone-400/60 dark:border-stone-600 bg-stone-200/50 dark:bg-stone-800/50 p-6 text-center text-sm text-stone-500 dark:text-stone-400">
            No reviews yet. Reviews left by players on your listings appear here.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {rep.recent.map((r) => (
              <div key={r.id} className="rounded-sm border border-stone-400/60 dark:border-stone-600 bg-stone-200/50 dark:bg-stone-800/50 p-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-minecraft text-sm text-stone-900 dark:text-stone-100">{r.author}</span>
                    <Stars rating={r.rating} />
                  </div>
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    on <Link to={`/${r.serverSlug}`} className="text-primary hover:underline">{r.serverName}</Link>
                  </span>
                </div>
                {r.title && <p className="mt-1 text-sm font-medium text-stone-800 dark:text-stone-200">{r.title}</p>}
                <p className="mt-0.5 text-sm text-stone-600 dark:text-stone-400 line-clamp-2">{r.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
        </>
      )}
    </div>
  )
}
