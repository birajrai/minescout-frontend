import { useParams, Link } from 'react-router'
import { MapPin, Globe } from 'lucide-react'
import { PageHero } from '../components/Shared'
import { useRealm } from '../lib/realms'
import { ErrorState } from '../components/Async'
import { ContentSkeleton } from '../components/Skeletons'
import { ApiError } from '../lib/api'
import { NotFound } from './NotFound'

export function RealmPage() {
  const { code } = useParams()
  const query = useRealm(code ?? '')

  if (query.isLoading) return <ContentSkeleton />
  if (query.error) {
    if ((query.error as ApiError).status === 404) return <NotFound />
    return <ErrorState error={query.error} onRetry={() => void query.refetch()} />
  }
  const realm = query.data
  if (!realm) return <NotFound />

  return (
    <>
      <PageHero crumbs={[{ to: '/', label: 'Home' }, { label: realm.name }]} title={realm.name} />
      <div className="wrapper px-4 md:px-0 py-6 flex flex-col gap-6">
        {realm.imageUrl && (
          <img src={realm.imageUrl} alt={realm.name} className="w-full max-h-72 object-cover rounded-sm border border-stone-400 dark:border-stone-600" onError={(e) => { e.currentTarget.style.display = 'none' }} />
        )}
        <div className="flex flex-wrap items-center gap-3 text-sm text-stone-600 dark:text-stone-400">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-lime-500/15 text-lime-700 dark:text-lime-400 font-bold text-xs uppercase">
            <Globe className="size-3" /> {realm.edition}
          </span>
          {realm.region && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3" /> {realm.region}
            </span>
          )}
        </div>
        {realm.description && (
          <p className="text-stone-700 dark:text-stone-300 whitespace-pre-line max-w-3xl">{realm.description}</p>
        )}
        <div>
          <Link to="/" className="inline-flex items-center h-10 px-4 rounded-sm border-2 border-stone-400 dark:border-stone-600 text-sm font-bold hover:bg-stone-200/60 dark:hover:bg-stone-700/60 transition-colors">
            ← Back to Minescout
          </Link>
        </div>
      </div>
    </>
  )
}
