import { AlertTriangle, RefreshCw } from 'lucide-react'
import { ApiError, errorMessage } from '../lib/api'

export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col gap-3 items-center justify-center py-16 text-stone-500 dark:text-stone-400">
      <div className="size-8 animate-spin rounded-full border-2 border-stone-400 dark:border-stone-600 border-t-transparent" aria-hidden="true" />
      <p className="text-sm">{label}</p>
    </div>
  )
}

export function ErrorState({ error, onRetry }: { error: ApiError; onRetry?: () => void }) {
  return (
    <div className="flex flex-col gap-3 items-center justify-center py-16 px-4 text-center">
      <AlertTriangle className="size-8 text-red-500" aria-hidden="true" />
      <p className="text-sm text-stone-600 dark:text-stone-400">{errorMessage(error)}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 h-9 px-3 rounded-sm border-2 border-stone-400 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 text-sm font-bold hover:bg-stone-300/60 dark:hover:bg-stone-700/60 transition-colors"
        >
          <RefreshCw className="size-4" />
          Try again
        </button>
      )}
    </div>
  )
}
