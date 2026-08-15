import { useEffect } from 'react'
import { useNavigate } from 'react-router'

/**
 * Converts clicks on same-origin <a> elements that react-router's <Link> does
 * not manage (navbar/footer/CMS markdown links, etc.) into client-side
 * navigations so the page never does a full reload.
 *
 * Mounted inside Providers so it applies to both the public SSR app and the
 * admin/dashboard SPA.
 */
export function SpaLinks() {
  const navigate = useNavigate()

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return
      if (event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const anchor = (event.target as Element | null)?.closest?.('a')
      if (!anchor) return
      if (anchor.target && anchor.target !== '_self') return
      if (anchor.hasAttribute('download')) return

      const href = anchor.getAttribute('href')
      if (!href) return
      if (href.startsWith('#') || /^(mailto:|tel:|javascript:)/i.test(href)) return

      const url = new URL(href, window.location.origin)
      if (url.origin !== window.location.origin) return
      if (url.pathname === window.location.pathname && !url.search) return

      event.preventDefault()
      navigate(url.pathname + url.search + url.hash)
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [navigate])

  return null
}
