'use client';

import React from 'react';
import { Session, User } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Clock,
  Briefcase,
  GraduationCap,
  CalendarCheck2,
  Sparkles,
} from 'lucide-react';
import { formatTimeUTC, getDurationMinutes, getInitials } from '@/lib/utils';

interface SessionCardProps {
  session: Session;
  activeUser: User | null;
  onBook: (sessionId: string) => Promise<void>;
  isBooking?: boolean;
}

export function SessionCard({
  session,
  activeUser,
  onBook,
  isBooking = false,
}: SessionCardProps) {
  const teacher = session.teacher;
  const duration = getDurationMinutes(session.startTime, session.endTime);

  return (
    <div className="bg-white rounded-xl border border-zinc-200/90 shadow-xs hover:border-zinc-300 hover:shadow-sm transition-all duration-150 p-4 flex flex-col justify-between gap-4">
      <div>
        {/* Card Header: Teacher info & status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200 flex items-center justify-center font-semibold text-xs tracking-tight flex-shrink-0">
              {getInitials(teacher?.fullName)}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-900 tracking-tight leading-tight">
                {teacher?.fullName || 'Assigned Mentor'}
              </h4>
              <p className="text-[11px] text-zinc-500 truncate max-w-[170px]">
                {teacher?.email}
              </p>
            </div>
          </div>

          <Badge variant="available" size="sm">
            Available
          </Badge>
        </div>

        {/* Specialization & Experience */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
            <GraduationCap className="w-3 h-3 text-zinc-500" />
            {teacher?.specialization || 'General Mentorship'}
          </span>
          {teacher?.experience !== undefined && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-zinc-50 text-zinc-600 border border-zinc-200/60">
              <Briefcase className="w-3 h-3 text-zinc-400" />
              {teacher.experience} yrs exp
            </span>
          )}
        </div>

        {/* Time Slot Details */}
        <div className="bg-zinc-50/80 rounded-lg p-2.5 border border-zinc-100 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-zinc-700">
            <span className="flex items-center gap-1.5 text-zinc-500">
              <Clock className="w-3.5 h-3.5 text-zinc-400" /> Time Window:
            </span>
            <span className="font-mono font-medium text-zinc-900">
              {formatTimeUTC(session.startTime)} – {formatTimeUTC(session.endTime)}
            </span>
          </div>

          <div className="flex items-center justify-between text-zinc-700 pt-1 border-t border-zinc-200/60 text-[11px]">
            <span className="text-zinc-500">Session Duration:</span>
            <span className="font-semibold text-zinc-900 font-mono">
              {duration} minutes
            </span>
          </div>
        </div>
      </div>

      {/* Booking Action */}
      <div className="pt-1">
        <Button
          variant="primary"
          size="md"
          className="w-full justify-center"
          onClick={() => onBook(session._id)}
          isLoading={isBooking}
          disabled={!activeUser}
        >
          <CalendarCheck2 className="w-3.5 h-3.5" />
          <span>
            {activeUser
              ? `Book Slot for ${activeUser.fullName.split(' ')[0]}`
              : 'Select Student to Book'}
          </span>
        </Button>
      </div>
    </div>
  );
}
