import { useLocation, NavLink, Outlet } from 'react-router'
import { ChevronRight } from 'lucide-react'

const TABS = [
  { to: '/dashboard', label: 'Dashboard', end: true },
  { to: '/dashboard/servers', label: 'Servers', end: false },
  { to: '/dashboard/realms', label: 'Realms', end: false },
  { to: '/dashboard/reputation', label: 'Reputation', end: false },
  { to: '/dashboard/pro-subscriptions', label: 'Pro Subscriptions', end: false },
  { to: '/dashboard/sponsored-slots', label: 'Sponsored Slots', end: false },
  { to: '/dashboard/transactions', label: 'Transactions', end: false },
  { to: '/dashboard/settings', label: 'Settings', end: false },
]

export function DashboardLayout() {
  const { pathname } = useLocation()

  return (
    <>
      <div className="flex flex-col min-h-[150px] md:min-h-0 max-h-[240px] lg:min-h-0">
        <header className="relative flex flex-col min-h-[150px] md:min-h-0 max-h-[240px] w-full overflow-hidden border-b border-stone-300 dark:border-stone-700">
          <video
            className="hidden md:block w-full max-h-[180px] md:max-h-none md:h-[240px] object-contain md:object-cover pointer-events-none select-none"
            width="1200"
            height="240"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            src="/brand/minelist_banner.webm?v=1786293318"
            poster="/brand/minelist_banner_poster.webp?v=1786293318"
          />
          <div className="md:hidden min-h-[150px] flex-shrink-0 bg-stone-800/95 dark:bg-stone-950/95" aria-hidden="true" />
          <div className="flex flex-col w-full h-full p-4 absolute top-0 left-0 gap-2 items-center justify-center bg-stone-800/60 dark:bg-stone-950/60 backdrop-blur-xl md:backdrop-blur-[4px] min-h-[150px] md:min-h-0">
            <div className="aspect-[180/60] max-w-[180px] flex items-center justify-center">
              <span className="font-minecraft text-2xl md:text-3xl text-stone-100 hidden md:inline">Minescout</span>
            </div>
            <h1 className="text-xl md:text-2xl font-minecraft text-stone-100 text-center max-w-xs md:max-w-none">Dashboard</h1>
            <nav aria-label="Breadcrumb" className="mt-1">
              <ol className="text-stone-300 flex flex-wrap items-center gap-1.5 text-xs md:text-sm font-medium">
                <li className="inline-flex items-center gap-1.5">
                  <NavLink className="hover:text-stone-100 transition-colors" to="/">Home</NavLink>
                </li>
                <li aria-hidden="true" className="[&>svg]:size-3.5"><ChevronRight className="size-3.5" /></li>
                <li className="inline-flex items-center gap-1.5 text-stone-100">Dashboard</li>
              </ol>
            </nav>
          </div>
        </header>
      </div>

      <section id="dashboard-section" className="wrapper flex flex-col gap-4 pt-4 md:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 mb-4 lg:items-start">
          <div className="hidden lg:flex col-span-1 md:col-span-3 flex-col">
            <div className="font-minecraft text-xl md:text-2xl flex flex-col justify-start bg-stone-300 dark:bg-stone-900" data-slot="tabs">
              {TABS.map((t) => (
                <NavLink
                  key={t.to}
                  to={t.to}
                  end={t.end}
                  className={({ isActive }) =>
                    `inline-flex h-[calc(100%-1px)] whitespace-nowrap px-4 py-2 gap-1.5 font-medium border-l-4 border-transparent xl:py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-stone-900 ${
                      isActive
                        ? 'bg-stone-300 dark:bg-stone-900 border-stone-400 dark:border-stone-900 text-stone-900 dark:text-stone-100 dark:bg-secondary/30 border-l-primary dark:border-l-primary'
                        : 'text-stone-500 hover:text-stone-700 dark:text-stone-600 dark:hover:text-stone-400'
                    }`
                  }
                  data-state={pathname.startsWith(t.to) ? 'active' : 'inactive'}
                >
                  {t.label}
                </NavLink>
              ))}
            </div>
          </div>
          <div className="lg:hidden">
            <select
              id="dashboard-tab-select"
              value={pathname.split('?')[0]}
              onChange={(e) => { window.location.href = e.target.value }}
              className="w-full h-11 px-3 rounded-sm border-2 border-stone-400 dark:border-stone-600 bg-stone-100/80 dark:bg-stone-800/70 text-sm font-bold"
              aria-label="Dashboard tabs"
            >
              {TABS.map((t) => (
                <option key={t.to} value={t.to}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="col-span-1 md:col-span-9 bg-stone-300/50 dark:bg-stone-900/50 p-3 md:p-4 min-h-[55vh] transition-[min-height] duration-200 ease-out">
            <Outlet />
          </div>
        </div>
      </section>
    </>
  )
}
