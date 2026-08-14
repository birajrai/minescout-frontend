import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Lock, Shield, FlaskConical } from 'lucide-react'
import { PageHero } from '../components/Shared'
import { useAuth, loginWithDiscord, loginWithGoogle } from '../lib/auth'
import { api } from '../lib/api'

export function LoginPage() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const error = params.get('error')
  const next = params.get('next')
  const [discordOk, setDiscordOk] = useState(false)
  const [devEnabled, setDevEnabled] = useState(false)

  useEffect(() => {
    let alive = true
    api
      .get<{ enabled: boolean }>('/auth/dev-status')
      .then((r) => { if (alive) setDevEnabled(r.enabled) })
      .catch(() => { if (alive) setDevEnabled(false) })
    return () => { alive = false }
  }, [])

  useEffect(() => {
    if (user) {
      if (next) navigate(next, { replace: true })
      else navigate(user.isAdmin ? '/admin' : '/dashboard', { replace: true })
    }
  }, [user, next, navigate])

  const doDiscord = () => {
    setDiscordOk(true)
    loginWithDiscord()
  }

  if (isLoading) return null

  const devLogin = (admin: boolean) => {
    window.location.href = `/api/auth/dev?username=${encodeURIComponent(admin ? 'Dev Admin' : 'Dev User')}&admin=${admin ? 1 : 0}&next=${encodeURIComponent(next ?? '')}`
  }

  return (
    <>
      <PageHero crumbs={[{ to: '/', label: 'Home' }, { label: 'Login' }]} title="Log in" />
      <div className="wrapper flex flex-col gap-4 items-center py-10 px-4">
        <div className="w-full max-w-sm rounded-sm border border-stone-400 dark:border-stone-600 bg-stone-200/60 dark:bg-stone-800/60 p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 justify-center">
            <Shield className="size-6 text-primary" />
            <h1 className="font-minecraft text-xl text-stone-900 dark:text-stone-100">Sign in to Minescout</h1>
          </div>
          <p className="text-sm text-center text-stone-600 dark:text-stone-400">Log in to manage servers, save them to your chest, and vote.</p>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 text-center">{error.replace(/\+/g, ' ')}</p>
          )}
          <div className="flex flex-col gap-2">
            <button type="button" onClick={doDiscord} disabled={discordOk} className="inline-flex items-center justify-center gap-2 h-11 rounded-md bg-[#5865F2] text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60">
              <Lock className="size-4" />
              {discordOk ? 'Redirecting to Discord…' : 'Continue with Discord'}
            </button>
            <button type="button" onClick={loginWithGoogle} className="inline-flex items-center justify-center gap-2 h-11 rounded-md border border-stone-400 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-bold text-sm hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
              Continue with Google
            </button>
          </div>
          {devEnabled && (
            <div className="flex flex-col gap-2 pt-1 border-t border-stone-400/50 dark:border-stone-600/50">
              <p className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wide flex items-center gap-1">
                <FlaskConical className="size-3" /> Dev mode
              </p>
              <div className="flex flex-col gap-2">
                <button type="button" onClick={() => devLogin(false)} className="inline-flex items-center justify-center gap-2 h-10 rounded-md border-2 border-dashed border-stone-400 dark:border-stone-600 text-sm font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-700/40 transition-colors">
                  Continue as Dev User
                </button>
                <button type="button" onClick={() => devLogin(true)} className="inline-flex items-center justify-center gap-2 h-10 rounded-md border-2 border-dashed border-amber-500/60 text-sm font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 transition-colors">
                  Continue as Dev Admin
                </button>
              </div>
            </div>
          )}
          <p className="text-xs text-center text-stone-500 dark:text-stone-400">
            By signing in you agree to our <Link to="/pages/terms-of-service" className="underline">Terms of Service</Link> and <Link to="/pages/privacy-policy" className="underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </>
  )
}
