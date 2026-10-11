import type { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
};

export function Card({ children, className, hover = false, onClick }: CardProps) {
  const hoverClasses = hover 
    ? 'hover:border-border-strong hover:shadow-xs cursor-pointer transition-[transform,opacity,box-shadow,border-color] duration-200 ease-out active:scale-[0.99] hover:-translate-y-[1px]' 
    : '';
  
  return (
    <div 
      className={`rounded-2xl border border-border-default bg-surface/90 backdrop-blur-sm shadow-elevation-1 text-text-primary transition-colors ${hoverClasses} ${className ?? ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, actions }: { children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <div className={`px-5 sm:px-6 pt-5 pb-4 border-b border-border-default flex items-center justify-between ${className ?? ''}`}>
      <div className="flex-1">{children}</div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function CardTitle({ children, className, subtitle }: { children: ReactNode; className?: string; subtitle?: string }) {
  return (
    <div>
      <h3 className={`text-sm sm:text-base font-semibold tracking-tight text-text-primary ${className ?? ''}`}>{children}</h3>
      {subtitle && <p className="text-xs text-text-muted mt-0.5 font-normal">{subtitle}</p>}
    </div>
  );
}

export function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={`text-xs sm:text-sm text-text-secondary mt-1 leading-relaxed ${className ?? ''}`}>{children}</p>;
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`px-5 sm:px-6 py-4 sm:py-5 ${className ?? ''}`}>{children}</div>;
}

export function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`px-5 sm:px-6 pb-5 pt-3 border-t border-border-default flex items-center justify-between ${className ?? ''}`}>{children}</div>;
}
