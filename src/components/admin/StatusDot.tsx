import { cn } from '../../lib/utils'

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'muted'

const DOT: Record<StatusTone, string> = {
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
  muted: 'bg-muted-foreground/50',
}

export function StatusDot({
  tone,
  pulse,
  label,
  className,
}: {
  tone: StatusTone
  pulse?: boolean
  label?: string
  className?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap', className)}>
      <span className="relative flex h-2 w-2 shrink-0">
        {pulse ? (
          <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-60', DOT[tone])} />
        ) : null}
        <span className={cn('relative inline-flex h-2 w-2 rounded-full', DOT[tone])} />
      </span>
      {label ? <span className="text-xs text-muted-foreground">{label}</span> : null}
    </span>
  )
}
