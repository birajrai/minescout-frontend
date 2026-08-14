/* oxlint-disable react/only-export-components -- provider + hook in one file is intentional */
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const KEY = 'layout_full_width'
const NORMAL = '1280px'
const WIDE = '95%'

interface LayoutWidthValue {
  full: boolean
  toggle: () => void
}

const LayoutWidthContext = createContext<LayoutWidthValue | null>(null)

function apply(wide: boolean) {
  document.documentElement.style.setProperty('--wrapper-max', wide ? WIDE : NORMAL)
  document.body.classList.toggle('layout-full-width', wide)
}

export function LayoutWidthProvider({ children }: { children: React.ReactNode }) {
  const [full, setFull] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem(KEY)
      if (v !== null) return v === '1'
    } catch {
      // ignore
    }
    return false
  })

  useEffect(() => {
    apply(full)
  }, [full])

  const toggle = useCallback(() => {
    setFull((f) => {
      try {
        localStorage.setItem(KEY, f ? '0' : '1')
      } catch {
        // ignore
      }
      return !f
    })
  }, [])

  return (
    <LayoutWidthContext.Provider value={{ full, toggle }}>{children}</LayoutWidthContext.Provider>
  )
}

export function useLayoutWidth(): LayoutWidthValue {
  const ctx = useContext(LayoutWidthContext)
  if (!ctx) throw new Error('useLayoutWidth must be used within LayoutWidthProvider')
  return ctx
}