import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Save } from 'lucide-react'
import { api, ApiError } from '../lib/api'
import { useServer } from '../lib/servers'
import { ErrorState } from '../components/Async'
import { ContentSkeleton } from '../components/Skeletons'
import { PageHeader } from '../components/admin/PageHeader'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { ImageField } from '../components/ImageField'

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  )
}

export function AdminServerEdit() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const serverQuery = useServer(slug ?? '')
  const server = serverQuery.data
  const [icon, setIcon] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [coverUrl, setCoverUrl] = useState('')

  const isNew = !slug

  const save = useMutation<{ id: string; slug: string }, ApiError, Record<string, unknown>>({
    mutationFn: (body) =>
      isNew ? api.post<{ id: string; slug: string }>('/servers', body) : api.patch<{ id: string; slug: string }>(`/servers/${slug}`, body),
    onSuccess: (row) => {
      toast.success(isNew ? 'Server created' : 'Server saved')
      if (isNew) navigate(`/admin/servers/${row.slug}/edit`, { replace: true })
      else {
        void queryClient.invalidateQueries({ queryKey: ['admin', 'servers'] })
        void queryClient.invalidateQueries({ queryKey: ['servers'] })
      }
    },
    onError: (err) => toast.error(err.message),
  })

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const body: Record<string, unknown> = {
      name: String(fd.get('name') ?? '').trim(),
      ip: String(fd.get('ip') ?? '').trim(),
      port: Number(fd.get('port')) || 25565,
      version: String(fd.get('version') ?? ''),
      edition: String(fd.get('edition') ?? 'java'),
      country: String(fd.get('country') ?? '').trim(),
      whitelist: fd.get('whitelist') === 'on',
      verified: fd.get('verified') === 'on',
      featured: fd.get('featured') === 'on',
      description: String(fd.get('description') ?? ''),
      website: String(fd.get('website') ?? ''),
      discord: String(fd.get('discord') ?? ''),
    }
    if (!isNew) body.slug = String(fd.get('slug') ?? '').trim()
    const supportedVersions = String(fd.get('supportedVersions') ?? '')
    body.supportedVersions = supportedVersions.split(',').map((s) => s.trim()).filter(Boolean)
    const tags = String(fd.get('tags') ?? '')
    body.tags = tags.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
    if (icon) body.icon = icon
    if (bannerUrl) body.bannerUrl = bannerUrl
    if (coverUrl) body.coverUrl = coverUrl
    save.mutate(body)
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader title={isNew ? 'Add server' : `Edit · ${server?.name ?? ''}`}>
        <Button variant="ghost" asChild>
          <Link to="/admin/servers"><ArrowLeft className="h-4 w-4" /> Back to servers</Link>
        </Button>
      </PageHeader>

      {!isNew && serverQuery.isLoading ? (
        <ContentSkeleton />
      ) : !isNew && serverQuery.error ? (
        <ErrorState error={serverQuery.error} onRetry={() => void serverQuery.refetch()} />
      ) : !isNew && !server ? null : (
        <form onSubmit={submit} className="flex flex-col gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Listing</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Name">
                <Input name="name" defaultValue={server?.name} required />
              </Field>
              <Field label="Slug" hint="Used in the public URL.">
                <Input name="slug" defaultValue={server?.slug} disabled={isNew} />
              </Field>
              <Field label="IP">
                <Input name="ip" defaultValue={server?.ip} required />
              </Field>
              <Field label="Port">
                <Input name="port" type="number" min={1} max={65535} defaultValue={server?.port ?? 25565} />
              </Field>
              <Field label="Version">
                <Input name="version" defaultValue={server?.version} />
              </Field>
              <Field label="Country (2-letter ISO)">
                <Input name="country" defaultValue={server?.country} maxLength={2} />
              </Field>
              <Field label="Supported versions" hint="Comma-separated, e.g. 1.21, 1.20.4">
                <Input name="supportedVersions" defaultValue={server?.supportedVersions.join(', ')} />
              </Field>
              <Field label="Tags / gamemodes" hint="Comma-separated, e.g. survival, pvp">
                <Input name="tags" defaultValue={server?.tags.join(', ')} />
              </Field>
              <Field label="Edition">
                <select name="edition" defaultValue={server?.edition ?? 'java'} className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                  <option value="java">Java</option>
                  <option value="bedrock">Bedrock</option>
                  <option value="crossplay">Crossplay</option>
                </select>
              </Field>
              <Field label="Website">
                <Input name="website" defaultValue={server?.website} placeholder="https://…" />
              </Field>
              <Field label="Discord invite">
                <Input name="discord" defaultValue={server?.discord} placeholder="https://discord.gg/…" />
              </Field>
              <div className="flex flex-wrap items-center gap-5 md:col-span-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="whitelist" defaultChecked={server?.whitelist} className="size-4 accent-primary" />
                  Whitelisted
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="verified" defaultChecked={server?.verified} className="size-4 accent-primary" />
                  Verified
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="featured" defaultChecked={server?.featured} className="size-4 accent-primary" />
                  Featured
                </label>
              </div>
              <div className="md:col-span-2">
                <Field label="Description">
                  <Textarea name="description" defaultValue={server?.description} rows={4} />
                </Field>
              </div>
              <div className="md:col-span-2 flex flex-col gap-4">
                <ImageField label="Icon" kind="icon" value={icon || server?.icon || ''} onChange={setIcon} hint="Square image shown next to your server. Upload or paste a URL." />
                <ImageField label="Banner" kind="banner" value={bannerUrl || server?.bannerUrl || ''} onChange={setBannerUrl} hint="Wide banner used on your server page." />
                <ImageField label="Cover" kind="cover" value={coverUrl || server?.coverUrl || ''} onChange={setCoverUrl} hint="Card/cover image used in listings." />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={save.isPending}>
              <Save className="h-4 w-4" /> {save.isPending ? 'Saving…' : 'Save'}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link to="/admin/servers">Cancel</Link>
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
