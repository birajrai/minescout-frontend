import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api, errorMessage, ApiError } from '../../lib/api'
import { useApiQuery } from '../../lib/hooks'
import { queryKeys } from '../../lib/queryKeys'
import { useAuth } from '../../lib/auth'
import { ContentSkeleton } from '../../components/Skeletons'

export function DashboardSettings() {
  const { isAdmin } = useAuth()
  const queryClient = useQueryClient()
  const [channelId, setChannelId] = useState('')
  const [saved, setSaved] = useState<string | null>(null)

  const settings = useApiQuery(queryKeys.settings, () => api.get<{ announceChannelId: string | null; cacheRevision: number }>('/settings'))

  const saveChannel = useMutation<unknown, ApiError, string>({
    mutationFn: (channelId) => api.post('/settings/announce-channel', { channelId }),
    onSuccess: () => {
      setSaved('Saved.')
      setTimeout(() => setSaved(null), 2000)
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings })
    },
  })

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <h2 className="font-minecraft text-xl text-stone-900 dark:text-stone-100">Dashboard settings</h2>

      <div className="rounded-sm border border-stone-400/60 dark:border-stone-600 bg-stone-200/40 dark:bg-stone-800/40 p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-stone-800 dark:text-stone-200">Announce channel (Discord)</span>
            <span className="text-xs text-stone-500 dark:text-stone-400">New server announcements are posted here by the bot.</span>
          </div>
          <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-stone-400/20 text-stone-600 dark:text-stone-300">System</span>
        </div>
        {settings.isLoading ? (
          <ContentSkeleton />
        ) : isAdmin ? (
          <form
            className="flex flex-col sm:flex-row gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (channelId.trim()) saveChannel.mutate(channelId.trim())
            }}
          >
            <input
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              placeholder={settings.data?.announceChannelId ?? 'Discord channel ID'}
              className="flex-1 h-10 px-3 rounded-sm border-2 border-stone-400 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 text-sm"
            />
            <button type="submit" disabled={saveChannel.isPending} className="inline-flex items-center justify-center h-10 px-4 rounded-sm bg-primary text-stone-900 text-sm font-bold hover:opacity-90 disabled:opacity-60">
              {saveChannel.isPending ? 'Saving…' : 'Save'}
            </button>
          </form>
        ) : (
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {settings.data?.announceChannelId ? `Set to ${settings.data.announceChannelId}` : 'Not set.'}
          </p>
        )}
        {saveChannel.isError && <p className="text-sm text-red-600 dark:text-red-400">{errorMessage(saveChannel.error)}</p>}
        {saved && <p className="text-sm text-lime-600 dark:text-lime-400">{saved}</p>}
      </div>

      <div className="rounded-sm border border-stone-400/60 dark:border-stone-600 bg-stone-200/40 dark:bg-stone-800/40 p-4 flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-stone-800 dark:text-stone-200">Cache revision</span>
          <span className="text-xs text-stone-500 dark:text-stone-400">Bumped when site-wide data is rebuilt.</span>
        </div>
        {settings.isLoading ? (
          <ContentSkeleton lines={1} />
        ) : (
          <span className="font-mono text-sm text-stone-700 dark:text-stone-300">{settings.data?.cacheRevision ?? 0}</span>
        )}
      </div>
    </div>
  )
}

export default DashboardSettings
