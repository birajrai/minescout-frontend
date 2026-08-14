import { useOutletContext, Link } from 'react-router'
import { useServerReviews } from '../lib/servers'
import { motdToHtml } from '../lib/motd'
import type { Server } from '../lib/types'
import { ContentSkeleton } from '../components/Skeletons'

const STAR_PATH =
  'M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z'

function ReviewStars({ rating }: { rating: number }) {
  const full = Math.round(rating)
  return (
    <div className="ov-reviews__stars" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`ov-reviews__star${n <= full ? ' is-on' : ''}`}
          aria-hidden="true"
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
    </div>
  )
}

export function ServerOverview() {
  const { server, slug } = useOutletContext<{ server: Server; slug: string }>()
  const reviewsQuery = useServerReviews(slug)
  const reviews = reviewsQuery.data ?? []
  const motdHtml = motdToHtml(server.motd)
  const paragraphs = server.description
    ? server.description.split(/\n\s*\n/).filter(Boolean)
    : []

  const links = [
    server.website ? { href: server.website, label: 'Website' } : null,
    server.discord ? { href: server.discord, label: 'Discord' } : null,
  ].filter(Boolean) as { href: string; label: string }[]

  return (
    <article className="server-overview flex flex-col gap-8 md:gap-10 text-sm md:text-base pl-2 md:pl-0">
      {server.description && (
        <section className="flex flex-col gap-3" aria-labelledby="server-about-heading">
          <h2 id="server-about-heading" className="font-minecraft text-lg md:text-xl text-stone-800 dark:text-stone-200">About {server.name}</h2>
          {paragraphs.length > 0 ? (
            paragraphs.map((p, i) => (
              <p key={i} className={`md:leading-relaxed text-stone-700 dark:text-stone-300${i === 0 ? ' font-medium' : ''}`}>{p}</p>
            ))
          ) : (
            <p className="md:leading-relaxed text-stone-700 dark:text-stone-300">{server.description}</p>
          )}
        </section>
      )}

      {server.bannerUrl && (
        <section className="server-overview-banner flex flex-col items-center w-full" aria-label="Server banner">
          <div className="aspect-[468/60] max-w-[468px] max-h-[60px] w-full">
            <img src={server.bannerUrl} alt={`${server.name} Minecraft Server banner`} width="468" height="60" className="rounded-sm w-full h-full object-cover" decoding="async" />
          </div>
        </section>
      )}

      {motdHtml && (
        <section className="flex flex-col gap-2 md:gap-3 w-full" aria-labelledby="server-motd-heading">
          <h2 id="server-motd-heading" className="font-minecraft text-base md:text-lg text-stone-800 dark:text-stone-200">{server.name} MOTD</h2>
          <div className="server-motd-banner">
            <div className="server-motd-banner__body">
              {server.icon && (
                <img className="server-motd-banner__icon" src={server.icon} width="64" height="64" alt={`${server.name} Minecraft server icon`} loading="lazy" />
              )}
              <div className="server-motd-banner__text">
                <div className="server-motd-banner__motd-row">
                  <div className="server-motd-banner__strip mc-motd" translate="no" dangerouslySetInnerHTML={{ __html: motdHtml }} />
                </div>
                <div className="server-motd-banner__players" translate="no">
                  {server.playersOnline}/{server.playersMax} playing now
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {links.length > 0 && (
        <nav className="flex flex-col gap-2" aria-label={`Links for ${server.name}`}>
          <h2 className="font-minecraft text-base md:text-lg text-stone-800 dark:text-stone-200">Connect with {server.name}</h2>
          <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noreferrer nofollow" className="inline-flex items-center rounded-md border border-stone-400/60 dark:border-stone-600 bg-stone-200/50 dark:bg-stone-800/50 text-stone-800 dark:text-stone-200 text-xs font-medium px-2.5 py-1 hover:bg-stone-300/60 dark:hover:bg-stone-700/60 transition-colors">{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {reviewsQuery.isLoading ? (
        <ContentSkeleton />
      ) : reviews.length > 0 ? (
        <section className="ov-reviews" aria-labelledby="overview-reviews-heading">
          <div className="ov-reviews__head">
            <div className="ov-reviews__titles">
              <h2 id="overview-reviews-heading" className="ov-reviews__title font-minecraft">Recent reviews of {server.name}</h2>
              <p className="ov-reviews__meta">{reviews.length} reviews on Minescout</p>
            </div>
            <Link to={`/${slug}/reviews`} className="ov-reviews__all">
              All reviews
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
            </Link>
          </div>
          <ul className="ov-reviews__list">
            {reviews.slice(0, 3).map((r) => (
              <li key={r.id} className="ov-reviews__item">
                <img src={r.authorAvatar ?? ''} alt="" width="40" height="40" className="ov-reviews__avatar" loading="lazy" data-placeholder="https://mineskin.eu/avatar/Steve/32.png" onError={(e) => { const el = e.currentTarget; el.onerror = null; el.src = el.dataset.placeholder || '' }} />
                <div className="ov-reviews__body">
                  <div className="ov-reviews__row">
                    <div className="ov-reviews__who">
                      <p className="ov-reviews__name">{r.author}</p>
                      <p className="ov-reviews__date">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                    <ReviewStars rating={r.rating} />
                  </div>
                  {r.title && <p className="ov-reviews__title-text font-semibold">{r.title}</p>}
                  {r.body && <p className="ov-reviews__text">{r.body}</p>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  )
}
