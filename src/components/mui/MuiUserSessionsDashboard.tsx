'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Event as EventIcon,
  DoneAll as DoneAllIcon,
} from '@mui/icons-material';
import { UserSessionsResponse, User } from '@/lib/types';
import { formatDate, formatTimeUTC, formatDateTime } from '@/lib/utils';
import { Tooltip } from '@mui/material';

interface MuiUserSessionsDashboardProps {
  userSessions: UserSessionsResponse | null;
  currentUser: User | null;
  onCompleteSession: (sessionId: string) => Promise<void>;
  isLoading: boolean;
}

export function MuiUserSessionsDashboard({
  userSessions,
  currentUser,
  onCompleteSession,
  isLoading,
}: MuiUserSessionsDashboardProps) {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [completingId, setCompletingId] = useState<string | null>(null);

  // Pagination for Upcoming Sessions
  const [upcomingPage, setUpcomingPage] = useState(0);
  const [upcomingRowsPerPage, setUpcomingRowsPerPage] = useState(5);

  // Pagination for Completed Sessions
  const [completedPage, setCompletedPage] = useState(0);
  const [completedRowsPerPage, setCompletedRowsPerPage] = useState(5);

  if (!userSessions) {
    return (
      <Paper sx={{ p: 6, textAlign: 'center' }}>
        <PersonIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          No Student Selected
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select an active student from the top bar dropdown to view their scheduled sessions.
        </Typography>
      </Paper>
    );
  }

  const { user, upcomingSessions = [], completedSessions = [] } = userSessions;

  const handleComplete = async (sessionId: string) => {
    try {
      setCompletingId(sessionId);
      await onCompleteSession(sessionId);
    } finally {
      setCompletingId(null);
    }
  };

  // Slice paginated data for upcoming
  const paginatedUpcoming = upcomingSessions.slice(
    upcomingPage * upcomingRowsPerPage,
    upcomingPage * upcomingRowsPerPage + upcomingRowsPerPage
  );

  // Slice paginated data for completed
  const paginatedCompleted = completedSessions.slice(
    completedPage * completedRowsPerPage,
    completedPage * completedRowsPerPage + completedRowsPerPage
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Student Profile & Live Metric Banner */}
      <Paper sx={{ p: 3, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {user.fullName}
            </Typography>
            <Chip label="API 6: Aggregation $facet" size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {user.email} • {user.phone}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Paper variant="outlined" sx={{ px: 2.5, py: 1.5, textAlign: 'center', bgcolor: '#f0f9ff', borderColor: '#bae6fd' }}>
            <Typography variant="caption" sx={{ color: '#0369a1', fontWeight: 600, textTransform: 'uppercase' }}>
              Upcoming
            </Typography>
            <Typography variant="h6" sx={{ color: '#0c4a6e', fontWeight: 700, fontFamily: 'monospace' }}>
              {upcomingSessions.length}
            </Typography>
          </Paper>

          <Paper variant="outlined" sx={{ px: 2.5, py: 1.5, textAlign: 'center', bgcolor: '#ecfdf5', borderColor: '#a7f3d0' }}>
            <Typography variant="caption" sx={{ color: '#047857', fontWeight: 600, textTransform: 'uppercase' }}>
              Completed
            </Typography>
            <Typography variant="h6" sx={{ color: '#064e3b', fontWeight: 700, fontFamily: 'monospace' }}>
              {completedSessions.length}
            </Typography>
          </Paper>
        </Box>
      </Paper>

      {/* Sessions Tabs: Upcoming vs Completed */}
      <Paper sx={{ overflow: 'hidden' }}>
        <Tabs
          value={tabIndex}
          onChange={(_, val) => setTabIndex(val)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}
        >
          <Tab
            icon={<EventIcon fontSize="small" />}
            iconPosition="start"
            label={`Upcoming Sessions (${upcomingSessions.length})`}
            sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem' }}
          />
          <Tab
            icon={<DoneAllIcon fontSize="small" />}
            iconPosition="start"
            label={`Completed Sessions (${completedSessions.length})`}
            sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem' }}
          />
        </Tabs>

        {/* Tab 0: Upcoming Sessions Table */}
        {tabIndex === 0 && (
          <Box>
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Mentor Details</TableCell>
                    <TableCell>Specialization</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Time Slot (UTC)</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Action (API 5)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <CircularProgress size={28} />
                      </TableCell>
                    </TableRow>
                  ) : paginatedUpcoming.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          No upcoming sessions booked for this student.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedUpcoming.map((session) => {
                      const isCompleting = completingId === session._id;
                      return (
                        <TableRow key={session._id} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {session.teacher?.fullName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {session.teacher?.specialization}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(session.startTime)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {formatTimeUTC(session.startTime)} – {formatTimeUTC(session.endTime)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label="BOOKED"
                              size="small"
                              sx={{
                                bgcolor: '#e0f2fe',
                                color: '#0369a1',
                                fontWeight: 700,
                                fontSize: '0.68rem',
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            {currentUser && currentUser.role === 'STUDENT' ? (
                              <Tooltip title="Role Restriction: Only Teachers or Admins can mark sessions as Completed (API 5)">
                                <span>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    disabled
                                    sx={{ fontSize: '0.75rem' }}
                                  >
                                    Mark Complete
                                  </Button>
                                </span>
                              </Tooltip>
                            ) : (
                              <Button
                                variant="outlined"
                                size="small"
                                color="success"
                                startIcon={isCompleting ? <CircularProgress size={14} color="inherit" /> : <CheckCircleIcon />}
                                disabled={isCompleting}
                                onClick={() => handleComplete(session._id)}
                                sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                              >
                                {isCompleting ? 'Completing...' : 'Mark Complete'}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination for Upcoming */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 20]}
              component="div"
              count={upcomingSessions.length}
              rowsPerPage={upcomingRowsPerPage}
              page={upcomingPage}
              onPageChange={(_, newPage) => setUpcomingPage(newPage)}
              onRowsPerPageChange={(e) => {
                setUpcomingRowsPerPage(parseInt(e.target.value, 10));
                setUpcomingPage(0);
              }}
            />
          </Box>
        )}

        {/* Tab 1: Completed Sessions Table */}
        {tabIndex === 1 && (
          <Box>
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Mentor Details</TableCell>
                    <TableCell>Specialization</TableCell>
                    <TableCell>Session Date</TableCell>
                    <TableCell>Time Slot (UTC)</TableCell>
                    <TableCell>Completed At</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <CircularProgress size={28} />
                      </TableCell>
                    </TableRow>
                  ) : paginatedCompleted.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          No completed sessions on record for this student.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedCompleted.map((session) => (
                      <TableRow key={session._id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {session.teacher?.fullName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {session.teacher?.specialization}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(session.startTime)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {formatTimeUTC(session.startTime)} – {formatTimeUTC(session.endTime)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                            {session.completedAt ? formatDateTime(session.completedAt) : 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label="COMPLETED"
                            size="small"
                            sx={{
                              bgcolor: '#ecfdf5',
                              color: '#047857',
                              fontWeight: 700,
                              fontSize: '0.68rem',
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination for Completed */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 20]}
              component="div"
              count={completedSessions.length}
              rowsPerPage={completedRowsPerPage}
              page={completedPage}
              onPageChange={(_, newPage) => setCompletedPage(newPage)}
              onRowsPerPageChange={(e) => {
                setCompletedRowsPerPage(parseInt(e.target.value, 10));
                setCompletedPage(0);
              }}
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
}
