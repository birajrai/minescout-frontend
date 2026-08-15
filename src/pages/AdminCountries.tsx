import { api } from '../lib/api'
import { ResourceCrudPage } from '../components/admin/ResourceCrudPage'

interface CountryRow {
  id: string
  code: string
  name: string
  description: string
  serverCount?: number
}

export function AdminCountries() {
  return (
    <ResourceCrudPage
      title="Countries"
      description="Country facets (ISO-2 code + display name)."
      queryKey={['admin', 'countries']}
      listFn={() => api.get<CountryRow[]>('/countries')}
      createUrl="/admin/countries"
      updateUrl={(id) => `/admin/countries/${id}`}
      deleteUrl={(id) => `/admin/countries/${id}`}
      displayOf={(r) => String(r.name)}
      fields={[
        { name: 'code', label: 'Code (ISO-2)', required: true, placeholder: 'e.g. US', hint: '2-letter uppercase code.' },
        { name: 'name', label: 'Name', required: true, placeholder: 'e.g. United States' },
        { name: 'description', label: 'Description', type: 'textarea' },
      ]}
      columns={[
        { key: 'name', header: 'Name', cell: (r) => <span className="font-medium">{String(r.name)}</span> },
        { key: 'code', header: 'Code', cell: (r) => <span className="font-mono text-xs font-semibold uppercase">{String(r.code)}</span> },
        { key: 'servers', header: 'Servers', cell: (r) => <span className="tabular-nums text-muted-foreground">{(r.serverCount ?? 0).toLocaleString()}</span> },
      ]}
    />
  )
}
