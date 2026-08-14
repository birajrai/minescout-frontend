import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, ExternalLink } from 'lucide-react'
import { api, errorMessage, ApiError } from '../../lib/api'
import { useRealms } from '../../lib/realms'
import { useAuth } from '../../lib/auth'
import { Loading } from '../../components/Async'

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

export function DashboardRealms() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const list = useRealms({ limit: 100 })
  const [form, setForm] = useState({ code: '', name: '', description: '', region: '', imageUrl: '', edition: 'java' as 'java' | 'bedrock' })
  const [error, setError] = useState<string | null>(null)

  const mine = (list.data?.results ?? []).filter((r) => r.ownerId === user?.user.userId)

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['realms'] })

  const create = useMutation<{ code: string }, ApiError>({
    mutationFn: () =>
      api.post<{ code: string }>('/realms', {
        code: form.code,
        name: form.name,
        description: form.description || undefined,
        region: form.region || undefined,
        imageUrl: form.imageUrl || undefined,
        edition: form.edition,
      }),
    onSuccess: () => {
      invalidate()
      setForm({ code: '', name: '', description: '', region: '', imageUrl: '', edition: 'java' })
      setError(null)
    },
    onError: (e) => setError(errorMessage(e)),
  })

  const remove = useMutation<{ success: boolean }, ApiError, string>({
    mutationFn: (code) => api.delete<{ success: boolean }>(`/realms/${code}`),
    onSuccess: () => invalidate(),
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    create.mutate()
  }

  if (list.isLoading) return <Loading label="Loading realms…" />

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-minecraft text-xl text-stone-900 dark:text-stone-100">My Realms ({mine.length})</h2>
      </div>
      <p className="text-sm text-stone-600 dark:text-stone-400">
        Realms are themed landing pages for your community. Create one with a short code and share it as <span className="font-mono text-xs">yourdomain/realm/CODE</span>.
      </p>

      {mine.length > 0 ? (
        <div className="rounded-sm border border-stone-400/60 dark:border-stone-600 overflow-hidden">
          {mine.map((r) => (
            <div key={r.code} className="flex flex-wrap items-center justify-between gap-3 p-3 border-b border-stone-400/40 dark:border-stone-700 last:border-0">
              <div className="flex items-center gap-3 min-w-0">
                {r.imageUrl ? (
                  <img src={r.imageUrl} alt="" className="size-12 rounded-sm object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                ) : null}
                <div className="flex flex-col min-w-0">
                  <span className="font-minecraft text-sm text-stone-900 dark:text-stone-100">{r.name}</span>
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">/{r.code} · {r.edition} · {r.region || '—'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={`/realm/${r.code}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  <ExternalLink className="size-3" /> View
                </a>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete realm "/${r.code}"? This cannot be undone.`)) remove.mutate(r.code)
                  }}
                  disabled={remove.isPending}
                  className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline disabled:opacity-50"
                >
                  <Trash2 className="size-3" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-sm border border-stone-400/60 dark:border-stone-600 bg-stone-200/50 dark:bg-stone-800/50 p-8 text-center text-sm text-stone-500 dark:text-stone-400">You don't own any realms yet.</div>
      )}

      <form onSubmit={submit} className="flex flex-col gap-3 max-w-2xl rounded-sm border border-stone-400/60 dark:border-stone-600 bg-stone-200/40 dark:bg-stone-800/40 p-4">
        <h3 className="font-minecraft text-sm text-stone-800 dark:text-stone-200">Create a realm</h3>
        {error && <p className="rounded-sm border border-red-600/40 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">{error}</p>}
        {create.isError && !error && <p className="text-sm text-red-600 dark:text-red-400">{errorMessage(create.error)}</p>}
        {create.isSuccess && <p className="text-sm text-lime-600 dark:text-lime-400">Realm created.</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Code" hint="1-64 chars: letters, numbers, dashes">
            <input required value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toLowerCase() }))} placeholder="my-community" className={inputCls} />
          </Field>
          <Field label="Name">
            <input required minLength={3} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} />
          </Field>
          <Field label="Edition">
            <select value={form.edition} onChange={(e) => setForm((f) => ({ ...f, edition: e.target.value as 'java' | 'bedrock' }))} className={inputCls}>
              <option value="java">Java</option>
              <option value="bedrock">Bedrock</option>
            </select>
          </Field>
          <Field label="Region">
            <input value={form.region} onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))} placeholder="EU / NA / " className={inputCls} />
          </Field>
          <Field label="Image URL" hint="Optional cover image">
            <input type="url" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="https://…" className={inputCls} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Description" hint="Optional, max 2000 chars">
              <textarea value={form.description} maxLength={2000} rows={3} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="px-3 py-2 rounded-sm border-2 border-stone-400 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 text-sm resize-y" />
            </Field>
          </div>
        </div>
        <div>
          <button type="submit" disabled={create.isPending} className="btn-accent btn-wrapper relative before:border rounded-md before:rounded-md h-11 before:h-11 inline-flex">
            <span className="btn-surface rounded-md font-bold border select-none w-full h-full px-6 inline-flex items-center justify-center text-sm text-stone-900">
              {create.isPending ? 'Creating…' : 'Create realm'}
            </span>
          </button>
        </div>
      </form>
    </div>
  )
}
