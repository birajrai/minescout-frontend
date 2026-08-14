import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (opts: {
            client_id: string
            callback: (resp: { credential?: string }) => void
            auto_select?: boolean
            cancel_on_tap_outside?: boolean
            prompt_parent_id?: string
          }) => void
          prompt: () => void
          renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void
          cancel: () => void
        }
      }
    }
  }
}

const GSI_SRC = 'https://accounts.google.com/gsi/client'

let gsiPromise: Promise<void> | null = null

function loadGsi(): Promise<void> {
  if (window.google?.accounts) return Promise.resolve()
  if (gsiPromise) return gsiPromise
  gsiPromise = new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      return
    }
    const script = document.createElement('script')
    script.src = GSI_SRC
    script.async = true
    script.defer = true
    script.addEventListener('load', () => resolve())
    document.head.appendChild(script)
  })
  return gsiPromise
}

/**
 * Google One Tap prompt. `onCredential` receives the ID token (credential).
 * Renders nothing when no client id is configured.
 */
export function GoogleOneTap({ clientId, onCredential }: {
  clientId?: string
  onCredential: (credential: string) => void
}) {
  const onCredentialRef = useRef(onCredential)
  onCredentialRef.current = onCredential
  const clientIdRef = useRef(clientId)
  clientIdRef.current = clientId

  useEffect(() => {
    if (!clientIdRef.current) return
    let cancelled = false

    loadGsi().then(() => {
      if (cancelled || !window.google?.accounts) return
      window.google.accounts.id.initialize({
        client_id: clientIdRef.current!,
        callback: (resp) => {
          if (resp.credential) onCredentialRef.current(resp.credential)
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      })
      window.google.accounts.id.prompt()
    }).catch(() => {
      // GSI failed to load — OAuth redirect button still works.
    })

    return () => {
      cancelled = true
      try {
        window.google?.accounts.id.cancel()
      } catch {
        // ignore
      }
    }
  }, [])

  return null
}
