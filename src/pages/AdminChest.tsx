import { Box, Trash2, ExternalLink } from 'lucide-react'
import { useChest, clearChest } from '../lib/chest'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'

export function AdminChest() {
  const chest = useChest()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Chest Data</h1>
          <p className="text-sm text-muted-foreground">{chest.length} saved servers.</p>
        </div>
        {chest.length > 0 && (
          <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => clearChest()}>
            <Trash2 className="h-4 w-4" /> Clear chest
          </Button>
        )}
      </div>

      {chest.length === 0 ? (
        <div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
          <Box className="h-8 w-8 text-muted-foreground/60" />
          <p>No servers saved. Users click the yellow chest button on any listing to add servers here.</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="flex flex-col divide-y">
              {chest.map((item) => (
                <div key={item.slug} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={item.icon} alt="" className="h-8 w-8 rounded object-cover shrink-0" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-sm truncate">{item.name}</span>
                      <span className="text-xs text-muted-foreground truncate">{item.ip}</span>
                    </div>
                  </div>
                  <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline shrink-0">
                    <ExternalLink className="h-3.5 w-3.5" /> View
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AdminChest
