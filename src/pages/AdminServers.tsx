import { useMemo, useState } from 'react'
import { Search, ExternalLink } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api, errorMessage, ApiError } from '../lib/api'
import { useAdminServers } from '../lib/admin-api'
import { TableRowsSkeleton } from '../components/Skeletons'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'

export function AdminServers() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const queryClient = useQueryClient()
  const list = useAdminServers({ search: q || undefined, status: status === 'all' ? undefined : status, limit: 50 })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'servers'] })
    void queryClient.invalidateQueries({ queryKey: ['servers'] })
  }

  const toggleFlag = useMutation<{ id: string; slug: string }, ApiError, { slug: string; field: 'verified' | 'featured'; value: boolean }>({
    mutationFn: ({ slug, field, value }) => api.patch<{ id: string; slug: string }>(`/servers/${slug}`, { [field]: value }),
    onSuccess: invalidate,
  })

  const error = list.error ?? (toggleFlag.isError ? toggleFlag.error : null)
  const [confirming, setConfirming] = useState<string | null>(null)

  const rows = useMemo(() => list.data?.results ?? [], [list.data])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Servers</h1>
        <p className="text-sm text-muted-foreground">{list.data?.total ?? 0} total · manage verification and featured status.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search servers..." className="w-64 pl-8" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending verification</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{errorMessage(error)}</p>}

      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base">Server list</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {list.isLoading ? (
            <TableRowsSkeleton />
          ) : rows.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No servers found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Server</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Votes</TableHead>
                  <TableHead className="w-full">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((s) => (
                  <TableRow key={s.slug}>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <img src={s.icon} alt="" className="h-8 w-8 rounded object-cover shrink-0" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                        <div className="flex flex-col">
                          <span className="font-medium">{s.name}</span>
                          <span className="text-xs text-muted-foreground">{s.slug}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-mono text-xs">{s.ip}:{s.port}</TableCell>
                    <TableCell>
                      <Button
                        variant={s.verified ? 'outline' : 'secondary'}
                        size="sm"
                        onClick={() => toggleFlag.mutate({ slug: s.slug, field: 'verified', value: !s.verified })}
                        className={s.verified ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}
                      >
                        {s.verified ? 'Verified' : 'Pending'}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={s.featured ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => toggleFlag.mutate({ slug: s.slug, field: 'featured', value: !s.featured })}
                      >
                        {s.featured ? 'Featured' : 'Not featured'}
                      </Button>
                    </TableCell>
                    <TableCell className="tabular-nums">{s.totalVotes}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <a href={`/${s.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                          <ExternalLink className="h-3.5 w-3.5" /> View
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirming === s.slug) {
                              toggleFlag.mutate({ slug: s.slug, field: 'verified', value: false })
                              setConfirming(null)
                            } else {
                              setConfirming(s.slug)
                              setTimeout(() => setConfirming((cur) => (cur === s.slug ? null : cur)), 3000)
                            }
                          }}
                          className="text-sm text-destructive hover:underline"
                        >
                          {confirming === s.slug ? 'Confirm unverify?' : 'Unverify'}
                        </button>
                      </div>
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

export default AdminServers
