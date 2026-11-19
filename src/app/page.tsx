'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Container,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  Typography,
} from '@mui/material';
import {
  EventAvailable as EventAvailableIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Person as TeacherIcon,
  SupervisorAccount as AdminIcon,
} from '@mui/icons-material';

import { theme } from '@/theme/theme';
import { api, getStoredUser, clearStoredAuth } from '@/lib/api';
import {
  User,
  Teacher,
  Session,
  UserSessionsResponse,
  TeacherSessionsResponse,
  AdminOverviewResponse,
} from '@/lib/types';

// MUI Custom Components
import { MuiNavbar } from '@/components/mui/MuiNavbar';
import { MuiAvailableSessionsTable } from '@/components/mui/MuiAvailableSessionsTable';
import { MuiStudentDashboard } from '@/components/mui/MuiStudentDashboard';
import { MuiTeacherDashboard } from '@/components/mui/MuiTeacherDashboard';
import { MuiAdminDashboard } from '@/components/mui/MuiAdminDashboard';
import { MuiTeacherTable } from '@/components/mui/MuiTeacherTable';
import { MuiCreateSessionDialog } from '@/components/mui/MuiCreateSessionDialog';
import { MuiCreateUserDialog } from '@/components/mui/MuiCreateUserDialog';
import { MuiAuthModal } from '@/components/mui/MuiAuthModal';
import { ApiInspectorModal } from '@/components/inspector/ApiInspectorModal';

