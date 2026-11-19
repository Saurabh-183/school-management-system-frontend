'use client';

import React, { useState, useMemo } from 'react';
import { Session, User } from '@/lib/types';
import { SessionCard } from './SessionCard';
import { DateSelectorStrip } from './DateSelectorStrip';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import {
  Search,
  Filter,
  CalendarX,
  Plus,
  RefreshCw,
} from 'lucide-react';

interface AvailableSessionsListProps {
  sessions: Session[];
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  activeUser: User | null;
  onBookSession: (sessionId: string) => Promise<void>;
  onOpenCreateSession: () => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function AvailableSessionsList({
  sessions,
  selectedDate,
  onSelectDate,
  activeUser,
  onBookSession,
  onOpenCreateSession,
  isLoading = false,
  onRefresh,
}: AvailableSessionsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('ALL');
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Extract unique specializations for filter
  const specializations = useMemo(() => {
    const specs = new Set<string>();
    sessions.forEach((s) => {
      if (s.teacher?.specialization) {
        specs.add(s.teacher.specialization);
      }
    });
    return Array.from(specs);
  }, [sessions]);

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const teacherName = s.teacher?.fullName?.toLowerCase() || '';
      const spec = s.teacher?.specialization?.toLowerCase() || '';
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch = !query || teacherName.includes(query) || spec.includes(query);
      const matchesSpec =
        selectedSpecialization === 'ALL' ||
        s.teacher?.specialization === selectedSpecialization;

      return matchesSearch && matchesSpec;
    });
  }, [sessions, searchQuery, selectedSpecialization]);

  const handleBook = async (sessionId: string) => {
    try {
      setBookingId(sessionId);
      await onBookSession(sessionId);
    } finally {
      setBookingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Date Selector Strip */}
      <DateSelectorStrip
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        availableCountForDate={sessions.length}
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-zinc-200/80 shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search mentor or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 hover:bg-white focus:bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-colors text-zinc-900 placeholder:text-zinc-400"
          />
        </div>

        {/* Specialization Filter & Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="w-full text-xs font-medium border border-zinc-200 rounded-lg px-2.5 py-1.5 bg-zinc-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 text-zinc-800 transition-colors"
            >
              <option value="ALL">All Specializations</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="px-2"
              title="Refresh sessions"
            >
              <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
            </Button>
          )}
        </div>
      </div>

      {/* Grid of Available Sessions */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-zinc-200 p-4 space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200/90 p-10 text-center shadow-xs">
          <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto mb-3">
            <CalendarX className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900">
            No Available Sessions Found
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
            {searchQuery || selectedSpecialization !== 'ALL'
              ? 'No sessions match your search filters. Try clearing your filters.'
              : `There are no open session slots scheduled for ${selectedDate}. You can schedule a new slot for a mentor.`}
          </p>
          <Button variant="primary" size="sm" onClick={onOpenCreateSession}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Schedule Mentor Session
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.map((session) => (
            <SessionCard
              key={session._id}
              session={session}
              activeUser={activeUser}
              onBook={handleBook}
              isBooking={bookingId === session._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
