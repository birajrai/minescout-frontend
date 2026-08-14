import { useParams } from 'react-router'
import { PageHero } from '../components/Shared'
import { useCmsPage, Markdown } from '../lib/cms'
import { Loading, ErrorState } from '../components/Async'
import { ApiError } from '../lib/api'
import { NotFound } from './NotFound'

export function ContentPage({ slug: fixedSlug }: { slug?: string }) {
  const params = useParams()
  const slug = fixedSlug ?? params.slug
  const query = useCmsPage(slug ?? '')

  if (query.isLoading) return <Loading label="Loading page…" />
  if (query.error) {
    if ((query.error as ApiError).status === 404) return <NotFound />
    return <ErrorState error={query.error} onRetry={() => void query.refetch()} />
  }
  const page = query.data
  if (!page) return <NotFound />

  const crumbs = [{ to: '/' as const, label: 'Home' }, { label: page.title }]

  return (
    <>
      <PageHero crumbs={crumbs} title={page.title} />
      <article className="wrapper flex flex-col gap-6 max-w-4xl px-4 py-6 md:py-12">
        <div className="bg-stone-300/50 dark:bg-stone-900/50 p-6 md:p-10 rounded-sm border border-stone-400 dark:border-stone-600">
          <Markdown source={page.contentMarkdown} />
        </div>
      </article>
    </>
  )
}
