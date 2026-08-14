import { Link } from 'react-router'
import { ChevronLeft, Search } from 'lucide-react'

export function NotFound() {
  return (
    <div className="flex flex-col gap-4 flex-1 items-center justify-center min-h-[50vh] px-4">
      <h1 className="font-minecraft text-2xl text-stone-900 dark:text-stone-100">Page Not Found</h1>
      <p className="text-sm text-stone-600 dark:text-stone-400">The page you are looking for does not exist.</p>
      <div className="flex flex-wrap gap-2 justify-center">
        <Link to="/" className="btn-wrapper relative before:border rounded-md before:rounded-md disabled:pointer-events-none disabled:opacity-50 disabled:grayscale-50 before:bg-stone-400/80 before:border-stone-500/80 text-stone-900 h-10 before:h-10 inline-flex">
          <span className="btn-surface rounded-md text-sm font-bold border select-none w-full h-full bg-stone-300 dark:bg-stone-400 border-stone-500 px-3 inline-flex items-center justify-center gap-2">
            <ChevronLeft className="size-4" />
            Go to Homepage
          </span>
        </Link>
        <Link to="/search" className="btn-wrapper relative before:border rounded-md before:rounded-md disabled:pointer-events-none disabled:opacity-50 disabled:grayscale-50 before:bg-stone-400/80 before:border-stone-500/80 text-stone-900 h-10 before:h-10 inline-flex">
          <span className="btn-surface rounded-md text-sm font-bold border select-none w-full h-full bg-stone-300 dark:bg-stone-400 border-stone-500 px-3 inline-flex items-center justify-center gap-2">
            <Search className="size-4" />
            Search servers
          </span>
        </Link>
      </div>
    </div>
  )
}
