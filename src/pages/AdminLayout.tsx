import { Link, NavLink, Outlet } from 'react-router'
import { LogOut, LayoutDashboard, Server, Newspaper, Tags, Box, Shield, ShieldAlert, Megaphone } from 'lucide-react'
import { useAuth, logout } from '../lib/auth'

const NAV = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/servers', label: 'Servers', icon: Server, end: false },
  { to: '/admin/moderation', label: 'Moderation', icon: ShieldAlert, end: false },
  { to: '/admin/ads', label: 'Ads', icon: Megaphone, end: false },
  { to: '/admin/content', label: 'Content', icon: Newspaper, end: false },
  { to: '/admin/tags', label: 'Tags', icon: Tags, end: false },
  { to: '/admin/chest', label: 'Chest Data', icon: Box, end: false },
]

export function AdminLayout() {
  const { user, isAdmin } = useAuth()

  return (
    <div className="wrapper flex flex-col gap-4 px-3 xl:px-0 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-sm border border-stone-400 dark:border-stone-600 bg-stone-200/60 dark:bg-stone-800/60 p-4">
        <div className="flex items-center gap-3">
          <Shield className="size-7 text-primary" />
          <div className="flex flex-col">
            <h1 className="font-minecraft text-lg text-stone-900 dark:text-stone-100">Admin Panel</h1>
            <p className="text-xs text-stone-600 dark:text-stone-400">Signed in as {user?.user.username} · {isAdmin ? 'admin' : 'user'}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="inline-flex items-center justify-center gap-2 h-9 px-3 rounded-sm border-2 border-stone-400 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 text-sm font-bold hover:bg-stone-300/60 dark:hover:bg-stone-700/60 transition-colors"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:items-start">
        <nav className="lg:col-span-2 flex lg:flex-col gap-1 overflow-x-auto" aria-label="Admin sections">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 whitespace-nowrap px-3 py-2 rounded-sm text-sm font-medium border-l-4 ${
                  isActive
                    ? 'border-l-primary bg-stone-300/70 dark:bg-stone-700/50 text-stone-900 dark:text-stone-100'
                    : 'border-l-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`
              }
            >
              <n.icon className="size-4 shrink-0" />
              {n.label}
            </NavLink>
          ))}
          <Link to="/" className="inline-flex items-center gap-2 whitespace-nowrap px-3 py-2 rounded-sm text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 border-l-4 border-l-transparent">
            View site →
          </Link>
        </nav>
        <div className="lg:col-span-10 flex flex-col gap-4 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
