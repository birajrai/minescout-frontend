import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { Chest, CookieConsent } from '../components/Chest'
import { Loading } from '../components/Async'

export function RootLayout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col">
        {pathname === '/' ? (
          <Suspense fallback={<Loading label="Loading…" />}>
            <Outlet />
          </Suspense>
        ) : (
          <div className="wrapper my-8 px-3">
            <Suspense fallback={<Loading label="Loading…" />}>
              <Outlet />
            </Suspense>
          </div>
        )}
      </main>
      <Footer />
      <Chest />
      <CookieConsent />
    </div>
  )
}
