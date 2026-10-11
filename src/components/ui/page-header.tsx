import React from 'react';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  actions,
  icon,
  className,
}: PageHeaderProps): JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border-default/80',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className="p-2 rounded-lg bg-surface border border-border-default shadow-xs text-sky-400 mt-0.5">
            {icon}
          </div>
        )}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary">
              {title}
            </h1>
            {badge && <div className="inline-flex items-center">{badge}</div>}
          </div>
          {description && (
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
