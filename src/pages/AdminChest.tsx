import { Box, Trash2, ExternalLink } from 'lucide-react'
import { useChest, clearChest } from '../lib/chest'

export function AdminChest() {
  const chest = useChest()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-minecraft text-xl text-stone-900 dark:text-stone-100">Chest Data ({chest.length})</h2>
        {chest.length > 0 && (
          <button
            type="button"
            onClick={() => clearChest()}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-sm border-2 border-red-400/60 dark:border-red-600 bg-red-500/10 text-sm font-bold text-red-700 dark:text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <Trash2 className="size-4" />
            Clear chest
          </button>
        )}
      </div>
      {chest.length === 0 ? (
        <div className="rounded-sm border border-stone-400/60 dark:border-stone-600 bg-stone-200/50 dark:bg-stone-800/50 p-8 text-center text-sm text-stone-500 dark:text-stone-400">
          <Box className="size-8 mx-auto mb-2 text-stone-400" />
          No servers saved. Users click the yellow chest button on any listing to add servers here.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {chest.map((item) => (
            <div key={item.slug} className="flex items-center justify-between gap-3 rounded-sm border border-stone-400/60 dark:border-stone-600 bg-stone-200/50 dark:bg-stone-800/50 px-3 py-2">
              <div className="flex items-center gap-3 min-w-0">
                <img src={item.icon} alt="" className="size-8 rounded object-cover shrink-0" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-sm truncate">{item.name}</span>
                  <span className="text-xs text-stone-500 dark:text-stone-400 truncate">{item.ip}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  <ExternalLink className="size-3" /> View
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
