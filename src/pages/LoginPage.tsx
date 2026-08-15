import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { FlaskConical } from 'lucide-react'
import { PageHero } from '../components/Shared'
import { useAuth, loginWithDiscord } from '../lib/auth'
import { api, errorMessage, ApiError } from '../lib/api'
import { Turnstile } from '../components/Turnstile'
import { GoogleOneTap } from '../components/GoogleOneTap'

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

export function LoginPage() {
  const { user, isLoading, refetch } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const error = params.get('error')
  const next = params.get('next')
  const [discordOk, setDiscordOk] = useState(false)
  const [devEnabled, setDevEnabled] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

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

  const handleOneTap = async (credential: string) => {
    setErr(null)
    try {
      const res = await api.post<{ user: { id: string } }>('/auth/google/token', { credential })
      if (res) {
        await refetch()
        navigate(next || '/dashboard', { replace: true })
      }
    } catch (err) {
      setErr(errorMessage(err as ApiError))
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    if (SITE_KEY && !token) {
      setErr('Please complete the captcha.')
      return
    }
    setBusy(true)
    try {
      await api.post<{ ok: boolean }>('/auth/login', {
        email,
        password,
        turnstileToken: token ?? undefined,
      })
      await refetch()
      navigate(next || '/dashboard', { replace: true })
    } catch (err) {
      setErr(errorMessage(err as ApiError))
    } finally {
      setBusy(false)
    }
  }

  if (isLoading) return null

  const devLogin = (admin: boolean) => {
    window.location.href = `/api/auth/dev?username=${encodeURIComponent(admin ? 'Dev Admin' : 'Dev User')}&admin=${admin ? 1 : 0}&next=${encodeURIComponent(next ?? '')}`
  }

  return (
    <>
      <GoogleOneTap clientId={GOOGLE_CLIENT_ID} onCredential={handleOneTap} />
      <PageHero crumbs={[{ to: '/', label: 'Home' }, { label: 'Login' }]} title="Best Minecraft Servers to Join in 2026" subtext="Explore the best and most popular Minecraft servers with real-time monitoring" />
      <div className="wrapper flex-1 flex flex-col gap-4 md:gap-8 p-4">
        <div className="bg-stone-300/50 dark:bg-stone-900/50 p-4 md:p-8 rounded-sm w-full max-w-xl mx-auto border border-stone-400 dark:border-stone-600">
          <div className="flex flex-col min-w-64">
            <h2 className="text-2xl font-minecraft">Sign In</h2>
            <p className="text-sm text-stone-700 dark:text-stone-300 mt-1">
              Please sign in to continue.
              <Link to="/login" className="text-primary hover:underline ml-1">Forgot Password?</Link>
            </p>
            {(error || err) && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">{err ?? error?.replace(/\+/g, ' ')}</p>
            )}
            <form className="flex flex-col gap-3 mt-8" onSubmit={submit}>
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium mb-1">Email</label>
                <input type="email" id="login-email" autoComplete="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full h-12 px-3 rounded-sm border-2 border-stone-400 dark:border-stone-600 bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium mb-1">Password</label>
                <input type="password" id="login-password" autoComplete="current-password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full h-12 px-3 rounded-sm border-2 border-stone-400 dark:border-stone-600 bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <Turnstile siteKey={SITE_KEY} onToken={setToken} />
              <button type="submit" disabled={busy} className="btn-accent btn-wrapper relative before:border rounded-md before:rounded-md mt-2 h-10 before:h-10 w-full">
                <span className="btn-surface rounded-md text-sm font-bold border select-none w-full h-full px-3 flex items-center justify-center text-white">
                  {busy ? 'Signing in…' : 'Sign in'}
                </span>
              </button>
            </form>
            <div className="flex items-center gap-2 my-4">
              <div className="flex-1 h-px bg-stone-400 dark:bg-stone-600" />
              <span className="text-sm text-stone-500">Or</span>
              <div className="flex-1 h-px bg-stone-400 dark:bg-stone-600" />
            </div>
            <div className="flex flex-col gap-2">
              <a href="/api/auth/google" className="btn-wrapper relative before:border rounded-md before:rounded-md before:bg-stone-400/80 before:border-stone-500/80 text-stone-900 h-10 before:h-10 w-full inline-flex">
                <span className="btn-surface rounded-md text-sm font-bold border select-none w-full h-full bg-white dark:bg-stone-200 border-stone-500 px-3 flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="shrink-0"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                  Continue with Google
                </span>
              </a>
              <button type="button" onClick={doDiscord} disabled={discordOk} className="btn-wrapper relative before:border rounded-md before:rounded-md before:bg-[#5865F2]/80 before:border-[#4752C4] text-stone-900 h-10 before:h-10 w-full inline-flex disabled:opacity-60">
                <span className="btn-surface rounded-md text-sm font-bold border select-none w-full h-full bg-[#5865F2] border-[#4752C4] text-white px-3 flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -28.5 256 256" className="size-5 shrink-0" aria-hidden="true"><path d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z" fill="currentColor" fillRule="nonzero" /></svg>
                  {discordOk ? 'Redirecting to Discord…' : 'Continue with Discord'}
                </span>
              </button>
            </div>
            {devEnabled && (
              <div className="flex flex-col gap-2 pt-4 border-t border-stone-400/50 dark:border-stone-600/50">
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
            <p className="text-sm text-stone-700 dark:text-stone-300 text-center mt-4">
              Don't have an account? <Link to="/register" className="text-primary hover:underline">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginPage
