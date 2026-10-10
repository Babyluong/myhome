import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ 
  className = '', 
  variant = 'rectangular',
  animation = 'pulse',
  width,
  height 
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };
  
  const animationClasses = {
    pulse: 'animate-pulse-subtle',
    wave: 'animate-shimmer overflow-hidden',
    none: '',
  };
  
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;
  
  return (
    <div
      className={`bg-slate-800/70 border border-slate-700/20 bg-gradient-to-r from-slate-800/70 via-slate-700/40 to-slate-800/70 ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className="h-3.5 bg-slate-800/80"
          width={i === lines - 1 ? '75%' : '100%'}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl p-5 sm:p-6 shadow-xl shadow-slate-950/40 ${className}`}>
      <div className="flex items-center gap-4 mb-4">
        <Skeleton variant="circular" className="w-11 h-11 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="h-4 w-1/3" />
          <Skeleton variant="text" className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}

/**
 * Metric/KPI Stat Card Skeleton
 */
export function SkeletonKpiCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-slate-900/60 backdrop-blur border border-slate-800/80 p-4 sm:p-5 rounded-2xl flex flex-col justify-between ${className}`}>
      <div className="flex justify-between items-start gap-2">
        <Skeleton variant="text" className="h-3.5 w-24 bg-slate-800/80" />
        <Skeleton variant="circular" className="w-8 h-8 flex-shrink-0" />
      </div>
      <div className="mt-3 space-y-1.5">
        <Skeleton variant="text" className="h-7 w-16 bg-slate-800/90" />
        <Skeleton variant="text" className="h-2.5 w-28 bg-slate-800/60" />
      </div>
    </div>
  );
}

/**
 * Responsive Table Skeleton for Desktop
 */
export function SkeletonTable({ rows = 5, columns = 4, className = '' }: { rows?: number; columns?: number; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl shadow-xl shadow-slate-950/40 overflow-hidden ${className}`}>
      {/* Table Header */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} variant="text" className="h-3.5 w-4/5" />
          ))}
        </div>
      </div>
      
      {/* Table Rows */}
      <div className="divide-y divide-slate-800/50">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} variant="text" className="h-3.5" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Native Phone View (< md) Card List Skeleton
 * Optimized for mobile ergonomics without horizontal scrollbars
 */
export function SkeletonMobileCardList({ count = 3, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 space-y-3 shadow-sm"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <Skeleton variant="circular" className="w-8 h-8 flex-shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <Skeleton variant="text" className="h-4 w-3/4" />
                <Skeleton variant="text" className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-5 w-16 rounded-full flex-shrink-0" />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/50">
            <Skeleton variant="text" className="h-3 w-4/5" />
            <Skeleton variant="text" className="h-3 w-3/5 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Calendar Grid Skeleton
 */
export function SkeletonCalendar({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-3xl border border-slate-800/80 bg-slate-900/70 p-5 sm:p-6 shadow-xl ${className}`}>
      {/* Calendar Header Month Bar */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton variant="text" className="h-6 w-36" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-xl" />
          <Skeleton className="h-8 w-8 rounded-xl" />
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} variant="text" className="h-3.5 w-8 mx-auto" />
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="min-h-[64px] sm:min-h-[88px] rounded-xl border border-slate-800/40 bg-slate-950/40 p-1.5 sm:p-2 space-y-1">
            <Skeleton variant="text" className="h-3 w-4 ml-auto" />
            {i % 3 === 0 && <Skeleton className="h-3.5 w-full rounded" />}
            {i % 5 === 0 && <Skeleton className="h-3.5 w-4/5 rounded" />}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Full Skeleton for Hub Submenus
 */
export function SkeletonSubMenu({ title = 'Memuatkan Sub-modul...' }: { title?: string }) {
  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto min-h-screen text-slate-100 animate-pulse-subtle">
      {/* Back button & Title banner */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-3.5 sm:gap-4">
          <Skeleton variant="circular" className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="h-3.5 w-64 max-w-full" />
          </div>
        </div>
      </div>

      {/* 4 KPI cards grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonKpiCard key={i} />
        ))}
      </div>

      {/* Module Choice Navigation Cards */}
      <div className="space-y-3 sm:space-y-4">
        <Skeleton variant="text" className="h-5 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl flex flex-col justify-between min-h-[170px]"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Skeleton className="w-11 h-11 rounded-xl" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton variant="text" className="h-5 w-3/4" />
                <SkeletonText lines={2} />
              </div>
              <Skeleton variant="text" className="h-3 w-24 mt-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Universal Page Skeleton Loader (Replacement for jarring white-screen PageLoader)
 */
export function ModulePageSkeleton() {
  return (
    <div className="w-full space-y-6 animate-pulse-subtle p-2 sm:p-4 text-slate-100 min-h-[80vh]">
      {/* Top Header Banner Skeleton */}
      <div className="bg-slate-900/60 backdrop-blur border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <Skeleton variant="circular" className="w-11 h-11 flex-shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 sm:w-64" />
            <Skeleton className="h-3.5 w-60 sm:w-80" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonKpiCard key={i} />
        ))}
      </div>

      {/* Content Area - Responsive Table / Card Grid */}
      <div className="space-y-4">
        <div className="hidden md:block">
          <SkeletonTable rows={6} columns={5} />
        </div>
        <div className="md:hidden">
          <SkeletonMobileCardList count={4} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonButton({ className = '' }: { className?: string }) {
  return <Skeleton className={`h-10 w-24 rounded-xl ${className}`} />;
}

export function SkeletonAvatar({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };
  
  return <Skeleton variant="circular" className={`${sizeMap[size]} ${className}`} />;
}

export function SkeletonForm({ fields = 3, className = '' }: { fields?: number; className?: string }) {
  return (
    <div className={`space-y-5 ${className}`}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton variant="text" className="h-3.5 w-24" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
