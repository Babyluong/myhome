import React from 'react';
import { cn } from '@/lib/utils';
import { EmptyState } from './empty-state';
import { Skeleton } from './skeleton';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string | number;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyTitle = 'Tiada data',
  emptyDescription = 'Tiada rekod dijumpai buat masa ini.',
  onRowClick,
  className,
}: DataTableProps<T>): JSX.Element {
  if (isLoading) {
    return (
      <div className={cn('w-full border border-border-default rounded-xl overflow-hidden bg-surface', className)}>
        <div className="p-4 space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-6 w-full opacity-70" />
          <Skeleton className="h-6 w-full opacity-50" />
          <Skeleton className="h-6 w-full opacity-30" />
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn('w-full border border-border-default rounded-xl bg-surface p-8', className)}>
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return (
    <div className={cn('w-full border border-border-default rounded-xl overflow-hidden bg-surface shadow-elevation-1', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border-default bg-subtle/50 text-text-secondary uppercase tracking-wider text-[11px] font-semibold">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'py-2.5 px-3 whitespace-nowrap',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right',
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle font-mono tabular-nums text-text-primary">
            {data.map((row, idx) => (
              <tr
                key={keyExtractor(row, idx)}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'transition-colors duration-150',
                  onRowClick
                    ? 'hover:bg-subtle/70 active:bg-muted-surface cursor-pointer focus-visible:outline-none focus-visible:bg-subtle'
                    : 'hover:bg-subtle/30'
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'py-2.5 px-3 text-xs font-sans',
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right font-mono',
                      col.className
                    )}
                  >
                    {col.render ? col.render(row, idx) : (row as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
