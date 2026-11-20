'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Chip,
  Divider,
  MenuItem,
} from '@mui/material';
import {
  Close as CloseIcon,
  Visibility,
  VisibilityOff,
  School as SchoolIcon,
  LockOutlined as LockIcon,
  Person as PersonIcon,
  SupervisorAccount as AdminIcon,
  Security as SecurityIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { User, UserRole } from '@/lib/types';

interface MuiAuthModalProps {
  open: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

const DEMO_USERS = [
  {
    name: 'Saurabh Agnihotri (Super Admin)',
    email: 'superadmin@gmail.com',
    role: 'SUPER_ADMIN' as UserRole,
    label: 'Super Admin',
    icon: <SecurityIcon fontSize="small" />,
    color: 'error' as const,
    password: '#*Saurabh8737@',
    desc: 'Ultimate governance: provision school admins, view all organizations, cross-tenant audit',
  },
  {
    name: 'Prince Agnihotri',
    email: 'prince.agnihotri@example.com',
    role: 'ADMIN' as UserRole,
    label: 'DPS Admin',
    icon: <AdminIcon fontSize="small" />,
    color: 'warning' as const,
    password: 'Password@123',
    desc: 'School Admin: Delhi Public School (DPS Campus) - manage teachers, classes & students',
  },
  {
    name: 'Abhishek Singh',
    email: 'abhishek.singh@example.com',
    role: 'TEACHER' as UserRole,
    label: 'Teacher',
    icon: <PersonIcon fontSize="small" />,
    color: 'secondary' as const,
    password: 'Password@123',
    desc: 'Can schedule availability slots, mark booked sessions COMPLETED',
  },
  {
    name: 'Manas Tiwari',
    email: 'manas.tiwari@example.com',
    role: 'TEACHER' as UserRole,
    label: 'Teacher',
    icon: <PersonIcon fontSize="small" />,
    color: 'secondary' as const,
    password: 'Password@123',
    desc: 'Can schedule availability slots, mark booked sessions COMPLETED',
  },
  {
    name: 'Saurabh Agnihotri',
    email: 'saurabh.agnihotri@example.com',
    role: 'STUDENT' as UserRole,
    label: 'Student',
    icon: <SchoolIcon fontSize="small" />,
    color: 'primary' as const,
    password: 'Password@123',
    desc: 'Can book slots, view upcoming & completed sessions',
  },
  {
    name: 'Anjali Verma',
    email: 'anjali.verma@example.com',
    role: 'STUDENT' as UserRole,
    label: 'Student',
    icon: <SchoolIcon fontSize="small" />,
    color: 'primary' as const,
    password: 'Password@123',
    desc: 'Can book slots, view upcoming & completed sessions',
  },
];

export function MuiAuthModal({ open, onClose, onAuthSuccess }: MuiAuthModalProps) {
  const [tabIndex, setTabIndex] = useState<number>(0); // 0: Login, 1: Register
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<typeof DEMO_USERS[0] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [seedSuccessMsg, setSeedSuccessMsg] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('Password@123');

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('Password@123');
  const [regRole, setRegRole] = useState<UserRole>('STUDENT');

  const handleSeedData = async (autoLoginDemo?: typeof DEMO_USERS[0]) => {
    setSeeding(true);
    setErrorMsg(null);
    setSeedSuccessMsg(null);
    try {
      await api.seedDemoData();
      setSeedSuccessMsg('Database seeded successfully! Demo accounts & sessions are ready in MongoDB Atlas.');
      if (autoLoginDemo) {
        const pass = (autoLoginDemo as any).password || 'Password@123';
        setLoginEmail(autoLoginDemo.email);
        setLoginPassword(pass);
        const res = await api.login({
          email: autoLoginDemo.email,
          password: pass,
        });
        onAuthSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Database seeding failed. Please check backend connection.');
    } finally {
      setSeeding(false);
    }
  };

  const handleQuickDemoSelect = async (demo: typeof DEMO_USERS[0]) => {
    const pass = (demo as any).password || 'Password@123';
    setSelectedDemo(demo);
    setLoginEmail(demo.email);
    setLoginPassword(pass);
    setErrorMsg(null);
    setSeedSuccessMsg(null);
    setTabIndex(0);

    // Auto-login on demo click for quick convenience
    try {
      setLoading(true);
      const res = await api.login({
        email: demo.email,
        password: pass,
      });
      onAuthSuccess(res.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setErrorMsg('Please fill in both email and password.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await api.login({
        email: loginEmail.trim(),
        password: loginPassword,
      });
      onAuthSuccess(res.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName || !regEmail || !regPhone || !regPassword) {
      setErrorMsg('Please fill in all required registration fields.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await api.register({
        fullName: regFullName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword,
        role: regRole,
      });
      onAuthSuccess(res.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LockIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.2 }}>
              Authentication & Role-Based Access
            </Typography>
            <Typography variant="caption" color="text.secondary">
              JWT Access Tokens • RBAC (Student, Teacher, Admin)
            </Typography>
          </Box>
        </Box>
        <IconButton aria-label="close" onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Divider />

      {/* Quick 1-Click Role Logins */}
      <Box sx={{ px: 2.5, pt: 2, pb: 1, bgcolor: '#fbfbfb' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ⚡ 1-Click Demo Profiles (Pre-seeded with RBAC)
          </Typography>
          <Button
            size="small"
            variant="text"
            startIcon={seeding ? <CircularProgress size={12} color="inherit" /> : <SyncIcon sx={{ fontSize: '0.9rem' }} />}
            onClick={() => handleSeedData()}
            disabled={seeding || loading}
            sx={{ fontSize: '0.72rem', textTransform: 'none', py: 0.2, px: 0.8, color: 'primary.main', fontWeight: 600 }}
          >
            {seeding ? 'Seeding Atlas DB...' : '🌱 Seed Demo Data'}
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {DEMO_USERS.map((demo) => (
            <Chip
              key={demo.email}
              icon={demo.icon}
              label={`${demo.name} (${demo.label})`}
              color={demo.color}
              variant="outlined"
              size="small"
              onClick={() => handleQuickDemoSelect(demo)}
              sx={{
                fontWeight: 600,
                fontSize: '0.75rem',
                cursor: 'pointer',
                bgcolor: '#ffffff',
                '&:hover': { bgcolor: '#f0f4f8' },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2.5 }}>
        <Tabs value={tabIndex} onChange={(_, val) => { setTabIndex(val); setErrorMsg(null); setSeedSuccessMsg(null); }}>
          <Tab label="Sign In" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="Create Account (Register)" sx={{ textTransform: 'none', fontWeight: 600 }} />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 2.5 }}>
        {seedSuccessMsg && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSeedSuccessMsg(null)}>
            {seedSuccessMsg}
          </Alert>
        )}

        {errorMsg && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              errorMsg.includes('Invalid email or password') || errorMsg.includes('failed') ? (
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => handleSeedData(selectedDemo || DEMO_USERS[2])}
                  disabled={seeding}
                  sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem' }}
                >
                  {seeding ? 'Seeding...' : '🌱 Seed Database Now'}
                </Button>
              ) : undefined
            }
          >
            {errorMsg}
            {errorMsg.includes('Invalid email or password') && (
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                Tip: The cloud MongoDB database was freshly created and is empty. Click &quot;Seed Database Now&quot; above to initialize all 5 demo accounts.
              </Typography>
            )}
          </Alert>
        )}

        {/* Tab 0: Sign In */}
        {tabIndex === 0 && (
          <Box component="form" onSubmit={handleLoginSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Email Address"
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="saurabh.agnihotri@example.com"
              fullWidth
              size="small"
              required
            />

            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              fullWidth
              size="small"
              required
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ mt: 1, py: 1, fontWeight: 600 }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In with Access Token'}
            </Button>
          </Box>
        )}

        {/* Tab 1: Create Account */}
        {tabIndex === 1 && (
          <Box component="form" onSubmit={handleRegisterSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Full Name"
              value={regFullName}
              onChange={(e) => setRegFullName(e.target.value)}
              placeholder="e.g. Saurabh Agnihotri"
              fullWidth
              size="small"
              required
            />

            <TextField
              label="Email Address"
              type="email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              placeholder="e.g. saurabh@example.com"
              fullWidth
              size="small"
              required
            />

            <TextField
              label="Phone Number"
              value={regPhone}
              onChange={(e) => setRegPhone(e.target.value)}
              placeholder="+91-9876543210"
              fullWidth
              size="small"
              required
            />

            <TextField
              select
              label="Account Role (Public Self-Registration)"
              value={regRole}
              onChange={(e) => setRegRole(e.target.value as 'STUDENT' | 'TEACHER')}
              fullWidth
              size="small"
              helperText="Admins are provisioned securely by Super Admin"
            >
              <MenuItem value="STUDENT">Student (Book sessions & view history)</MenuItem>
              <MenuItem value="TEACHER">Teacher (Publish slots & mark completion)</MenuItem>
            </TextField>

            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              fullWidth
              size="small"
              required
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ mt: 1, py: 1, fontWeight: 600 }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Register & Generate Token'}
            </Button>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2.5, pb: 2, pt: 0, justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          Password for all demo accounts: <strong>Password@123</strong>
        </Typography>
        <Button onClick={onClose} size="small" color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
