'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Teacher } from '@/lib/types';
import { PlusCircle, AlertCircle } from 'lucide-react';

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: Teacher[];
  onSubmit: (data: { teacherId: string; startTime: string; endTime: string }) => Promise<void>;
  defaultTeacherId?: string;
}

export function CreateSessionModal({
  isOpen,
  onClose,
  teachers,
  onSubmit,
  defaultTeacherId = '',
}: CreateSessionModalProps) {
  const [teacherId, setTeacherId] = useState(defaultTeacherId);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('15:00');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setDate(new Date().toISOString().split('T')[0]);
  }, []);

  // Sync default teacher if provided
  useEffect(() => {
    if (defaultTeacherId) setTeacherId(defaultTeacherId);
    else if (teachers.length > 0 && !teacherId) setTeacherId(teachers[0]._id);
  }, [defaultTeacherId, teachers, teacherId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!teacherId) {
      setError('Please select a teacher.');
      return;
    }

    if (!date) {
      setError('Please select a session date.');
      return;
    }

    const startISO = new Date(`${date}T${startTime}:00.000Z`);
    const endISO = new Date(`${date}T${endTime}:00.000Z`);

    if (endISO.getTime() <= startISO.getTime()) {
      setError('End time must be strictly greater than start time.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        teacherId,
        startTime: startISO.toISOString(),
        endTime: endISO.toISOString(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create session');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Teacher Availability (API 2)"
      description="Create an AVAILABLE session slot for a mentor. Validates endTime > startTime."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
            Select Mentor / Teacher:
          </label>
          <select
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            className="w-full text-xs font-medium border border-zinc-200 rounded-lg px-3 py-2 bg-zinc-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 text-zinc-900 transition-colors"
            required
          >
            <option value="">-- Choose a teacher --</option>
            {teachers.map((t) => (
              <option key={t._id} value={t._id}>
                {t.fullName} ({t.specialization} • {t.experience} yrs exp)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
            Session Date:
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full text-xs font-medium border border-zinc-200 rounded-lg px-3 py-2 bg-zinc-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 text-zinc-900 transition-colors"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Start Time (UTC):
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full text-xs font-medium border border-zinc-200 rounded-lg px-3 py-2 bg-zinc-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 text-zinc-900 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              End Time (UTC):
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full text-xs font-medium border border-zinc-200 rounded-lg px-3 py-2 bg-zinc-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 text-zinc-900 transition-colors"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            <PlusCircle className="w-3.5 h-3.5" />
            Schedule Session
          </Button>
        </div>
      </form>
    </Modal>
  );
}
