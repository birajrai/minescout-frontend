import { useState, useEffect } from 'react'
import { NavLink, Outlet, Link, useLocation } from 'react-router'
import {
  LayoutDashboard,
  Server,
  ShieldAlert,
  Megaphone,
  Pin,
  CreditCard,
  Newspaper,
  Tags,
  Box,
  Users,
  KeyRound,
  LogOut,
  ExternalLink,
  Menu,
  Moon,
  Sun,
  ChevronRight,
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
      { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
      { to: '/admin/servers', label: 'Servers', icon: Server },
      { to: '/admin/moderation', label: 'Moderation', icon: ShieldAlert },
    ],
  },
  {
    label: 'Monetization',
    items: [
      { to: '/admin/ads', label: 'Ads', icon: Megaphone },
      { to: '/admin/placements', label: 'Placements', icon: Pin },
      { to: '/admin/billing', label: 'Billing', icon: CreditCard },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/content', label: 'Content', icon: Newspaper },
      { to: '/admin/tags', label: 'Tags', icon: Tags },
      { to: '/admin/chest', label: 'Chest Data', icon: Box },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/admin/users', label: 'Users', icon: Users },
      { to: '/admin/api-keys', label: 'API Keys', icon: KeyRound },
    ],
  },
]

const TITLES: Record<string, string> = {
  '/admin': 'Overview',
  '/admin/servers': 'Servers',
  '/admin/moderation': 'Moderation',
  '/admin/ads': 'Ads',
  '/admin/placements': 'Placements',
  '/admin/billing': 'Billing',
  '/admin/content': 'Content',
  '/admin/tags': 'Tags',
  '/admin/chest': 'Chest Data',
  '/admin/users': 'Users',
  '/admin/api-keys': 'API Keys',
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-6 px-3 py-4">
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <span className="px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">{group.label}</span>
          {group.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  )
}

function SidebarFooter() {
  const { user } = useAuth()
  return (
    <div className="mt-auto border-t p-3">
      <div className="flex flex-col gap-1 px-3 py-2">
        <Link to="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ExternalLink className="h-4 w-4" /> View site
        </Link>
        <button
          type="button"
          onClick={() => void logout()}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors text-left"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
      <Separator className="my-2" />
      <div className="flex items-center gap-2 px-3 py-2">
        <Avatar className="h-7 w-7">
          <AvatarFallback className="bg-primary/15 text-primary text-xs">{user?.user.username?.[0]?.toUpperCase() ?? 'A'}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="truncate text-sm font-medium">{user?.user.username}</span>
          <span className="text-xs text-muted-foreground">Administrator</span>
        </div>
      </div>
    </div>
  )
}

export function AdminLayout() {
  const { pathname } = useLocation()
  const { toggle } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, isAdmin } = useAuth()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  const title = TITLES[pathname] ?? 'Admin'
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-muted/20 lg:flex">
        <Link to="/admin" className="flex h-14 items-center gap-2 border-b px-5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">M</span>
          <span className="text-base font-semibold tracking-tight">Minescout Admin</span>
        </Link>
        <div className="flex flex-1 overflow-y-auto">
          <NavItems />
        </div>
        <SidebarFooter />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden absolute top-3 left-3 z-20">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="h-14 border-b px-5">
            <SheetTitle className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">M</span>
              Minescout Admin
            </SheetTitle>
          </SheetHeader>
          <div className="flex h-[calc(100%-3.5rem)] flex-col overflow-y-auto">
            <NavItems onNavigate={() => setMobileOpen(false)} />
            <SidebarFooter />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background px-4 lg:px-6">
          <div className="lg:hidden w-9" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Minescout</Link>
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
                    <AvatarFallback className="bg-primary/15 text-primary text-xs">{user?.user.username?.[0]?.toUpperCase() ?? 'A'}</AvatarFallback>
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
