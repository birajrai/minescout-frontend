import type { ComponentType } from 'react'
import { Link } from 'react-router'
import { Card, CardContent } from '../ui/card'
import { cn } from '../../lib/utils'

export function StatCard({
  label,
  value,
  icon: Icon,
  to,
  className,
}: {
  label: string
  value: number | string
  icon?: ComponentType<{ className?: string }>
  to?: string
  className?: string
}) {
  const body = (
    <div className="flex items-center gap-3">
      {Icon ? <Icon className="h-5 w-5 shrink-0 text-muted-foreground" /> : null}
      <span className="flex min-w-0 flex-col">
        <span className="text-2xl font-semibold tabular-nums">{typeof value === 'number' ? value.toLocaleString() : value}</span>
        <span className="truncate text-xs text-muted-foreground">{label}</span>
      </span>
    </div>
  )
  if (to) {
    return (
      <Link
        to={to}
        className={cn(
          'flex items-center rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:border-primary/50 hover:no-underline',
          className
        )}
      >
        {body}
      </Link>
    )
  }
  return (
    <Card className={cn('flex', className)}>
      <CardContent className="flex items-center p-4">{body}</CardContent>
    </Card>
  )
}
