import type { ReactNode } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { Checkbox } from '../ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { TableRowsSkeleton } from '../Skeletons'
import { ErrorState } from '../Async'
import { EmptyState } from './EmptyState'
import { Pagination, type PaginationProps } from './Pagination'
import { cn } from '../../lib/utils'
import { ApiError } from '../../lib/api'

export interface DataColumn<T> {
  key: string
  header: ReactNode
  cell: (row: T) => ReactNode
  sortKey?: string
  sortable?: boolean
  className?: string
  headerClassName?: string
}

export interface SortState {
  key: string
  dir: 'asc' | 'desc'
}

export interface DataTableProps<T> {
  columns: DataColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  isLoading?: boolean
  error?: unknown
  onRetry?: () => void
  sort?: SortState
  onSortChange?: (sort: SortState | null) => void
  selectable?: boolean
  selected?: Set<string>
  onSelectedChange?: (sel: Set<string>) => void
  pagination?: PaginationProps
  rowClassName?: (row: T) => string | undefined
  empty?: ReactNode
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading,
  error,
  onRetry,
  sort,
  onSortChange,
  selectable,
  selected,
  onSelectedChange,
  pagination,
  rowClassName,
  empty,
}: DataTableProps<T>) {
  if (error) {
    const err = error instanceof ApiError ? error : new ApiError(0, { message: String(error), error: String(error) })
    return <ErrorState error={err} onRetry={onRetry} />
  }
  if (isLoading) return <TableRowsSkeleton />

  if (rows.length === 0) {
    return (
      empty ?? (
        <EmptyState
          icon={<span className="text-3xl">🗂</span>}
          title="Nothing here yet"
          description="No rows match the current filters."
        />
      )
    )
  }

  const toggleSort = (col: DataColumn<T>) => {
    if (!onSortChange) return
    const key = col.sortKey ?? col.key
    if (sort?.key === key && sort.dir === 'asc') onSortChange({ key, dir: 'desc' })
    else onSortChange({ key, dir: 'asc' })
  }

  const allSelected = selectable && selected ? rows.length > 0 && rows.every((r) => selected.has(rowKey(r))) : false
  const someSelected = selectable && selected ? rows.some((r) => selected.has(rowKey(r))) : false

  const toggleRow = (key: string) => {
    if (!onSelectedChange || !selected) return
    const next = new Set(selected)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    onSelectedChange(next)
  }

  const toggleAll = () => {
    if (!onSelectedChange || !selected) return
    const next = new Set(selected)
    for (const r of rows) {
      const key = rowKey(r)
      if (allSelected) next.delete(key)
      else next.add(key)
    }
    onSelectedChange(next)
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable ? (
                <TableHead className="w-10">
                  <Checkbox checked={allSelected || someSelected} onCheckedChange={toggleAll} aria-label="Select all rows" />
                </TableHead>
              ) : null}
              {columns.map((col) => {
                const isSorted = sort?.key === (col.sortKey ?? col.key)
                return (
                  <TableHead key={col.key} className={cn(col.headerClassName)}>
                    {col.sortable || col.sortKey ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col)}
                        className="inline-flex items-center gap-1.5 font-medium hover:text-foreground"
                      >
                        {col.header}
                        {isSorted ? (
                          sort?.dir === 'asc' ? (
                            <ArrowUp className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const key = rowKey(row)
              return (
                <TableRow key={key} className={rowClassName?.(row)}>
                  {selectable ? (
                    <TableCell>
                      <Checkbox
                        checked={selected?.has(key) ?? false}
                        onCheckedChange={() => toggleRow(key)}
                        aria-label="Select row"
                      />
                    </TableCell>
                  ) : null}
                  {columns.map((col) => (
                    <TableCell key={col.key} className={cn('whitespace-nowrap', col.className)}>
                      {col.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      {pagination ? <Pagination {...pagination} /> : null}
    </div>
  )
}
