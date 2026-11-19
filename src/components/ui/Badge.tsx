import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'available' | 'booked' | 'completed' | 'neutral' | 'outline' | 'accent';
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'neutral',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    available: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    booked: 'bg-sky-50 text-sky-700 border-sky-200/80',
    completed: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    neutral: 'bg-zinc-100 text-zinc-700 border-zinc-200/70',
    outline: 'bg-transparent text-zinc-600 border-zinc-300',
    accent: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 tracking-tight font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border font-sans select-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
