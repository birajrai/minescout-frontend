import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import {
  Search,
  Moon,
  X,
  LayoutGrid,
  ChevronDown,
  Maximize2,
  Minimize2,
  User,
  LogIn,
  UserPlus,
  Lock,
  ArrowUpRight,
} from 'lucide-react'
import { useTheme } from '../lib/theme'
import { useLayoutWidth } from '../lib/layout-width'
import { useServers } from '../lib/servers'
import { useDebouncedValue } from '../lib/use-debounce'
import { useAuth, logout } from '../lib/auth'

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -28.5 256 256" className={className} aria-hidden="true">
    <path
      d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z"
      fill="currentColor"
      fillRule="nonzero"
    />
  </svg>
)

const MODES = [
  'Pixelmon',
  'Survival',
  'Skyblock',
  'Prison',
  'Earth',
  'SMP',
  'Parkour',
  'Factions',
  'Bedwars',
  'Vanilla',
  'PvP',
]

const VERSIONS = ['26.1', '1.21', '1.20', '1.19', '1.18', '1.17', '1.16', '1.15', '1.14', '1.13', '1.12']

const COUNTRIES = [
  { name: 'United States', slug: 'united-states' },
  { name: 'UK', slug: 'united-kingdom' },
  { name: 'Canada', slug: 'canada' },
  { name: 'Australia', slug: 'australia' },
  { name: 'New Zealand', slug: 'new-zealand' },
  { name: 'Turkey', slug: 'turkey' },
  { name: 'Netherlands', slug: 'netherlands' },
  { name: 'Brazil', slug: 'brazil' },
  { name: 'India', slug: 'india' },
  { name: 'Pakistan', slug: 'pakistan' },
  { name: 'Germany', slug: 'germany' },
]

