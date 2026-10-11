"use client";

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
    <div className={`inline-flex items-center gap-1 p-1 bg-subtle/80 border border-border-default rounded-xl ${className}`}>
      {React.Children.map(children, (child: any) => React.cloneElement(child, { tabsValue, setTabsValue }))}
    </div>
  );
}

export function TabsTrigger({ value, children, className = "", tabsValue, setTabsValue }: any) {
  const active = tabsValue === value;
  return (
    <button
      onClick={() => setTabsValue(value)}
      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-[transform,opacity,box-shadow,border-color] duration-150 active:scale-[0.98] border ${
        active
          ? "bg-surface text-text-primary shadow-xs border-border-default/80"
          : "border-transparent text-text-muted hover:text-text-primary hover:bg-surface/50"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className = "", tabsValue }: any) {
  if (tabsValue !== value) return null;
  return <div className={className}>{children}</div>;
}
