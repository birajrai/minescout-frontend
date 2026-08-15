import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Sparkles, Save, Wand2 } from 'lucide-react'
import { api, ApiError } from '../lib/api'
import { PageHeader } from '../components/admin/PageHeader'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

interface AiResult {
  title: string
  excerpt: string
  seoTitle: string
  seoDescription: string
  markdown: string
}

export function AdminAiWriter() {
  const navigate = useNavigate()
  const [topic, setTopic] = useState('')
  const [keywords, setKeywords] = useState('')
  const [tone, setTone] = useState('')
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium')
  const [result, setResult] = useState<AiResult | null>(null)

  const generate = useMutation<AiResult, ApiError>({
    mutationFn: () =>
      api.post<AiResult>('/admin/blog/ai-write', {
        topic,
        keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
        tone,
        length,
      }),
    onSuccess: (data) => {
      setResult(data)
      toast.success('Draft generated')
    },
    onError: (err) => toast.error(err.message),
  })

  const saveDraft = useMutation<{ id: string; slug: string }, ApiError>({
    mutationFn: () =>
      api.post<{ id: string; slug: string }>('/blog/posts', {
        title: result?.title,
        excerpt: result?.excerpt,
        bodyMarkdown: result?.markdown,
        seoTitle: result?.seoTitle,
        seoDescription: result?.seoDescription,
        status: 'draft',
      }),
    onSuccess: (row) => {
      toast.success('Draft saved — open it in the editor')
      navigate(`/admin/blog/${row.id}/edit`)
    },
    onError: (err) => toast.error(err.message),
  })

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader title="AI Blog Writer" description="Generate a complete blog post draft from a topic and keywords." />

      <Card>
        <CardHeader><CardTitle className="text-base">New post</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Topic</Label>
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. How to make a modded Minecraft server" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Keywords</Label>
            <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="comma, separated, keywords" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Tone</Label>
              <Input value={tone} onChange={(e) => setTone(e.target.value)} placeholder="e.g. friendly, expert" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Length</Label>
              <Select value={length} onValueChange={(v) => setLength(v as typeof length)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (~400 words)</SelectItem>
                  <SelectItem value="medium">Medium (~700 words)</SelectItem>
                  <SelectItem value="long">Long (~1200 words)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={() => generate.mutate()} disabled={generate.isPending || !topic.trim()}>
            <Wand2 className="h-4 w-4" /> {generate.isPending ? 'Generating…' : 'Generate draft'}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
            <CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-4 w-4 text-primary" /> Preview</CardTitle>
            <Button size="sm" onClick={() => saveDraft.mutate()} disabled={saveDraft.isPending}>
              <Save className="h-3.5 w-3.5" /> {saveDraft.isPending ? 'Saving…' : 'Save as draft'}
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</span>
              <p className="text-lg font-semibold">{result.title}</p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Excerpt</span>
              <p className="text-sm text-muted-foreground">{result.excerpt}</p>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">SEO title</span>
                <p className="text-sm">{result.seoTitle}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">SEO description</span>
                <p className="text-sm">{result.seoDescription}</p>
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Body (markdown)</span>
              <pre className="mt-1 max-h-80 overflow-auto rounded-md border bg-muted/40 p-3 text-xs whitespace-pre-wrap">{result.markdown}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
