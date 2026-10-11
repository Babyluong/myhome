import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: 1 | 2 | 3;
  interactive?: boolean;
  glow?: boolean;
}

export const Surface = forwardRef<HTMLDivElement, SurfaceProps>(
  ({ elevation = 1, interactive = false, glow = false, className, children, ...props }, ref) => {
    const elevationClasses = {
      1: 'bg-surface shadow-elevation-1 border border-border-default/80',
      2: 'bg-surface shadow-elevation-2 border border-border-default',
      3: 'bg-elevated shadow-elevation-3 border border-border-strong/90',
    }[elevation];

    const interactiveClasses = interactive
      ? 'transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-elevation-2 hover:border-sky-500/30 active:scale-[0.99] cursor-pointer'
      : '';

    const glowClasses = glow
      ? 'relative before:absolute before:-inset-px before:rounded-xl before:bg-gradient-to-r before:from-sky-500/20 before:to-teal-500/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:-z-10'
      : '';

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl text-text-primary backdrop-blur-[2px]',
          elevationClasses,
          interactiveClasses,
          glowClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Surface.displayName = 'Surface';
export default Surface;
