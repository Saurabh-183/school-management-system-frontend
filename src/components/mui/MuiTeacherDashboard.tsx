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
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  TaskAlt as CheckCircleOutlineIcon,
  EventAvailable as AvailableIcon,
  AssignmentTurnedIn as CompletedIcon,
  School as SchoolIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { TeacherSessionsResponse, User } from '@/lib/types';
import { formatDate, formatTimeUTC, formatDateTime, getDurationMinutes } from '@/lib/utils';
import { MuiEnrollStudentDialog } from './MuiEnrollStudentDialog';

interface MuiTeacherDashboardProps {
  teacherData: TeacherSessionsResponse | null;
  currentUser: User | null;
  onOpenScheduleSlot: () => void;
  onCompleteSession: (sessionId: string) => Promise<void>;
  onRefresh: () => void;
  isLoading: boolean;
}

export function MuiTeacherDashboard({
  teacherData,
  currentUser,
  onOpenScheduleSlot,
  onCompleteSession,
  onRefresh,
  isLoading,
}: MuiTeacherDashboardProps) {
  const [tabIndex, setTabIndex] = useState<number>(0); // 0: Booked (Actionable), 1: Available, 2: Completed
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [isEnrollStudentOpen, setIsEnrollStudentOpen] = useState<boolean>(false);

  // Pagination states
  const [bookedPage, setBookedPage] = useState(0);
  const [bookedRowsPerPage, setBookedRowsPerPage] = useState(5);

  const [availablePage, setAvailablePage] = useState(0);
  const [availableRowsPerPage, setAvailableRowsPerPage] = useState(5);

  const [completedPage, setCompletedPage] = useState(0);
  const [completedRowsPerPage, setCompletedRowsPerPage] = useState(5);

  const teacher = teacherData?.teacher;
  const bookedSessions = teacherData?.bookedSessions || [];
  const availableSessions = teacherData?.availableSessions || [];
  const completedSessions = teacherData?.completedSessions || [];
  const metrics = teacherData?.metrics || {
    totalAvailable: 0,
    totalBooked: 0,
    totalCompleted: 0,
    totalSessions: 0,
  };

  const handleComplete = async (sessionId: string) => {
    try {
      setCompletingId(sessionId);
      await onCompleteSession(sessionId);
      onRefresh();
    } finally {
      setCompletingId(null);
    }
  };

  const paginatedBooked = bookedSessions.slice(
    bookedPage * bookedRowsPerPage,
    bookedPage * bookedRowsPerPage + bookedRowsPerPage
  );

  const paginatedAvailable = availableSessions.slice(
    availablePage * availableRowsPerPage,
    availablePage * availableRowsPerPage + availableRowsPerPage
  );

  const paginatedCompleted = completedSessions.slice(
    completedPage * completedRowsPerPage,
    completedPage * completedRowsPerPage + completedRowsPerPage
  );

  const teacherName = teacher?.fullName || currentUser?.fullName || 'Teacher';
  const teacherEmail = teacher?.email || currentUser?.email || '';

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
          background: 'linear-gradient(135deg, #faf5ff 0%, #ffffff 100%)',
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
              bgcolor: 'secondary.main',
              color: 'secondary.contrastText',
              fontSize: '1.25rem',
              fontWeight: 700,
            }}
          >
            {teacherName.charAt(0)}
          </Avatar>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                {teacherName}
              </Typography>
              <Chip
                icon={<PersonIcon sx={{ fontSize: '0.85rem !important' }} />}
                label="Teacher Portal"
                color="secondary"
                size="small"
                sx={{ fontWeight: 700, fontSize: '0.72rem' }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {teacherEmail} • {teacher?.specialization || 'Mentor'} • {teacher?.experience || 5} years experience
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Tooltip title="Refresh Schedule">
            <IconButton onClick={onRefresh} sx={{ border: '1px solid #e4e4e7' }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            color="primary"
            size="medium"
            startIcon={<PersonAddIcon />}
            onClick={() => setIsEnrollStudentOpen(true)}
            sx={{ fontWeight: 600 }}
          >
            + Enroll Student
          </Button>
          <Button
            variant="contained"
            color="secondary"
            size="medium"
            startIcon={<AddIcon />}
            onClick={onOpenScheduleSlot}
            sx={{ fontWeight: 600, px: 2.5 }}
          >
            Publish New Slot (API 2)
          </Button>
        </Box>
      </Paper>

      {/* 2. KPI Metric Stat Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5, bgcolor: '#ffffff' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                Confirmed Bookings
              </Typography>
              <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: '#e0f2fe', color: '#0369a1' }}>
                <EventIcon fontSize="small" />
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0369a1' }}>
              {metrics.totalBooked}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Students scheduled & pending completion
            </Typography>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5, bgcolor: '#ffffff' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                Available Slots
              </Typography>
              <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: '#ecfdf5', color: '#047857' }}>
                <AvailableIcon fontSize="small" />
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#047857' }}>
              {metrics.totalAvailable}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Published slots ready to be booked
            </Typography>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5, bgcolor: '#ffffff' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                Completed Classes
              </Typography>
              <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: '#f5f3ff', color: '#7c3aed' }}>
                <CompletedIcon fontSize="small" />
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#7c3aed' }}>
              {metrics.totalCompleted}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Conducted and marked as completed
            </Typography>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5, bgcolor: '#ffffff' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                Total Schedule Slots
              </Typography>
              <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: '#f4f4f5', color: 'text.primary' }}>
                <PersonIcon fontSize="small" />
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
              {metrics.totalSessions}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Lifetime slots published by mentor
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* 3. Tabbed Sessions Section */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#fbfbfb', px: 2 }}>
          <Tabs
            value={tabIndex}
            onChange={(_, val) => setTabIndex(val)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{ minHeight: 48 }}
          >
            <Tab
              icon={<EventIcon fontSize="small" />}
              iconPosition="start"
              label={`Confirmed Student Bookings (${bookedSessions.length})`}
              sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.85rem' }}
            />
            <Tab
              icon={<AvailableIcon fontSize="small" />}
              iconPosition="start"
              label={`Open Availability Slots (${availableSessions.length})`}
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
            <CircularProgress size={36} color="secondary" />
            <Typography variant="body2" color="text.secondary">
              Loading mentor teaching schedule...
            </Typography>
          </Box>
        ) : (
          <>
            {/* Tab 0: Confirmed Bookings (Actionable: Mark Complete) */}
            {tabIndex === 0 && (
              <Box>
                {bookedSessions.length === 0 ? (
                  <Box sx={{ p: 6, textAlign: 'center' }}>
                    <EventIcon sx={{ fontSize: 44, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      No Pending Bookings
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                      When students book your available slots, their session details and action buttons will appear here.
                    </Typography>
                    <Button variant="outlined" color="secondary" size="small" onClick={onOpenScheduleSlot}>
                      Publish More Availability
                    </Button>
                  </Box>
                ) : (
                  <>
                    <TableContainer>
                      <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                          <TableRow>
                            <TableCell>Enrolled Student</TableCell>
                            <TableCell>Contact Information</TableCell>
                            <TableCell>Session Date</TableCell>
                            <TableCell>Time Window (UTC)</TableCell>
                            <TableCell>Duration</TableCell>
                            <TableCell align="right">Action (API 5)</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {paginatedBooked.map((session) => {
                            const isCompleting = completingId === session._id;
                            return (
                              <TableRow key={session._id} hover>
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {session.user?.fullName || 'Registered Student'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" color="text.secondary">
                                    {session.user?.email || 'N/A'}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {session.user?.phone}
                                  </Typography>
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
                                <TableCell align="right">
                                  <Button
                                    variant="contained"
                                    size="small"
                                    color="success"
                                    startIcon={isCompleting ? <CircularProgress size={14} color="inherit" /> : <CheckCircleOutlineIcon />}
                                    disabled={isCompleting}
                                    onClick={() => handleComplete(session._id)}
                                    sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                                  >
                                    {isCompleting ? 'Completing...' : 'Mark Complete (API 5)'}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <TablePagination
                      rowsPerPageOptions={[5, 10, 20]}
                      component="div"
                      count={bookedSessions.length}
                      rowsPerPage={bookedRowsPerPage}
                      page={bookedPage}
                      onPageChange={(_, p) => setBookedPage(p)}
                      onRowsPerPageChange={(e) => {
                        setBookedRowsPerPage(parseInt(e.target.value, 10));
                        setBookedPage(0);
                      }}
                    />
                  </>
                )}
              </Box>
            )}

            {/* Tab 1: Available Slots */}
            {tabIndex === 1 && (
              <Box>
                {availableSessions.length === 0 ? (
                  <Box sx={{ p: 6, textAlign: 'center' }}>
                    <AvailableIcon sx={{ fontSize: 44, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      No Open Slots
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                      You currently have no open slots for students to book.
                    </Typography>
                    <Button variant="contained" color="secondary" size="small" onClick={onOpenScheduleSlot}>
                      Publish New Slot
                    </Button>
                  </Box>
                ) : (
                  <>
                    <TableContainer>
                      <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Time Window (UTC)</TableCell>
                            <TableCell>Duration</TableCell>
                            <TableCell align="right">Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {paginatedAvailable.map((session) => (
                            <TableRow key={session._id} hover>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
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
                                  label={`${getDurationMinutes(session.startTime, session.endTime)} mins`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.72rem' }}
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Chip
                                  label="AVAILABLE FOR BOOKING"
                                  size="small"
                                  sx={{
                                    bgcolor: '#ecfdf5',
                                    color: '#047857',
                                    fontWeight: 700,
                                    fontSize: '0.7rem',
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <TablePagination
                      rowsPerPageOptions={[5, 10, 20]}
                      component="div"
                      count={availableSessions.length}
                      rowsPerPage={availableRowsPerPage}
                      page={availablePage}
                      onPageChange={(_, p) => setAvailablePage(p)}
                      onRowsPerPageChange={(e) => {
                        setAvailableRowsPerPage(parseInt(e.target.value, 10));
                        setAvailablePage(0);
                      }}
                    />
                  </>
                )}
              </Box>
            )}

            {/* Tab 2: Completed History */}
            {tabIndex === 2 && (
              <Box>
                {completedSessions.length === 0 ? (
                  <Box sx={{ p: 6, textAlign: 'center' }}>
                    <CheckCircleIcon sx={{ fontSize: 44, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      No Completed Sessions Yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Classes marked as complete will be archived here.
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <TableContainer>
                      <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                          <TableRow>
                            <TableCell>Student</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Time Window (UTC)</TableCell>
                            <TableCell>Completed At</TableCell>
                            <TableCell align="right">Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {paginatedCompleted.map((session) => (
                            <TableRow key={session._id} hover>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {session.user?.fullName || 'Student'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {session.user?.email}
                                </Typography>
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
                              <TableCell align="right">
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

      {/* Enroll Student Dialog */}
      <MuiEnrollStudentDialog
        open={isEnrollStudentOpen}
        onClose={() => setIsEnrollStudentOpen(false)}
        currentUser={currentUser}
        onStudentEnrolled={onRefresh}
      />
    </Box>
  );
}
