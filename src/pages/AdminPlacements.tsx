import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { api, errorMessage, ApiError } from '../lib/api'
import { useApiQuery } from '../lib/hooks'
import { queryKeys } from '../lib/queryKeys'
import { useAdminServers } from '../lib/admin-api'
import { Loading } from '../components/Async'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Checkbox } from '../components/ui/checkbox'
import { Card, CardContent } from '../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import type { AdminPlacement } from '../lib/types'

const TYPE_BADGE: Record<string, 'info' | 'warning' | 'secondary'> = { sponsored: 'info', pro: 'warning', featured: 'secondary' }

export function AdminPlacements() {
  const queryClient = useQueryClient()
  const [type, setType] = useState<'featured' | 'sponsored' | 'pro'>('sponsored')
  const [slot, setSlot] = useState(0)
  const [serverId, setServerId] = useState('')
  const [gamemodes, setGamemodes] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [active, setActive] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const list = useApiQuery(queryKeys.adminPlacements, () => api.get<AdminPlacement[]>('/admin/placements'))
  const serversQ = useAdminServers({ limit: 100 })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.adminPlacements })
    void queryClient.invalidateQueries({ queryKey: queryKeys.placements() })
    void queryClient.invalidateQueries({ queryKey: queryKeys.servers })
  }

  const create = useMutation<{ id: string }, ApiError>({
    mutationFn: () =>
      api.post<{ id: string }>('/placements', {
        type,
        slot: Number(slot) || 0,
        serverId,
        gamemodes: gamemodes ? gamemodes.split(',').map((g) => g.trim().toLowerCase()).filter(Boolean) : [],
        startsAt: startsAt || undefined,
        endsAt: endsAt || undefined,
        active,
      }),
    onSuccess: () => {
      invalidate()
      setServerId('')
      setError(null)
    },
    onError: (e) => setError(errorMessage(e)),
  })

  const toggle = useMutation<{ success: boolean }, ApiError, AdminPlacement>({
    mutationFn: (p) => api.patch<{ success: boolean }>(`/placements/${p.id}`, { active: !p.active }),
    onSuccess: () => invalidate(),
  })

  const remove = useMutation<{ success: boolean }, ApiError, string>({
    mutationFn: (id) => api.delete<{ success: boolean }>(`/placements/${id}`),
    onSuccess: () => invalidate(),
  })

  const servers = serversQ.data?.results ?? []

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    create.mutate()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Placements</h1>
        <p className="text-sm text-muted-foreground">{list.data?.length ?? 0} featured / sponsored / pro slots.</p>
      </div>

      {error && <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

      <Card>
        <CardContent className="p-0">
          {list.isLoading ? (
            <Loading label="Loading placements…" />
          ) : (list.data ?? []).length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No placements yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Server</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Slot</TableHead>
                  <TableHead>Gamemodes</TableHead>
                  <TableHead>Window</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-full">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(list.data ?? []).map((p) => {
                  const isActive = p.active && (!p.endsAt || new Date(p.endsAt).getTime() > Date.now())
                  return (
                    <TableRow key={p.id} className="align-top">
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <img src={p.serverIcon} alt="" className="h-8 w-8 rounded object-cover shrink-0" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                          <span className="font-medium">{p.serverName}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant={TYPE_BADGE[p.type] ?? 'secondary'}>{p.type}</Badge></TableCell>
                      <TableCell>#{p.slot}</TableCell>
                      <TableCell className="text-xs">{p.gamemodes.length ? p.gamemodes.join(', ') : 'All'}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        {p.startsAt ? new Date(p.startsAt).toLocaleDateString() : 'Immediate'}
                        {p.endsAt ? ` → ${new Date(p.endsAt).toLocaleDateString()}` : ' → ongoing'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={isActive ? 'success' : 'muted'} className="cursor-pointer" onClick={() => toggle.mutate(p)}>
                          {p.active ? (isActive ? 'Active' : 'Scheduled') : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            if (window.confirm('Delete this placement?')) remove.mutate(p.id)
                          }}
                          disabled={remove.isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <form onSubmit={submit} className="flex flex-col gap-4 rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold">Create placement</h3>
          <p className="text-sm text-muted-foreground">Assign a slot to a verified server.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Server</Label>
            <Select value={serverId} onValueChange={setServerId} required>
              <SelectTrigger><SelectValue placeholder="Select server…" /></SelectTrigger>
              <SelectContent>
                {servers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name} ({s.slug})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as 'featured' | 'sponsored' | 'pro')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="sponsored">Sponsored</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Slot</Label>
            <Input type="number" min={0} value={slot} onChange={(e) => setSlot(Number(e.target.value))} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Gamemodes <span className="text-muted-foreground">(comma separated, optional)</span></Label>
            <Input value={gamemodes} onChange={(e) => setGamemodes(e.target.value)} placeholder="survival, skyblock" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Starts at <span className="text-muted-foreground">(optional)</span></Label>
            <Input type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Ends at <span className="text-muted-foreground">(optional)</span></Label>
            <Input type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <Checkbox checked={active} onCheckedChange={(v) => setActive(v === true)} />
            Active
          </label>
        </div>
        <div>
          <Button type="submit" disabled={create.isPending}>{create.isPending ? 'Creating…' : 'Create placement'}</Button>
        </div>
      </form>
    </div>
  )
}
