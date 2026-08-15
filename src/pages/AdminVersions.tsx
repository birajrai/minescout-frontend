import { api } from '../lib/api'
import { ResourceCrudPage } from '../components/admin/ResourceCrudPage'

interface VersionRow {
  id: string
  slug: string
  label: string
  protocolMin: number | null
  protocolMax: number | null
  description: string
  sort: number
  serverCount?: number
}

export function AdminVersions() {
  return (
    <ResourceCrudPage
      title="Versions"
      description="Minecraft version list used for filtering."
      queryKey={['admin', 'versions']}
      listFn={() => api.get<VersionRow[]>('/versions')}
      createUrl="/admin/versions"
      updateUrl={(id) => `/admin/versions/${id}`}
      deleteUrl={(id) => `/admin/versions/${id}`}
      displayOf={(r) => String(r.label)}
      fields={[
        { name: 'label', label: 'Label', required: true, placeholder: 'e.g. 1.21.1' },
        { name: 'protocolMin', label: 'Protocol min', type: 'number' },
        { name: 'protocolMax', label: 'Protocol max', type: 'number' },
        { name: 'sort', label: 'Sort order', type: 'number' },
        { name: 'description', label: 'Description', type: 'textarea' },
      ]}
      columns={[
        { key: 'label', header: 'Label', cell: (r) => <span className="font-medium">{String(r.label)}</span> },
        { key: 'slug', header: 'Slug', cell: (r) => <span className="font-mono text-xs text-muted-foreground">{String(r.slug)}</span> },
        { key: 'protocol', header: 'Protocol', cell: (r) => <span className="font-mono text-xs text-muted-foreground">{`${r.protocolMin ?? '—'}–${r.protocolMax ?? '—'}`}</span> },
        { key: 'servers', header: 'Servers', cell: (r) => <span className="tabular-nums text-muted-foreground">{(r.serverCount ?? 0).toLocaleString()}</span> },
      ]}
    />
  )
}
