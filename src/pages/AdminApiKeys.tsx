import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Copy, Check, KeyRound, Trash2 } from 'lucide-react'
import { api, errorMessage, ApiError } from '../lib/api'
import { useApiQuery } from '../lib/hooks'
import { queryKeys } from '../lib/queryKeys'
import { Loading } from '../components/Async'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Checkbox } from '../components/ui/checkbox'
import { Card, CardContent } from '../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import type { ApiKey } from '../lib/types'

const SCOPE_OPTIONS = ['servers:read', 'servers:write', 'stats:read']

export function AdminApiKeys() {
  const [name, setName] = useState('')
  const [scopes, setScopes] = useState<string[]>([])
  const [created, setCreated] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const queryClient = useQueryClient()

  const list = useApiQuery(queryKeys.adminApiKeys, () => api.get<ApiKey[]>('/admin/api-keys'))
  const invalidate = () => void queryClient.invalidateQueries({ queryKey: queryKeys.adminApiKeys })

  const create = useMutation<{ id?: string; key?: string; note?: string }, ApiError>({
    mutationFn: () => api.post<{ id?: string; key?: string; note?: string }>('/admin/api-keys', { name, scopes }),
    onSuccess: (res) => {
      setCreated(res.key ?? null)
      setName('')
      setScopes([])
      invalidate()
    },
  })

  const toggle = useMutation<{ id: string }, ApiError, ApiKey>({
    mutationFn: (k) => api.patch<{ id: string }>(`/admin/api-keys/${k.id}/${k.revoked ? 'unrevoke' : 'revoke'}`),
    onSuccess: () => invalidate(),
  })

  const remove = useMutation<{ success: boolean }, ApiError, string>({
    mutationFn: (id) => api.delete<{ success: boolean }>(`/admin/api-keys/${id}`),
    onSuccess: () => invalidate(),
  })

  const copyKey = async () => {
    if (!created) return
    try {
      await navigator.clipboard.writeText(created)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">API Keys</h1>
        <p className="text-sm text-muted-foreground">{list.data?.length ?? 0} keys for programmatic access.</p>
      </div>

      {created && (
        <div className="rounded-lg border border-green-600/40 bg-green-500/10 p-4 text-sm">
          <p className="font-semibold text-green-700 dark:text-green-400">Key created — copy it now, it won't be shown again.</p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 break-all rounded-md border bg-background px-2 py-1.5 text-xs">{created}</code>
            <Button variant="outline" size="sm" onClick={() => void copyKey()}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>
      )}

      {list.error && <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{errorMessage(list.error)}</p>}

      <Card>
        <CardContent className="p-0">
          {list.isLoading ? (
            <Loading label="Loading API keys…" />
          ) : (list.data ?? []).length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No API keys yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Scopes</TableHead>
                  <TableHead>Last used</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-full">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(list.data ?? []).map((k) => (
                  <TableRow key={k.id} className="align-top">
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <KeyRound className="h-3.5 w-3.5 text-muted-foreground" /> {k.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">{new Date(k.createdAt).toLocaleDateString()}</span>
                    </TableCell>
                    <TableCell className="text-xs">{(k.scopes ?? []).join(', ') || '—'}</TableCell>
                    <TableCell className="text-xs">{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : 'Never'}</TableCell>
                    <TableCell>
                      <Badge variant={k.revoked ? 'destructive' : 'success'} className="cursor-pointer" onClick={() => toggle.mutate(k)}>
                        {k.revoked ? 'Revoked' : 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          if (window.confirm('Delete this API key?')) remove.mutate(k.id)
                        }}
                        disabled={remove.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          create.mutate()
        }}
        className="flex flex-col gap-4 rounded-lg border bg-card p-6 shadow-sm"
      >
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold">Create API key</h3>
          <p className="text-sm text-muted-foreground">Keys are shown only once at creation.</p>
        </div>
        {create.isError && <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{errorMessage(create.error)}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Name</Label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="CI server" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Scopes</Label>
            <div className="flex flex-wrap items-center gap-4 h-9">
              {SCOPE_OPTIONS.map((s) => (
                <label key={s} className="flex items-center gap-1.5 text-sm font-medium cursor-pointer">
                  <Checkbox checked={scopes.includes(s)} onCheckedChange={(v) => setScopes((cur) => (v === true ? [...cur, s] : cur.filter((x) => x !== s)))} />
                  {s}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div>
          <Button type="submit" disabled={create.isPending}>{create.isPending ? 'Creating…' : 'Create key'}</Button>
        </div>
      </form>
    </div>
  )
}
