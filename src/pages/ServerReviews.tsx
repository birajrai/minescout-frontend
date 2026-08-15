import { useState } from 'react'
import { useOutletContext } from 'react-router'
import { Link } from 'react-router'
import { Star, ChevronRight } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api, errorMessage, ApiError } from '../lib/api'
import { useServerReviews } from '../lib/servers'
import { queryKeys } from '../lib/queryKeys'
import { ErrorState } from '../components/Async'
import { ContentSkeleton } from '../components/Skeletons'
import type { Server, Review } from '../lib/types'

function ReviewForm({ slug }: { slug: string }) {
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const queryClient = useQueryClient()

  const mutation = useMutation<Review, ApiError>({
    mutationFn: async () =>
      api.post<Review>(`/servers/${slug}/reviews`, { rating, title, body }),
    onSuccess: () => {
      setTitle('')
      setBody('')
      setRating(5)
      void queryClient.invalidateQueries({ queryKey: queryKeys.serverReviews(slug) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.server(slug) })
    },
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return
    mutation.mutate()
  }

  return (
    <section className="rounded-sm border border-stone-300 dark:border-stone-600 bg-stone-100/50 dark:bg-stone-800/50 p-6 flex flex-col gap-4">
      <h2 className="font-minecraft text-lg text-stone-900 dark:text-stone-100">Write a review</h2>
      {mutation.isSuccess && (
        <p className="rounded-sm border border-lime-600/40 bg-lime-500/10 px-3 py-2 text-sm text-lime-700 dark:text-lime-400">Thanks! Your review was published.</p>
      )}
      {mutation.isError && (
        <p className="rounded-sm border border-red-600/40 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">
          {errorMessage(mutation.error)}
          {mutation.error.status === 401 && <> <Link to="/login" className="underline">Log in</Link> to review.</>}
        </p>
      )}
      <form className="flex flex-col gap-3 max-w-md" onSubmit={submit}>
        <div className="flex flex-col gap-1">
          <label htmlFor="review-rating" className="text-xs font-medium text-stone-600 dark:text-stone-400">Rating</label>
          <select id="review-rating" value={rating} onChange={(e) => setRating(Number(e.target.value))} className="h-10 px-2 rounded-sm border-2 border-stone-400 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 text-sm">
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="review-title" className="text-xs font-medium text-stone-600 dark:text-stone-400">Title (optional)</label>
          <input id="review-title" type="text" value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} className="h-10 px-3 rounded-sm border-2 border-stone-400 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 text-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="review-body" className="text-xs font-medium text-stone-600 dark:text-stone-400">Review</label>
          <textarea id="review-body" value={body} maxLength={2000} rows={4} required onChange={(e) => setBody(e.target.value)} className="px-3 py-2 rounded-sm border-2 border-stone-400 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 text-sm resize-y" />
        </div>
        <button type="submit" disabled={mutation.isPending} className="btn-accent btn-wrapper relative rounded-md before:rounded-md h-11 before:h-11 w-full sm:w-auto inline-flex">
          <span className="btn-surface rounded-md font-bold border select-none w-full h-full px-6 py-3 inline-flex items-center justify-center gap-2 text-sm">
            {mutation.isPending ? 'Submitting…' : 'Submit review'}
          </span>
        </button>
      </form>
    </section>
  )
}

export function ServerReviews() {
  const { server, slug } = useOutletContext<{ server: Server; slug: string }>()
  const reviews = useServerReviews(slug)

  return (
    <div className="flex flex-col gap-6">
      <div className="ov-reviews__head">
        <div className="ov-reviews__titles">
          <h2 className="ov-reviews__title font-minecraft text-lg md:text-xl text-stone-800 dark:text-stone-200">Recent reviews of {server.name}</h2>
          <p className="ov-reviews__meta text-sm text-stone-600 dark:text-stone-400">{(reviews.data ?? []).length} reviews on Minescout</p>
        </div>
        <Link to={`/${slug}/reviews`} className="ov-reviews__all text-primary hover:underline text-sm inline-flex items-center gap-1">
          All reviews <ChevronRight className="size-3.5" />
        </Link>
      </div>
      {reviews.isLoading ? (
        <ContentSkeleton />
      ) : reviews.error ? (
        <ErrorState error={reviews.error} onRetry={() => void reviews.refetch()} />
      ) : (reviews.data ?? []).length === 0 ? (
        <div className="rounded-sm border border-stone-300 dark:border-stone-600 bg-stone-200/50 dark:bg-stone-800/50 p-6 text-center text-stone-500 dark:text-stone-400">
          <p>No reviews yet. Be the first to review {server.name}!</p>
        </div>
      ) : (
        <ul className="ov-reviews__list flex flex-col gap-4 list-none p-0 m-0">
          {(reviews.data ?? []).map((r) => (
            <li key={r.id} className="ov-reviews__item flex gap-3">
              <img src={r.authorAvatar ?? ''} alt="" width="40" height="40" className="ov-reviews__avatar size-10 rounded-sm shrink-0" loading="lazy" data-placeholder="https://mineskin.eu/avatar/Steve/32.png" onError={(e) => { const el = e.currentTarget; el.onerror = null; el.src = el.dataset.placeholder || '' }} />
              <div className="ov-reviews__body flex flex-col gap-1 min-w-0">
                <div className="ov-reviews__row flex items-center justify-between gap-2 flex-wrap">
                  <div className="ov-reviews__who flex items-baseline gap-2">
                    <p className="ov-reviews__name font-semibold text-sm">{r.author}</p>
                    <p className="ov-reviews__date text-xs text-stone-500 dark:text-stone-400">{new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="ov-reviews__stars flex gap-0.5" role="img" aria-label={`${r.rating} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className={`ov-reviews__star size-4 ${n <= r.rating ? 'is-on fill-current text-yellow-500' : 'text-stone-400'}`} />
                    ))}
                  </div>
                </div>
                {r.title && <p className="ov-reviews__title-text font-semibold text-sm">{r.title}</p>}
                {r.body && <p className="ov-reviews__text text-sm text-stone-700 dark:text-stone-300">{r.body}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
      <ReviewForm slug={slug} />
    </div>
  )
}

export default ServerReviews
