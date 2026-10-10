import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from './table';
import { SkeletonTable, SkeletonMobileCardList } from './skeleton';

export interface DataTableColumn<T> {
  key: string;
  header: React.ReactNode;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
  className?: string;
  headerClassName?: string;
  rowClassName?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  onRowClick,
  className = '',
  headerClassName = '',
  rowClassName = '',
  emptyTitle = 'Tiada Rekod Dijumpai',
  emptyDescription = 'Cuba ubah penapis atau carian anda',
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        {/* Desktop View Skeleton */}
        <div className="hidden md:block">
          <SkeletonTable columns={columns.length || 4} rows={5} />
        </div>
        {/* Mobile View Skeleton */}
        <div className="md:hidden">
          <SkeletonMobileCardList count={4} />
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`w-full rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl p-12 text-center ${className}`}>
        <div className="flex flex-col items-center justify-center text-slate-400">
          <div className="w-14 h-14 bg-slate-800/60 rounded-2xl flex items-center justify-center mb-3 border border-slate-700/40">
            <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="font-bold text-xs uppercase tracking-widest text-slate-300">{emptyTitle}</p>
          <p className="text-xs text-slate-500 mt-1">{emptyDescription}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl shadow-xl shadow-slate-950/40 overflow-hidden ${className}`}>
      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block w-full overflow-x-auto">
        <Table className="border-none shadow-none bg-transparent w-full">
          <TableHeader className={headerClassName}>
            <TableRow hoverable={false} className="border-b border-slate-800/80 bg-slate-950/60">
              {columns.map((col) => (
                <TableHead key={col.key} className={`py-3.5 px-4 text-xs font-bold tracking-wider uppercase text-slate-400 ${col.className || ''}`}>
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
                className={`border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors ${rowClassName}`}
              >
                {columns.map((col) => (
                  <TableCell key={col.key} className={`py-3.5 px-4 text-sm text-slate-200 ${col.className || ''}`}>
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Native Card View (< md) - Zero Horizontal Scrolling! */}
      <div className="md:hidden divide-y divide-slate-800/60">
        {data.map((item, i) => (
          <div
            key={i}
            onClick={() => onRowClick?.(item)}
            className={`p-4 space-y-2.5 transition-colors ${onRowClick ? 'cursor-pointer hover:bg-slate-800/40 active:bg-slate-800/60' : ''} ${rowClassName}`}
          >
            {columns.map((col, colIdx) => {
              const val = col.render ? col.render(item) : (item as any)[col.key];

              // Primary / Header row on mobile card
              if (colIdx === 0) {
                return (
                  <div key={col.key} className="flex items-center justify-between pb-1 border-b border-slate-800/40">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {col.header}
                    </span>
                    <div className="font-bold text-sm text-slate-100">
                      {val}
                    </div>
                  </div>
                );
              }

              return (
                <div key={col.key} className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide flex-shrink-0">
                    {col.header}
                  </span>
                  <div className="text-right text-slate-200 truncate max-w-[60%] font-medium">
                    {val}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default DataTable;
