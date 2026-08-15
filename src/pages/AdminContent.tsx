import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router'
import { Search, ExternalLink, Tags, Plus, Pencil, Trash2 } from 'lucide-react'
import { useApiQuery } from '../lib/hooks'
import { api, ApiError } from '../lib/api'
import { useFacets } from '../lib/servers'
import { ErrorState } from '../components/Async'
import { TableRowsSkeleton } from '../components/Skeletons'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import type { BlogListResult, CmsPage } from '../lib/types'

function useBlogAdminList() {
  return useApiQuery(['blog', 'admin'], () => api.get<BlogListResult[]>('/blog/admin/posts'))
}

export function AdminContent() {
  const [q, setQ] = useState('')
  const posts = useBlogAdminList()
  const pages = useApiQuery(['cms', 'admin'], () => api.get<CmsPage[]>('/admin/pages'))
  const tags = useFacets('gamemodes')
  const queryClient = useQueryClient()

  const remove = useMutation<{ success: boolean }, ApiError, string>({
    mutationFn: (id) => api.delete<{ success: boolean }>(`/blog/posts/${id}`),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['blog', 'admin'] }),
  })

  const filteredPosts = useMemo(() => {
    const query = q.trim().toLowerCase()
    const entries = posts.data ?? []
    if (!query) return entries
    return entries.filter((p) => p.slug.includes(query) || p.title.toLowerCase().includes(query))
  }, [q, posts.data])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Content</h1>
        <p className="text-sm text-muted-foreground">Blog posts, CMS pages and tag inventory.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search posts & pages..." className="pl-8" />
      </div>

      <Card>
        <CardHeader className="py-4 flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">Blog posts ({filteredPosts.length})</CardTitle>
          <Button asChild size="sm">
            <Link to="/admin/content/blog/new"><Plus className="h-3.5 w-3.5" /> New post</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {posts.isLoading ? (
            <TableRowsSkeleton />
          ) : posts.error ? (
            <ErrorState error={posts.error} onRetry={() => void posts.refetch()} />
          ) : (
          <div className="flex flex-col divide-y">
            {filteredPosts.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No posts found.</div>}
            {filteredPosts.map((p) => (
              <div key={p.slug} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-sm break-words">{p.title}</span>
                  <span className="text-xs text-muted-foreground">{p.slug}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                    <ExternalLink className="h-3.5 w-3.5" /> View
                  </a>
                  <Link to={`/admin/content/blog/${p.id}/edit`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      if (window.confirm(`Delete "${p.title}"?`)) remove.mutate(p.id)
                    }}
                    disabled={remove.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base">CMS pages ({pages.data?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {pages.isLoading ? (
            <TableRowsSkeleton />
          ) : pages.error ? (
            <ErrorState error={pages.error} onRetry={() => void pages.refetch()} />
          ) : (
          <div className="flex flex-wrap gap-2">
            {(pages.data ?? []).map((p) => (
              <a key={p.slug} href={`/pages/${p.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border bg-secondary/50 px-3 py-1.5 text-xs font-medium hover:border-primary/60 hover:bg-secondary transition-colors">
                {p.title}
                <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Tags className="h-4 w-4" /> Tags ({tags.data?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {(tags.data ?? []).slice(0, 24).map((t) => (
              <Badge key={t.slug} variant="outline" className="capitalize gap-1.5 py-1">
                {t.name ?? t.slug}
                <span className="text-muted-foreground">{t.serverCount}</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminContent
