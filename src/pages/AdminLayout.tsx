import { useEffect, useState } from 'react'
import { NavLink, Outlet, Link, useLocation } from 'react-router'
import { Toaster } from 'sonner'
import {
  LayoutDashboard,
  Server,
  UserCheck,
  Users,
  ShieldAlert,
  Hash,
  Layers,
  Globe,
  Newspaper,
  Sparkles,
  Tags,
  Bookmark,
  KeyRound,
  Pin,
  CreditCard,
  Megaphone,
  ScrollText,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  Moon,
  Sun,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { useAuth, logout } from '../lib/auth'
import { useTheme } from '../lib/theme'
import { Button } from '../components/ui/button'
import { Separator } from '../components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import { cn } from '../lib/utils'

const LOGO_URL = 'https://www.minescout.bond/brand/minescout-logo.avif'
const COLLAPSE_KEY = 'admin-sidebar-collapsed'

interface NavItem {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  end?: boolean
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'General',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/admin/servers', label: 'Servers', icon: Server },
      { to: '/admin/realms', label: 'Realms', icon: ScrollText },
    ],
  },
  {
    label: 'Moderation',
    items: [
      { to: '/admin/claims', label: 'Claims', icon: UserCheck },
      { to: '/admin/reports', label: 'Reports', icon: ShieldAlert },
      { to: '/admin/users', label: 'Users', icon: Users },
    ],
  },
  {
    label: 'Directory',
    items: [
      { to: '/admin/gamemodes', label: 'Gamemodes', icon: Hash },
      { to: '/admin/versions', label: 'Versions', icon: Layers },
      { to: '/admin/countries', label: 'Countries', icon: Globe },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/blog', label: 'Blog Entries', icon: Newspaper },
      { to: '/admin/blog/ai-writer', label: 'AI Blog Writer', icon: Sparkles },
      { to: '/admin/blog-tags', label: 'Blog Tags', icon: Bookmark },
      { to: '/admin/tags', label: 'Tags', icon: Tags },
    ],
  },
  {
    label: 'Monetization',
    items: [
      { to: '/admin/placements', label: 'Featured Slots', icon: Pin },
      { to: '/admin/billing', label: 'Transactions', icon: CreditCard },
      { to: '/admin/ads', label: 'Ads', icon: Megaphone },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/admin/api-keys', label: 'API', icon: KeyRound },
      { to: '/admin/logs', label: 'Logs', icon: ScrollText },
      { to: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
]

const TITLES: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/servers': 'Servers',
  '/admin/realms': 'Realms',
  '/admin/claims': 'Claims',
  '/admin/users': 'Users',
  '/admin/reports': 'Reports',
  '/admin/gamemodes': 'Gamemodes',
  '/admin/versions': 'Versions',
  '/admin/countries': 'Countries',
  '/admin/blog': 'Blog Entries',
  '/admin/blog/ai-writer': 'AI Blog Writer',
  '/admin/blog-tags': 'Blog Tags',
  '/admin/tags': 'Tags',
  '/admin/api-keys': 'API',
  '/admin/placements': 'Featured Slots',
  '/admin/billing': 'Transactions',
  '/admin/ads': 'Ads',
  '/admin/logs': 'Logs',
  '/admin/settings': 'Settings',
}

function NavItems({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  return (
    <nav className={cn('flex flex-col gap-5 overflow-y-auto px-3 py-4', collapsed ? 'items-center' : '')}>
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className={cn('flex flex-col gap-1', collapsed ? 'items-center' : '')}>
          {!collapsed ? (
            <span className="px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">{group.label}</span>
          ) : null}
          {group.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              title={item.label}
              className={({ isActive }) =>
                cn(
                  'flex items-center rounded-md text-sm font-medium transition-colors',
                  collapsed ? 'justify-center px-2 py-2' : 'gap-3 px-3 py-2',
                  isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed ? item.label : null}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  )
}

function BrandHeader({ collapsed }: { collapsed: boolean }) {
  return (
    <Link
      to="/admin"
      className={cn('flex h-14 shrink-0 items-center border-b', collapsed ? 'justify-center px-2' : 'gap-2.5 px-4')}
    >
      <img src={LOGO_URL} alt="Minescout" className={cn('w-auto shrink-0 object-contain', collapsed ? 'h-6' : 'h-8')} />
      {!collapsed ? <span className="text-base font-semibold tracking-tight">Admin</span> : null}
    </Link>
  )
}

function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  const { user } = useAuth()
  return (
    <div className="mt-auto border-t p-3">
      <div className={cn('flex flex-col gap-1', collapsed ? 'items-center' : 'px-3')}>
        <Link
          to="/"
          title="View site"
          className={cn(
            'flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
            collapsed ? 'justify-center py-1' : 'px-1 py-1'
          )}
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          {!collapsed ? 'View site' : null}
        </Link>
        <button
          type="button"
          onClick={() => void logout()}
          title="Sign out"
          className={cn(
            'flex items-center gap-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:text-destructive',
            collapsed ? 'justify-center py-1' : 'px-1 py-1'
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed ? 'Sign out' : null}
        </button>
      </div>
      {!collapsed ? (
        <>
          <Separator className="my-2" />
          <div className="flex items-center gap-2 px-3 py-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-primary/15 text-primary text-xs">
                {user?.user.username?.[0]?.toUpperCase() ?? 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium">{user?.user.username}</span>
              <span className="text-xs text-muted-foreground">Administrator</span>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

export function AdminLayout() {
  const { pathname } = useLocation()
  const { toggle } = useTheme()
  const { user, isAdmin } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0')
    } catch {
      // ignore
    }
  }, [collapsed])

  const title = TITLES[pathname] ?? 'Admin'
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <Toaster position="bottom-right" richColors />

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden shrink-0 flex-col border-r bg-muted/20 transition-[width] duration-200 lg:flex',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        <BrandHeader collapsed={collapsed} />
        <div className="flex h-9 items-center justify-end px-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex flex-1 overflow-y-auto">
          <NavItems collapsed={collapsed} />
        </div>
        <SidebarFooter collapsed={collapsed} />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="absolute left-3 top-3 z-20 lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="h-14 border-b px-4">
            <SheetTitle className="flex items-center gap-2.5">
              <img src={LOGO_URL} alt="Minescout" className="h-8 w-auto object-contain" />
              <span className="text-base font-semibold tracking-tight">Admin</span>
            </SheetTitle>
          </SheetHeader>
          <div className="flex h-[calc(100%-3.5rem)] flex-col overflow-y-auto">
            <NavItems onNavigate={() => setMobileOpen(false)} />
            <SidebarFooter collapsed={false} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background px-4 lg:px-6">
          <div className="w-9 lg:hidden" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="transition-colors hover:text-foreground">
              Minescout
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">{title}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/15 text-primary text-xs">
                      {user?.user.username?.[0]?.toUpperCase() ?? 'A'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{user?.user.username}</span>
                    <span className="text-xs font-normal text-muted-foreground">{isAdmin ? 'Administrator' : 'User'}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/">View site</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">User dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => void logout()}>
                  <LogOut className="h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
