import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { api, errorMessage, ApiError } from '../../lib/api'

const ALLOWED_TAGS = ['SMP', 'Survival', 'PvP', 'Skyblock', 'Creative', 'Minigames', 'Vanilla', 'Modded']
const EDITIONS = [
  { value: 'java', label: 'Java' },
  { value: 'bedrock', label: 'Bedrock' },
  { value: 'crossplay', label: 'Crossplay (Java + Bedrock)' },
]

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-stone-600 dark:text-stone-400">{label}</label>
      {children}
      {hint && <span className="text-xs text-stone-500 dark:text-stone-400">{hint}</span>}
    </div>
  )
}

const inputCls =
  'h-10 px-3 rounded-sm border-2 border-stone-400 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary'

export function AddServer() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    ip: '',
    port: '25565',
    description: '',
    website: '',
    discord: '',
    edition: 'java',
    country: '',
    bedrockIp: '',
    bedrockPort: '19132',
    whitelist: false,
    version: '',
    supportedVersions: '',
    tags: [] as string[],
  })

  const set = (k: keyof typeof form, v: string | boolean | string[]) => setForm((f) => ({ ...f, [k]: v }))

  const mutation = useMutation<{ id: string; slug: string }, ApiError>({
    mutationFn: async () =>
      api.post<{ id: string; slug: string }>('/servers', {
        name: form.name,
        ip: form.ip,
        port: form.port ? Number(form.port) : undefined,
        description: form.description,
        website: form.website || undefined,
        discord: form.discord || undefined,
        edition: form.edition,
        country: form.country || undefined,
        bedrockIp: form.bedrockIp || undefined,
        bedrockPort: form.bedrockPort ? Number(form.bedrockPort) : undefined,
        whitelist: form.whitelist,
        version: form.version || undefined,
        supportedVersions: form.supportedVersions ? form.supportedVersions.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
        tags: form.tags,
      }),
    onSuccess: (data) => {
      navigate(`/dashboard/servers/${data.slug}`)
    },
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-minecraft text-xl text-stone-900 dark:text-stone-100">Add your server</h2>
      </div>
      {mutation.isError && (
        <p className="rounded-sm border border-red-600/40 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">{errorMessage(mutation.error)}</p>
      )}
      <form onSubmit={submit} className="flex flex-col gap-4 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Server name">
            <input required minLength={3} maxLength={60} value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} />
          </Field>
          <Field label="IP / address">
            <input required value={form.ip} onChange={(e) => set('ip', e.target.value)} placeholder="play.example.com" className={inputCls} />
          </Field>
          <Field label="Port">
            <input type="number" min={1} max={65535} value={form.port} onChange={(e) => set('port', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Edition">
            <select value={form.edition} onChange={(e) => set('edition', e.target.value)} className={inputCls}>
              {EDITIONS.map((ed) => <option key={ed.value} value={ed.value}>{ed.label}</option>)}
            </select>
          </Field>
          <Field label="Country (2-letter ISO code)" hint="e.g. US, GB, DE">
            <input value={form.country} maxLength={2} onChange={(e) => set('country', e.target.value.toUpperCase())} className={inputCls} />
          </Field>
          <Field label="Version (from ping)">
            <input value={form.version} onChange={(e) => set('version', e.target.value)} placeholder="1.21" className={inputCls} />
          </Field>
          <Field label="Website">
            <input value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://…" className={inputCls} />
          </Field>
          <Field label="Discord invite">
            <input value={form.discord} onChange={(e) => set('discord', e.target.value)} placeholder="https://discord.gg/…" className={inputCls} />
          </Field>
          {form.edition !== 'java' && (
            <>
              <Field label="Bedrock IP">
                <input value={form.bedrockIp} onChange={(e) => set('bedrockIp', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Bedrock port">
                <input type="number" min={1} max={65535} value={form.bedrockPort} onChange={(e) => set('bedrockPort', e.target.value)} className={inputCls} />
              </Field>
            </>
          )}
          <Field label="Supported versions (comma-separated)" hint="e.g. 1.21, 1.20, 1.19">
            <input value={form.supportedVersions} onChange={(e) => set('supportedVersions', e.target.value)} className={inputCls} />
          </Field>
        </div>

        <Field label="Description (at least 20 characters)">
          <textarea
            required
            minLength={20}
            maxLength={240}
            rows={4}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            className="px-3 py-2 rounded-sm border-2 border-stone-400 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 text-sm resize-y"
          />
        </Field>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-stone-600 dark:text-stone-400">Tags / gamemodes</span>
          <div className="flex flex-wrap gap-2">
            {ALLOWED_TAGS.map((t) => {
              const active = form.tags.includes(t)
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => set('tags', active ? form.tags.filter((x) => x !== t) : [...form.tags, t])}
                  className={`px-3 py-1.5 rounded-sm text-sm font-medium border transition-colors ${
                    active
                      ? 'bg-lime-500 border-lime-700 text-stone-900'
                      : 'border-stone-400 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                  }`}
                >
                  {t}
                </button>
              )
            })}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.whitelist} onChange={(e) => set('whitelist', e.target.checked)} className="size-4 rounded border-stone-400 text-primary focus:ring-primary" />
          Whitelisted server
        </label>

        <div className="flex gap-2">
          <button type="submit" disabled={mutation.isPending} className="btn-accent btn-wrapper relative before:border rounded-md before:rounded-md h-11 before:h-11 inline-flex">
            <span className="btn-surface rounded-md font-bold border select-none w-full h-full px-6 inline-flex items-center justify-center text-sm text-stone-900">{mutation.isPending ? 'Submitting…' : 'Submit for review'}</span>
          </button>
          <Link to="/dashboard" className="inline-flex items-center h-11 px-4 rounded-md border-2 border-stone-400 dark:border-stone-600 text-sm font-bold hover:bg-stone-200/60 dark:hover:bg-stone-700/60 transition-colors">Cancel</Link>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          New servers appear on the public list after an admin verifies them. Until then they are visible here as "Pending".
        </p>
      </form>
    </div>
  )
}

export default AddServer
