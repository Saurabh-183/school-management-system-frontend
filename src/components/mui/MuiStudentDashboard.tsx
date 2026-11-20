'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
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
  Avatar,
  Divider,
} from '@mui/material';
import {
  School as SchoolIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  HistoryEdu as HistoryEduIcon,
  ArrowForward as ArrowForwardIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  MenuBook as MenuBookIcon,
} from '@mui/icons-material';
import { UserSessionsResponse, User, Session } from '@/lib/types';
import { formatDate, formatTimeUTC, formatDateTime, getDurationMinutes } from '@/lib/utils';
import { MuiLearningResourcesDialog } from '../learning/MuiLearningResourcesDialog';

interface MuiStudentDashboardProps {
  userSessions: UserSessionsResponse | null;
  currentUser: User | null;
  onExploreAvailableSlots: () => void;
  isLoading: boolean;
}

export function MuiStudentDashboard({
  userSessions,
  currentUser,
  onExploreAvailableSlots,
  isLoading,
}: MuiStudentDashboardProps) {
  const [tabIndex, setTabIndex] = useState<number>(0); // 0: Upcoming, 1: Completed
  const [selectedSessionForResources, setSelectedSessionForResources] = useState<Session | null>(null);

  // Pagination for Upcoming Sessions
  const [upcomingPage, setUpcomingPage] = useState(0);
  const [upcomingRowsPerPage, setUpcomingRowsPerPage] = useState(5);

  // Pagination for Completed Sessions
  const [completedPage, setCompletedPage] = useState(0);
  const [completedRowsPerPage, setCompletedRowsPerPage] = useState(5);

  const upcomingSessions = userSessions?.upcomingSessions || [];
  const completedSessions = userSessions?.completedSessions || [];
  const totalBookings = upcomingSessions.length + completedSessions.length;

  const paginatedUpcoming = upcomingSessions.slice(
    upcomingPage * upcomingRowsPerPage,
    upcomingPage * upcomingRowsPerPage + upcomingRowsPerPage
  );

  const paginatedCompleted = completedSessions.slice(
    completedPage * completedRowsPerPage,
    completedPage * completedRowsPerPage + completedRowsPerPage
  );

  const studentName = currentUser?.fullName || userSessions?.user?.fullName || 'Student';
  const studentEmail = currentUser?.email || userSessions?.user?.email || '';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* 1. Header Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 52,
              height: 52,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              fontSize: '1.25rem',
              fontWeight: 700,
            }}
          >
            {studentName.charAt(0)}
          </Avatar>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                {studentName}
              </Typography>
              <Chip
                icon={<SchoolIcon sx={{ fontSize: '0.85rem !important' }} />}
                label="Student Portal"
                color="primary"
                size="small"
                sx={{ fontWeight: 700, fontSize: '0.72rem' }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {studentEmail} • Personalized Learning & Session Dashboard
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          size="medium"
          endIcon={<ArrowForwardIcon />}
          onClick={onExploreAvailableSlots}
          sx={{ fontWeight: 600, px: 2.5 }}
        >
          Book New Session
        </Button>
      </Paper>

      {/* 2. KPI Metric Stat Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2.5 }}>
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5, bgcolor: '#ffffff' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                Upcoming Sessions
              </Typography>
              <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: 'primary.50', color: 'primary.main' }}>
                <EventIcon fontSize="small" />
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
              {upcomingSessions.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Confirmed classes waiting to be conducted
            </Typography>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5, bgcolor: '#ffffff' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                Completed Sessions
              </Typography>
              <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: '#ecfdf5', color: '#047857' }}>
                <CheckCircleIcon fontSize="small" />
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#047857' }}>
              {completedSessions.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Successfully attended learning slots
            </Typography>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5, bgcolor: '#ffffff' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                Total Bookings
              </Typography>
              <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: '#f4f4f5', color: 'text.primary' }}>
                <HistoryEduIcon fontSize="small" />
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
              {totalBookings}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Lifetime sessions booked across mentors
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* 3. Session Tables Section */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#fbfbfb', px: 2 }}>
          <Tabs value={tabIndex} onChange={(_, val) => setTabIndex(val)} sx={{ minHeight: 48 }}>
            <Tab
              icon={<EventIcon fontSize="small" />}
              iconPosition="start"
              label={`Upcoming Schedule (${upcomingSessions.length})`}
              sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.85rem' }}
            />
            <Tab
              icon={<CheckCircleIcon fontSize="small" />}
              iconPosition="start"
              label={`Completed History (${completedSessions.length})`}
              sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.85rem' }}
            />
          </Tabs>
        </Box>

        {isLoading ? (
          <Box sx={{ p: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={36} />
            <Typography variant="body2" color="text.secondary">
              Loading your scheduled sessions...
            </Typography>
          </Box>
        ) : (
          <>
            {/* Tab 0: Upcoming Sessions */}
            {tabIndex === 0 && (
              <Box>
                {upcomingSessions.length === 0 ? (
                  <Box sx={{ p: 6, textAlign: 'center' }}>
                    <EventIcon sx={{ fontSize: 44, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      No Upcoming Sessions Scheduled
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                      Browse available mentor slots for your preferred date and book your next 1-on-1 session.
                    </Typography>
                    <Button variant="contained" size="small" onClick={onExploreAvailableSlots}>
                      Explore Available Mentors
                    </Button>
                  </Box>
                ) : (
                  <>
                    <TableContainer>
                      <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                          <TableRow>
                            <TableCell>Mentor Details</TableCell>
                            <TableCell>Domain Specialization</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Time Window (UTC)</TableCell>
                            <TableCell>Duration</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Course Materials</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {paginatedUpcoming.map((session) => (
                            <TableRow key={session._id} hover>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {session.teacher?.fullName || 'Assigned Mentor'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {session.teacher?.email}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{session.teacher?.specialization || 'General Mentorship'}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{formatDate(session.startTime)}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                  {formatTimeUTC(session.startTime)} – {formatTimeUTC(session.endTime)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={`${getDurationMinutes(session.startTime, session.endTime)} mins`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.72rem' }}
                                />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label="BOOKED"
                                  size="small"
                                  sx={{
                                    bgcolor: '#e0f2fe',
                                    color: '#0369a1',
                                    fontWeight: 700,
                                    fontSize: '0.7rem',
                                  }}
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Button
                                  variant="outlined"
                                  size="small"
                                  color="secondary"
                                  startIcon={<MenuBookIcon fontSize="small" />}
                                  onClick={() => setSelectedSessionForResources(session)}
                                  sx={{ textTransform: 'none', fontSize: '0.72rem', fontWeight: 700, borderRadius: 1.5 }}
                                >
                                  Notes & Lectures
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <TablePagination
                      rowsPerPageOptions={[5, 10, 20]}
                      component="div"
                      count={upcomingSessions.length}
                      rowsPerPage={upcomingRowsPerPage}
                      page={upcomingPage}
                      onPageChange={(_, p) => setUpcomingPage(p)}
                      onRowsPerPageChange={(e) => {
                        setUpcomingRowsPerPage(parseInt(e.target.value, 10));
                        setUpcomingPage(0);
                      }}
                    />
                  </>
                )}
              </Box>
            )}

            {/* Tab 1: Completed Sessions */}
            {tabIndex === 1 && (
              <Box>
                {completedSessions.length === 0 ? (
                  <Box sx={{ p: 6, textAlign: 'center' }}>
                    <CheckCircleIcon sx={{ fontSize: 44, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      No Completed Sessions Yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Once your mentors conduct and complete scheduled sessions, they will be archived here.
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <TableContainer>
                      <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                          <TableRow>
                            <TableCell>Mentor Details</TableCell>
                            <TableCell>Domain Specialization</TableCell>
                            <TableCell>Session Date</TableCell>
                            <TableCell>Time (UTC)</TableCell>
                            <TableCell>Completed At</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Course Materials</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {paginatedCompleted.map((session) => (
                            <TableRow key={session._id} hover>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {session.teacher?.fullName || 'Assigned Mentor'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {session.teacher?.email}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{session.teacher?.specialization}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{formatDate(session.startTime)}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                  {formatTimeUTC(session.startTime)} – {formatTimeUTC(session.endTime)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                  {session.completedAt ? formatDateTime(session.completedAt) : 'Recorded'}
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
                                    fontSize: '0.7rem',
                                  }}
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Button
                                  variant="outlined"
                                  size="small"
                                  color="secondary"
                                  startIcon={<MenuBookIcon fontSize="small" />}
                                  onClick={() => setSelectedSessionForResources(session)}
                                  sx={{ textTransform: 'none', fontSize: '0.72rem', fontWeight: 700, borderRadius: 1.5 }}
                                >
                                  Notes & Lectures
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <TablePagination
                      rowsPerPageOptions={[5, 10, 20]}
                      component="div"
                      count={completedSessions.length}
                      rowsPerPage={completedRowsPerPage}
                      page={completedPage}
                      onPageChange={(_, p) => setCompletedPage(p)}
                      onRowsPerPageChange={(e) => {
                        setCompletedRowsPerPage(parseInt(e.target.value, 10));
                        setCompletedPage(0);
                      }}
                    />
                  </>
                )}
              </Box>
            )}
          </>
        )}
      </Paper>

      {/* Learning Portal Material Viewer for Students */}
      <MuiLearningResourcesDialog
        open={Boolean(selectedSessionForResources)}
        onClose={() => setSelectedSessionForResources(null)}
        session={selectedSessionForResources}
        currentUser={currentUser}
      />
    </Box>
  );
}
