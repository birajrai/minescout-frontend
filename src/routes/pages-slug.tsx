import { Navigate, useParams } from 'react-router'
import { ContentPage } from '../pages/ContentPage'

const MIGRATED_PAGE_SLUGS = new Set([
  'how-to-get-more-players-on-a-minecraft-server',
  'how-to-join-a-minecraft-server',
  'how-to-make-a-minecraft-server',
  'how-to-make-a-modded-minecraft-server',
  'how-to-make-a-blast-furnace-in-minecraft',
  'how-to-make-an-armor-stand-in-minecraft',
  'how-to-tame-a-fox-in-minecraft',
  'best-minecraft-servers-2026',
  'minelist-the-best-minecraft-server-list-script',
])

export default function PagesSlug() {
  const { slug } = useParams()
  if (slug && MIGRATED_PAGE_SLUGS.has(slug)) return <Navigate to={`/blog/${slug}`} replace />
  return <ContentPage />
}
