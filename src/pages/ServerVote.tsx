import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { api, errorMessage, ApiError } from '../lib/api'
import { useApiQuery } from '../lib/hooks'
import { ContentSkeleton } from '../components/Skeletons'
import type { Server, VoteCheck, VoteResult, RecentVote } from '../lib/types'

const USERNAME_PATTERN = '[a-zA-Z0-9_]{2,16}'

export function ServerVote() {
  const { server } = useOutletContext<{ server: Server }>()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [writeReview, setWriteReview] = useState(true)
  const [check, setCheck] = useState<VoteCheck | null>(null)

  const checkMutation = useMutation<VoteCheck, ApiError>({
    mutationFn: async () => {
      const qs = username ? `?username=${encodeURIComponent(username)}` : ''
      return api.get<VoteCheck>(`/servers/${server.slug}/vote/check${qs}`)
    },
    onSuccess: (data) => setCheck(data),
  })

  const voteMutation = useMutation<VoteResult, ApiError>({
    mutationFn: async () => {
      const res = await api.post<VoteResult>(`/servers/${server.slug}/vote`, {
        username: username.trim(),
        email: email.trim() || undefined,
      })
      return res
    },
    onSuccess: () => {
      setCheck(null)
      void recentQuery.refetch()
    },
  })

  const recentQuery = useApiQuery<RecentVote[]>(
    ['votes', server.slug, 'recent'],
    () => api.get<RecentVote[]>(`/servers/${server.slug}/vote/recent?limit=10`),
    { staleTime: 30_000 }
  )

  useEffect(() => {
    if (username.trim().length >= 2) void checkMutation.mutate()
    else setCheck(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username])

  const canVote = check ? check.canVote : true
  const voteError = voteMutation.isError ? errorMessage(voteMutation.error) : null
  const checkBlocked = check && !check.canVote ? check.reason ?? null : null

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !canVote) return
    voteMutation.mutate()
  }

  return (
    <div className="flex flex-col gap-8 text-stone-700 dark:text-stone-300">
      <section id="vote-now" className="rounded-sm border border-stone-300 dark:border-stone-600 bg-stone-100/50 dark:bg-stone-800/50 p-6">
        <h2 className="font-minecraft text-lg mb-4 text-stone-900 dark:text-stone-100">Vote for {server.name}</h2>
        {voteMutation.isSuccess && (
          <p className="mb-4 rounded-sm border border-lime-600/40 bg-lime-500/10 px-3 py-2 text-sm text-lime-700 dark:text-lime-400">
            Thanks! Your vote for {server.name} has been submitted. Total votes: {voteMutation.data?.totalVotes ?? 0}.
            {writeReview && (
              <> <a href={`/${server.slug}/reviews`} className="underline">Write a review</a>.</>
            )}
          </p>
        )}
        {voteError && <p className="mb-4 rounded-sm border border-red-600/40 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">{voteError}</p>}
        {checkBlocked && <p className="mb-4 rounded-sm border border-amber-600/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">{checkBlocked}</p>}
        <form className="flex flex-col gap-4 max-w-md" onSubmit={submit}>
          <input type="hidden" name="server_slug" value={server.slug} />
          <div>
            <label htmlFor="vote-username" className="block text-sm font-medium mb-1">Minecraft username</label>
            <input
              type="text"
              id="vote-username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={2}
              maxLength={16}
              pattern={USERNAME_PATTERN}
              title="2–16 characters: Latin letters (A–Z, a–z), numbers, underscore only"
              placeholder="Your in-game name"
              className="w-full rounded-md border-2 border-stone-400 dark:border-stone-600 bg-stone-200 dark:bg-stone-700 px-3 py-2 text-stone-900 dark:text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-primary"
              autoComplete="username"
              spellCheck={false}
              autoCapitalize="off"
            />
          </div>
          <div>
            <label htmlFor="vote-email" className="block text-sm font-medium mb-1">Email (optional)</label>
            <input
              type="email"
              id="vote-email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com — for a vote reminder in 24h"
              className="w-full rounded-md border-2 border-stone-400 dark:border-stone-600 bg-stone-200 dark:bg-stone-700 px-3 py-2 text-stone-900 dark:text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-primary"
              autoComplete="email"
            />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="vote-write-review" checked={writeReview} onChange={(e) => setWriteReview(e.target.checked)} className="size-4 rounded border-stone-400 text-primary focus:ring-primary" />
            <label htmlFor="vote-write-review" className="text-sm">I would like to write a review after voting</label>
          </div>
          <button type="submit" disabled={voteMutation.isPending || !canVote} className="btn-accent btn-wrapper relative rounded-md before:rounded-md h-11 before:h-11 w-full sm:w-auto inline-flex">
            <span className="btn-surface rounded-md font-bold border select-none w-full h-full px-6 py-3 inline-flex items-center justify-center gap-2 text-sm">
              {voteMutation.isPending ? 'Voting...' : 'Vote now'}
            </span>
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-minecraft text-lg text-stone-900 dark:text-stone-100">Recent votes</h2>
        <div className="rounded-sm border border-stone-300 dark:border-stone-600 bg-stone-100/50 dark:bg-stone-800/50">
          {recentQuery.isLoading ? (
            <div className="p-3"><ContentSkeleton lines={5} /></div>
          ) : recentQuery.error ? (
            <p className="p-4 text-sm text-red-600 dark:text-red-400">{errorMessage(recentQuery.error)}</p>
          ) : (recentQuery.data ?? []).length === 0 ? (
            <p className="p-4 text-sm text-stone-500 dark:text-stone-400">No votes yet — be the first!</p>
          ) : (
            <ul className="flex flex-col divide-y divide-stone-300 dark:divide-stone-700">
              {recentQuery.data!.map((v, i) => (
                <li key={i} className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm">
                  <span className="font-minecraft text-stone-800 dark:text-stone-200">{v.username}</span>
                  <span className="text-xs text-stone-500 dark:text-stone-400">{new Date(v.votedAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-minecraft text-lg text-stone-900 dark:text-stone-100">How voting works</h2>
        <div className="flex flex-col gap-2 text-sm">
          <p>Vote once every 24 hours per server. Votes determine the weekly and total rankings on our Minecraft server list.</p>
          <p>If the server has Votifier enabled, you may receive a reward in-game shortly after voting.</p>
          <p>Add an optional email to get a reminder when you can vote again.</p>
        </div>
      </section>
    </div>
  )
}
