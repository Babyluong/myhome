import React from 'react';
import { cn } from '@/lib/utils';

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  ambientDepth?: boolean;
}

export function AppShell({
  children,
  ambientDepth = true,
  className,
  ...props
}: AppShellProps): JSX.Element {
  return (
    <div
      className={cn(
        'relative min-h-screen bg-canvas text-text-primary antialiased selection:bg-sky-500/20 selection:text-sky-300',
        ambientDepth && 'overflow-x-hidden',
        className
      )}
      {...props}
    >
      {ambientDepth && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-sky-500/[0.04] dark:bg-sky-500/[0.06] blur-3xl" />
          <div className="absolute top-1/3 -right-40 h-[30rem] w-[30rem] rounded-full bg-teal-500/[0.03] dark:bg-teal-500/[0.05] blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/[0.03] dark:bg-indigo-500/[0.04] blur-3xl" />
        </div>
      )}
      {children}
    </div>
  );
}

export default AppShell;
