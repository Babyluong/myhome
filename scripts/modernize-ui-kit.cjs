const fs = require('fs');
const path = require('path');

console.log('=== Starting Modern Linear/21st.dev UI Kit Transformation ===');

// ========================================================
// 1. OVERHAUL src/shared/components/ui/StatCard.tsx
// ========================================================
function updateStatCard() {
  const filePath = 'src/shared/components/ui/StatCard.tsx';
  const newContent = `import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronRight, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ElementType
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'teal' | 'emerald' | 'sky' | 'amber' | 'rose' | 'indigo' | 'purple'
  link?: string
  subtitle?: string
  loading?: boolean
  className?: string
}

const colorMap: Record<string, { icon: string; badge: string; highlight: string }> = {
  primary: {
    icon: 'bg-accent-base/10 text-accent-base border-accent-base/20',
    badge: 'bg-accent-base/10 text-accent-base border-accent-base/20',
    highlight: 'from-accent-base/20 to-transparent',
  },
  success: {
    icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    highlight: 'from-emerald-500/20 to-transparent',
  },
  emerald: {
    icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    highlight: 'from-emerald-500/20 to-transparent',
  },
  warning: {
    icon: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    highlight: 'from-amber-500/20 to-transparent',
  },
  amber: {
    icon: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    highlight: 'from-amber-500/20 to-transparent',
  },
  error: {
    icon: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    highlight: 'from-rose-500/20 to-transparent',
  },
  rose: {
    icon: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    highlight: 'from-rose-500/20 to-transparent',
  },
  info: {
    icon: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    highlight: 'from-sky-500/20 to-transparent',
  },
  sky: {
    icon: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    highlight: 'from-sky-500/20 to-transparent',
  },
  teal: {
    icon: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    highlight: 'from-teal-500/20 to-transparent',
  },
  indigo: {
    icon: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    highlight: 'from-indigo-500/20 to-transparent',
  },
  purple: {
    icon: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    highlight: 'from-purple-500/20 to-transparent',
  },
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color = 'primary',
  link,
  subtitle,
  loading = false,
  className,
}) => {
  if (loading) {
    return (
      <div className={cn("p-5 rounded-2xl border border-border-default bg-surface/80 backdrop-blur-sm shadow-2xs animate-pulse-subtle", className)}>
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-subtle animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-20 bg-subtle rounded animate-pulse" />
          <div className="h-7 w-24 bg-subtle rounded animate-pulse" />
          <div className="h-2.5 w-32 bg-subtle/70 rounded animate-pulse mt-1" />
        </div>
      </div>
    )
  }

  const theme = colorMap[color] || colorMap.primary
  const isPositive = change !== undefined && change >= 0

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        'group relative bg-surface/90 backdrop-blur-md p-5 rounded-2xl border border-border-default shadow-2xs transition-all duration-200 hover:border-border-strong hover:shadow-xs hover:-translate-y-0.5 active:scale-[0.98] overflow-hidden',
        link && 'cursor-pointer',
        className
      )}
    >
      {/* Top subtle hairline highlight */}
      <div className={cn("absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r opacity-60 group-hover:opacity-100 transition-opacity", theme.highlight)} />

      {/* Background Icon Watermark */}
      <div className="absolute top-2 right-2 p-3 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none text-text-primary">
        <Icon size={64} strokeWidth={1.2} />
      </div>

      <div className="relative flex flex-col h-full justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className={cn(
            'w-10 h-10 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105 duration-200',
            theme.icon
          )}>
            <Icon className="w-5 h-5" />
          </div>

          {change !== undefined && (
            <div
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border tabular-nums',
                isPositive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
              )}
            >
              <TrendingUp className={cn('w-3 h-3', !isPositive && 'rotate-180')} />
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>

        <div>
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-text-primary tracking-tight tabular-nums">
            {value}
          </div>

          {subtitle && (
            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border-default/80">
              <span className="text-xs text-text-muted font-normal truncate">
                {subtitle}
              </span>
              {link && (
                <ChevronRight className="w-3.5 h-3.5 text-text-muted group-hover:text-text-primary group-hover:translate-x-0.5 transition-transform" />
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )

  if (link) {
    return <Link to={link}>{content}</Link>
  }

  return content
}
`;
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log('✓ Updated', filePath);
}

