'use client';

import React from 'react';
import { Session } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Award,
} from 'lucide-react';
import { formatTimeUTC, formatDate, formatDateTime, getInitials } from '@/lib/utils';

interface CompletedSessionsListProps {
  sessions: Session[];
}

export function CompletedSessionsList({ sessions }: CompletedSessionsListProps) {
  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-zinc-200/90 p-8 text-center shadow-xs">
        <Award className="w-8 h-8 text-zinc-300 mx-auto mb-2.5" />
        <h4 className="text-xs font-semibold text-zinc-800">No Completed Sessions Yet</h4>
        <p className="text-[11px] text-zinc-500 mt-0.5">
          Sessions you attend and complete will be recorded in this permanent learning log.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <div
          key={session._id}
          className="bg-white rounded-xl border border-zinc-200/90 shadow-xs p-4 opacity-95 hover:opacity-100 transition-opacity"
        >
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 border border-zinc-200 flex items-center justify-center font-semibold text-xs">
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

            <Badge variant="completed" size="sm">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Completed
            </Badge>
          </div>

          <div className="bg-zinc-50/80 rounded-lg p-2.5 border border-zinc-100 text-[11px] space-y-1">
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
                <Clock className="w-3 h-3 text-zinc-400" /> Slot Time (UTC):
              </span>
              <span className="font-mono font-medium text-zinc-900">
                {formatTimeUTC(session.startTime)} – {formatTimeUTC(session.endTime)}
              </span>
            </div>

            {session.completedAt && (
              <div className="flex items-center justify-between pt-1 border-t border-zinc-200/60 text-emerald-700">
                <span>Completed At:</span>
                <span className="font-medium font-mono text-[10px]">
                  {formatDateTime(session.completedAt)}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
