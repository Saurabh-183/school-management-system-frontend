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
  SupervisorAccount as AdminIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  Refresh as RefreshIcon,
  EventAvailable as AvailableIcon,
} from '@mui/icons-material';
import { AdminOverviewResponse, User } from '@/lib/types';
import { formatDate, formatTimeUTC, formatDateTime } from '@/lib/utils';
import { MuiCreateTeacherDialog } from './MuiCreateTeacherDialog';

interface MuiAdminDashboardProps {
  adminData: AdminOverviewResponse | null;
  currentUser: User | null;
  onOpenCreateSession: () => void;
  onOpenCreateUser: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export function MuiAdminDashboard({
  adminData,
  currentUser,
  onOpenCreateSession,
  onOpenCreateUser,
  onRefresh,
  isLoading,
}: MuiAdminDashboardProps) {
  const [tabIndex, setTabIndex] = useState<number>(0); // 0: Live Sessions Audit, 1: User Accounts
  const [isCreateTeacherOpen, setIsCreateTeacherOpen] = useState<boolean>(false);

  // Pagination for Sessions
  const [sessionsPage, setSessionsPage] = useState(0);
  const [sessionsRowsPerPage, setSessionsRowsPerPage] = useState(10);

  // Pagination for Users
  const [usersPage, setUsersPage] = useState(0);
  const [usersRowsPerPage, setUsersRowsPerPage] = useState(10);

  const metrics = adminData?.metrics || {
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalSessions: 0,
    availableSessions: 0,
    bookedSessions: 0,
    completedSessions: 0,
  };

  const recentSessions = adminData?.recentSessions || [];
  const users = adminData?.users || [];

  const paginatedSessions = recentSessions.slice(
    sessionsPage * sessionsRowsPerPage,
    sessionsPage * sessionsRowsPerPage + sessionsRowsPerPage
  );

  const paginatedUsers = users.slice(
    usersPage * usersRowsPerPage,
    usersPage * usersRowsPerPage + usersRowsPerPage
  );

  const adminName = currentUser?.fullName || 'Administrator';
  const adminEmail = currentUser?.email || 'admin@example.com';

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <Chip
            label="AVAILABLE"
            size="small"
            sx={{ bgcolor: '#ecfdf5', color: '#047857', fontWeight: 700, fontSize: '0.68rem' }}
          />
        );
      case 'BOOKED':
        return (
          <Chip
            label="BOOKED"
            size="small"
            sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 700, fontSize: '0.68rem' }}
          />
        );
      case 'COMPLETED':
        return (
          <Chip
            label="COMPLETED"
            size="small"
            sx={{ bgcolor: '#f4f4f5', color: '#52525b', fontWeight: 700, fontSize: '0.68rem' }}
          />
        );
      default:
        return <Chip label={status} size="small" />;
    }
  };

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
          background: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)',
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
              bgcolor: 'warning.main',
              color: 'warning.contrastText',
              fontSize: '1.25rem',
              fontWeight: 700,
            }}
          >
            {adminName.charAt(0)}
          </Avatar>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                {adminName}
              </Typography>
              <Chip
                icon={<AdminIcon sx={{ fontSize: '0.85rem !important' }} />}
                label="Admin Command Center"
                color="warning"
                size="small"
                sx={{ fontWeight: 700, fontSize: '0.72rem' }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {adminEmail} • <strong>{currentUser?.organization || 'Delhi Public School (DPS Campus)'}</strong> • Teachers, Classes & Students Management
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Tooltip title="Refresh Platform Metrics">
            <IconButton onClick={onRefresh} sx={{ border: '1px solid #e4e4e7' }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="secondary"
            size="medium"
            startIcon={<PersonAddIcon />}
            onClick={() => setIsCreateTeacherOpen(true)}
            sx={{ fontWeight: 700 }}
          >
            + Provision Teacher
          </Button>
          <Button
            variant="contained"
            color="warning"
            size="medium"
            startIcon={<AddIcon />}
            onClick={onOpenCreateSession}
            sx={{ fontWeight: 600, px: 2.5 }}
          >
            Schedule Slot (API 2)
          </Button>
        </Box>
      </Paper>

      {/* 2. KPI Metric Stat Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }, gap: 2 }}>
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5, bgcolor: '#ffffff' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
              Total Accounts
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'warning.dark', my: 0.5 }}>
              {metrics.totalUsers}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Students & Teachers
            </Typography>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5, bgcolor: '#ffffff' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
              Teachers in Directory
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'secondary.main', my: 0.5 }}>
              {metrics.totalTeachers}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Registered Mentors
            </Typography>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5, bgcolor: '#ffffff' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
              Open Available Slots
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#047857', my: 0.5 }}>
              {metrics.availableSessions}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Ready for booking
            </Typography>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5, bgcolor: '#ffffff' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
              Active Bookings
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0369a1', my: 0.5 }}>
              {metrics.bookedSessions}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Scheduled with students
            </Typography>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5, bgcolor: '#ffffff' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
              Completed Classes
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', my: 0.5 }}>
              {metrics.completedSessions}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Conducted sessions
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* 3. Tabbed Tables Section */}
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
              label={`System Sessions Audit (${recentSessions.length})`}
              sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.85rem' }}
            />
            <Tab
              icon={<PeopleIcon fontSize="small" />}
              iconPosition="start"
              label={`Registered Users Roster (${users.length})`}
              sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.85rem' }}
            />
          </Tabs>
        </Box>

        {isLoading ? (
          <Box sx={{ p: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={36} color="warning" />
            <Typography variant="body2" color="text.secondary">
              Loading platform data...
            </Typography>
          </Box>
        ) : (
          <>
            {/* Tab 0: Sessions Audit */}
            {tabIndex === 0 && (
              <Box>
                <TableContainer>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Teacher / Mentor</TableCell>
                        <TableCell>Student</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Time (UTC)</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Completed At</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedSessions.map((session) => (
                        <TableRow key={session._id} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {typeof session.teacherId === 'object' && session.teacherId !== null
                                ? (session.teacherId as any).fullName
                                : 'Assigned Mentor'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {typeof session.teacherId === 'object' && session.teacherId !== null
                                ? (session.teacherId as any).specialization
                                : ''}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: session.userId ? 600 : 400, color: session.userId ? 'text.primary' : 'text.disabled' }}>
                              {typeof session.userId === 'object' && session.userId !== null
                                ? (session.userId as any).fullName
                                : session.userId ? 'Booked Student' : 'Unassigned'}
                            </Typography>
                            {typeof session.userId === 'object' && session.userId !== null && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                {(session.userId as any).email}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{formatDate(session.startTime)}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {formatTimeUTC(session.startTime)} – {formatTimeUTC(session.endTime)}
                            </Typography>
                          </TableCell>
                          <TableCell>{getStatusChip(session.status)}</TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                              {session.completedAt ? formatDateTime(session.completedAt) : '—'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  rowsPerPageOptions={[10, 20, 50]}
                  component="div"
                  count={recentSessions.length}
                  rowsPerPage={sessionsRowsPerPage}
                  page={sessionsPage}
                  onPageChange={(_, p) => setSessionsPage(p)}
                  onRowsPerPageChange={(e) => {
                    setSessionsRowsPerPage(parseInt(e.target.value, 10));
                    setSessionsPage(0);
                  }}
                />
              </Box>
            )}

            {/* Tab 1: User Accounts Directory */}
            {tabIndex === 1 && (
              <Box>
                <TableContainer>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Phone Number</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell align="right">Registered On</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedUsers.map((user) => (
                        <TableRow key={user._id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: user.role === 'ADMIN' ? 'warning.main' : user.role === 'TEACHER' ? 'secondary.main' : 'primary.main' }}>
                                {user.fullName.charAt(0)}
                              </Avatar>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {user.fullName}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {user.email}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{user.phone}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={user.role}
                              size="small"
                              color={user.role === 'ADMIN' ? 'warning' : user.role === 'TEACHER' ? 'secondary' : 'primary'}
                              sx={{ fontWeight: 700, fontSize: '0.68rem', height: 22 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                              {user.createdAt ? formatDate(user.createdAt) : 'Recently'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  rowsPerPageOptions={[10, 20, 50]}
                  component="div"
                  count={users.length}
                  rowsPerPage={usersRowsPerPage}
                  page={usersPage}
                  onPageChange={(_, p) => setUsersPage(p)}
                  onRowsPerPageChange={(e) => {
                    setUsersRowsPerPage(parseInt(e.target.value, 10));
                    setUsersPage(0);
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Paper>

      {/* Provision Teacher Dialog */}
      <MuiCreateTeacherDialog
        open={isCreateTeacherOpen}
        onClose={() => setIsCreateTeacherOpen(false)}
        currentUser={currentUser}
        onTeacherCreated={onRefresh}
      />
    </Box>
  );
}
