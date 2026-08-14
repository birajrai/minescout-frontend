import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { Chest, CookieConsent } from '../components/Chest'
import { ContentSkeleton } from '../components/Skeletons'

export function RootLayout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Suspense fallback={<ContentSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <Chest />
      <CookieConsent />
    </div>
  )
}
