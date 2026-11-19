'use client';

import React from 'react';
import { Calendar, History, Users, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { User } from '@/lib/types';

interface SubHeaderProps {
  activeTab: 'browse' | 'my-sessions' | 'teachers';
  onTabChange: (tab: 'browse' | 'my-sessions' | 'teachers') => void;
  availableCount: number;
  upcomingCount: number;
  completedCount: number;
  teachersCount: number;
  activeUser: User | null;
  onOpenUserSwitcher: () => void;
}

export function SubHeader({
  activeTab,
  onTabChange,
  availableCount,
  upcomingCount,
  completedCount,
  teachersCount,
  activeUser,
  onOpenUserSwitcher,
}: SubHeaderProps) {
  return (
    <div className="border-b border-zinc-200/80 bg-white/70 backdrop-blur-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3">
          {/* Main Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2" aria-label="Tabs">
            <button
              onClick={() => onTabChange('browse')}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-all -mb-[1px]',
                activeTab === 'browse'
                  ? 'border-zinc-900 text-zinc-950 font-semibold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300'
              )}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Available Sessions</span>
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-100 text-zinc-600 font-mono">
                {availableCount}
              </span>
            </button>

            <button
              onClick={() => onTabChange('my-sessions')}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-all -mb-[1px]',
                activeTab === 'my-sessions'
                  ? 'border-zinc-900 text-zinc-950 font-semibold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300'
              )}
            >
              <History className="w-3.5 h-3.5" />
              <span>My Sessions</span>
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-sky-50 text-sky-700 font-mono font-medium">
                {upcomingCount}
              </span>
              {completedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-100 text-zinc-600 font-mono">
                  {completedCount} done
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange('teachers')}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-all -mb-[1px]',
                activeTab === 'teachers'
                  ? 'border-zinc-900 text-zinc-950 font-semibold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300'
              )}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Teachers Directory</span>
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-100 text-zinc-600 font-mono">
                {teachersCount}
              </span>
            </button>
          </nav>

          {/* Active Context Banner */}
          <div className="flex items-center gap-2 pb-2 sm:pb-0 text-xs text-zinc-500">
            <UserCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span>Booking as:</span>
            <span className="font-medium text-zinc-900 truncate max-w-[160px]">
              {activeUser?.fullName || 'Guest'}
            </span>
            <button
              onClick={onOpenUserSwitcher}
              className="text-[11px] text-zinc-500 hover:text-zinc-900 underline underline-offset-2 ml-1"
            >
              Switch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
