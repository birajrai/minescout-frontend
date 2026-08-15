import { api } from '../lib/api'
import { ResourceCrudPage } from '../components/admin/ResourceCrudPage'

interface GamemodeRow {
  id: string
  slug: string
  name: string
  icon: string
  description: string
  sort: number
  serverCount?: number
}

export function AdminGamemodes() {
  return (
    <ResourceCrudPage
      title="Gamemodes"
      description="Taxonomy shown in the site nav and facet pages. Also powers the Tags view (server tags match gamemode names)."
      queryKey={['admin', 'gamemodes']}
      listFn={() => api.get<GamemodeRow[]>('/gamemodes')}
      createUrl="/admin/gamemodes"
      updateUrl={(id) => `/admin/gamemodes/${id}`}
      deleteUrl={(id) => `/admin/gamemodes/${id}`}
      displayOf={(r) => String(r.name ?? r.slug ?? '')}
      fields={[
        { name: 'name', label: 'Name', required: true, placeholder: 'e.g. Skyblock' },
        { name: 'icon', label: 'Icon URL', placeholder: '/uploads/gamemodes/skyblock.webp' },
        { name: 'sort', label: 'Sort order', type: 'number' },
        { name: 'description', label: 'Description', type: 'textarea' },
      ]}
      columns={[
        { key: 'name', header: 'Name', cell: (r) => <span className="font-medium capitalize">{String(r.name ?? r.slug)}</span> },
        { key: 'slug', header: 'Slug', cell: (r) => <span className="font-mono text-xs text-muted-foreground">{String(r.slug)}</span> },
        { key: 'icon', header: 'Icon', cell: (r) => r.icon ? <img src={String(r.icon)} alt="" className="h-6 w-6 rounded object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} /> : <span className="text-muted-foreground">—</span> },
        { key: 'servers', header: 'Servers', cell: (r) => <span className="tabular-nums text-muted-foreground">{(r.serverCount ?? 0).toLocaleString()}</span> },
      ]}
    />
  )
}
