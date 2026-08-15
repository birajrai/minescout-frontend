import { api } from '../lib/api'
import { useApiQuery } from '../lib/hooks'
import { ResourceCrudPage } from '../components/admin/ResourceCrudPage'

interface BlogTagRow {
  id: string
  slug: string
  name: string
}

export function AdminBlogTags() {
  const tags = useApiQuery(['admin', 'blog-tags'], () => api.get<BlogTagRow[]>('/admin/blog-tags'))
  void tags
  return (
    <ResourceCrudPage
      title="Blog Tags"
      description="Tags used across blog posts."
      queryKey={['admin', 'blog-tags']}
      listFn={() => api.get<BlogTagRow[]>('/admin/blog-tags')}
      createUrl="/admin/blog-tags"
      updateUrl={(id) => `/admin/blog-tags/${id}`}
      deleteUrl={(id) => `/admin/blog-tags/${id}`}
      displayOf={(r) => String(r.name)}
      fields={[{ name: 'name', label: 'Name', required: true, placeholder: 'e.g. Server Setup' }]}
      columns={[
        { key: 'name', header: 'Name', cell: (r) => <span className="font-medium">{String(r.name)}</span> },
        { key: 'slug', header: 'Slug', cell: (r) => <span className="font-mono text-xs text-muted-foreground">{String(r.slug)}</span> },
      ]}
    />
  )
}
