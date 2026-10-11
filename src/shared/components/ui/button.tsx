"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = 
  | "default" 
  | "primary"
  | "secondary"
  | "outline" 
  | "ghost" 
  | "destructive"
  | "success"
  | "warning";

type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-teal-700 text-white hover:bg-teal-800 active:bg-teal-900 dark:bg-teal-600 dark:hover:bg-teal-500 dark:text-slate-950 border border-teal-800/30 dark:border-teal-500/30 focus-visible:ring-teal-500 shadow-xs active:scale-[0.98]",
  primary:
    "bg-teal-700 text-white hover:bg-teal-800 active:bg-teal-900 dark:bg-teal-600 dark:hover:bg-teal-500 dark:text-slate-950 border border-teal-800/30 dark:border-teal-500/30 focus-visible:ring-teal-500 shadow-xs active:scale-[0.98]",
  secondary:
    "bg-surface text-text-secondary hover:bg-subtle active:bg-muted-surface border border-border-default hover:border-border-strong text-text-primary dark:text-slate-200 focus-visible:ring-slate-400 shadow-xs active:scale-[0.98]",
  outline:
    "bg-transparent text-text-primary border border-border-default hover:bg-subtle active:bg-muted-surface hover:border-border-strong focus-visible:ring-teal-500 shadow-xs active:scale-[0.98]",
  ghost: 
    "bg-transparent text-text-secondary hover:bg-subtle active:bg-muted-surface hover:text-text-primary focus-visible:ring-teal-500 active:scale-[0.98]",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 border border-red-700/40 focus-visible:ring-red-500 shadow-xs active:scale-[0.98]",
  success:
    "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 border border-emerald-700/40 focus-visible:ring-emerald-500 shadow-xs active:scale-[0.98]",
  warning:
    "bg-amber-600 text-white hover:bg-amber-700 active:bg-amber-800 border border-amber-700/40 focus-visible:ring-amber-500 shadow-xs active:scale-[0.98]",
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: "h-7 px-2.5 text-xs gap-1",
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
  xl: "h-14 px-8 text-lg gap-2.5",
};

const Spinner = ({ size = "sm" }: { size?: "xs" | "sm" | "md" | "lg" }) => {
  const sizeMap = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };
  
  return (
    <svg
      className={`animate-spin ${sizeMap[size]}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className = "", 
    variant = "default", 
    size = "md",
    loading = false,
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    asChild = false,
    ...props 
  }, ref) => {
    const isAnyLoading = loading || isLoading;
    const spinnerSize = size === "xs" ? "xs" : size === "sm" ? "sm" : size === "lg" || size === "xl" ? "lg" : "md";
    
    const buttonClasses = cn(
      "inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none select-none",
      variantClasses[variant],
      sizeClasses[size],
      className
    );
    
    // If asChild is true, render children directly with the classes applied
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...children.props,
        className: `${buttonClasses} ${children.props.className || ''}`,
      } as any);
    }
    
    return (
      <button
        ref={ref}
        disabled={disabled || isAnyLoading}
        className={buttonClasses}
        {...props}
      >
        {isAnyLoading && <Spinner size={spinnerSize} />}
        {!isAnyLoading && leftIcon && <span className="inline-flex">{leftIcon}</span>}
        {children}
        {!isAnyLoading && rightIcon && <span className="inline-flex">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;



