import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useFacets } from '../lib/servers'
import { Loading, ErrorState } from '../components/Async'
import { Input } from '../components/ui/input'
import { Card, CardContent } from '../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'

export function AdminTags() {
  const [q, setQ] = useState('')
  const tags = useFacets('gamemodes')

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    const list = tags.data ?? []
    if (!query) return list
    return list.filter((t) => (t.name ?? t.slug).toLowerCase().includes(query) || t.slug.includes(query))
  }, [q, tags.data])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Tags</h1>
        <p className="text-sm text-muted-foreground">{tags.data?.length.toLocaleString() ?? 0} gamemode tags.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tags..." className="pl-8" />
      </div>

      {tags.isLoading ? (
        <Loading label="Loading tags…" />
      ) : tags.error ? (
        <ErrorState error={tags.error} onRetry={() => void tags.refetch()} />
      ) : (
        <Card>
          <CardContent className="p-0 max-h-[65vh] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead>Tag</TableHead>
                  <TableHead className="whitespace-nowrap">Servers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
                  <TableRow key={t.slug}>
                    <TableCell className="font-medium capitalize">{t.name ?? t.slug}</TableCell>
                    <TableCell className="text-muted-foreground tabular-nums whitespace-nowrap">{t.serverCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      <p className="text-sm text-muted-foreground">Showing {filtered.length.toLocaleString()} of {tags.data?.length.toLocaleString() ?? 0} tags.</p>
    </div>
  )
}
