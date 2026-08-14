import { useEffect, useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { useChest, clearChest, notifyChestUpdated } from '../lib/chest'

export function Chest() {
  const [open, setOpen] = useState(false)
  const items = useChest()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const doClear = () => {
    clearChest()
    notifyChestUpdated()
  }

  return (
    <>
      <div className="fixed right-4 bottom-2 xl:right-10 lg:bottom-20 w-16 h-16 xl:w-20 xl:h-20 z-[100]">
        <button
          id="chest-trigger"
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="bg-center bg-cover cursor-pointer w-16 h-16 xl:w-20 xl:h-20 hover:scale-110 transition-all duration-150 ease-in-out active:scale-95 relative rounded-lg shadow-lg"
          style={{ backgroundImage: "url('/brand/chest.webp')" }}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls="chest-drawer"
          title="Open chest (Ctrl+Q)"
        >
          <span className="sr-only">Chest</span>
          <span
            id="chest-count-badge"
            className={`select-none absolute top-0 right-0 font-bold text-xs text-red-100 px-1 rounded-full bg-red-500 aspect-square size-5 flex items-center justify-center ${items.length ? '' : 'hidden'}`}
          >
            {items.length}
          </span>
          <div className="absolute -bottom-2 left-0 right-0 hidden lg:flex justify-center">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 text-sm rounded-xs border-b-4 border-stone-500 dark:border-stone-700 bg-stone-300 dark:bg-stone-500 px-1.5 font-mono font-medium text-stone-900 dark:text-stone-900 opacity-100">
              <span className="text-xs">Ctrl</span>
              <span className="text-xs">+ Q</span>
            </kbd>
          </div>
        </button>
      </div>

      <div
        id="chest-backdrop"
        className={`fixed inset-0 bg-stone-900/70 dark:bg-stone-950/80 backdrop-blur-sm z-[120] ${open ? '' : 'hidden'}`}
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />

      <div
        id="chest-drawer"
        className={`fixed inset-x-0 bottom-0 z-[130] bg-stone-100 dark:bg-stone-900 border-t border-stone-300 dark:border-stone-700 rounded-t-lg shadow-2xl transition-all duration-200 ease-out ${open ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-full opacity-0 pointer-events-none'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chest-title"
        aria-describedby="chest-description"
        data-state={open ? 'open' : 'closed'}
      >
        <div className="wrapper p-4 min-h-[40vh] max-h-[70vh] flex flex-col gap-4 overflow-y-auto">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 id="chest-title" className="text-foreground font-semibold font-minecraft text-xl md:text-2xl">My Chest</h2>
              <p id="chest-description" className="text-muted-foreground text-sm mt-1">
                Saved servers you want to remember. Use the save button on any listing to add it here.
              </p>
            </div>
            <button
              type="button"
              id="chest-close"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center rounded-sm h-8 w-8 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-stone-900"
              aria-label="Close chest"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="flex items-center justify-between text-sm text-stone-600 dark:text-stone-400">
            <p id="chest-summary">
              {items.length} {items.length === 1 ? 'server' : 'servers'} saved
            </p>
            <button
              type="button"
              id="chest-clear"
              onClick={doClear}
              className="btn-wrapper relative before:border rounded-md before:rounded-md disabled:pointer-events-none disabled:opacity-50 before:bg-stone-400/80 before:border-stone-500/80 h-8 before:h-8 text-stone-900 text-xs px-0"
            >
              <div className="btn-surface rounded-md font-bold border select-none w-full h-full bg-stone-300 dark:bg-stone-400 border-stone-500 px-2 py-1 flex items-center justify-center gap-2">
                <Trash2 className="size-4" />
                <span>Clear chest</span>
              </div>
            </button>
          </div>

          {items.length === 0 ? (
            <p id="chest-empty" className="text-sm text-stone-600 dark:text-stone-400">
              Your chest is empty. Click the yellow chest button on any server card to save it here.
            </p>
          ) : (
            <div id="chest-items" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <div key={item.slug} className="rounded-sm border border-stone-300 dark:border-stone-600 bg-stone-200/40 dark:bg-stone-800/40 p-3 flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <img src={item.icon} alt="" className="size-8 rounded object-cover shrink-0" width="32" height="32" loading="lazy" decoding="async" data-placeholder="/assets/placeholder-server-icon.svg" onError={(e) => { const el = e.currentTarget; el.onerror = null; el.src = el.dataset.placeholder || '' }} />
                    <a href={item.url} className="font-minecraft text-sm break-words min-w-0 hover:underline">{item.name}</a>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-mono truncate">{item.ip}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('cookie_consent')
      if (raw === null) {
        const t = setTimeout(() => setVisible(true), 800)
        return () => clearTimeout(t)
      }
    } catch {
      // ignore
    }
  }, [])

  const choose = (accept: boolean) => {
    try {
      localStorage.setItem('cookie_consent', accept ? 'all' : 'essential')
    } catch {
      // ignore
    }
    setVisible(false)
  }

  return (
    <>
      <div
        id="cookie-consent-backdrop"
        className={`fixed inset-0 z-[139] bg-stone-900/25 dark:bg-stone-950/40 ${visible ? '' : 'hidden'}`}
        aria-hidden="true"
      />
      <div
        id="cookie-consent"
        className={`fixed bottom-0 left-0 right-0 z-[140] p-3 sm:p-4 pb-4 sm:pb-5 transition-[transform,opacity] duration-300 ease-out ${visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-consent-title"
        aria-describedby="cookie-consent-desc"
        aria-live="polite"
        aria-hidden={!visible}
      >
        <div className="mx-auto max-w-3xl rounded-lg border-2 border-stone-400 dark:border-stone-600 bg-stone-100 dark:bg-stone-900 shadow-xl px-4 py-3 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <p id="cookie-consent-title" className="text-sm font-minecraft text-stone-800 dark:text-stone-100">Cookies on Minescout</p>
            <p id="cookie-consent-desc" className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
              We use essential cookies for login and security. Analytics runs by default to help us improve the site — choose <strong>Essential only</strong> to opt out.
              <a href="/pages/cookie-policy" className="text-primary hover:underline whitespace-nowrap"> Cookie Policy</a>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button type="button" id="cookie-consent-essential" onClick={() => choose(false)} className="px-3 py-2 rounded-md text-xs sm:text-sm font-medium border border-stone-400 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors">
              Essential only
            </button>
            <button type="button" id="cookie-consent-accept" onClick={() => choose(true)} className="px-3 py-2 rounded-md text-xs sm:text-sm font-bold bg-primary text-white border border-accent hover:opacity-90 transition-opacity">
              Accept all
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export function HomeFooterMeta() {
  return null
}