import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Ban } from 'lucide-react'
import { api, errorMessage, ApiError } from '../lib/api'
import { useApiQuery } from '../lib/hooks'
import { queryKeys } from '../lib/queryKeys'
import { TableRowsSkeleton } from '../components/Skeletons'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent } from '../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import type { AdminUser } from '../lib/types'

export function AdminUsers() {
  const [q, setQ] = useState('')
  const queryClient = useQueryClient()
  const list = useApiQuery(queryKeys.adminUsers, () => api.get<AdminUser[]>('/admin/users'))

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers })

  const toggleBan = useMutation<{ id: string; banned: boolean }, ApiError, AdminUser>({
    mutationFn: (u) =>
      api.patch<{ id: string; banned: boolean }>(u.banned ? `/admin/users/${u.id}/unban` : `/admin/users/${u.id}/ban`),
    onSuccess: () => invalidate(),
  })

  const [confirming, setConfirming] = useState<string | null>(null)

  const rows = useMemo(() => {
    const all = list.data ?? []
    const term = q.trim().toLowerCase()
    if (!term) return all
    return all.filter(
      (u) =>
        u.username.toLowerCase().includes(term) ||
        (u.email ?? '').toLowerCase().includes(term) ||
        (u.minecraftUsername ?? '').toLowerCase().includes(term)
    )
  }, [list.data, q])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">{list.data?.length ?? 0} registered accounts.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search users..." className="pl-8" />
      </div>

      {list.error && <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{errorMessage(list.error)}</p>}

      <Card>
        <CardContent className="p-0">
          {list.isLoading ? (
            <TableRowsSkeleton />
          ) : rows.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No users found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Minecraft</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-full">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((u) => (
                  <TableRow key={u.id} className="align-top">
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={u.avatar ?? undefined} />
                          <AvatarFallback className="bg-primary/15 text-primary text-xs">{u.username[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{u.username}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{u.email || '—'}</TableCell>
                    <TableCell className="text-xs">{u.minecraftUsername || '—'}</TableCell>
                    <TableCell className="text-xs">{(u.roles ?? []).join(', ') || '—'}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        variant={u.banned ? 'destructive' : 'ghost'}
                        size="sm"
                        onClick={() => {
                          if (u.banned || confirming === u.id) {
                            toggleBan.mutate(u)
                            setConfirming(null)
                          } else {
                            setConfirming(u.id)
                            setTimeout(() => setConfirming((cur) => (cur === u.id ? null : cur)), 3000)
                          }
                        }}
                        disabled={toggleBan.isPending}
                      >
                        <Ban className="h-3.5 w-3.5" />
                        {u.banned ? 'Banned' : confirming === u.id ? 'Confirm ban?' : 'Active'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminUsers
