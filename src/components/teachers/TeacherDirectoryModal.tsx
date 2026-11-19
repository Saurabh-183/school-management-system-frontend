'use client';

import React from 'react';
import { Teacher } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  GraduationCap,
  Briefcase,
  Mail,
  Plus,
  Users,
} from 'lucide-react';
import { getInitials } from '@/lib/utils';

interface TeacherDirectoryViewProps {
  teachers: Teacher[];
  onScheduleForTeacher: (teacherId: string) => void;
}

export function TeacherDirectoryView({
  teachers,
  onScheduleForTeacher,
}: TeacherDirectoryViewProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <Users className="w-4 h-4 text-zinc-500" />
            Verified Mentors & Faculty
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Explore teachers, their technical specializations, and schedule 1-on-1 mentorship sessions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers.map((teacher) => (
          <div
            key={teacher._id}
            className="bg-white rounded-xl border border-zinc-200/90 shadow-xs hover:border-zinc-300 p-5 flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-xs tracking-tight">
                  {getInitials(teacher.fullName)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 leading-tight">
                    {teacher.fullName}
                  </h3>
                  <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 text-zinc-400" />
                    {teacher.email}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                    Domain Specialization
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-medium text-zinc-900 bg-zinc-100 px-2.5 py-1 rounded-md">
                      {teacher.specialization}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-600">
                  <span className="flex items-center gap-1.5 text-zinc-500">
                    <Briefcase className="w-3.5 h-3.5 text-zinc-400" /> Professional Experience:
                  </span>
                  <span className="font-semibold text-zinc-900 font-mono">
                    {teacher.experience} years
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onScheduleForTeacher(teacher._id)}
              className="w-full justify-center"
            >
              <Plus className="w-3.5 h-3.5" />
              Schedule Availability (API 2)
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
