'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-lg bg-white transition-all duration-200 animate-in slide-in-from-bottom-2',
            toast.type === 'success' && 'border-emerald-200 text-zinc-900',
            toast.type === 'error' && 'border-rose-200 text-zinc-900',
            toast.type === 'info' && 'border-zinc-200 text-zinc-900'
          )}
        >
          {toast.type === 'success' && (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          )}
          {toast.type === 'error' && (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          )}
          {toast.type === 'info' && (
            <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
          )}

          <div className="flex-1 text-xs font-medium text-zinc-800 leading-relaxed">
            {toast.message}
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-zinc-400 hover:text-zinc-600 p-0.5 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