// ========================================================
// 2. OVERHAUL src/shared/components/ui/Card.tsx
// ========================================================
function updateCard() {
  const filePath = 'src/shared/components/ui/Card.tsx';
  const newContent = `import type { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
};

export function Card({ children, className, hover = false, onClick }: CardProps) {
  const hoverClasses = hover 
    ? 'hover:border-border-strong hover:shadow-xs cursor-pointer transition-all duration-200 ease-out active:scale-[0.99] hover:-translate-y-[1px]' 
    : '';
  
  return (
    <div 
      className={\`rounded-2xl border border-border-default bg-surface/90 backdrop-blur-sm shadow-2xs text-text-primary transition-colors \${hoverClasses} \${className ?? ''}\`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, actions }: { children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <div className={\`px-5 sm:px-6 pt-5 pb-4 border-b border-border-default flex items-center justify-between \${className ?? ''}\`}>
      <div className="flex-1">{children}</div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function CardTitle({ children, className, subtitle }: { children: ReactNode; className?: string; subtitle?: string }) {
  return (
    <div>
      <h3 className={\`text-sm sm:text-base font-semibold tracking-tight text-text-primary \${className ?? ''}\`}>{children}</h3>
      {subtitle && <p className="text-xs text-text-muted mt-0.5 font-normal">{subtitle}</p>}
    </div>
  );
}

export function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={\`text-xs sm:text-sm text-text-secondary mt-1 leading-relaxed \${className ?? ''}\`}>{children}</p>;
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={\`px-5 sm:px-6 py-4 sm:py-5 \${className ?? ''}\`}>{children}</div>;
}

export function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={\`px-5 sm:px-6 pb-5 pt-3 border-t border-border-default flex items-center justify-between \${className ?? ''}\`}>{children}</div>;
}
`;
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log('✓ Updated', filePath);
}

// ========================================================
// 3. OVERHAUL src/shared/components/ui/Badge.tsx
// ========================================================
function updateBadge() {
  const filePath = 'src/shared/components/ui/Badge.tsx';
  const newContent = `import React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'gray' | 'primary'
  size?: 'sm' | 'md'
  children: React.ReactNode
  className?: string
  dot?: boolean
}

const variants: Record<string, string> = {
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  error: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  info: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  gray: 'bg-subtle text-text-muted border-border-default',
  primary: 'bg-accent-base/10 text-accent-base border-accent-base/20',
}

const dotColors: Record<string, string> = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-rose-500',
  info: 'bg-sky-500',
  gray: 'bg-text-muted',
  primary: 'bg-accent-base',
}

const sizes: Record<string, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-0.5 text-xs',
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'gray',
  size = 'md',
  children,
  className,
  dot = false,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium border tracking-tight transition-colors',
        variants[variant] || variants.gray,
        sizes[size] || sizes.md,
        className
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant] || dotColors.gray)} />
      )}
      {children}
    </span>
  )
}

export default Badge
`;
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log('✓ Updated', filePath);
}

// ========================================================
// 4. OVERHAUL src/shared/components/ui/tabs.tsx
// ========================================================
function updateTabs() {
  const filePath = 'src/shared/components/ui/tabs.tsx';
  const newContent = `"use client";

import * as React from "react";

export function Tabs({ value, onValueChange, className = "", children }: { value: string; onValueChange: (v: string) => void; className?: string; children: React.ReactNode; }) {
  return (
    <div className={className}>
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child as any, { tabsValue: value, setTabsValue: onValueChange });
      })}
    </div>
  );
}

export function TabsList({ className = "", children, tabsValue, setTabsValue }: any) {
  return (
    <div className={\`inline-flex items-center gap-1 p-1 bg-subtle/80 border border-border-default rounded-xl \${className}\`}>
      {React.Children.map(children, (child: any) => React.cloneElement(child, { tabsValue, setTabsValue }))}
    </div>
  );
}

export function TabsTrigger({ value, children, className = "", tabsValue, setTabsValue }: any) {
  const active = tabsValue === value;
  return (
    <button
      onClick={() => setTabsValue(value)}
      className={\`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 active:scale-[0.98] border \${
        active
          ? "bg-surface text-text-primary shadow-xs border-border-default/80"
          : "border-transparent text-text-muted hover:text-text-primary hover:bg-surface/50"
      } \${className}\`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className = "", tabsValue }: any) {
  if (tabsValue !== value) return null;
  return <div className={className}>{children}</div>;
}
`;
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log('✓ Updated', filePath);
}

