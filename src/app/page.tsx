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
  Chip,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  EventAvailable as EventAvailableIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Person as TeacherIcon,
  SupervisorAccount as AdminIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

import { theme } from '@/theme/theme';
import { api, getStoredUser, getStoredToken } from '@/lib/api';
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
import { MuiAuthScreen } from '@/components/auth/MuiAuthScreen';
import { MuiAvailableSessionsTable } from '@/components/mui/MuiAvailableSessionsTable';
import { MuiStudentDashboard } from '@/components/mui/MuiStudentDashboard';
import { MuiTeacherDashboard } from '@/components/mui/MuiTeacherDashboard';
import { MuiAdminDashboard } from '@/components/mui/MuiAdminDashboard';
import { MuiSuperAdminDashboard } from '@/components/mui/MuiSuperAdminDashboard';
import { MuiTeacherTable } from '@/components/mui/MuiTeacherTable';
import { MuiCreateSessionDialog } from '@/components/mui/MuiCreateSessionDialog';
import { MuiCreateUserDialog } from '@/components/mui/MuiCreateUserDialog';
import { MuiAuthModal } from '@/components/mui/MuiAuthModal';
import { ApiInspectorModal } from '@/components/inspector/ApiInspectorModal';
import { AntiScreenshotProtection } from '@/components/security/AntiScreenshotProtection';
import { MuiStudentStudyChatbot } from '@/components/chatbot/MuiStudentStudyChatbot';

function TrialBanner({ currentUser }: { currentUser: User }) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isExpired: boolean }>({
    hours: 72,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    if (!currentUser.isTrial || !currentUser.trialExpiresAt) return;

    const calc = () => {
      const diff = new Date(currentUser.trialExpiresAt!).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds, isExpired: false });
      }
    };

    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [currentUser]);

  if (!currentUser.isTrial) return null;

  return (
    <Box
      sx={{
        bgcolor: timeLeft.isExpired ? '#fef2f2' : '#fffbeb',
        borderBottom: `1px solid ${timeLeft.isExpired ? '#fecaca' : '#fde68a'}`,
        py: 1,
        px: 2,
        textAlign: 'center',
      }}
    >
      <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <Typography variant="body2" sx={{ fontWeight: 700, color: timeLeft.isExpired ? '#991b1b' : '#92400e' }}>
          {timeLeft.isExpired ? '⚠️ 72-Hour Free Trial Expired' : '⏳ 72-Hour Student Evaluation Trial Active'}:
        </Typography>
        <Chip
          label={
            timeLeft.isExpired
              ? 'Access Expired'
              : `${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s remaining`
          }
          color={timeLeft.isExpired ? 'error' : 'warning'}
          size="small"
          sx={{ fontWeight: 800, fontFamily: 'monospace' }}
        />
        <Typography variant="caption" sx={{ color: timeLeft.isExpired ? '#b91c1c' : '#78350f', fontWeight: 500 }}>
          {timeLeft.isExpired
            ? 'Evaluation period ended. Account scheduled for archival. Contact your school administrator to unlock permanent enrollment.'
            : 'You are on a temporary 72-hour student evaluation access. Contact administration to extend full access before expiry.'}
        </Typography>
      </Container>
    </Box>
  );
}

