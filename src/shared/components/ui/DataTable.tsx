import React from 'react'
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from './table'
import { SkeletonTable, SkeletonMobileCardList } from './skeleton'
import { cn } from '@/lib/utils'

export interface DataTableColumn<T> {
  key: string
  header: React.ReactNode
  render?: (item: T) => React.ReactNode
  className?: string
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  isLoading?: boolean
  onRowClick?: (item: T) => void
  className?: string
  headerClassName?: string
  rowClassName?: string
  emptyTitle?: string
  emptyDescription?: string
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  onRowClick,
  className = '',
  headerClassName = '',
  rowClassName = '',
  emptyTitle = 'No Records Found',
  emptyDescription = 'Try adjusting your filters or search criteria',
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className={cn('w-full', className)}>
        <div className="hidden md:block">
          <SkeletonTable columns={columns.length || 4} rows={5} />
        </div>
        <div className="md:hidden">
          <SkeletonMobileCardList count={4} />
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className={cn('w-full rounded-2xl border border-border-default bg-surface p-12 text-center shadow-xs', className)}>
        <div className="flex flex-col items-center justify-center text-text-muted">
          <div className="w-12 h-12 bg-subtle rounded-xl flex items-center justify-center mb-3 border border-border-subtle">
            <svg className="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="font-bold text-xs uppercase tracking-widest text-text-primary">{emptyTitle}</p>
          <p className="text-xs text-text-muted mt-1">{emptyDescription}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('w-full rounded-2xl border border-border-default bg-surface shadow-xs overflow-hidden', className)}>
      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block w-full overflow-x-auto">
        <Table className="border-none shadow-none bg-transparent w-full">
          <TableHeader className={headerClassName}>
            <TableRow hoverable={false} className="border-b border-border-default bg-subtle/50">
              {columns.map((col) => (
                <TableHead key={col.key} className={cn('py-3.5 px-4 text-xs font-bold tracking-wider uppercase text-text-muted', col.className)}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, i) => (
              <TableRow
                key={i}
                onClick={() => onRowClick?.(item)}
                hoverable={!!onRowClick}
                className={cn('border-b border-border-subtle hover:bg-subtle/50 transition-colors', rowClassName)}
              >
                {columns.map((col) => (
                  <TableCell key={col.key} className={cn('py-3.5 px-4 text-sm text-text-primary', col.className)}>
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Native Card View (< md) - Zero Horizontal Scrolling */}
      <div className="md:hidden divide-y divide-border-subtle">
        {data.map((item, i) => (
          <div
            key={i}
            onClick={() => onRowClick?.(item)}
            className={cn(
              'p-4 space-y-2.5 transition-colors touch-press',
              onRowClick && 'cursor-pointer hover:bg-subtle/40 active:bg-subtle',
              rowClassName
            )}
          >
            {columns.map((col, colIdx) => {
              const val = col.render ? col.render(item) : (item as any)[col.key]

              if (colIdx === 0) {
                return (
                  <div key={col.key} className="flex items-center justify-between pb-1.5 border-b border-border-subtle">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      {col.header}
                    </span>
                    <div className="font-semibold text-sm text-text-primary">
                      {val}
                    </div>
                  </div>
                )
              }

              return (
                <div key={col.key} className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-[11px] font-medium text-text-muted uppercase tracking-wide flex-shrink-0">
                    {col.header}
                  </span>
                  <div className="text-right text-text-secondary truncate max-w-[65%] font-medium tabular-nums">
                    {val}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
