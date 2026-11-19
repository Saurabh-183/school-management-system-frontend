'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Dialog container */}
      <div
        className={cn(
          'relative w-full bg-white rounded-xl border border-zinc-200/90 shadow-xl overflow-hidden z-10 transition-all duration-150 animate-in zoom-in-95',
          maxWidthStyles[maxWidth]
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-zinc-100">
          <div>
            <h3 className="text-base font-semibold text-zinc-900 tracking-tight">{title}</h3>
            {description && <p className="text-xs text-zinc-500 mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
