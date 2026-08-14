import { useState } from 'react'
import { Link } from 'react-router'
import { ChevronRight } from 'lucide-react'

export function PageHero({
  crumbs,
  title,
  subtext,
}: {
  crumbs: { to?: string; label: string }[]
  title: string
  subtext?: string
}) {
  return (
    <div className="flex flex-col min-h-[150px] md:min-h-0 max-h-[240px] lg:min-h-0">
      <header className="relative flex flex-col min-h-[150px] md:min-h-0 max-h-[240px] w-full overflow-hidden border-b border-stone-300 dark:border-stone-700">
        <video
          className="hidden md:block w-full max-h-[180px] md:max-h-none md:h-[240px] object-contain md:object-cover pointer-events-none select-none"
          width="1200"
          height="240"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          src="/brand/minescout_banner.webm?v=1786293318"
          poster="/brand/minescout_banner_poster.webp?v=1786293318"
        />
        <div className="md:hidden min-h-[150px] flex-shrink-0 bg-stone-800/95 dark:bg-stone-950/95" aria-hidden="true" />
        <div className="flex flex-col w-full h-full p-4 absolute top-0 left-0 gap-2 items-center justify-center bg-stone-800/60 dark:bg-stone-950/60 backdrop-blur-xl md:backdrop-blur-[4px] min-h-[150px] md:min-h-0">
          <h1 className="text-xl md:text-2xl font-minecraft text-stone-100 text-center max-w-xs md:max-w-none">{title}</h1>
          {subtext && <p className="text-stone-300 text-center text-sm hidden md:block">{subtext}</p>}
          <nav aria-label="Breadcrumb" className="mt-1">
            <ol className="text-stone-300 flex flex-wrap items-center gap-1.5 text-xs md:text-sm font-medium">
              {crumbs.map((c, i) => (
                <li key={i} className="inline-flex items-center gap-1.5">
                  {i > 0 && (
                    <span className="[&>svg]:size-3.5" aria-hidden="true">
                      <ChevronRight className="size-3.5" />
                    </span>
                  )}
                  {c.to ? (
                    <Link className="hover:text-stone-100 transition-colors" to={c.to}>
                      {c.label}
                    </Link>
                  ) : (
                    <span>{c.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </header>
    </div>
  )
}

export function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="ml-faq" data-ml-faq>
      {items.map((item, i) => (
        <div key={i} className="ml-faq__item">
          <button
            type="button"
            className="ml-faq__q"
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="ml-faq__q-text">{item.q}</span>
            <span className="ml-faq__icon" aria-hidden="true">{open === i ? '−' : '+'}</span>
          </button>
          {open === i && (
            <div className="ml-faq__a" role="region">
              <p>{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