export default function Home() {
  // Navigation
  const [tabIndex, setTabIndex] = useState<number>(0);

  // Authentication & RBAC State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Core Data
  const [users, setUsers] = useState<User[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [activeUserId, setActiveUserId] = useState<string>('');

  // Available Sessions (API 3) State with Pagination and Debounced Search
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSessions, setAvailableSessions] = useState<Session[]>([]);
  const [totalSessions, setTotalSessions] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSessionsLoading, setIsSessionsLoading] = useState<boolean>(false);

  // Student Sessions (API 6) State
  const [userSessions, setUserSessions] = useState<UserSessionsResponse | null>(null);
  const [isUserSessionsLoading, setIsUserSessionsLoading] = useState<boolean>(false);

  // Teacher Schedule & Sessions State
  const [teacherSessions, setTeacherSessions] = useState<TeacherSessionsResponse | null>(null);
  const [isTeacherSessionsLoading, setIsTeacherSessionsLoading] = useState<boolean>(false);

  // Admin Platform Overview State
  const [adminData, setAdminData] = useState<AdminOverviewResponse | null>(null);
  const [isAdminDataLoading, setIsAdminDataLoading] = useState<boolean>(false);

  // Dialogs
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [preselectedTeacherId, setPreselectedTeacherId] = useState<string>('');

  // Toast / Snackbar Feedback
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
  }>({ open: false, type: 'info', message: '' });

  const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setSnackbar({ open: true, type, message });
  }, []);

  // 1. Initialize Date & Stored User on client mount
  useEffect(() => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
    const stored = getStoredUser();
    if (stored) {
      setCurrentUser(stored);
      if (stored.role === 'STUDENT' || stored.role === 'ADMIN') {
        setActiveUserId(stored._id);
      }
      if (stored.role === 'TEACHER' && stored.teacherId) {
        setPreselectedTeacherId(stored.teacherId);
      }
    }
  }, []);

  // 2. Load Users & Teachers ONCE on mount (preventing duplicate /users and /teachers requests)
  const initialLoadDone = useRef(false);
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    const loadInitialData = async () => {
      try {
        const [usersList, teachersList] = await Promise.all([api.getUsers(), api.getTeachers()]);
        setUsers(usersList);
        setTeachers(teachersList);

        // If no user is logged in, select default student
        setActiveUserId((prev) => prev || (usersList.length > 0 ? usersList[0]._id : ''));
      } catch (err: any) {
        showNotification('error', `Failed to load initial data: ${err.message}`);
      }
    };

    loadInitialData();
  }, [showNotification]);

  // 3. Fetch Available Sessions with Backend Pagination & Debounced Search (API 3)
  const fetchAvailableSessions = useCallback(
    async (dateStr: string, pageNum: number, limit: number, query: string) => {
      if (!dateStr) return;
      try {
        setIsSessionsLoading(true);
        const targetDate = new Date(`${dateStr}T00:00:00.000Z`);
        const res = await api.getAvailableSessions(targetDate.getTime(), {
          page: pageNum + 1,
          limit,
          search: query || undefined,
        });
        setAvailableSessions(res.sessions || []);
        setTotalSessions(res.pagination?.total ?? res.totalAvailable ?? 0);
      } catch (err: any) {
        showNotification('error', `Could not fetch available slots: ${err.message}`);
      } finally {
        setIsSessionsLoading(false);
      }
    },
    [showNotification]
  );

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSessions(selectedDate, page, rowsPerPage, searchQuery);
    }
  }, [selectedDate, page, rowsPerPage, searchQuery, fetchAvailableSessions]);

  // 4. Fetch Student Sessions (API 6)
  const fetchUserSessions = useCallback(
    async (userId: string) => {
      if (!userId) return;
      try {
        setIsUserSessionsLoading(true);
        const res = await api.getUserSessions(userId);
        setUserSessions(res);
      } catch (err: any) {
        showNotification('error', `Could not fetch sessions for student: ${err.message}`);
      } finally {
        setIsUserSessionsLoading(false);
      }
    },
    [showNotification]
  );

  useEffect(() => {
    if (activeUserId && (currentUser?.role === 'STUDENT' || !currentUser || currentUser?.role === 'ADMIN')) {
      fetchUserSessions(activeUserId);
    }
  }, [activeUserId, currentUser, fetchUserSessions]);

  // 5. Fetch Teacher Schedule & Sessions (For Teacher Role)
  const fetchTeacherSessions = useCallback(
    async (teacherId: string) => {
      if (!teacherId) return;
      try {
        setIsTeacherSessionsLoading(true);
        const res = await api.getTeacherSessions(teacherId);
        setTeacherSessions(res);
      } catch (err: any) {
        showNotification('error', `Could not fetch teacher schedule: ${err.message}`);
      } finally {
        setIsTeacherSessionsLoading(false);
      }
    },
    [showNotification]
  );

  useEffect(() => {
    if (currentUser?.role === 'TEACHER') {
      const targetTeacherId = currentUser.teacherId || (teachers.length > 0 ? teachers[0]._id : '');
      if (targetTeacherId) {
        fetchTeacherSessions(targetTeacherId);
      }
    }
  }, [currentUser, teachers, fetchTeacherSessions]);

  // 6. Fetch Admin Platform Overview (For Admin Role)
  const fetchAdminData = useCallback(async () => {
    try {
      setIsAdminDataLoading(true);
      const res = await api.getAdminOverview();
      setAdminData(res);
    } catch (err: any) {
      showNotification('error', `Could not fetch admin overview: ${err.message}`);
    } finally {
      setIsAdminDataLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    if (currentUser?.role === 'ADMIN') {
      fetchAdminData();
    }
  }, [currentUser, fetchAdminData]);

  // Auth Handlers
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'STUDENT' || user.role === 'ADMIN') {
      setActiveUserId(user._id);
    } else if (user.role === 'TEACHER' && user.teacherId) {
      setPreselectedTeacherId(user.teacherId);
      fetchTeacherSessions(user.teacherId);
    }
    if (user.role === 'ADMIN') {
      fetchAdminData();
    }
    showNotification('success', `Signed in as ${user.fullName} (${user.role})`);
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setTeacherSessions(null);
    setAdminData(null);
    showNotification('info', 'Logged out successfully');
  };

  // Handler: Book a Session (API 4)
  const handleBookSession = async (sessionId: string) => {
    const bookingUserId = currentUser?.role === 'STUDENT' ? currentUser._id : activeUserId;
    if (!bookingUserId) {
      showNotification('error', 'Please sign in or select an active student first.');
      setIsAuthModalOpen(true);
      return;
    }
    try {
      await api.bookSession(sessionId, bookingUserId);
      showNotification('success', 'Session booked successfully!');
      fetchAvailableSessions(selectedDate, page, rowsPerPage, searchQuery);
      if (bookingUserId) {
        fetchUserSessions(bookingUserId);
      }
      if (currentUser?.role === 'TEACHER' && currentUser.teacherId) {
        fetchTeacherSessions(currentUser.teacherId);
      }
      if (currentUser?.role === 'ADMIN') {
        fetchAdminData();
      }
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  // Handler: Mark Session Complete (API 5)
  const handleCompleteSession = async (sessionId: string) => {
    try {
      await api.completeSession(sessionId);
      showNotification('success', 'Session marked as COMPLETED successfully!');
      if (activeUserId) {
        fetchUserSessions(activeUserId);
      }
      if (currentUser?.role === 'TEACHER' && currentUser.teacherId) {
        fetchTeacherSessions(currentUser.teacherId);
      }
      if (currentUser?.role === 'ADMIN') {
        fetchAdminData();
      }
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  // Handler: Create Session (API 2)
  const handleCreateSession = async (data: {
    teacherId: string;
    startTime: string;
    endTime: string;
  }) => {
    try {
      await api.createSession(data);
      showNotification('success', 'New availability slot created successfully!');
      fetchAvailableSessions(selectedDate, page, rowsPerPage, searchQuery);
      if (currentUser?.role === 'TEACHER' && currentUser.teacherId) {
        fetchTeacherSessions(currentUser.teacherId);
      }
      if (currentUser?.role === 'ADMIN') {
        fetchAdminData();
      }
    } catch (err: any) {
      throw err;
    }
  };

  // Handler: Create User (API 1)
  const handleCreateUser = async (data: {
    fullName: string;
    email: string;
    phone: string;
  }): Promise<User> => {
    try {
      const newUser = await api.createUser(data);
      showNotification('success', `Student '${newUser.fullName}' registered successfully!`);
      setUsers((prev) => [newUser, ...prev]);
      setActiveUserId(newUser._id);
      if (currentUser?.role === 'ADMIN') {
        fetchAdminData();
      }
      return newUser;
    } catch (err: any) {
      throw err;
    }
  };

  // Dynamic Tab 1 Label & Icon based on Active Role
  const getDashboardTabInfo = () => {
    if (currentUser?.role === 'TEACHER') {
      return {
        label: `Teacher Schedule (${teacherSessions?.metrics.totalBooked || 0} Booked)`,
        icon: <TeacherIcon fontSize="small" />,
      };
    }
    if (currentUser?.role === 'ADMIN') {
      return {
        label: `Admin Overview (${adminData?.metrics.totalSessions || 0} Sessions)`,
        icon: <AdminIcon fontSize="small" />,
      };
    }
    return {
      label: `My Learning Schedule (${userSessions?.upcomingSessions?.length || 0})`,
      icon: <DashboardIcon fontSize="small" />,
    };
  };

  const dashboardTabInfo = getDashboardTabInfo();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
        {/* Top Navbar with RBAC */}
        <MuiNavbar
          users={users}
          currentUser={currentUser}
          activeUserId={activeUserId}
          onUserChange={(id) => setActiveUserId(id)}
          onOpenCreateSession={() => {
            if (currentUser?.role === 'TEACHER' && currentUser.teacherId) {
              setPreselectedTeacherId(currentUser.teacherId);
            } else {
              setPreselectedTeacherId('');
            }
            setIsCreateSessionOpen(true);
          }}
          onOpenCreateUser={() => setIsCreateUserOpen(true)}
          onOpenInspector={() => setIsInspectorOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Tab Navigation */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Container maxWidth="lg">
            <Tabs
              value={tabIndex}
              onChange={(_, val) => setTabIndex(val)}
              sx={{ minHeight: 48 }}
            >
              <Tab
                icon={<EventAvailableIcon fontSize="small" />}
                iconPosition="start"
                label={`Available Sessions (${totalSessions})`}
                sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem' }}
              />
              <Tab
                icon={dashboardTabInfo.icon}
                iconPosition="start"
                label={dashboardTabInfo.label}
                sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem' }}
              />
              <Tab
                icon={<PeopleIcon fontSize="small" />}
                iconPosition="start"
                label={`Teachers Directory (${teachers.length})`}
                sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem' }}
              />
            </Tabs>
          </Container>
        </Box>

        {/* Main Body */}
        <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
          {/* Tab 0: Available Sessions (API 3 & API 4) */}
          {tabIndex === 0 && (
            <MuiAvailableSessionsTable
              sessions={availableSessions}
              totalSessions={totalSessions}
              selectedDate={selectedDate}
              onDateChange={(date) => {
                setSelectedDate(date);
                setPage(0);
              }}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={(newPage) => setPage(newPage)}
              onRowsPerPageChange={(newLimit) => {
                setRowsPerPage(newLimit);
                setPage(0);
              }}
              searchQuery={searchQuery}
              onSearchChange={(query) => {
                setSearchQuery(query);
                setPage(0);
              }}
              activeUser={users.find((u) => u._id === activeUserId) || null}
              currentUser={currentUser}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onBookSession={handleBookSession}
              isLoading={isSessionsLoading}
              onRefresh={() => fetchAvailableSessions(selectedDate, page, rowsPerPage, searchQuery)}
            />
          )}

          {/* Tab 1: Role-Specific Dedicated Dashboards */}
          {tabIndex === 1 && (
            <>
              {currentUser?.role === 'TEACHER' ? (
                /* TEACHER DASHBOARD */
                <MuiTeacherDashboard
                  teacherData={teacherSessions}
                  currentUser={currentUser}
                  onOpenScheduleSlot={() => {
                    if (currentUser.teacherId) setPreselectedTeacherId(currentUser.teacherId);
                    setIsCreateSessionOpen(true);
                  }}
                  onCompleteSession={handleCompleteSession}
                  onRefresh={() => {
                    if (currentUser.teacherId) fetchTeacherSessions(currentUser.teacherId);
                  }}
                  isLoading={isTeacherSessionsLoading}
                />
              ) : currentUser?.role === 'ADMIN' ? (
                /* ADMIN DASHBOARD */
                <MuiAdminDashboard
                  adminData={adminData}
                  currentUser={currentUser}
                  onOpenCreateSession={() => {
                    setPreselectedTeacherId('');
                    setIsCreateSessionOpen(true);
                  }}
                  onOpenCreateUser={() => setIsCreateUserOpen(true)}
                  onRefresh={fetchAdminData}
                  isLoading={isAdminDataLoading}
                />
              ) : (
                /* STUDENT / GUEST DASHBOARD */
                <MuiStudentDashboard
                  userSessions={userSessions}
                  currentUser={currentUser}
                  onExploreAvailableSlots={() => setTabIndex(0)}
                  isLoading={isUserSessionsLoading}
                />
              )}
            </>
          )}

          {/* Tab 2: Teachers Directory */}
          {tabIndex === 2 && (
            <MuiTeacherTable
              teachers={teachers}
              currentUser={currentUser}
              onScheduleForTeacher={(teacherId) => {
                setPreselectedTeacherId(teacherId);
                setIsCreateSessionOpen(true);
              }}
            />
          )}
        </Container>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            py: 2.5,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            textAlign: 'center',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Mentora • Enterprise Teacher Session Booking REST API & Multi-Role RBAC Dashboards
          </Typography>
        </Box>

        {/* Dialogs */}
        <MuiAuthModal
          open={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />

        <MuiCreateSessionDialog
          open={isCreateSessionOpen}
          onClose={() => setIsCreateSessionOpen(false)}
          teachers={teachers}
          defaultTeacherId={preselectedTeacherId}
          onSubmit={handleCreateSession}
        />

        <MuiCreateUserDialog
          open={isCreateUserOpen}
          onClose={() => setIsCreateUserOpen(false)}
          onSubmit={handleCreateUser}
        />

        <ApiInspectorModal
          isOpen={isInspectorOpen}
          onClose={() => setIsInspectorOpen(false)}
        />

        {/* Feedback Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            severity={snackbar.type}
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            sx={{ width: '100%', boxShadow: 3 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
