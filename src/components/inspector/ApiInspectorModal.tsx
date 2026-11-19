'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Code2, Database, Terminal, CheckCircle2 } from 'lucide-react';

interface ApiInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiInspectorModal({ isOpen, onClose }: ApiInspectorModalProps) {
  const [activeTab, setActiveTab] = useState<'api3' | 'api6' | 'endpoints'>('api3');

  const api3PipelineCode = `// API 3: GET /sessions/available?dateTimestamp={timestamp}
// Mandatory MongoDB Aggregation Pipeline
[
  // 1. Filter only AVAILABLE sessions for the 24h day window
  {
    $match: {
      status: 'AVAILABLE',
      startTime: {
        $gte: new Date(Date.UTC(year, month, date, 0, 0, 0, 0)),
        $lte: new Date(Date.UTC(year, month, date, 23, 59, 59, 999))
      }
    }
  },
  // 2. Relational join with Teachers collection
  {
    $lookup: {
      from: 'teachers',
      localField: 'teacherId',
      foreignField: '_id',
      as: 'teacher'
    }
  },
  // 3. Deconstruct array to single embedded object
  {
    $unwind: { path: '$teacher', preserveNullAndEmptyArrays: false }
  },
  // 4. Safe projection (omits internal __v)
  {
    $project: {
      _id: 1,
      startTime: 1,
      endTime: 1,
      status: 1,
      teacher: {
        _id: '$teacher._id',
        fullName: '$teacher.fullName',
        email: '$teacher.email',
        specialization: '$teacher.specialization',
        experience: '$teacher.experience'
      }
    }
  },
  // 5. Order chronologically
  { $sort: { startTime: 1 } }
]`;

  const api6PipelineCode = `// API 6: GET /users/:id/sessions
// Mandatory MongoDB Aggregation Pipeline
[
  // 1. Match sessions booked by this user
  { $match: { userId: new Types.ObjectId(userId) } },

  // 2. Join teacher details
  {
    $lookup: {
      from: 'teachers',
      localField: 'teacherId',
      foreignField: '_id',
      as: 'teacher'
    }
  },

  // 3. Unwind teacher
  { $unwind: { path: '$teacher', preserveNullAndEmptyArrays: true } },

  // 4. Clean projection
  {
    $project: {
      _id: 1,
      startTime: 1,
      endTime: 1,
      status: 1,
      completedAt: 1,
      teacher: {
        _id: '$teacher._id',
        fullName: '$teacher.fullName',
        specialization: '$teacher.specialization'
      }
    }
  },

  // 5. Facet into Upcoming (BOOKED) and Completed (COMPLETED) simultaneously
  {
    $facet: {
      upcomingSessions: [
        { $match: { status: 'BOOKED' } },
        { $sort: { startTime: 1 } }
      ],
      completedSessions: [
        { $match: { status: 'COMPLETED' } },
        { $sort: { completedAt: -1, startTime: -1 } }
      ]
    }
  }
]`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="MongoDB Aggregation Pipeline Inspector"
      description="Inspect how the platform executes high-performance aggregation pipelines."
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Sub-tabs */}
        <div className="flex border-b border-zinc-200 gap-2 pb-1">
          <button
            onClick={() => setActiveTab('api3')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === 'api3'
                ? 'bg-zinc-950 text-white'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            API 3: Available Sessions Pipeline
          </button>
          <button
            onClick={() => setActiveTab('api6')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === 'api6'
                ? 'bg-zinc-950 text-white'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            API 6: User Sessions $facet Pipeline
          </button>
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === 'endpoints'
                ? 'bg-zinc-950 text-white'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            All 6 Endpoints
          </button>
        </div>

        {/* Code View */}
        {activeTab === 'api3' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span className="font-mono">backend/src/services/session.service.ts</span>
              <Badge variant="available" size="sm">
                $match → $lookup → $unwind → $project → $sort
              </Badge>
            </div>
            <pre className="bg-zinc-950 text-zinc-100 p-4 rounded-xl text-[11px] font-mono leading-relaxed overflow-x-auto border border-zinc-800">
              {api3PipelineCode}
            </pre>
          </div>
        )}

        {activeTab === 'api6' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span className="font-mono">backend/src/services/user.service.ts</span>
              <Badge variant="booked" size="sm">
                $match → $lookup → $unwind → $facet
              </Badge>
            </div>
            <pre className="bg-zinc-950 text-zinc-100 p-4 rounded-xl text-[11px] font-mono leading-relaxed overflow-x-auto border border-zinc-800">
              {api6PipelineCode}
            </pre>
          </div>
        )}

        {activeTab === 'endpoints' && (
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 space-y-1">
              <div className="flex items-center gap-2 font-mono">
                <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                  POST
                </span>
                <span className="font-semibold text-zinc-900">/users</span>
              </div>
              <p className="text-zinc-500 text-[11px]">
                API 1: Create user. Email must be unique (409 on duplicate).
              </p>
            </div>

            <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 space-y-1">
              <div className="flex items-center gap-2 font-mono">
                <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                  POST
                </span>
                <span className="font-semibold text-zinc-900">/sessions</span>
              </div>
              <p className="text-zinc-500 text-[11px]">
                API 2: Create session. Default AVAILABLE. Validates teacher & endTime &gt; startTime.
              </p>
            </div>

            <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 space-y-1">
              <div className="flex items-center gap-2 font-mono">
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  GET
                </span>
                <span className="font-semibold text-zinc-900">/sessions/available?dateTimestamp=&#123;timestamp&#125;</span>
              </div>
              <p className="text-zinc-500 text-[11px]">
                API 3: Return AVAILABLE sessions for supplied date using MongoDB Aggregation Pipeline.
              </p>
            </div>

            <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 space-y-1">
              <div className="flex items-center gap-2 font-mono">
                <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                  POST
                </span>
                <span className="font-semibold text-zinc-900">/sessions/:id/book</span>
              </div>
              <p className="text-zinc-500 text-[11px]">
                API 4: Book session. Atomic findOneAndUpdate ensures race-condition safety.
              </p>
            </div>

            <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 space-y-1">
              <div className="flex items-center gap-2 font-mono">
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                  PATCH
                </span>
                <span className="font-semibold text-zinc-900">/sessions/:id/complete</span>
              </div>
              <p className="text-zinc-500 text-[11px]">
                API 5: Mark session complete. Only BOOKED sessions allowed. Sets completedAt.
              </p>
            </div>

            <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 space-y-1">
              <div className="flex items-center gap-2 font-mono">
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  GET
                </span>
                <span className="font-semibold text-zinc-900">/users/:id/sessions</span>
              </div>
              <p className="text-zinc-500 text-[11px]">
                API 6: User sessions separated into upcoming & completed via $facet Aggregation.
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
