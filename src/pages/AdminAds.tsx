import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { api, errorMessage, ApiError } from '../lib/api'
import { useApiQuery } from '../lib/hooks'
import { queryKeys } from '../lib/queryKeys'
import { Loading } from '../components/Async'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Checkbox } from '../components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import type { Ad } from '../lib/ads'

const EMPTY = { slot: 'leaderboard', placement: 'global', placementValue: '', imageUrl: '', targetUrl: '', active: true }

export function AdminAds() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState<string | null>(null)

  const list = useApiQuery(queryKeys.ads(), () => api.get<Ad[]>('/admin/ads'))
  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['ads'] })

  const create = useMutation<{ id: string }, ApiError>({
    mutationFn: () =>
      api.post<{ id: string }>('/admin/ads', {
        slot: form.slot,
        placement: form.placement,
        placementValue: form.placementValue,
        imageUrl: form.imageUrl,
        targetUrl: form.targetUrl,
        active: form.active,
      }),
    onSuccess: () => {
      invalidate()
      setForm(EMPTY)
      setError(null)
    },
    onError: (e) => setError(errorMessage(e)),
  })

  const toggle = useMutation<{ success: boolean }, ApiError, Ad>({
    mutationFn: (ad) => api.patch<{ success: boolean }>(`/admin/ads/${ad.id}`, { active: !ad.active }),
    onSuccess: () => invalidate(),
  })

  const remove = useMutation<{ success: boolean }, ApiError, string>({
    mutationFn: (id) => api.delete<{ success: boolean }>(`/admin/ads/${id}`),
    onSuccess: () => invalidate(),
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    create.mutate()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Ads</h1>
        <p className="text-sm text-muted-foreground">{list.data?.length ?? 0} ads across all slots.</p>
      </div>

      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base">Ad inventory</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {list.isLoading ? (
            <Loading label="Loading ads…" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Preview</TableHead>
                  <TableHead>Slot</TableHead>
                  <TableHead>Placement</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-full">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(list.data ?? []).map((ad) => (
                  <TableRow key={ad.id} className="align-top">
                    <TableCell>
                      <img src={ad.imageUrl} alt="" className="h-10 max-w-40 rounded object-cover border" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                    </TableCell>
                    <TableCell className="font-mono text-xs">{ad.slot}</TableCell>
                    <TableCell>
                      {ad.placement}
                      {ad.placementValue && <span className="block text-xs text-muted-foreground">{ad.placementValue}</span>}
                    </TableCell>
                    <TableCell className="text-primary break-all max-w-56">
                      <a href={ad.targetUrl} target="_blank" rel="noreferrer" className="hover:underline text-sm">{ad.targetUrl}</a>
                    </TableCell>
                    <TableCell>
                      <Badge variant={ad.active ? 'success' : 'muted'} className="cursor-pointer" onClick={() => toggle.mutate(ad)}>
                        {ad.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          if (window.confirm('Delete this ad?')) remove.mutate(ad.id)
                        }}
                        disabled={remove.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(list.data ?? []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="p-8 text-center text-sm text-muted-foreground">No ads yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <form onSubmit={submit} className="flex flex-col gap-4 rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold">Create ad</h3>
          <p className="text-sm text-muted-foreground">An image banner served in the configured slot.</p>
        </div>
        {error && <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Slot</Label>
            <Select value={form.slot} onValueChange={(v) => setForm((f) => ({ ...f, slot: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="leaderboard">leaderboard</SelectItem>
                <SelectItem value="sidebar">sidebar</SelectItem>
                <SelectItem value="server-banner">server-banner</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Placement</Label>
            <Input value={form.placement} onChange={(e) => setForm((f) => ({ ...f, placement: e.target.value }))} />
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <Label>Placement value <span className="text-muted-foreground">(e.g. a gamemode or server slug — optional)</span></Label>
            <Input value={form.placementValue} onChange={(e) => setForm((f) => ({ ...f, placementValue: e.target.value }))} />
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <Label>Image URL</Label>
            <Input required type="url" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="https://…" />
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <Label>Target URL</Label>
            <Input required type="url" value={form.targetUrl} onChange={(e) => setForm((f) => ({ ...f, targetUrl: e.target.value }))} placeholder="https://…" />
          </div>
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <Checkbox checked={form.active} onCheckedChange={(v) => setForm((f) => ({ ...f, active: v === true }))} />
            Active immediately
          </label>
        </div>
        <div>
          <Button type="submit" disabled={create.isPending}>{create.isPending ? 'Creating…' : 'Create ad'}</Button>
        </div>
      </form>
    </div>
  )
}