export default function Home() {
  // Client hydration check
  const [isHydrating, setIsHydrating] = useState<boolean>(true);

  // Authentication & RBAC State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Navigation: 0: Available Sessions, 1: Role Dashboard, 2: Teachers
  const [tabIndex, setTabIndex] = useState<number>(0);

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

  // 1. Initial Client Mount: Check localStorage authentication
  useEffect(() => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
    const stored = getStoredUser();
    const token = getStoredToken();
    if (stored && token) {
      setCurrentUser(stored);
      if (stored.role === 'STUDENT' || stored.role === 'ADMIN' || stored.role === 'SUPER_ADMIN') {
        setActiveUserId(stored._id);
      }
      if (stored.role === 'TEACHER' && stored.teacherId) {
        setPreselectedTeacherId(stored.teacherId);
      }
      // Route to user's default role view
      if (stored.role === 'SUPER_ADMIN' || stored.role === 'ADMIN' || stored.role === 'TEACHER') {
        setTabIndex(1);
      } else {
        setTabIndex(0);
      }
    } else {
      setCurrentUser(null);
    }
    setIsHydrating(false);
  }, []);

  // Listen for concurrent session termination (Security: single active login)
  useEffect(() => {
    const handleTerminated = (e: any) => {
      const msg = e.detail?.message || 'Session ended: This account was signed in from another location.';
      showNotification('error', msg);
      handleLogout();
    };
    window.addEventListener('mentora:session-terminated', handleTerminated);
    return () => window.removeEventListener('mentora:session-terminated', handleTerminated);
  }, [showNotification]);

  // 2. Load Core Users & Teachers ONLY when user is authenticated
  useEffect(() => {
    if (!currentUser) return;

    const loadInitialData = async () => {
      try {
        const [usersList, teachersList] = await Promise.all([api.getUsers(), api.getTeachers()]);
        setUsers(usersList);
        setTeachers(teachersList);

        if (!activeUserId && (currentUser.role === 'STUDENT' || currentUser.role === 'ADMIN')) {
          setActiveUserId(currentUser._id);
        }
      } catch (err: any) {
        showNotification('error', `Failed to load initial data: ${err.message}`);
      }
    };

    loadInitialData();
  }, [currentUser, activeUserId, showNotification]);

  // 3. Fetch Available Sessions with Backend Pagination & Debounced Search (API 3)
  const fetchAvailableSessions = useCallback(
    async (dateStr: string, pageNum: number, limit: number, query: string) => {
      if (!dateStr || !currentUser) return;
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
    [currentUser, showNotification]
  );

  useEffect(() => {
    if (currentUser && selectedDate) {
      fetchAvailableSessions(selectedDate, page, rowsPerPage, searchQuery);
    }
  }, [currentUser, selectedDate, page, rowsPerPage, searchQuery, fetchAvailableSessions]);

  // 4. Fetch Student Sessions (API 6)
  const fetchUserSessions = useCallback(
    async (userId: string) => {
      if (!userId || !currentUser) return;
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
    [currentUser, showNotification]
  );

  useEffect(() => {
    if (currentUser && activeUserId && (currentUser.role === 'STUDENT' || currentUser.role === 'ADMIN')) {
      fetchUserSessions(activeUserId);
    }
  }, [currentUser, activeUserId, fetchUserSessions]);

  // 5. Fetch Teacher Schedule & Sessions (For Teacher Role)
  const fetchTeacherSessions = useCallback(
    async (teacherId: string) => {
      if (!teacherId || !currentUser) return;
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
    [currentUser, showNotification]
  );

  useEffect(() => {
    if (currentUser?.role === 'TEACHER') {
      const targetTeacherId = currentUser.teacherId || preselectedTeacherId || (teachers.length > 0 ? teachers[0]._id : '');
      if (targetTeacherId) {
        fetchTeacherSessions(targetTeacherId);
      }
    }
  }, [currentUser, preselectedTeacherId, teachers, fetchTeacherSessions]);

  // 6. Fetch Admin Platform Overview (For Admin Role)
  const fetchAdminData = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'ADMIN') return;
    try {
      setIsAdminDataLoading(true);
      const res = await api.getAdminOverview();
      setAdminData(res);
    } catch (err: any) {
      showNotification('error', `Could not fetch admin overview: ${err.message}`);
    } finally {
      setIsAdminDataLoading(false);
    }
  }, [currentUser, showNotification]);

  useEffect(() => {
    if (currentUser?.role === 'ADMIN') {
      fetchAdminData();
    }
  }, [currentUser, fetchAdminData]);

  // Auth Handlers: Success & Logout
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'STUDENT' || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      setActiveUserId(user._id);
    } else if (user.role === 'TEACHER' && user.teacherId) {
      setPreselectedTeacherId(user.teacherId);
    }

    // Switch to optimal initial tab for the logged-in role
    if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || user.role === 'TEACHER') {
      setTabIndex(1);
    } else {
      setTabIndex(0);
    }

    setIsAuthModalOpen(false);
    showNotification('success', `Welcome, ${user.fullName}! Logged in as ${user.role}.`);
  };

  const handleLogout = () => {
    api.logout(); // Removes token and user from localStorage
    setCurrentUser(null);
    setActiveUserId('');
    setUserSessions(null);
    setTeacherSessions(null);
    setAdminData(null);
    setTabIndex(0);
    setIsAuthModalOpen(false);
    showNotification('info', 'Logged out successfully. All session tokens removed.');
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
      fetchUserSessions(bookingUserId);
      if (currentUser?.role === 'ADMIN') fetchAdminData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to book session');
    }
  };

  // Handler: Complete a Session (API 5)
  const handleCompleteSession = async (sessionId: string) => {
    try {
      await api.completeSession(sessionId);
      showNotification('success', 'Session marked as COMPLETED successfully!');
      if (currentUser?.role === 'TEACHER' && currentUser.teacherId) {
        fetchTeacherSessions(currentUser.teacherId);
      } else if (currentUser?.role === 'ADMIN') {
        fetchAdminData();
      }
      if (activeUserId) {
        fetchUserSessions(activeUserId);
      }
      fetchAvailableSessions(selectedDate, page, rowsPerPage, searchQuery);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to complete session');
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

  // Handler: Create User (API 1 - Teacher & Admin only)
  const handleCreateUser = async (data: {
    fullName: string;
    email: string;
    phone: string;
  }): Promise<User> => {
    if (currentUser?.role === 'STUDENT') {
      showNotification('error', 'RBAC Restriction: Students cannot register new students. Only Teachers and Admins have access.');
      throw new Error('Access denied: Students cannot register new students.');
    }
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
    if (currentUser?.role === 'SUPER_ADMIN') {
      return {
        label: 'Super Admin Center (Multi-Org Governance)',
        icon: <SecurityIcon fontSize="small" />,
      };
    }
    if (currentUser?.role === 'ADMIN') {
      return {
        label: `School Admin (${adminData?.metrics.totalSessions || 0} Sessions)`,
        icon: <AdminIcon fontSize="small" />,
      };
    }
    if (currentUser?.role === 'TEACHER') {
      return {
        label: `Teacher Schedule (${teacherSessions?.metrics.totalBooked || 0} Booked)`,
        icon: <TeacherIcon fontSize="small" />,
      };
    }
    return {
      label: `My Learning Schedule (${userSessions?.upcomingSessions?.length || 0})`,
      icon: <DashboardIcon fontSize="small" />,
    };
  };

  // -------------------------------------------------------------
  // AUTHENTICATION GATE:
  // If hydrating, display a clean splash screen.
  // If not logged in, display the dedicated full-screen Login/Register Screen!
  // -------------------------------------------------------------
  if (isHydrating) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#f8fafc',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              bgcolor: 'primary.main',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(15, 23, 42, 0.15)',
            }}
          >
            <SchoolIcon sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
            Mentora Platform
          </Typography>
          <CircularProgress size={24} sx={{ color: 'primary.main' }} />
        </Box>
      </ThemeProvider>
    );
  }

  // Not authenticated: Show ONLY the dedicated login & registration page
  if (!currentUser) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <MuiAuthScreen onAuthSuccess={handleAuthSuccess} />
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
      </ThemeProvider>
    );
  }

  const dashboardTabInfo = getDashboardTabInfo();

  // Authenticated User: Render Full Application with DRM Content Protection
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AntiScreenshotProtection currentUser={currentUser}>
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

        {/* 72-Hour Student Trial Countdown Banner */}
        {currentUser?.isTrial && <TrialBanner currentUser={currentUser} />}

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
              onDateChange={(newDate) => {
                setSelectedDate(newDate);
                setPage(0);
              }}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={(newPage) => setPage(newPage)}
              onRowsPerPageChange={(newRows) => {
                setRowsPerPage(newRows);
                setPage(0);
              }}
              searchQuery={searchQuery}
              onSearchChange={(q) => {
                setSearchQuery(q);
                setPage(0);
              }}
              activeUser={users.find((u) => u._id === activeUserId) || currentUser}
              currentUser={currentUser}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onBookSession={handleBookSession}
              onRefresh={() => fetchAvailableSessions(selectedDate, page, rowsPerPage, searchQuery)}
              isLoading={isSessionsLoading}
            />
          )}

          {/* Tab 1: Role-Specific Dedicated Dashboards */}
          {tabIndex === 1 && (
            <>
              {currentUser?.role === 'SUPER_ADMIN' ? (
                /* SUPER ADMIN COMMAND CENTER */
                <MuiSuperAdminDashboard
                  currentUser={currentUser}
                  onRefreshAll={() => {
                    fetchAvailableSessions(selectedDate, page, rowsPerPage, searchQuery);
                  }}
                  onAuthSuccess={handleAuthSuccess}
                />
              ) : currentUser?.role === 'TEACHER' ? (
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
                /* STUDENT DASHBOARD */
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
              onTeacherCreated={async () => {
                try {
                  const refreshed = await api.getTeachers();
                  setTeachers(refreshed);
                  showNotification('success', 'New teacher profile registered successfully!');
                } catch (err: any) {
                  showNotification('error', err.message || 'Failed to refresh teacher list');
                }
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

          {/* AI Study Assistant Chatbot (Floating Bottom Right) */}
          <MuiStudentStudyChatbot currentUser={currentUser} />
        </Box>
      </AntiScreenshotProtection>
    </ThemeProvider>
  );
}
