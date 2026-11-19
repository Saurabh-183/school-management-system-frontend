'use client';

import React from 'react';
import { UserSessionsResponse } from '@/lib/types';
import { UpcomingSessionsList } from './UpcomingSessionsList';
import { CompletedSessionsList } from './CompletedSessionsList';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  User as UserIcon,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  Database,
  RefreshCw,
} from 'lucide-react';

interface UserSessionsDashboardProps {
  userSessions: UserSessionsResponse | null;
  onCompleteSession: (sessionId: string) => Promise<void>;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function UserSessionsDashboard({
  userSessions,
  onCompleteSession,
  onRefresh,
  isLoading = false,
}: UserSessionsDashboardProps) {
  if (!userSessions) {
    return (
      <div className="bg-white rounded-xl border border-zinc-200/90 p-12 text-center shadow-xs">
        <UserIcon className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-zinc-900">No Student Selected</h3>
        <p className="text-xs text-zinc-500 mt-1">
          Please select a student from the top navigation to view their booked sessions.
        </p>
      </div>
    );
  }

  const { user, upcomingSessions = [], completedSessions = [] } = userSessions;

  return (
    <div className="space-y-6">
      {/* Student Profile Card & Aggregation Notice */}
      <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
              Student Profile
            </span>
            <Badge variant="outline" size="sm">
              <Database className="w-3 h-3 text-zinc-500" />
              API 6: Aggregation $facet
            </Badge>
          </div>
          <h2 className="text-base font-bold text-zinc-900 tracking-tight">
            {user.fullName}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 mt-1">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-zinc-400" />
              {user.email}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-zinc-400" />
              {user.phone}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-3">
          <div className="bg-sky-50/70 border border-sky-100 rounded-lg px-3.5 py-2 text-center min-w-[90px]">
            <span className="text-[10px] uppercase font-bold text-sky-800 tracking-wider">
              Upcoming
            </span>
            <p className="text-base font-bold text-sky-950 font-mono">
              {upcomingSessions.length}
            </p>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-100 rounded-lg px-3.5 py-2 text-center min-w-[90px]">
            <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
              Completed
            </span>
            <p className="text-base font-bold text-emerald-950 font-mono">
              {completedSessions.length}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            isLoading={isLoading}
            className="h-12 px-3"
            title="Refresh User Sessions"
          >
            <RefreshCw className="w-3.5 h-3.5 text-zinc-600" />
          </Button>
        </div>
      </div>

      {/* 2-Column Split: Upcoming Sessions vs Completed Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Upcoming Sessions */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-sky-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Upcoming Sessions ({upcomingSessions.length})
              </h3>
            </div>
            <span className="text-[11px] text-zinc-500 font-mono">status: BOOKED</span>
          </div>

          <UpcomingSessionsList
            sessions={upcomingSessions}
            onCompleteSession={onCompleteSession}
            isLoading={isLoading}
          />
        </div>

        {/* Right Column: Completed Sessions */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Completed Sessions ({completedSessions.length})
              </h3>
            </div>
            <span className="text-[11px] text-zinc-500 font-mono">status: COMPLETED</span>
          </div>

          <CompletedSessionsList sessions={completedSessions} />
        </div>
      </div>
    </div>
  );
}
