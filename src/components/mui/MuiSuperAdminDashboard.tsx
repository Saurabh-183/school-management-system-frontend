'use client';

import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  SupervisorAccount as AdminIcon,
  Business as SchoolIcon,
  Person as TeacherIcon,
  School as StudentIcon,
  PersonAdd as PersonAddIcon,
  Add as AddIcon,
  Security as SecurityIcon,
  CheckCircle as CheckIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { SuperAdminOverviewResponse, User, Teacher } from '@/lib/types';

interface MuiSuperAdminDashboardProps {
  currentUser: User | null;
  onRefreshAll?: () => void;
}

export function MuiSuperAdminDashboard({ currentUser, onRefreshAll }: MuiSuperAdminDashboardProps) {
  const [data, setData] = useState<SuperAdminOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tabIndex, setTabIndex] = useState<number>(0); // 0: Admins, 1: Organizations, 2: Teachers, 3: Students

  // Create Admin Modal State
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('+919876543200');
  const [adminPassword, setAdminPassword] = useState('Password@123');
  const [adminOrg, setAdminOrg] = useState('St. Xavier’s International School');
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Pagination for sub-tables
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

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

  useEffect(() => {
    fetchSuperData();
  }, []);

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
      setAdminOrg('St. Xavier’s International School');
      setFeedback('New Organization Administrator provisioned successfully in MongoDB!');
      fetchSuperData();
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
                Super Admin Control Center
              </Typography>
              <Chip
                label="Root Authority"
                size="small"
                color="error"
                sx={{ height: 22, fontSize: '0.68rem', fontWeight: 800 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
              {currentUser?.fullName} ({currentUser?.email}) • Multi-Tenant School & Organization Provisioning
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={fetchSuperData}
            disabled={isLoading}
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
            + Provision New Organization Admin
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
              Schools, Institutes & Colleges
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
              Enrolled Students
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main', mt: 0.5 }}>
              {isLoading ? <CircularProgress size={20} /> : metrics.totalStudents}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Across all institutions
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
            icon={<AdminIcon fontSize="small" />}
            iconPosition="start"
            label={`Organization Admins (${data?.admins.length || 0})`}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          />
          <Tab
            icon={<SchoolIcon fontSize="small" />}
            iconPosition="start"
            label={`Registered Schools & Orgs (${data?.organizations.length || 0})`}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          />
          <Tab
            icon={<TeacherIcon fontSize="small" />}
            iconPosition="start"
            label={`Faculty Members (${data?.teachers.length || 0})`}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          />
          <Tab
            icon={<StudentIcon fontSize="small" />}
            iconPosition="start"
            label={`Enrolled Students (${data?.students.length || 0})`}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          />
        </Tabs>
      </Box>

      {/* TAB 0: ORGANIZATION ADMINS LIST */}
      {tabIndex === 0 && (
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
                    No organization admins found. Click "+ Provision New Organization Admin" above to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={data?.admins.length || 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
          />
        </TableContainer>
      )}

      {/* TAB 1: ORGANIZATIONS DIRECTORY */}
      {tabIndex === 1 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          {data?.organizations && data.organizations.length > 0 ? (
            data.organizations.map((org) => (
              <Card key={org.name} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Box sx={{ p: 1, bgcolor: '#eff6ff', borderRadius: 2, color: 'primary.main' }}>
                      <SchoolIcon fontSize="medium" />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        {org.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Affiliated Educational Institution
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">Admins</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{org.adminsCount}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">Teachers</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{org.teachersCount}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">Students</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{org.studentsCount}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">No organizations registered yet.</Typography>
          )}
        </Box>
      )}

      {/* TAB 2: FACULTY & TEACHERS */}
      {tabIndex === 2 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Teacher Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Organization / School</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Specialization</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Experience</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.teachers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((teacher) => (
                <TableRow key={teacher._id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{teacher.fullName}</TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell>
                    <Chip label={teacher.organization || 'General Organization'} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{teacher.specialization}</TableCell>
                  <TableCell>{teacher.experience} years</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={data?.teachers.length || 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
          />
        </TableContainer>
      )}

      {/* TAB 3: ENROLLED STUDENTS */}
      {tabIndex === 3 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Organization / School</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Class / Grade</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Contact Phone</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.students.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((student) => (
                <TableRow key={student._id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{student.fullName}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>
                    <Chip label={student.organization || 'General Organization'} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip label={student.classGrade || 'Class 12-A'} size="small" color="primary" sx={{ fontWeight: 600 }} />
                  </TableCell>
                  <TableCell>{student.phone}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={data?.students.length || 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
          />
        </TableContainer>
      )}

      {/* PROVISION NEW ADMIN MODAL */}
      <Dialog
        open={isCreateAdminOpen}
        onClose={() => !modalSubmitting && setIsCreateAdminOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AdminIcon color="error" />
          Provision Organization Admin
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          {modalError && <Alert severity="error">{modalError}</Alert>}
          <Typography variant="caption" color="text.secondary">
            Only Super Admins can provision Admins. Each Admin is tied to a specific School, College, or Institute.
          </Typography>
          <TextField
            label="Admin Full Name"
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            placeholder="e.g. Prince Agnihotri"
            fullWidth
            required
            size="small"
          />
          <TextField
            label="Admin Email Address"
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            placeholder="admin@school.com"
            fullWidth
            required
            size="small"
          />
          <TextField
            label="Organization / School Name"
            value={adminOrg}
            onChange={(e) => setAdminOrg(e.target.value)}
            placeholder="e.g. Delhi Public School"
            fullWidth
            required
            size="small"
          />
          <TextField
            label="Contact Phone"
            value={adminPhone}
            onChange={(e) => setAdminPhone(e.target.value)}
            placeholder="+91 9876543200"
            fullWidth
            size="small"
          />
          <TextField
            label="Initial Password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            fullWidth
            required
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setIsCreateAdminOpen(false)} disabled={modalSubmitting} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleCreateAdminSubmit}
            disabled={modalSubmitting}
            variant="contained"
            color="error"
            startIcon={modalSubmitting ? <CircularProgress size={16} color="inherit" /> : <CheckIcon />}
            sx={{ fontWeight: 700 }}
          >
            {modalSubmitting ? 'Provisioning...' : 'Provision Admin'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
