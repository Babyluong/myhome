import React from 'react';

interface SkeletonProps {
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
