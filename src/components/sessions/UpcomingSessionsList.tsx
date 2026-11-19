'use client';

import React, { useState } from 'react';
import { Session } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Calendar,
  Clock,
  CheckCircle2,
  CalendarClock,
  GraduationCap,
} from 'lucide-react';
import { formatTimeUTC, formatDate, getInitials } from '@/lib/utils';

interface UpcomingSessionsListProps {
  sessions: Session[];
  onCompleteSession: (sessionId: string) => Promise<void>;
  isLoading?: boolean;
}

export function UpcomingSessionsList({
  sessions,
  onCompleteSession,
  isLoading = false,
}: UpcomingSessionsListProps) {
  const [completingId, setCompletingId] = useState<string | null>(null);

  const handleComplete = async (sessionId: string) => {
    try {
      setCompletingId(sessionId);
      await onCompleteSession(sessionId);
    } finally {
      setCompletingId(null);
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-zinc-200/90 p-8 text-center shadow-xs">
        <CalendarClock className="w-8 h-8 text-zinc-300 mx-auto mb-2.5" />
        <h4 className="text-xs font-semibold text-zinc-800">No Upcoming Sessions</h4>
        <p className="text-[11px] text-zinc-500 mt-0.5">
          You don't have any booked sessions waiting. Browse available sessions to book one!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <div
          key={session._id}
          className="bg-white rounded-xl border border-zinc-200/90 shadow-xs hover:border-zinc-300 p-4 transition-all"
        >
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-800 border border-sky-100 flex items-center justify-center font-semibold text-xs">
                {getInitials(session.teacher?.fullName)}
              </div>
              <div>
                <h5 className="text-xs font-semibold text-zinc-900 tracking-tight">
                  {session.teacher?.fullName}
                </h5>
                <p className="text-[11px] text-zinc-500">
                  {session.teacher?.specialization}
                </p>
              </div>
            </div>

            <Badge variant="booked" size="sm">
              Booked
            </Badge>
          </div>

          <div className="bg-zinc-50/80 rounded-lg p-2.5 border border-zinc-100 text-[11px] space-y-1 mb-3">
            <div className="flex items-center justify-between text-zinc-600">
              <span className="flex items-center gap-1.5 text-zinc-500">
                <Calendar className="w-3 h-3 text-zinc-400" /> Date:
              </span>
              <span className="font-medium text-zinc-900">
                {formatDate(session.startTime)}
              </span>
            </div>

            <div className="flex items-center justify-between text-zinc-600">
              <span className="flex items-center gap-1.5 text-zinc-500">
                <Clock className="w-3 h-3 text-zinc-400" /> Time (UTC):
              </span>
              <span className="font-mono font-medium text-zinc-900">
                {formatTimeUTC(session.startTime)} – {formatTimeUTC(session.endTime)}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 hover:border-emerald-200 border-zinc-200"
            onClick={() => handleComplete(session._id)}
            isLoading={completingId === session._id}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mark Session Complete (API 5)</span>
          </Button>
        </div>
      ))}
    </div>
  );
}
