'use client';

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn, getDaysList } from '@/lib/utils';

interface DateSelectorStripProps {
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  availableCountForDate?: number;
}

export function DateSelectorStrip({
  selectedDate,
  onSelectDate,
  availableCountForDate,
}: DateSelectorStripProps) {
  const [days, setDays] = useState<
    { dateStr: string; dayName: string; dayNumber: number; isToday: boolean }[]
  >([]);

  useEffect(() => {
    setDays(getDaysList(10));
  }, []);

  return (
    <div className="bg-white border border-zinc-200/80 rounded-xl p-3 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5 px-1">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-zinc-500" />
          <span className="text-xs font-semibold text-zinc-900 tracking-tight">
            Select Date for Available Slots
          </span>
          <span className="text-[11px] text-zinc-500 font-mono">
            (API 3: Aggregation Query)
          </span>
        </div>

        {/* Custom date picker */}
        <div className="flex items-center gap-2">
          <label htmlFor="custom-date-input" className="text-[11px] text-zinc-500 font-medium">
            Jump to date:
          </label>
          <input
            id="custom-date-input"
            type="date"
            value={selectedDate}
            onChange={(e) => onSelectDate(e.target.value)}
            className="text-xs font-medium border border-zinc-200 rounded-md px-2 py-1 bg-zinc-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-colors text-zinc-800"
          />
        </div>
      </div>

      {/* Horizontal Scrollable Days */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {days.map((day) => {
          const isSelected = selectedDate === day.dateStr;
          return (
            <button
              key={day.dateStr}
              onClick={() => onSelectDate(day.dateStr)}
              className={cn(
                'flex-shrink-0 flex flex-col items-center justify-center min-w-[76px] py-2 px-3 rounded-lg border text-center transition-all duration-150',
                isSelected
                  ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
                  : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700'
              )}
            >
              <span
                className={cn(
                  'text-[10px] uppercase tracking-wider font-semibold',
                  isSelected ? 'text-zinc-300' : 'text-zinc-500'
                )}
              >
                {day.dayName}
              </span>
              <span className="text-sm font-bold tracking-tight my-0.5">
                {day.dayNumber}
              </span>
              <span
                className={cn(
                  'text-[9px] font-mono px-1 rounded',
                  isSelected ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-400'
                )}
              >
                {isSelected && availableCountForDate !== undefined
                  ? `${availableCountForDate} slots`
                  : day.isToday
                  ? 'Today'
                  : ''}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
