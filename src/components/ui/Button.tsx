import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none';

  const variantStyles = {
    primary:
      'bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm border border-zinc-900 active:bg-zinc-950',
    secondary:
      'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 border border-zinc-200/80',
    outline:
      'bg-white text-zinc-700 hover:bg-zinc-50 border border-zinc-200 shadow-xs hover:text-zinc-900',
    ghost:
      'bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 shadow-xs border border-rose-600',
    success:
      'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs border border-emerald-600',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 h-8',
    md: 'text-xs px-3.5 py-2 gap-2 h-9',
    lg: 'text-sm px-4 py-2.5 gap-2.5 h-10',
    icon: 'h-8 w-8 p-0',
  };

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {children}
    </button>
  );
}
