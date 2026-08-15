import { useParams } from 'react-router'
import { PageHero } from '../components/Shared'
import { useCmsPage, Markdown } from '../lib/cms'
import { ErrorState } from '../components/Async'
import { ContentSkeleton } from '../components/Skeletons'
import { ApiError } from '../lib/api'
import { NotFound } from './NotFound'

export function ContentPage({ slug: fixedSlug }: { slug?: string }) {
  const params = useParams()
  const slug = fixedSlug ?? params.slug
  const query = useCmsPage(slug ?? '')

  const page = query.data
  const crumbs = [{ to: '/' as const, label: 'Home' }, { label: page?.title ?? '' }]

  return (
    <>
      <PageHero crumbs={crumbs} title={page?.title ?? ''} />
      <article className="wrapper flex flex-col gap-6 max-w-4xl px-4 py-6 md:py-12">
        {query.isLoading ? (
          <ContentSkeleton />
        ) : query.error ? (
          (query.error as ApiError).status === 404 ? (
            <NotFound />
          ) : (
            <ErrorState error={query.error} onRetry={() => void query.refetch()} />
          )
        ) : !page ? (
          <NotFound />
        ) : (
          <div className="bg-stone-300/50 dark:bg-stone-900/50 p-6 md:p-10 rounded-sm border border-stone-400 dark:border-stone-600">
            <Markdown source={page.contentMarkdown} />
          </div>
        )}
      </article>
    </>
  )
}
