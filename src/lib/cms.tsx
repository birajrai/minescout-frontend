/* oxlint-disable react/only-export-components -- hooks + component in one file is intentional */
import { useMemo } from 'react'
import { marked } from 'marked'
import { api } from './api'
import { useApiQuery } from './hooks'
import { queryKeys } from './queryKeys'
import type { BlogListResult, BlogPost, CmsPage, Paged } from './types'

marked.setOptions({ breaks: true, gfm: true })

export function useCmsPage(slug: string) {
  return useApiQuery(queryKeys.cmsPage(slug), () => api.get<CmsPage>(`/pages/${encodeURIComponent(slug)}`))
}

export function useBlogList(page = 1, tag?: string) {
  return useApiQuery(queryKeys.blog({ page, tag }), () =>
    api.get<Paged<BlogListResult>>('/blog/posts', { page, limit: 12, tag })
  )
}

export function useBlogPost(slug: string) {
  return useApiQuery(queryKeys.blogPost(slug), () => api.get<BlogPost>(`/blog/posts/${encodeURIComponent(slug)}`))
}

export function renderMarkdown(md: string): string {
  return marked.parse(md, { async: false }) as string
}

export function Markdown({ source, className }: { source: string; className?: string }) {
  const html = useMemo(() => renderMarkdown(source ?? ''), [source])
  return (
    <div
      className={`prose prose-stone dark:prose-invert max-w-none text-stone-700 dark:text-stone-300 prose-headings:font-minecraft prose-headings:text-stone-900 dark:prose-headings:text-stone-100 prose-a:text-primary prose-a:underline ${className ?? ''}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
