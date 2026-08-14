import { Skeleton } from './ui/skeleton'

export function ListingCardSkeleton() {
  return (
    <div className="listing-card flex flex-col lg:flex-row rounded-sm overflow-hidden">
      <div className="lg:aspect-square lg:w-[130px] bg-stone-300 dark:bg-stone-900 p-2 px-3 lg:p-4 flex items-center justify-center gap-2">
        <Skeleton className="h-10 w-10 lg:h-12 lg:w-12" />
      </div>
      <div className="flex-1 flex flex-col lg:flex-row gap-4 bg-stone-300/50 dark:bg-stone-900/50 p-3 lg:p-4 justify-between">
        <div className="flex-1 flex flex-col gap-2 md:gap-3">
          <div className="flex gap-2 lg:gap-4 flex-col lg:flex-row items-center lg:items-start">
            <Skeleton className="block shrink-0 w-full min-w-0 lg:w-[468px] lg:min-w-[468px] h-[50px] lg:h-[60px] rounded-xs" />
            <div className="flex flex-col items-center lg:items-start justify-center lg:gap-1">
              <div className="flex gap-2 lg:gap-3 items-center">
                <Skeleton className="aspect-square size-6 lg:size-8 rounded" />
                <Skeleton className="h-6 w-40 lg:w-56" />
              </div>
              <Skeleton className="h-4 w-32 mt-1 lg:mt-0" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-md" />
            <Skeleton className="h-6 w-20 rounded-md" />
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-2 items-center justify-start max-w-full lg:max-w-[200px] xl:max-w-[220px]">
          <Skeleton className="h-8 w-full rounded-md" />
          <div className="flex gap-2 w-full">
            <Skeleton className="h-8 flex-1 rounded-md" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function TableRowsSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="border border-stone-300 dark:border-stone-600 bg-stone-100/50 dark:bg-stone-800/50 rounded-sm overflow-x-auto divide-y divide-stone-300 dark:divide-stone-600">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3 p-3">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="flex-1 h-4" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function ContentSkeleton({ lines = 5 }: { lines?: number }) {
  return (
    <div className="py-8 px-4 flex flex-col gap-3">
      <Skeleton className="h-6 w-1/3 mx-auto" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-4 ${i % 3 === 0 ? 'w-full' : i % 3 === 1 ? 'w-[90%]' : 'w-[80%]'}`} />
      ))}
    </div>
  )
}

export function CardGridSkeleton({ count = 8, className }: { count?: number; className?: string }) {
  return (
    <div className={className ?? 'grid grid-cols-2 lg:grid-cols-3 gap-4'}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-24" />
      ))}
    </div>
  )
}
