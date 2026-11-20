'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import {
  SupervisorAccount as AdminIcon,
  Business as SchoolIcon,
  Person as TeacherIcon,
  School as StudentIcon,
  PersonAdd as PersonAddIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  ListAlt as LogsIcon,
  Bolt as BoltIcon,
  Visibility,
  VisibilityOff,
  HourglassTop as TrialIcon,
  FiberManualRecord as DotIcon,
  ContentCopy as CopyIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { SuperAdminOverviewResponse, User, ActivityLogUser } from '@/lib/types';

interface MuiSuperAdminDashboardProps {
  currentUser: User | null;
  onRefreshAll?: () => void;
  onAuthSuccess?: (user: User) => void;
}

export function MuiSuperAdminDashboard({
  currentUser,
  onRefreshAll,
  onAuthSuccess,
}: MuiSuperAdminDashboardProps) {
  const [data, setData] = useState<SuperAdminOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tabIndex, setTabIndex] = useState<number>(0); // 0: Activity Logs, 1: Admins, 2: Orgs, 3: Teachers, 4: Students

  // Activity Logs Module State
  const [activityLogs, setActivityLogs] = useState<ActivityLogUser[]>([]);
  const [activityMetrics, setActivityMetrics] = useState({
    totalAccounts: 0,
    onlineAccounts: 0,
    trialAccounts: 0,
    deletedOrExpiredAccounts: 0,
    activeAccounts: 0,
  });
  const [isLogsLoading, setIsLogsLoading] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // Stealth Impersonation Confirmation Modal
  const [impersonateTarget, setImpersonateTarget] = useState<ActivityLogUser | null>(null);
  const [isImpersonating, setIsImpersonating] = useState<boolean>(false);

  // Create Admin Modal State
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('+919876543200');
  const [adminPassword, setAdminPassword] = useState('Password@123');
  const [adminOrg, setAdminOrg] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch Super Admin Overview
  const fetchSuperData = async () => {
    try {
      setIsLoading(true);
      const res = await api.getSuperOverview();
      setData(res);
    } catch (err: any) {
      console.error('Failed to load super admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Activity Logs
  const fetchActivityLogs = useCallback(async (status?: string, search?: string) => {
    try {
      setIsLogsLoading(true);
      const res = await api.getActivityLogs(status, search);
      setActivityLogs(res.logs || []);
      if (res.metrics) {
        setActivityMetrics(res.metrics);
      }
    } catch (err: any) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setIsLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuperData();
    fetchActivityLogs(statusFilter, searchQuery);
  }, [fetchActivityLogs, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchActivityLogs(statusFilter, searchQuery);
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswordMap((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  // Stealth Impersonation Action
  const handleConfirmDirectLogin = async () => {
    if (!impersonateTarget) return;
    try {
      setIsImpersonating(true);
      const res = await api.impersonateLogin({ targetUserId: impersonateTarget._id });
      setFeedback(`Direct login successful as ${impersonateTarget.fullName}. Activity not recorded.`);
      setImpersonateTarget(null);
      if (onAuthSuccess) {
        onAuthSuccess(res.user);
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      setModalError(err.message || 'Direct login failed');
    } finally {
      setIsImpersonating(false);
    }
  };

  const handleCreateAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName.trim() || !adminEmail.trim() || !adminPassword || !adminOrg.trim()) {
      setModalError('Please fill in all required fields.');
      return;
    }

    try {
      setModalSubmitting(true);
      setModalError(null);
      await api.createAdmin({
        fullName: adminName.trim(),
        email: adminEmail.trim(),
        phone: adminPhone.trim(),
        password: adminPassword,
        organization: adminOrg.trim(),
      });
      setIsCreateAdminOpen(false);
      setAdminName('');
      setAdminEmail('');
      setAdminOrg('');
      setFeedback('New Organization Administrator provisioned & welcome email dispatched!');
      fetchSuperData();
      fetchActivityLogs(statusFilter, searchQuery);
      if (onRefreshAll) onRefreshAll();
    } catch (err: any) {
      setModalError(err.message || 'Failed to provision admin');
    } finally {
      setModalSubmitting(false);
    }
  };

  const metrics = data?.metrics || {
    totalAdmins: 0,
    totalOrganizations: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalSessions: 0,
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* 1. Header Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: 3,
          border: '1px solid #fecaca',
          background: 'linear-gradient(135deg, #fff1f2 0%, #ffffff 100%)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              bgcolor: 'error.main',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(225, 29, 72, 0.2)',
            }}
          >
            <SecurityIcon sx={{ fontSize: 30 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>
                Super Admin Command Center
              </Typography>
              <Chip
                label="Root Authority"
                size="small"
                color="error"
                sx={{ height: 22, fontSize: '0.68rem', fontWeight: 800 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
              {currentUser?.fullName} ({currentUser?.email}) • Enterprise Multi-Tenant Governance & Audit Logs
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={() => {
              fetchSuperData();
              fetchActivityLogs(statusFilter, searchQuery);
            }}
            disabled={isLoading || isLogsLoading}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={<PersonAddIcon />}
            onClick={() => setIsCreateAdminOpen(true)}
            sx={{ fontWeight: 700, textTransform: 'none', px: 2, borderRadius: 2 }}
          >
            + Provision New School Admin
          </Button>
        </Box>
      </Paper>

      {feedback && (
        <Alert severity="success" onClose={() => setFeedback(null)}>
          {feedback}
        </Alert>
      )}

      {/* 2. Platform Key Metrics */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }, gap: 2 }}>
        <Card sx={{ border: '1px solid #e2e8f0', borderRadius: 2, boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
              Org Admins
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'error.main', mt: 0.5 }}>
              {isLoading ? <CircularProgress size={20} /> : metrics.totalAdmins}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Provisioned by Super Admin
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ border: '1px solid #e2e8f0', borderRadius: 2, boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
              Organizations
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mt: 0.5 }}>
              {isLoading ? <CircularProgress size={20} /> : metrics.totalOrganizations}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Schools & Institutes
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ border: '1px solid #e2e8f0', borderRadius: 2, boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
              Total Faculty
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'secondary.main', mt: 0.5 }}>
              {isLoading ? <CircularProgress size={20} /> : metrics.totalTeachers}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Registered Mentors
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ border: '1px solid #e2e8f0', borderRadius: 2, boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
              Total Students
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main', mt: 0.5 }}>
              {isLoading ? <CircularProgress size={20} /> : metrics.totalStudents}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Enrolled & Trial
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ border: '1px solid #e2e8f0', borderRadius: 2, boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
              Total Sessions
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#334155', mt: 0.5 }}>
              {isLoading ? <CircularProgress size={20} /> : metrics.totalSessions}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Platform-wide slots
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* 3. Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabIndex} onChange={(_, val) => { setTabIndex(val); setPage(0); }}>
          <Tab
            icon={<LogsIcon fontSize="small" />}
            iconPosition="start"
            label={`Activity Logs & Audit (${activityMetrics.totalAccounts || 0})`}
            sx={{ textTransform: 'none', fontWeight: 700, color: tabIndex === 0 ? 'error.main' : undefined }}
          />
          <Tab
            icon={<AdminIcon fontSize="small" />}
            iconPosition="start"
            label={`School Admins (${data?.admins.length || 0})`}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          />
          <Tab
            icon={<SchoolIcon fontSize="small" />}
            iconPosition="start"
            label={`Organizations (${data?.organizations.length || 0})`}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          />
          <Tab
            icon={<TeacherIcon fontSize="small" />}
            iconPosition="start"
            label={`Faculty (${data?.teachers.length || 0})`}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          />
          <Tab
            icon={<StudentIcon fontSize="small" />}
            iconPosition="start"
            label={`Students (${data?.students.length || 0})`}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          />
        </Tabs>
      </Box>

      {/* TAB 0: ACTIVITY LOGS & AUDIT MODULE */}
      {tabIndex === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Activity Logs Filter & Search Bar */}
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              {/* Quick Status Chips */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip
                  label={`All Accounts (${activityMetrics.totalAccounts})`}
                  color={statusFilter === 'all' ? 'error' : 'default'}
                  variant={statusFilter === 'all' ? 'filled' : 'outlined'}
                  size="small"
                  onClick={() => setStatusFilter('all')}
                  sx={{ fontWeight: 700, cursor: 'pointer' }}
                />
                <Chip
                  icon={<DotIcon sx={{ fontSize: '10px !important', color: '#16a34a' }} />}
                  label={`Online Now (${activityMetrics.onlineAccounts})`}
                  color={statusFilter === 'online' ? 'success' : 'default'}
                  variant={statusFilter === 'online' ? 'filled' : 'outlined'}
                  size="small"
                  onClick={() => setStatusFilter('online')}
                  sx={{ fontWeight: 700, cursor: 'pointer' }}
                />
                <Chip
                  icon={<TrialIcon fontSize="small" />}
                  label={`72h Trial Students (${activityMetrics.trialAccounts})`}
                  color={statusFilter === 'trial' ? 'warning' : 'default'}
                  variant={statusFilter === 'trial' ? 'filled' : 'outlined'}
                  size="small"
                  onClick={() => setStatusFilter('trial')}
                  sx={{ fontWeight: 700, cursor: 'pointer' }}
                />
                <Chip
                  label={`Expired / Deleted (${activityMetrics.deletedOrExpiredAccounts})`}
                  color={statusFilter === 'deleted' ? 'default' : 'default'}
                  variant={statusFilter === 'deleted' ? 'filled' : 'outlined'}
                  size="small"
                  onClick={() => setStatusFilter('deleted')}
                  sx={{ fontWeight: 700, cursor: 'pointer' }}
                />
                <Chip
                  label={`Active Permanent (${activityMetrics.activeAccounts})`}
                  color={statusFilter === 'active' ? 'primary' : 'default'}
                  variant={statusFilter === 'active' ? 'filled' : 'outlined'}
                  size="small"
                  onClick={() => setStatusFilter('active')}
                  sx={{ fontWeight: 700, cursor: 'pointer' }}
                />
              </Box>

              {/* Search Bar */}
              <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', gap: 1, minWidth: 260 }}>
                <TextField
                  placeholder="Search user, email, org..."
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{ bgcolor: '#ffffff' }}
                />
                <Button type="submit" variant="outlined" size="small" sx={{ textTransform: 'none', fontWeight: 600 }}>
                  Search
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* Activity Logs Table */}
          <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Account & Role</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Username (Email)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Password (Eye Toggle)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>School / Organization</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Mobile No</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Session Timestamps</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status & Trial</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Stealth Direct Login
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLogsLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={24} sx={{ color: 'error.main' }} />
                      <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                        Loading real-time activity logs...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : activityLogs && activityLogs.length > 0 ? (
                  activityLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((log) => {
                    const isPwdVisible = Boolean(showPasswordMap[log._id]);

                    return (
                      <TableRow key={log._id} hover>
                        {/* Account & Role */}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                            {log.fullName}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.3 }}>
                            <Chip
                              label={log.role}
                              size="small"
                              color={
                                log.role === 'SUPER_ADMIN'
                                  ? 'error'
                                  : log.role === 'ADMIN'
                                  ? 'warning'
                                  : log.role === 'TEACHER'
                                  ? 'secondary'
                                  : 'primary'
                              }
                              sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }}
                            />
                            {log.createdByName && (
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                                by {log.createdByName}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>

                        {/* Username / Email */}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                            {log.email}
                          </Typography>
                        </TableCell>

                        {/* Password with Eye Toggle */}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                bgcolor: '#f1f5f9',
                                px: 1,
                                py: 0.3,
                                borderRadius: 1,
                                fontSize: '0.8rem',
                              }}
                            >
                              {isPwdVisible ? log.plainPassword : '••••••••••••'}
                            </Typography>
                            <IconButton size="small" onClick={() => togglePasswordVisibility(log._id)}>
                              {isPwdVisible ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </Box>
                        </TableCell>

                        {/* Organization */}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                            {log.organization}
                          </Typography>
                          {log.classGrade && log.classGrade !== 'N/A' && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {log.classGrade}
                            </Typography>
                          )}
                        </TableCell>

                        {/* Mobile Phone */}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                            {log.phone || 'N/A'}
                          </Typography>
                        </TableCell>

                        {/* Timestamps */}
                        <TableCell>
                          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.7rem' }}>
                            <strong>Login:</strong> {log.lastLoginAt ? new Date(log.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.7rem' }}>
                            <strong>Logout:</strong> {log.lastLogoutAt ? new Date(log.lastLogoutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.7rem' }}>
                            <strong>Active:</strong> {log.lastActiveAt ? new Date(log.lastActiveAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                          </Typography>
                        </TableCell>

                        {/* Status & Trial */}
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <DotIcon sx={{ fontSize: 12, color: log.isOnline ? '#16a34a' : '#94a3b8' }} />
                              <Typography variant="caption" sx={{ fontWeight: 700, color: log.isOnline ? '#16a34a' : '#64748b' }}>
                                {log.isOnline ? 'Online' : 'Offline'}
                              </Typography>
                            </Box>

                            {log.isTrial ? (
                              <Chip
                                icon={<TrialIcon sx={{ fontSize: '12px !important' }} />}
                                label={
                                  log.trialRemainingHours && log.trialRemainingHours > 0
                                    ? `Trial: ${log.trialRemainingHours}h left`
                                    : 'Trial Expired'
                                }
                                size="small"
                                color={log.trialRemainingHours && log.trialRemainingHours > 0 ? 'warning' : 'error'}
                                sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                              />
                            ) : (
                              <Chip
                                label={log.accountStatus}
                                size="small"
                                color={log.accountStatus === 'ACTIVE' ? 'success' : 'default'}
                                variant="outlined"
                                sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700 }}
                              />
                            )}
                          </Box>
                        </TableCell>

                        {/* Stealth Direct Login */}
                        <TableCell align="center">
                          {log._id === currentUser?._id ? (
                            <Chip label="Current Session" size="small" sx={{ fontWeight: 600, fontSize: '0.68rem' }} />
                          ) : (
                            <Button
                              variant="contained"
                              size="small"
                              color="primary"
                              startIcon={<BoltIcon sx={{ fontSize: '14px !important' }} />}
                              onClick={() => setImpersonateTarget(log)}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                py: 0.4,
                                px: 1.2,
                                borderRadius: 1.5,
                                bgcolor: '#0f172a',
                                '&:hover': { bgcolor: '#1e293b' },
                              }}
                            >
                              Direct Login
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                      No activity logs match the selected filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={activityLogs.length}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </TableContainer>
        </Box>
      )}

      {/* TAB 1: ORGANIZATION ADMINS LIST */}
      {tabIndex === 1 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Admin Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email Address</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Assigned Organization / School</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Contact Phone</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Authority Level</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.admins && data.admins.length > 0 ? (
                data.admins.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((admin) => (
                  <TableRow key={admin._id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{admin.fullName}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <Chip
                        icon={<SchoolIcon fontSize="small" />}
                        label={admin.organization || 'General Organization'}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                      />
                    </TableCell>
                    <TableCell>{admin.phone || '+91 9876543212'}</TableCell>
                    <TableCell>
                      <Chip label="ADMIN" size="small" color="warning" sx={{ fontWeight: 800, fontSize: '0.68rem' }} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No organization admins found. Click "+ Provision New School Admin" above to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={data?.admins.length || 0}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 20]}
          />
        </TableContainer>
      )}

      {/* TAB 2: ORGANIZATIONS DIRECTORY */}
      {tabIndex === 2 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Organization / School Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Admins</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Faculty Mentors</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Enrolled Students</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.organizations && data.organizations.length > 0 ? (
                data.organizations.map((org) => (
                  <TableRow key={org.name} hover>
                    <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>{org.name}</TableCell>
                    <TableCell align="center">
                      <Chip label={org.adminsCount} size="small" color="warning" sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={org.teachersCount} size="small" color="secondary" sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={org.studentsCount} size="small" color="success" sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell>
                      <Chip label="Active Institutional Node" size="small" color="primary" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No registered organizations yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* TAB 3: FACULTY MEMBERS */}
      {tabIndex === 3 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Mentor Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email Address</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Specialization</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Experience</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Assigned Facility</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.teachers && data.teachers.length > 0 ? (
                data.teachers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((t) => (
                  <TableRow key={t._id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{t.fullName}</TableCell>
                    <TableCell>{t.email}</TableCell>
                    <TableCell>{t.specialization}</TableCell>
                    <TableCell>{t.experience} years</TableCell>
                    <TableCell>
                      <Chip label={t.organization || 'General Organization'} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No faculty members found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={data?.teachers.length || 0}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 20]}
          />
        </TableContainer>
      )}

      {/* TAB 4: ENROLLED STUDENTS */}
      {tabIndex === 4 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email Address</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Class / Grade</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>School / Organization</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.students && data.students.length > 0 ? (
                data.students.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((s) => (
                  <TableRow key={s._id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{s.fullName}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>
                      <Chip label={s.classGrade || 'General'} size="small" color="primary" sx={{ fontWeight: 600 }} />
                    </TableCell>
                    <TableCell>{s.organization || 'General Organization'}</TableCell>
                    <TableCell>{s.phone || 'N/A'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No enrolled students found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={data?.students.length || 0}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 20]}
          />
        </TableContainer>
      )}

      {/* DIALOG: STEALTH IMPERSONATION CONFIRMATION */}
      <Dialog
        open={Boolean(impersonateTarget)}
        onClose={() => setImpersonateTarget(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <BoltIcon sx={{ color: '#f59e0b' }} /> Direct Stealth Login
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            You are logging directly into the account of:
          </Typography>
          <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              {impersonateTarget?.fullName}
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
              Email: <code>{impersonateTarget?.email}</code>
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
              Role: <strong>{impersonateTarget?.role}</strong> | Org: {impersonateTarget?.organization}
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setImpersonateTarget(null)} color="inherit" disabled={isImpersonating}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirmDirectLogin}
            disabled={isImpersonating}
            startIcon={isImpersonating ? <CircularProgress size={16} color="inherit" /> : <BoltIcon />}
            sx={{ fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
          >
            {isImpersonating ? 'Logging In...' : 'Confirm Direct Login'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG: PROVISION NEW ORGANIZATION ADMIN */}
      <Dialog
        open={isCreateAdminOpen}
        onClose={() => setIsCreateAdminOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonAddIcon color="error" /> Provision School / Organization Admin
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Super Admin provisions School Administrators for affiliated academic institutions. An onboarding welcome email with login credentials will be dispatched automatically.
          </Typography>

          {modalError && <Alert severity="error">{modalError}</Alert>}

          <TextField
            label="Admin Full Name"
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            placeholder="e.g. Prince Agnihotri"
            fullWidth
            required
            size="small"
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <TextField
              label="Admin Email Address"
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="admin@dps.edu"
              fullWidth
              required
              size="small"
            />
            <TextField
              label="Contact Phone"
              value={adminPhone}
              onChange={(e) => setAdminPhone(e.target.value)}
              placeholder="+919876543200"
              fullWidth
              size="small"
            />
          </Box>

          <TextField
            label="Organization / School / Campus Name"
            value={adminOrg}
            onChange={(e) => setAdminOrg(e.target.value)}
            placeholder="e.g. Delhi Public School (DPS Campus)"
            fullWidth
            required
            size="small"
            helperText="The school or college this administrator will manage"
          />

          <TextField
            label="Initial Password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            fullWidth
            required
            size="small"
            helperText="Default password sent in onboarding welcome email"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={() => setIsCreateAdminOpen(false)} color="inherit" disabled={modalSubmitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCreateAdminSubmit}
            disabled={modalSubmitting}
            startIcon={modalSubmitting ? <CircularProgress size={16} color="inherit" /> : <PersonAddIcon />}
            sx={{ fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
          >
            {modalSubmitting ? 'Provisioning...' : 'Provision Admin & Dispatch Email'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
