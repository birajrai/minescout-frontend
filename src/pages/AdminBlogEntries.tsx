import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Search, ExternalLink, Plus, Pencil, Trash2, FileText, Newspaper } from 'lucide-react'
import { useApiQuery } from '../lib/hooks'
import { api, ApiError } from '../lib/api'
import { ErrorState } from '../components/Async'
import { PageHeader } from '../components/admin/PageHeader'
import { DataTable, type DataColumn } from '../components/admin/DataTable'
import { FilterBar } from '../components/admin/FilterBar'
import { EmptyState } from '../components/admin/EmptyState'
import { ConfirmDialog } from '../components/admin/ConfirmDialog'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { cn } from '../lib/utils'

interface BlogListResult {
  id: string
  slug: string
  title: string
  status: string
  excerpt: string
  publishedAt: string | null
  updatedAt: string
  authorName?: string
}

interface CmsPage {
  id: string
  slug: string
  title: string
  updatedAt: string
}

function useBlogAdminList() {
  return useApiQuery(['blog', 'admin'], () => api.get<BlogListResult[]>('/blog/admin/posts'))
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString()
}

export function AdminBlogEntries() {
  const [tab, setTab] = useState<'posts' | 'pages'>('posts')
  const [q, setQ] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<BlogListResult | null>(null)
  const queryClient = useQueryClient()
  const posts = useBlogAdminList()
  const pages = useApiQuery(['cms', 'admin'], () => api.get<CmsPage[]>('/admin/pages'))

  const remove = useMutation<{ success: boolean }, ApiError, string>({
    mutationFn: (id) => api.delete<{ success: boolean }>(`/blog/posts/${id}`),
    onSuccess: () => {
      toast.success('Post deleted')
      void queryClient.invalidateQueries({ queryKey: ['blog', 'admin'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'logs'] })
    },
    onError: (err) => toast.error(err.message),
  })

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    const entries = posts.data ?? []
    if (!query) return entries
    return entries.filter((p) => p.slug.includes(query) || p.title.toLowerCase().includes(query))
  }, [q, posts.data])

  const columns: DataColumn<BlogListResult>[] = [
    {
      key: 'title',
      header: 'Title',
      cell: (p) => (
        <div className="flex flex-col">
          <span className="font-medium">{p.title}</span>
          <span className="font-mono text-xs text-muted-foreground">{p.slug}</span>
        </div>
      ),
    },
    { key: 'status', header: 'Status', cell: (p) => <Badge variant={p.status === 'published' ? 'success' : p.status === 'scheduled' ? 'info' : 'warning'}>{p.status}</Badge> },
    { key: 'updated', header: 'Updated', cell: (p) => <span className="text-xs text-muted-foreground">{fmtDate(p.updatedAt)}</span> },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-full',
      cell: (p) => (
        <div className="flex items-center gap-2">
          <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            <ExternalLink className="h-3.5 w-3.5" /> View
          </a>
          <Link to={`/admin/blog/${p.id}/edit`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Link>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setConfirmDelete(p)}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Blog Entries" description="Posts, CMS pages and site content.">
        <Button asChild>
          <Link to="/admin/blog/new"><Plus className="h-4 w-4" /> New post</Link>
        </Button>
      </PageHeader>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-md border bg-muted/40 p-1">
          <button
            type="button"
            onClick={() => setTab('posts')}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              tab === 'posts' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Newspaper className="h-4 w-4" /> Posts
          </button>
          <button
            type="button"
            onClick={() => setTab('pages')}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              tab === 'pages' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <FileText className="h-4 w-4" /> Pages ({pages.data?.length ?? 0})
          </button>
        </div>
        {tab === 'posts' && (
          <FilterBar>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search posts…" className="w-64 pl-8" />
            </div>
          </FilterBar>
        )}
      </div>

      {tab === 'posts' ? (
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(p) => p.slug}
          isLoading={posts.isLoading}
          error={posts.error}
          onRetry={() => void posts.refetch()}
          empty={<EmptyState title="No posts found" description="Write your first post with the AI writer or the editor." />}
        />
      ) : (
        <div className="rounded-lg border bg-card p-4">
          {pages.isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading pages…</div>
          ) : pages.error ? (
            <ErrorState error={pages.error} onRetry={() => void pages.refetch()} />
          ) : (
            <div className="flex flex-wrap gap-2">
              {(pages.data ?? []).map((p) => (
                <a key={p.slug} href={`/pages/${p.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border bg-secondary/50 px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary/60 hover:bg-secondary">
                  {p.title}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        onOpenChange={(open) => setConfirmDelete(open ? confirmDelete : null)}
        title={`Delete "${confirmDelete?.title}"?`}
        description="The post and its URL are removed permanently."
        confirmLabel="Delete post"
        destructive
        onConfirm={() => confirmDelete && remove.mutate(confirmDelete.id)}
      />
    </div>
  )
}
