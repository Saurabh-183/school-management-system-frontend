'use client';

import React from 'react';
import { User } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { getInitials } from '@/lib/utils';
import {
  Calendar,
  UserPlus,
  Plus,
  Code2,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  activeUser: User | null;
  onOpenUserSwitcher: () => void;
  onOpenCreateUser: () => void;
  onOpenCreateSession: () => void;
  onOpenInspector: () => void;
}

export function Navbar({
  activeUser,
  onOpenUserSwitcher,
  onOpenCreateUser,
  onOpenCreateSession,
  onOpenInspector,
}: NavbarProps) {
  return (
    <header className="border-b border-zinc-200/80 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm tracking-tight text-zinc-900">
                  Mentora
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-semibold tracking-wider">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 hidden sm:block">
                Session Booking Platform
              </p>
            </div>
          </div>

          {/* Backend Status indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/70 border border-emerald-200/60 text-emerald-700 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>REST API Active :5000</span>
          </div>
        </div>

        {/* Right Section: Actions & User Switcher */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* API Inspector Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenInspector}
            className="hidden sm:inline-flex text-zinc-600 hover:text-zinc-900 gap-1.5"
            title="Inspect MongoDB Aggregation Pipelines"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="text-xs">Pipeline Inspector</span>
          </Button>

          {/* Schedule Session (API 2) */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenCreateSession}
            className="gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Schedule Session</span>
            <span className="sm:hidden">Session</span>
          </Button>

          {/* Active Student Pill / Switcher */}
          <button
            onClick={onOpenUserSwitcher}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-zinc-200/90 hover:bg-zinc-50 hover:border-zinc-300 transition-all text-left group"
          >
            <div className="w-6 h-6 rounded-md bg-zinc-900 text-white flex items-center justify-center font-medium text-[11px]">
              {getInitials(activeUser?.fullName)}
            </div>
            <div className="hidden lg:block">
              <p className="text-xs font-medium text-zinc-900 leading-tight">
                {activeUser?.fullName || 'Select Student'}
              </p>
              <p className="text-[10px] text-zinc-500 leading-tight truncate max-w-[120px]">
                {activeUser?.email || 'No user selected'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
          </button>
        </div>
      </div>
    </header>
  );
}
