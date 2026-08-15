import { useEffect, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { api, errorMessage, ApiError } from '../lib/api'
import { useApiQuery } from '../lib/hooks'
import { ErrorState } from '../components/Async'
import { TableRowsSkeleton } from '../components/Skeletons'
import { RichTextEditor } from '../components/RichTextEditor'
import { ImageField } from '../components/ImageField'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import type { BlogListResult } from '../lib/types'

type PostStatus = 'draft' | 'published' | 'scheduled'

interface AdminPost extends BlogListResult {
  bodyMarkdown: string
  status: PostStatus
  seoTitle: string | null
  seoDescription: string | null
  updatedAt: string
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120)
}

export function BlogEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [bodyMarkdown, setBodyMarkdown] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [status, setStatus] = useState<PostStatus>('draft')
  const [publishedAt, setPublishedAt] = useState('')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')

  const slugAuto = useRef(true)
  const hydrated = useRef(false)

  const list = useApiQuery(['blog', 'admin'], () => api.get<AdminPost[]>('/blog/admin/posts'))
  const post = id ? (list.data ?? []).find((p) => p.id === id) : undefined

  useEffect(() => {
    if (isEdit && post && !hydrated.current) {
      hydrated.current = true
      setTitle(post.title)
      setSlug(post.slug)
      slugAuto.current = false
      setExcerpt(post.excerpt ?? '')
      setBodyMarkdown(post.bodyMarkdown ?? '')
      setCoverUrl(post.coverUrl ?? '')
      setStatus(post.status)
      setPublishedAt(post.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 16) : '')
      setSeoTitle(post.seoTitle ?? '')
      setSeoDescription(post.seoDescription ?? '')
    }
  }, [isEdit, post])

  const create = useMutation<{ id: string; slug: string }, ApiError>({
    mutationFn: () =>
      api.post<{ id: string; slug: string }>('/blog/posts', {
        title,
        slug,
        excerpt,
        bodyMarkdown,
        coverUrl,
        tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
        status,
        ...(status === 'scheduled' && publishedAt ? { publishedAt: new Date(publishedAt).toISOString() } : {}),
        seoTitle,
        seoDescription,
      }),
    onSuccess: () => navigate('/admin/blog'),
  })

  const update = useMutation<{ success: boolean }, ApiError>({
    mutationFn: () =>
      api.patch<{ success: boolean }>(`/blog/posts/${id}`, {
        title,
        slug,
        excerpt,
        bodyMarkdown,
        coverUrl,
        tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
        status,
        ...(status === 'scheduled' && publishedAt ? { publishedAt: new Date(publishedAt).toISOString() } : {}),
        seoTitle,
        seoDescription,
      }),
    onSuccess: () => navigate('/admin/blog'),
  })

  const isPending = create.isPending || update.isPending
  const saveError = create.error ?? update.error

  if (isEdit && list.isLoading) return <TableRowsSkeleton />
  if (isEdit && list.error) return <ErrorState error={list.error} onRetry={() => void list.refetch()} />

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link to="/admin/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to content
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">{isEdit ? 'Edit post' : 'New post'}</h1>
        <p className="text-sm text-muted-foreground">Blog posts are written and stored in markdown.</p>
      </div>

      {isEdit && !post ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Post not found.{' '}
          <Link to="/admin/blog" className="text-primary hover:underline">Back to content</Link>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (isEdit) update.mutate()
            else create.mutate()
          }}
          className="flex flex-col gap-4"
        >
          {saveError && <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{errorMessage(saveError)}</p>}

          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="post-title">Title</Label>
                  <Input
                    id="post-title"
                    required
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value)
                      if (slugAuto.current) setSlug(slugify(e.target.value))
                    }}
                    placeholder="How to make a Minecraft server"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="post-slug">Slug</Label>
                  <Input
                    id="post-slug"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value)
                      slugAuto.current = false
                    }}
                    placeholder="how-to-make-a-minecraft-server"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="post-excerpt">Excerpt</Label>
                <Textarea id="post-excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Short summary shown in listings (max 300 chars)" maxLength={300} />
              </div>
              <ImageField label="Cover image" value={coverUrl} onChange={setCoverUrl} kind="cover" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-base">Body</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor value={bodyMarkdown} onChange={setBodyMarkdown} placeholder="Write your post in markdown…" maxLength={50000} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-base">Publishing</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="post-tags">Tags</Label>
                  <Input id="post-tags" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="minecraft, servers, guides (comma separated)" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as PostStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {status === 'scheduled' && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="post-published-at">Publish at</Label>
                  <Input id="post-published-at" type="datetime-local" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-base">SEO</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="post-seo-title">SEO title</Label>
                  <Input id="post-seo-title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Max 120 chars" maxLength={120} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="post-seo-description">SEO description</Label>
                  <Input id="post-seo-description" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder="Max 300 chars" maxLength={300} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="outline" asChild>
              <Link to="/admin/blog">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isPending}>{isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create post'}</Button>
          </div>
        </form>
      )}
    </div>
  )
}

export default BlogEditor
