import { useEffect, useRef, useState } from 'react'

interface TurnstileInstance {
  render: (el: HTMLElement, opts: {
    sitekey: string
    theme?: string
    size?: string
    callback: (token: string) => void
    'expired-callback'?: () => void
    'error-callback'?: () => void
  }) => string
  reset: (id: string) => void
  remove: (id: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileInstance
    onTurnstileLoad?: () => void
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad'

let scriptPromise: Promise<void> | null = null

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      return
    }
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.defer = true
    script.addEventListener('load', () => resolve())
    document.head.appendChild(script)
  })
  return scriptPromise
}

/**
 * Cloudflare Turnstile captcha widget. Renders nothing when no site key is
 * configured (dev). `onToken(null)` signals expiry/error so the caller can
 * block submission.
 */
export function Turnstile({ siteKey, theme, onToken }: {
  siteKey?: string
  theme?: 'light' | 'dark' | 'auto'
  onToken: (token: string | null) => void
}) {
  const elRef = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)
  const onTokenRef = useRef(onToken)
  onTokenRef.current = onToken
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!siteKey) return
    let cancelled = false
    let loaded = false

    const render = () => {
      if (cancelled || !elRef.current) return
      const id = window.turnstile!.render(elRef.current, {
        sitekey: siteKey,
        theme: theme ?? 'auto',
        size: 'normal',
        callback: (token: string) => {
          setFailed(false)
          onTokenRef.current(token)
        },
        'expired-callback': () => onTokenRef.current(null),
        'error-callback': () => {
          setFailed(true)
          onTokenRef.current(null)
        },
      })
      widgetId.current = id
    }

    loadScript().then(() => {
      loaded = true
      if (!cancelled) render()
    }).catch(() => {
      if (!cancelled) {
        setFailed(true)
        onTokenRef.current(null)
      }
    })

    return () => {
      cancelled = true
      if (loaded && widgetId.current) {
        try {
          window.turnstile?.remove(widgetId.current)
        } catch {
          // ignore
        }
        widgetId.current = null
      }
    }
  }, [siteKey, theme])

  if (!siteKey) return null
  return (
    <div className="flex justify-center turnstile-wrap min-h-[65px]">
      <div ref={elRef} />
      {failed && <p className="text-xs text-red-600 dark:text-red-400">Captcha failed to load. Refresh to retry.</p>}
    </div>
  )
}
