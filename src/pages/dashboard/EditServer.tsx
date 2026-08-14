import { useState } from 'react'
import { useParams } from 'react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api, errorMessage, ApiError } from '../../lib/api'
import { useServer } from '../../lib/servers'
import { queryKeys } from '../../lib/queryKeys'
import { ErrorState } from '../../components/Async'
import { ContentSkeleton } from '../../components/Skeletons'
import { ImageField } from '../../components/ImageField'

const inputCls =
  'h-10 px-3 rounded-sm border-2 border-stone-400 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary'

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-stone-600 dark:text-stone-400">{label}</label>
      {children}
      {hint && <span className="text-xs text-stone-500 dark:text-stone-400">{hint}</span>}
    </div>
  )
}

export function EditServer({ votifier = false }: { votifier?: boolean }) {
  const { slug } = useParams()
  const serverQuery = useServer(slug ?? '')
  const queryClient = useQueryClient()

  const server = serverQuery.data
  const [savedMsg, setSavedMsg] = useState<string | null>(null)
  const [icon, setIcon] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [coverUrl, setCoverUrl] = useState('')

  const save = useMutation<{ id: string; slug: string }, ApiError, Record<string, unknown>>({
    mutationFn: (body) => {
      const path = votifier ? `/servers/${slug}/votifier` : `/servers/${slug}/owner`
      return api.patch<{ id: string; slug: string }>(path, body)
    },
    onSuccess: () => {
      setSavedMsg('Saved.')
      setTimeout(() => setSavedMsg(null), 2000)
      if (slug) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.server(slug) })
      }
    },
  })

  if (serverQuery.isLoading) return <ContentSkeleton />
  if (serverQuery.error) return <ErrorState error={serverQuery.error} onRetry={() => void serverQuery.refetch()} />
  if (!server) return null

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const body: Record<string, unknown> = {}
    if (!votifier) {
      const pick = (k: string) => {
        const v = fd.get(k)
        if (v !== null) body[k] = String(v)
      }
      pick('description')
      pick('website')
      pick('discord')
      pick('edition')
      pick('country')
      pick('bedrockIp')
      pick('version')
      body.bedrockPort = Number(fd.get('bedrockPort'))
      body.whitelist = fd.get('whitelist') === 'on'
      const supportedVersions = String(fd.get('supportedVersions') ?? '')
      body.supportedVersions = supportedVersions.split(',').map((s) => s.trim()).filter(Boolean)
      if (icon) body.icon = icon
      if (bannerUrl) body.bannerUrl = bannerUrl
      if (coverUrl) body.coverUrl = coverUrl
    } else {
      body.votifierEnabled = fd.get('votifierEnabled') === 'on'
      body.votifierHost = String(fd.get('votifierHost') ?? '')
      body.votifierPort = Number(fd.get('votifierPort'))
      body.votifierProtocol = String(fd.get('votifierProtocol') ?? 'auto')
      body.votifierToken = String(fd.get('votifierToken') ?? '')
      body.votifierPubKey = String(fd.get('votifierPubKey') ?? '')
    }
    save.mutate(body)
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-minecraft text-xl text-stone-900 dark:text-stone-100">
          {votifier ? `Votifier · ${server.name}` : `Edit · ${server.name}`}
        </h2>
      </div>
      {savedMsg && <p className="rounded-sm border border-lime-600/40 bg-lime-500/10 px-3 py-2 text-sm text-lime-700 dark:text-lime-400">{savedMsg}</p>}
      {save.isError && <p className="rounded-sm border border-red-600/40 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">{errorMessage(save.error)}</p>}

      <form onSubmit={submit} className="flex flex-col gap-4">
        {votifier ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Votifier enabled">
              <input type="checkbox" name="votifierEnabled" defaultChecked={server.votifierEnabled} className="size-5 mt-2 rounded border-stone-400 text-primary" />
            </Field>
            <Field label="Protocol">
              <select name="votifierProtocol" defaultValue={server.votifierProtocol} className={inputCls}>
                <option value="auto">Auto (v2 then v1)</option>
                <option value="v1">v1</option>
                <option value="v2">v2</option>
              </select>
            </Field>
            <Field label="Host">
              <input name="votifierHost" defaultValue={server.votifierHost} className={inputCls} />
            </Field>
            <Field label="Port">
              <input name="votifierPort" type="number" min={1} max={65535} defaultValue={server.votifierPort} className={inputCls} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Token (v2) or RSA public key (v1)" hint="Leave blank to keep the existing value.">
                <textarea name="votifierToken" defaultValue="" placeholder="Existing token is kept if blank" rows={3} className="px-3 py-2 rounded-sm border-2 border-stone-400 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 text-sm resize-y" />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Public key (v2)" hint="Only required for protocol v2. Leave blank to keep the existing value.">
                <textarea name="votifierPubKey" defaultValue="" placeholder="Existing key is kept if blank" rows={4} className="px-3 py-2 rounded-sm border-2 border-stone-400 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 text-sm resize-y" />
              </Field>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Edition">
              <select name="edition" defaultValue={server.edition} className={inputCls}>
                <option value="java">Java</option>
                <option value="bedrock">Bedrock</option>
                <option value="crossplay">Crossplay</option>
              </select>
            </Field>
            <Field label="Country (2-letter ISO)">
              <input name="country" defaultValue={server.country} maxLength={2} className={inputCls} />
            </Field>
            <Field label="Website">
              <input name="website" defaultValue={server.website} placeholder="https://…" className={inputCls} />
            </Field>
            <Field label="Discord invite">
              <input name="discord" defaultValue={server.discord} placeholder="https://discord.gg/…" className={inputCls} />
            </Field>
            <Field label="Version">
              <input name="version" defaultValue={server.version} className={inputCls} />
            </Field>
            <Field label="Bedrock IP">
              <input name="bedrockIp" defaultValue={server.bedrockIp} className={inputCls} />
            </Field>
            <Field label="Bedrock port">
              <input name="bedrockPort" type="number" min={1} max={65535} defaultValue={server.bedrockPort} className={inputCls} />
            </Field>
            <Field label="Supported versions (comma-separated)">
              <input name="supportedVersions" defaultValue={server.supportedVersions.join(', ')} className={inputCls} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Description">
                <textarea name="description" defaultValue={server.description} rows={4} className="px-3 py-2 rounded-sm border-2 border-stone-400 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 text-sm resize-y" />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="whitelist" defaultChecked={server.whitelist} className="size-4 rounded border-stone-400 text-primary" />
              Whitelisted server
            </label>
            <div className="md:col-span-2 flex flex-col gap-4 border-t border-stone-400/50 dark:border-stone-600/50 pt-4">
              <h3 className="font-minecraft text-sm text-stone-800 dark:text-stone-200">Listing images</h3>
              <ImageField label="Icon" kind="icon" value={icon || server.icon} onChange={setIcon} hint="Square image shown next to your server. Upload or paste a URL." />
              <ImageField label="Banner" kind="banner" value={bannerUrl || server.bannerUrl} onChange={setBannerUrl} hint="Wide banner (1200×300-ish) used on your server page." />
              <ImageField label="Cover" kind="cover" value={coverUrl || server.coverUrl} onChange={setCoverUrl} hint="Card/cover image used in listings." />
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button type="submit" disabled={save.isPending} className="btn-accent btn-wrapper relative before:border rounded-md before:rounded-md h-11 before:h-11 inline-flex">
            <span className="btn-surface rounded-md font-bold border select-none w-full h-full px-6 inline-flex items-center justify-center text-sm text-stone-900">
              {save.isPending ? 'Saving…' : 'Save'}
            </span>
          </button>
        </div>
      </form>
    </div>
  )
}