// ========================================================
// 5. UPDATE src/index.css UTILITIES
// ========================================================
function updateIndexCss() {
  const filePath = 'src/index.css';
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('.bento-highlight')) {
    const modernUtilities = `
  /* Modern 21st.dev / Linear Minimalist Utilities */
  .bento-highlight {
    position: relative;
    overflow: hidden;
  }
  .bento-highlight::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 113, 227, 0.4), transparent);
  }
  .card-glow {
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .card-glow:hover {
    border-color: var(--border-strong);
    box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.05);
  }
`;
    content = content.replace('.tabular-nums {', `${modernUtilities}\n  .tabular-nums {`);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✓ Updated', filePath, 'with modern 21st.dev utilities');
  }
}

// ========================================================
// 6. MODERNIZE src/modules/mykunci/pages/KunciDashboardPage.tsx
// ========================================================
function updateKunciDashboard() {
  const filePath = 'src/modules/mykunci/pages/KunciDashboardPage.tsx';
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace KPI Stats block with modern 21st.dev Bento KPI layout
  const oldStatsTarget = /\{\/\* Hospital KPI Stats \*\/\}[\s\S]*?\{\/\* Hospital Departments Grid \*\/\}/;

  const newStatsBlock = `{\/* Hospital KPI Stats *\/}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <div className="group relative bg-surface/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-border-default shadow-2xs hover:border-border-strong transition-all duration-200 hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent-base/40 to-transparent" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              Total Master Keys
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent-base/10 text-accent-base border border-accent-base/20">
              Registry
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-text-primary mt-1 tabular-nums">
            {loading ? <Skeleton className="h-7 w-12 bg-subtle inline-block rounded" /> : stats.total}
          </div>
        </div>

        <div className="group relative bg-surface/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-border-default shadow-2xs hover:border-border-strong transition-all duration-200 hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/40 to-transparent" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              Available
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              In Storage
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 mt-1 tabular-nums">
            {loading ? <Skeleton className="h-7 w-12 bg-subtle inline-block rounded" /> : stats.available}
          </div>
        </div>

        <div className="group relative bg-surface/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-border-default shadow-2xs hover:border-border-strong transition-all duration-200 hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500/40 to-transparent" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              Borrowed
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Active Loan
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-500 mt-1 tabular-nums">
            {loading ? <Skeleton className="h-7 w-12 bg-subtle inline-block rounded" /> : stats.borrowed}
          </div>
        </div>

        <div className="group relative bg-surface/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-border-default shadow-2xs hover:border-border-strong transition-all duration-200 hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-rose-500/40 to-transparent" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              Overdue
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              Alert
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-rose-600 mt-1 tabular-nums">
            {loading ? <Skeleton className="h-7 w-12 bg-subtle inline-block rounded" /> : stats.overdue}
          </div>
        </div>

        <div className="group relative bg-surface/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-border-default shadow-2xs hover:border-border-strong transition-all duration-200 hover:-translate-y-0.5 overflow-hidden col-span-2 md:col-span-1">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-text-muted/30 to-transparent" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              Damaged / Lost
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-subtle text-text-muted border border-border-default">
              Audit
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-text-muted mt-1 tabular-nums">
            {loading ? <Skeleton className="h-7 w-12 bg-subtle inline-block rounded" /> : (stats.damaged + stats.lost)}
          </div>
        </div>
      </div>

      {/* Hospital Departments Grid */}`;

  if (oldStatsTarget.test(content)) {
    content = content.replace(oldStatsTarget, newStatsBlock);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✓ Updated KPI Stats in', filePath);
  } else {
    console.warn('Could not match old stats block in', filePath);
  }
}

// Execute all transforms
updateStatCard();
updateCard();
updateBadge();
updateTabs();
updateIndexCss();
updateKunciDashboard();

console.log('=== All modern UI transformations completed successfully ===');