export function Navbar() {
  const { toggle } = useTheme()
  const { full, toggle: toggleWidth } = useLayoutWidth()
  const { user, isAdmin } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [accountOpen, setAccountOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((o) => !o)
      }
      if (e.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!searchOpen) setSearchQuery('')
  }, [searchOpen])

  const debouncedSearch = useDebouncedValue(searchQuery)
  const searchResults = useServers(
    useMemo(() => ({ search: debouncedSearch.trim() || undefined, limit: 8 }), [debouncedSearch])
  )

  const openMobile = () => setMobileOpen(true)
  const closeMobile = () => setMobileOpen(false)

  const triggerDropdown = (name: string) =>
    setOpenDropdown((cur) => (cur === name ? null : name))

  return (
    <nav className="w-full sticky top-0 z-50">
      {/* Page progress bar */}
      <div className="bprogress" id="page-progress" role="progressbar" aria-hidden="true">
        <div className="bar"></div>
        <span className="peg"></span>
        <div className="indeterminate" aria-hidden="true">
          <div className="inc"></div>
          <div className="dec"></div>
        </div>
      </div>
      {/* Mobile bar */}
      <div className="flex lg:hidden w-full items-center justify-between bg-stone-200 dark:bg-stone-900 border-b border-stone-300 dark:border-stone-700 px-3 py-2.5">
        <Link to="/" className="inline-block h-8 flex items-center">
          <img src="/brand/minescout-logo.avif" alt="Minescout logo" className="h-8 w-auto max-w-[140px] object-contain object-left" width="140" height="32" decoding="async" />
        </Link>
        <div className="flex items-center gap-2">
          <button type="button" id="mobile-search-trigger" onClick={() => setSearchOpen(true)} className="inline-flex items-center justify-center h-9 w-9 rounded-sm font-bold text-sm border-y-4 border-transparent hover:bg-stone-400/50 dark:hover:bg-stone-700/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2 border-none active:bg-stone-400/30 dark:active:bg-stone-700/30 cursor-pointer" aria-label="Search">
            <Search className="size-5" />
          </button>
          <button type="button" id="mobile-nav-theme" onClick={toggle} className="inline-flex items-center justify-center h-9 w-9 rounded-sm font-bold text-sm border-y-4 border-transparent hover:bg-stone-400/50 dark:hover:bg-stone-700/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2 border-none active:bg-stone-400/30 dark:active:bg-stone-700/30 cursor-pointer" title="Switch theme" aria-label="Switch theme">
            <Moon className="size-5" />
          </button>
          <button type="button" id="mobile-nav-toggle" onClick={mobileOpen ? closeMobile : openMobile} className="inline-flex items-center justify-center h-9 w-9 rounded-sm font-bold text-sm border-y-4 border-transparent hover:bg-stone-400/50 dark:hover:bg-stone-700/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2 border-none active:bg-stone-400/30 dark:active:bg-stone-700/30 cursor-pointer" aria-label="Menu" aria-expanded={mobileOpen} aria-controls="mobile-nav-panel">
            <LayoutGrid className={`size-5 ${mobileOpen ? 'hidden' : ''}`} />
            <X className={`size-5 ${mobileOpen ? '' : 'hidden'}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div id="mobile-nav-panel" className={`absolute inset-x-0 top-full z-50 flex flex-col bg-stone-200 dark:bg-stone-900 border-b border-stone-300 dark:border-stone-700 shadow-lg max-h-[85vh] overflow-y-auto lg:hidden ${mobileOpen ? '' : 'hidden'}`} aria-hidden={!mobileOpen}>
        <div className="p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-minecraft text-sm">Game modes</span>
              <a href="/gamemodes" className="text-xs font-bold text-primary hover:underline">All game modes</a>
            </div>
            <div className="flex flex-wrap gap-2">
              {MODES.slice(0, 8).map((m) => (
                <a key={m} href={`/gamemodes/${m.toLowerCase()}`} className="text-sm px-2 py-1 rounded-md border border-transparent bg-stone-300/50 dark:bg-stone-800/50 hover:bg-stone-400/50 dark:hover:bg-stone-700/50">{m}</a>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-minecraft text-sm">Minecraft Version</span>
              <a href="/versions" className="text-xs font-bold text-stone-700 dark:text-stone-300 hover:underline">All versions</a>
            </div>
            <div className="flex flex-wrap gap-2">
              {VERSIONS.slice(0, 10).map((v) => (
                <a key={v} href={`/versions/${v.replace('.', '-')}`} className="text-sm px-2 py-1 rounded-md border border-transparent bg-stone-300/50 dark:bg-stone-800/50 hover:bg-stone-400/50 dark:hover:bg-stone-700/50">{v}</a>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-minecraft text-sm">Countries</span>
              <a href="/countries" className="text-xs font-bold text-primary hover:underline">All countries</a>
            </div>
            <div className="flex flex-wrap gap-2">
              {COUNTRIES.slice(0, 4).map((c) => (
                <a key={c.slug} href={`/countries/${c.slug}`} className="text-sm px-2 py-1 rounded-md border border-transparent bg-stone-300/50 dark:bg-stone-800/50 hover:bg-stone-400/50 dark:hover:bg-stone-700/50">{c.name}</a>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-minecraft text-sm">Server lists</span>
            <div className="flex flex-wrap gap-2">
              {[
                ['Java Servers', '/java-servers'],
                ['Bedrock Servers', '/bedrock-servers'],
                ['Crossplay', '/crossplay-servers'],
                ['New Servers', '/new-minecraft-servers'],
                ['Popular', '/popular'],
              ].map(([label, href]) => (
                <a key={href} href={href} className="text-sm px-2 py-1 rounded-md border border-transparent bg-stone-300/50 dark:bg-stone-800/50 hover:bg-stone-400/50 dark:hover:bg-stone-700/50">{label}</a>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a href="/dashboard/servers/add" className="nav-mega-link inline-flex items-center justify-center w-full py-3 rounded-md font-minecraft text-sm border-2 border-stone-700 dark:border-stone-500 bg-stone-800 text-stone-100 hover:bg-stone-700 dark:bg-stone-700 dark:hover:bg-stone-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-500/70 focus-visible:ring-offset-2 transition-all" title="Add your Minecraft Server">Add your Minecraft Server</a>
              <a href="/realms" className="nav-realms-btn inline-flex items-center justify-center w-full py-3 rounded-md font-minecraft text-sm border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e65be6] focus-visible:ring-offset-2 transition-all" title="Minecraft Realm Codes Server List">Minecraft Realms Server List</a>
              <a href="/tags" className="nav-tags-btn inline-flex items-center justify-center w-full py-3 rounded-md font-minecraft text-sm border-2 border-lime-800 bg-lime-600 text-stone-900 hover:bg-lime-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:ring-offset-2 transition-all" title="Browse Minecraft server tags">All Tags</a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-minecraft text-sm">My account</span>
              {user ? (
                <>
                  <span className="text-sm py-1 font-medium text-stone-900 dark:text-stone-100">{user.user.username}</span>
                  {isAdmin && <Link to="/admin" className="text-sm hover:underline py-1">Admin panel</Link>}
                  <Link to="/dashboard" className="text-sm hover:underline py-1">Dashboard</Link>
                  <button type="button" onClick={() => void logout()} className="text-sm hover:underline py-1 text-left bg-transparent border-0 p-0 cursor-pointer">Sign out</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm hover:underline py-1">Login</Link>
                  <Link to="/login" className="text-sm hover:underline py-1">Register</Link>
                </>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-minecraft text-sm">Tools</span>
              <a href="/pages/server-status-checker" className="text-sm hover:underline py-1">Server Checker</a>
              <a href="/blog/how-to-make-a-minecraft-server" className="text-sm hover:underline py-1">How to make a server</a>
              <a href="/pages/free-minecraft-hosting" className="text-sm hover:underline py-1">Free Minecraft hosting</a>
              <a href="/blog/how-to-join-a-minecraft-server" className="text-sm hover:underline py-1">How to join</a>
              <a href="/pages/votifier-tester" className="text-sm hover:underline py-1">Votifier Test</a>
              <a href="/pages/motd-generator" className="text-sm hover:underline py-1">MOTD Generator</a>
              <a href="https://gamingbanners.com/animated-banners?aff=minescout" target="_blank" className="text-sm hover:underline py-1">Banner Maker</a>
              <a href="/stats" className="text-sm hover:underline py-1">Minescout Statistics</a>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-minecraft text-sm">Misc</span>
            <a href="/blog" className="text-sm hover:underline py-1">Blog</a>
            <a href="/featured-slots" className="text-sm hover:underline py-1">Featured Slots</a>
            <a href="/pro-pricing" className="text-sm hover:underline py-1">Pro Pricing</a>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-stone-300 dark:border-stone-700">
            <button type="button" id="mobile-theme-toggle" onClick={toggle} className="inline-flex items-center justify-center h-9 w-9 rounded-sm font-bold text-sm hover:bg-stone-400/50 dark:hover:bg-stone-700/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2" aria-label="Switch theme"><Moon className="size-5" /></button>
            <button type="button" id="mobile-nav-close" onClick={closeMobile} className="inline-flex items-center justify-center h-10 px-4 rounded-sm font-bold text-sm hover:bg-stone-400/50 dark:hover:bg-stone-700/50 focus:outline-none">Close</button>
          </div>
        </div>
      </div>

      {/* Desktop bar */}
      <div className="hidden lg:block bg-stone-200 dark:bg-stone-900 border-b border-stone-300 dark:border-stone-700">
        <div className="wrapper py-4 px-3">
          <div className="flex items-center gap-2 xl:gap-8 min-w-0 flex-1">
            <div className="shrink-0">
              <Link to="/" id="logo" className="inline-block h-9 flex items-center">
                <img src="/brand/minescout-logo.avif" alt="Minescout logo" className="h-9 w-auto max-w-[160px] object-contain object-left" width="160" height="36" decoding="async" />
              </Link>
            </div>
            <nav aria-label="Main" className="flex-1 hidden md:flex items-center justify-between">
              <ul className="flex list-none items-center justify-center gap-1" id="primary-menu">
                <li className="relative">
                  <button
                    type="button"
                    id="nav-trigger-servers"
                    className={`nav-dropdown-trigger group inline-flex h-9 w-full items-center justify-center px-2 xl:px-4 py-2 rounded-sm font-minecraft text-xs xl:text-sm hover:bg-stone-300/50 dark:hover:bg-stone-800/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-stone-900 ${openDropdown === 'servers' ? 'data-[state=open]:bg-stone-300/50 dark:data-[state=open]:bg-stone-800/50' : ''}`}
                    data-state={openDropdown === 'servers' ? 'open' : 'closed'}
                    aria-expanded={openDropdown === 'servers'}
                    aria-controls="nav-dropdown-servers"
                    aria-haspopup="true"
                    data-dropdown="servers"
                    onClick={() => triggerDropdown('servers')}
                  >
                    Servers
                    <ChevronDown className="nav-dropdown-chevron ml-2 w-3 h-3 transition-transform duration-300" />
                  </button>
                </li>
                <li className="relative">
                  <button
                    type="button"
                    id="nav-trigger-tools"
                    className={`nav-dropdown-trigger group inline-flex h-9 w-full items-center justify-center px-2 xl:px-4 py-2 rounded-sm font-minecraft text-xs xl:text-sm hover:bg-stone-300/50 dark:hover:bg-stone-800/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-stone-900 ${openDropdown === 'tools' ? 'data-[state=open]:bg-stone-300/50 dark:data-[state=open]:bg-stone-800/50' : ''}`}
                    data-state={openDropdown === 'tools' ? 'open' : 'closed'}
                    aria-expanded={openDropdown === 'tools'}
                    aria-controls="nav-dropdown-tools"
                    aria-haspopup="true"
                    data-dropdown="tools"
                    onClick={() => triggerDropdown('tools')}
                  >
                    Minecraft Tools
                    <ChevronDown className="nav-dropdown-chevron ml-2 w-3 h-3 transition-transform duration-300" />
                  </button>
                </li>
                <li><a href="/blog" className="font-minecraft text-xs xl:text-sm h-9 inline-flex items-center justify-center px-2 xl:px-4 rounded-sm hover:bg-stone-300/50 dark:hover:bg-stone-800/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-stone-900">Blog</a></li>
                <li><a href="/featured-slots" className="font-minecraft text-xs xl:text-sm h-9 inline-flex items-center justify-center px-2 xl:px-4 rounded-sm hover:bg-stone-300/50 dark:hover:bg-stone-800/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-stone-900">Featured Slots</a></li>
                <li><a href="/pro-pricing" className="font-minecraft text-xs xl:text-sm h-9 inline-flex items-center justify-center px-2 xl:px-4 rounded-sm hover:bg-stone-300/50 dark:hover:bg-stone-800/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-stone-900">Pro Pricing</a></li>
              </ul>
              <ul className="group flex flex-1 list-none items-center justify-end gap-2 font-minecraft" id="secondary-menu" dir="ltr">
                <li className="relative">
                  <button type="button" id="search-trigger" onClick={() => setSearchOpen(true)} className="inline-flex items-center justify-between gap-2 min-w-0 max-w-full w-56 h-9 px-3 rounded-sm font-bold text-xs cursor-pointer hover:bg-stone-400/50 dark:hover:bg-stone-700/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-stone-900 border-none active:bg-stone-400/30 dark:active:bg-stone-700/30 bg-stone-200 dark:bg-stone-800 border border-stone-400 dark:border-stone-600 shrink min-w-[8rem]" aria-label="Search" aria-haspopup="dialog" aria-expanded={searchOpen} aria-controls="search-dialog">
                    <span className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                      <Search className="h-5 w-5 shrink-0" />
                      <span className="text-sm font-normal min-w-0 truncate" title="Search">Search</span>
                    </span>
                    <kbd className="pointer-events-none shrink-0 inline-flex h-5 select-none items-center gap-0.5 text-sm rounded-xs border border-stone-500 dark:border-stone-700 border-b-2 bg-stone-400/50 dark:bg-stone-500 px-1.5 font-mono font-medium text-stone-900 dark:text-stone-900">
                      <span className="text-xs">Ctrl</span><span className="font-light text-base">+</span><span className="font-light text-base">k</span>
                    </kbd>
                  </button>
                </li>
                <li className="relative">
                  <a href="https://discord.gg/EV5hpQU8Z9" target="_blank" rel="noreferrer nofollow" className="inline-flex items-center justify-center h-9 w-9 rounded-sm font-bold text-sm border-y-4 border-transparent text-[#5865F2] hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-stone-900 border-none active:opacity-70 cursor-pointer" aria-label="Discord">
                    <DiscordIcon className="size-5 shrink-0" />
                  </a>
                </li>
                <li className="relative">
                  <button type="button" id="layout-width-toggle" data-layout-width-toggle onClick={toggleWidth} className="inline-flex items-center justify-center h-9 w-9 rounded-sm font-bold text-sm border-y-4 border-transparent hover:bg-stone-400/50 dark:hover:bg-stone-700/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-stone-900 border-none active:bg-stone-400/30 dark:active:bg-stone-700/30 cursor-pointer" title="Toggle full width" aria-label="Toggle full width layout">
                    <Maximize2 className={`size-5 ${full ? '' : 'hidden'}`} />
                    <Minimize2 className={`size-5 ${full ? 'hidden' : ''}`} />
                    <span className="sr-only">Toggle full width</span>
                  </button>
                </li>
                <li className="relative">
                  <button type="button" id="theme-toggle" onClick={toggle} className="inline-flex items-center justify-center h-9 w-9 rounded-sm font-bold text-sm border-y-4 border-transparent hover:bg-stone-400/50 dark:hover:bg-stone-700/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-stone-900 border-none active:bg-stone-400/30 dark:active:bg-stone-700/30 cursor-pointer" title="Switch theme" aria-label="Switch theme">
                    <Moon className="lucide-moon size-5" />
                    <span className="sr-only">Switch theme</span>
                  </button>
                </li>
                <li className="relative">
                  <button
                    type="button"
                    id="nav-trigger-account"
                    onClick={() => setAccountOpen((o) => !o)}
                    className={`account-dropdown-trigger inline-flex items-center justify-center h-9 w-9 rounded-sm font-bold text-sm border-y-4 border-transparent hover:bg-stone-400/50 dark:hover:bg-stone-700/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-stone-900 border-none active:bg-stone-400/30 dark:active:bg-stone-700/30 cursor-pointer ${accountOpen ? 'data-[state=open]:bg-stone-400/50 dark:data-[state=open]:bg-stone-700/50' : ''}`}
                    data-state={accountOpen ? 'open' : 'closed'}
                    aria-expanded={accountOpen}
                    aria-controls="nav-dropdown-account"
                    aria-haspopup="menu"
                    aria-label="User menu"
                  >
                    <User className="size-5" />
                    <span className="sr-only">User menu</span>
                  </button>
                  <div className={`account-dropdown-panel absolute right-0 top-full z-50 mt-1 w-56 rounded-sm bg-stone-300 dark:bg-stone-900 border border-stone-400 dark:border-stone-600 shadow-md p-1 ${accountOpen ? '' : 'hidden'}`} id="nav-dropdown-account" role="menu" aria-labelledby="nav-trigger-account" aria-orientation="vertical">
                    <div className="px-2 py-1.5 font-medium text-sm font-minecraft">{user ? user.user.username : 'Account'}</div>
                    <div className="bg-border -mx-1 my-1 h-px" role="separator" aria-orientation="horizontal" />
                    {user ? (
                      <>
                        <Link to="/dashboard" className="account-dropdown-item flex items-center gap-2 text-sm px-2 py-1.5 rounded-sm hover:bg-stone-400 dark:hover:bg-stone-800 focus:bg-stone-400 dark:focus:bg-stone-800 outline-none" role="menuitem" tabIndex={-1}>
                          <LogIn className="text-stone-500 shrink-0 size-4" />
                          <span>Dashboard</span>
                        </Link>
                        {isAdmin && (
                          <Link to="/admin" className="account-dropdown-item flex items-center gap-2 text-sm px-2 py-1.5 rounded-sm hover:bg-stone-400 dark:hover:bg-stone-800 focus:bg-stone-400 dark:focus:bg-stone-800 outline-none" role="menuitem" tabIndex={-1}>
                            <Lock className="text-stone-500 shrink-0 size-4" />
                            <span>Admin panel</span>
                          </Link>
                        )}
                        <div className="bg-border -mx-1 my-1 h-px" role="separator" aria-orientation="horizontal" />
                        <button type="button" onClick={() => void logout()} className="account-dropdown-item flex items-center gap-2 text-sm px-2 py-1.5 rounded-sm hover:bg-stone-400 dark:hover:bg-stone-800 focus:bg-stone-400 dark:focus:bg-stone-800 outline-none w-full text-left bg-transparent border-0 cursor-pointer" role="menuitem" tabIndex={-1}>
                          <UserPlus className="text-stone-500 shrink-0 size-4" />
                          <span>Sign out</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" className="account-dropdown-item flex items-center gap-2 text-sm px-2 py-1.5 rounded-sm hover:bg-stone-400 dark:hover:bg-stone-800 focus:bg-stone-400 dark:focus:bg-stone-800 outline-none" role="menuitem" tabIndex={-1}>
                          <LogIn className="text-stone-500 shrink-0 size-4" />
                          <span>Login</span>
                        </Link>
                        <Link to="/login" className="account-dropdown-item flex items-center gap-2 text-sm px-2 py-1.5 rounded-sm hover:bg-stone-400 dark:hover:bg-stone-800 focus:bg-stone-400 dark:focus:bg-stone-800 outline-none" role="menuitem" tabIndex={-1}>
                          <UserPlus className="text-stone-500 shrink-0 size-4" />
                          <span>Register</span>
                        </Link>
                      </>
                    )}
                  </div>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        {/* Dropdown viewport */}
        <div
          className="nav-dropdown-viewport fixed top-16 left-0 right-0 isolate z-50 flex justify-center w-full overflow-x-auto overflow-y-auto pointer-events-none border-t border-b border-stone-300/30 dark:border-stone-700/30 bg-stone-100 dark:bg-stone-900 shadow-2xl origin-top transition-[opacity,visibility] duration-200"
          aria-hidden={openDropdown === null}
          data-state={openDropdown === null ? 'closed' : 'open'}
        >
          <div className="nav-dropdown-panel w-full top-0 left-0 p-2 pr-2.5 dark:bg-stone-900" id="nav-dropdown-servers" role="menu" aria-labelledby="nav-trigger-servers" hidden={openDropdown !== 'servers'}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 wrapper">
              <div className="flex flex-col gap-3 p-4">
                <span className="font-minecraft text-sm">Server Game Modes</span>
                <div className="grid grid-cols-2 gap-2">
                  {MODES.map((m) => (
                    <a key={m} href={`/gamemodes/${m.toLowerCase()}`} className="nav-mega-link text-xs xl:text-sm h-9 inline-flex items-center justify-center px-2 xl:px-4 py-2 rounded-sm hover:bg-stone-300/50 dark:hover:bg-stone-800/50 focus:bg-stone-300/50 dark:focus:bg-stone-800/50 focus:outline-none">{m}</a>
                  ))}
                  <a href="/gamemodes" className="nav-mega-link text-xs xl:text-sm h-9 inline-flex items-center justify-center px-2 xl:px-4 py-2 rounded-sm hover:bg-stone-300/50 dark:hover:bg-stone-800/50 focus:outline-none group"><span className="font-bold text-primary group-hover:opacity-90 transition-colors">View all</span></a>
                </div>
              </div>
              <div className="flex flex-col gap-3 p-4">
                <span className="font-minecraft text-sm">Server Versions</span>
                <div className="grid grid-cols-2 gap-2">
                  {VERSIONS.map((v) => (
                    <a key={v} href={`/versions/${v.replace('.', '-')}`} className="nav-mega-link text-xs xl:text-sm h-9 inline-flex items-center justify-center px-2 xl:px-4 py-2 rounded-sm hover:bg-stone-300/50 dark:hover:bg-stone-800/50 focus:outline-none">{v}</a>
                  ))}
                  <a href="/versions" className="nav-mega-link text-xs xl:text-sm h-9 inline-flex items-center justify-center px-2 xl:px-4 py-2 rounded-sm hover:bg-stone-300/50 dark:hover:bg-stone-800/50 focus:outline-none group"><span className="font-bold text-primary group-hover:opacity-90 transition-colors">View all</span></a>
                </div>
              </div>
              <div className="flex flex-col gap-3 p-4">
                <span className="font-minecraft text-sm">Server Countries</span>
                <div className="grid grid-cols-2 gap-2">
                  {COUNTRIES.map((c) => (
                    <a key={c.slug} href={`/countries/${c.slug}`} className="nav-mega-link text-xs xl:text-sm h-9 inline-flex items-center justify-center px-2 xl:px-4 py-2 rounded-sm hover:bg-stone-300/50 dark:hover:bg-stone-800/50 focus:outline-none">{c.name}</a>
                  ))}
                  <a href="/countries" className="nav-mega-link text-xs xl:text-sm h-9 inline-flex items-center justify-center px-2 xl:px-4 py-2 rounded-sm hover:bg-stone-300/50 dark:hover:bg-stone-800/50 focus:outline-none group"><span className="font-bold text-primary group-hover:opacity-90 transition-colors">View all</span></a>
                </div>
              </div>
              <div className="flex flex-col gap-3 p-4">
                <span className="font-minecraft text-sm">Other</span>
                <div className="flex flex-col gap-2">
                  {[
                    ['New Minecraft Servers', '/new-minecraft-servers'],
                    ['Java Servers', '/java-servers'],
                    ['Bedrock Servers', '/bedrock-servers'],
                    ['Crossplay Servers', '/crossplay-servers'],
                    ['Popular', '/popular'],
                    ['Whitelist Servers', '/whitelist'],
                  ].map(([label, href]) => (
                    <a key={href} href={href} className="nav-mega-link text-xs xl:text-sm h-9 inline-flex items-center justify-center px-2 xl:px-4 py-2 rounded-sm hover:bg-stone-300/50 dark:hover:bg-stone-800/50 focus:outline-none">{label}</a>
                  ))}
                </div>
              </div>
            </div>
            <div className="wrapper flex justify-center pt-4 pb-2">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <a href="/dashboard/servers/add" className="nav-mega-link inline-flex items-center justify-center px-6 py-3 rounded-sm font-minecraft text-sm border-2 border-stone-700 dark:border-stone-500 bg-stone-800 text-stone-100 hover:bg-stone-700 dark:bg-stone-700 dark:hover:bg-stone-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-100 dark:focus-visible:ring-offset-stone-900 transition-all" title="Add your Minecraft Server">Add your Minecraft Server</a>
                <a href="/realms" className="nav-mega-link nav-realms-btn inline-flex items-center justify-center px-6 py-3 rounded-sm font-minecraft text-sm border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e65be6] focus-visible:ring-offset-2 focus-visible:ring-offset-stone-100 dark:focus-visible:ring-offset-stone-900 transition-all" title="Minecraft Realm Codes Server List">Minecraft Realms Server List</a>
                <a href="/tags" className="nav-mega-link nav-tags-btn inline-flex items-center justify-center px-6 py-3 rounded-sm font-minecraft text-sm border-2 border-lime-800 bg-lime-600 text-stone-900 hover:bg-lime-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-100 dark:focus-visible:ring-offset-stone-900 transition-all" title="Browse Minecraft server tags">All Tags</a>
              </div>
            </div>
            <div className="wrapper border-t border-stone-300 dark:border-stone-700 py-3 px-4">
              <p className="text-center text-xs font-minecraft text-stone-600 dark:text-stone-400 mb-2">Guides</p>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
                <a href="/blog/how-to-make-a-minecraft-server" className="text-primary hover:underline font-medium">How to make a server</a>
                <a href="/pages/free-minecraft-hosting" className="text-primary hover:underline font-medium">Free hosting</a>
                <a href="/blog/how-to-join-a-minecraft-server" className="text-primary hover:underline font-medium">How to join</a>
                <a href="/blog/how-to-make-a-modded-minecraft-server" className="text-primary hover:underline font-medium">Modded server</a>
                <a href="/pages/are-minecraft-servers-down" className="text-primary hover:underline font-medium">Minecraft down?</a>
              </div>
            </div>
            <div className="wrapper flex justify-center py-3">
              <a href="/stats" className="nav-mega-link text-sm px-4 py-2 rounded-sm hover:bg-stone-300/50 dark:hover:bg-stone-800/50 focus:outline-none font-medium">Minescout Statistics</a>
            </div>
          </div>

          <div className="nav-dropdown-panel w-full top-0 left-0 p-2 pr-2.5 dark:bg-stone-900" id="nav-dropdown-tools" role="menu" aria-labelledby="nav-trigger-tools" hidden={openDropdown !== 'tools'}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 wrapper">
              <div className="col-span-1 flex flex-col gap-3 p-4">
                <a href="/pages/server-status-checker" className="nav-tools-card flex flex-col gap-1 rounded-sm text-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-stone-500/50 h-full p-4 group hover:bg-stone-300/30 dark:hover:bg-stone-800/30">
                  <div className="aspect-square w-full rounded-sm border border-stone-400 dark:border-stone-600 bg-stone-300 dark:bg-stone-800 mb-2 overflow-hidden pointer-events-none select-none">
                    <img src="/brand/server_status_checker_new.webp" alt="Minecraft Server Status Checker" loading="lazy" width="400" height="400" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="font-semibold">Minecraft Server Status Checker</h3>
                  <p className="text-stone-600 dark:text-stone-400 text-sm">Free Java &amp; Bedrock ping tool — check online status, players, version, and latency</p>
                </a>
              </div>
              <div className="col-span-1 flex flex-col gap-3 p-4">
                <a href="/pages/votifier-tester" className="nav-tools-card flex flex-col gap-1 rounded-sm text-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-stone-500/50 h-full p-4 group hover:bg-stone-300/30 dark:hover:bg-stone-800/30">
                  <div className="aspect-square w-full rounded-sm border border-stone-400 dark:border-stone-600 bg-stone-300 dark:bg-stone-800 mb-2 overflow-hidden pointer-events-none select-none">
                    <img src="/brand/votifier_tester_new.png" alt="Minecraft Votifier Tester" loading="lazy" width="400" height="400" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="font-semibold">Minecraft Votifier Tester</h3>
                  <p className="text-stone-600 dark:text-stone-400 text-sm">Test Votifier v1 (RSA) and NuVotifier v2 token setups before going live</p>
                </a>
              </div>
              <div className="col-span-1 flex flex-col gap-3 p-4">
                <a href="/pages/motd-generator" className="nav-tools-card flex flex-col gap-1 rounded-sm text-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-stone-500/50 h-full p-4 group hover:bg-stone-300/30 dark:hover:bg-stone-800/30">
                  <div className="aspect-square w-full rounded-sm border border-stone-400 dark:border-stone-600 bg-stone-300 dark:bg-stone-800 mb-2 overflow-hidden pointer-events-none select-none">
                    <img src="/brand/minecraft_motd_generator_new.webp" alt="Minecraft MOTD Generator" loading="lazy" width="400" height="400" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="font-semibold">Minecraft MOTD Generator</h3>
                  <p className="text-stone-600 dark:text-stone-400 text-sm">Free colored MOTD creator with live preview — export for Vanilla, Spigot &amp; more</p>
                </a>
              </div>
              <div className="col-span-1 flex flex-col gap-3 p-4">
                <a href="https://gamingbanners.com/animated-banners?aff=minescout" target="_blank" className="nav-tools-card flex flex-col gap-1 rounded-sm text-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-stone-500/50 h-full p-4 group hover:bg-stone-300/30 dark:hover:bg-stone-800/30">
                  <div className="aspect-square w-full rounded-sm border border-stone-400 dark:border-stone-600 bg-stone-300 dark:bg-stone-800 mb-2 flex items-center justify-center text-stone-500 dark:text-stone-400 text-xs font-minecraft pointer-events-none select-none">Banner</div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">Minecraft Banner Maker</h3>
                    <ArrowUpRight className="size-4 shrink-0" />
                  </div>
                  <p className="text-stone-600 dark:text-stone-400 text-sm">Create minecraft banner designs with live preview and easy customization</p>
                </a>
              </div>
            </div>
            <div className="wrapper border-t border-stone-300 dark:border-stone-700 py-3 px-4">
              <p className="text-center text-xs font-minecraft text-stone-600 dark:text-stone-400 mb-2">Guides</p>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
                <a href="/blog/how-to-make-a-minecraft-server" className="text-primary hover:underline font-medium">How to make a server</a>
                <a href="/pages/free-minecraft-hosting" className="text-primary hover:underline font-medium">Free hosting</a>
                <a href="/blog/how-to-join-a-minecraft-server" className="text-primary hover:underline font-medium">How to join</a>
                <a href="/blog/how-to-make-a-modded-minecraft-server" className="text-primary hover:underline font-medium">Modded server</a>
                <a href="/pages/are-minecraft-servers-down" className="text-primary hover:underline font-medium">Minecraft down?</a>
              </div>
            </div>
            <div className="wrapper flex justify-center py-3">
              <a href="/stats" className="nav-mega-link text-sm px-4 py-2 rounded-sm hover:bg-stone-300/50 dark:hover:bg-stone-800/50 focus:outline-none font-medium">Minescout Statistics</a>
            </div>
          </div>
        </div>
      </div>

      {/* Search dialog */}
      {searchOpen && (
        <div id="search-dialog" className="search-dialog fixed inset-0 z-[100] flex items-center justify-center p-4 opacity-0 pointer-events-none transition-opacity duration-150" role="dialog" aria-modal="true" aria-labelledby="search-dialog-title" aria-describedby="search-dialog-desc" aria-hidden="false">
          <div className="search-dialog-backdrop absolute inset-0 bg-stone-900/60 dark:bg-stone-950/80 backdrop-blur-sm" aria-hidden="true" onClick={() => setSearchOpen(false)} />
          <div className="search-dialog-content relative w-full max-w-lg rounded-sm border border-stone-400 dark:border-stone-600 shadow-xl overflow-hidden bg-white dark:bg-stone-900/95" role="document">
            <button type="button" className="absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none z-10 p-1" id="search-dialog-close" aria-label="Close" tabIndex={-1} onClick={() => setSearchOpen(false)}>
              <X className="size-4" />
            </button>
            <h2 id="search-dialog-title" className="sr-only">Search</h2>
            <p id="search-dialog-desc" className="sr-only">Search for a server, listing, or account...</p>
            <div className="flex flex-col overflow-hidden" data-slot="command">
              <div className="flex h-12 items-center gap-2 border-b border-stone-300 dark:border-stone-700 px-3" data-slot="command-input-wrapper">
                <Search className="size-4 shrink-0 opacity-50" />
                <input type="text" id="search-dialog-input" className="placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-base min-[480px]:text-sm outline-none border-0" placeholder="Search servers..." autoFocus autoComplete="off" autoCorrect="off" spellCheck={false} aria-autocomplete="list" role="combobox" aria-expanded="true" aria-controls="search-dialog-list" aria-label="Search servers" tabIndex={-1} inputMode="search" maxLength={200} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <div id="search-dialog-list" className="max-h-[300px] overflow-x-auto overflow-y-auto py-1 min-w-0" role="listbox" aria-label="Search results">
                <div id="search-dialog-results">
                  {searchResults.isLoading ? (
                    <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                      Searching…
                    </div>
                  ) : (searchResults.data?.results.length ?? 0) === 0 ? (
                    <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                      No servers found. Try <a href="/search" className="text-primary hover:underline">advanced search</a>.
                    </div>
                  ) : (
                    <div data-slot="command-group" className="p-1" role="group" aria-label="Search results">
                      {(searchResults.data?.results ?? []).map((s) => {
                        const players = s.online
                          ? `${s.playersOnline.toLocaleString()}/${s.playersMax.toLocaleString()} playing now`
                          : s.playersOnline > 0 || s.playersMax > 0
                            ? `Stale snapshot · ${s.playersOnline.toLocaleString()}/${s.playersMax.toLocaleString()} (when last reachable)`
                            : 'Player counts update when our ping succeeds.'
                        return (
                          <a
                            key={s.slug}
                            href={`/${s.slug}`}
                            className="data-[selected]:bg-accent data-[selected]:text-accent-foreground relative cursor-default rounded-xs px-2 py-3 text-sm outline-none select-none flex items-center gap-3 border-l-2 border-transparent"
                            role="option"
                            aria-selected="false"
                          >
                            <div className="flex-shrink-0">
                              <div className="aspect-square w-8 h-8 rounded overflow-hidden bg-muted flex items-center justify-center">
                                <img alt={`${s.name} Minecraft server icon`} loading="lazy" width="32" height="32" className="object-cover w-full h-full" src={s.icon} onError={(e) => { e.currentTarget.style.display = 'none' }} />
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-minecraft text-sm font-medium break-words">{s.name}</span>
                                {s.featured && (
                                  <span className="inline-flex items-center justify-center gap-0.5 border font-medium shrink-0 text-[10px] md:text-xs px-1.5 py-0 rounded-sm bg-gradient-to-r from-yellow-500 to-yellow-300 text-yellow-900 border-yellow-600" title="Minescout Pro server">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-2.5 md:size-3" aria-hidden="true"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" /><path d="M20 2v4" /><path d="M22 4h-4" /><circle cx="4" cy="20" r="2" /></svg>
                                    Pro
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-col gap-0.5 text-xs text-muted-foreground min-w-0">
                                <div className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0">
                                  <span className={`inline-flex shrink-0 items-center gap-1 ${s.online ? 'text-green-600' : 'text-red-600'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.online ? 'bg-green-500' : 'bg-red-500'}`} />
                                    {s.online ? 'Online' : 'Offline'}
                                  </span>
                                  <span className="break-words min-w-0">{players}</span>
                                </div>
                              </div>
                            </div>
                          </a>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full flex items-center justify-center border-t border-stone-300 dark:border-stone-700 py-2">
                <a href="/search" id="search-dialog-advanced" className="inline-flex gap-1 text-xs text-center cursor-pointer p-3 text-primary hover:underline" tabIndex={-1}>
                  <Search className="size-4 shrink-0" />
                  Advanced search
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}