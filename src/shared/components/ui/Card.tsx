import type { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
};

export function Card({ children, className, hover = false, onClick }: CardProps) {
  const hoverClasses = hover 
    ? 'hover:border-border-strong hover:bg-subtle/30 cursor-pointer transition-all duration-150 ease-out active:scale-[0.99]' 
    : '';
  
  return (
    <div 
      className={`rounded-xl border border-border-default bg-surface shadow-2xs text-text-primary ${hoverClasses} ${className ?? ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, actions }: { children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <div className={`px-6 pt-5 pb-4 border-b border-border-default flex items-center justify-between ${className ?? ''}`}>
      <div className="flex-1">{children}</div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function CardTitle({ children, className, subtitle }: { children: ReactNode; className?: string; subtitle?: string }) {
  return (
    <div>
      <h3 className={`text-base font-semibold tracking-tight text-text-primary ${className ?? ''}`}>{children}</h3>
      {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
    </div>
  );
}

export function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={`text-sm text-text-secondary mt-1 leading-relaxed ${className ?? ''}`}>{children}</p>;
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`px-6 py-4 ${className ?? ''}`}>{children}</div>;
}

export function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`px-6 pb-5 pt-3 border-t border-border-default ${className ?? ''}`}>{children}</div>;
}
