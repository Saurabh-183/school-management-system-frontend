'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Chip,
  Divider,
  MenuItem,
  Container,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  School as SchoolIcon,
  LockOutlined as LockIcon,
  Person as PersonIcon,
  SupervisorAccount as AdminIcon,
  Sync as SyncIcon,
  HowToReg as RegisterIcon,
  Login as LoginIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { User, UserRole } from '@/lib/types';

interface MuiAuthScreenProps {
  onAuthSuccess: (user: User) => void;
}

const DEMO_USERS = [
  {
    name: 'Saurabh Agnihotri',
    email: 'saurabh.agnihotri@example.com',
    role: 'STUDENT' as UserRole,
    label: 'Student',
    icon: <SchoolIcon fontSize="small" />,
    color: 'primary' as const,
    desc: 'Browse available sessions, book slots, view learning schedule',
  },
  {
    name: 'Anjali Verma',
    email: 'anjali.verma@example.com',
    role: 'STUDENT' as UserRole,
    label: 'Student',
    icon: <SchoolIcon fontSize="small" />,
    color: 'primary' as const,
    desc: 'Browse available sessions, book slots, view learning schedule',
  },
  {
    name: 'Abhishek Singh',
    email: 'abhishek.singh@example.com',
    role: 'TEACHER' as UserRole,
    label: 'Teacher',
    icon: <PersonIcon fontSize="small" />,
    color: 'secondary' as const,
    desc: 'Schedule availability slots, manage student bookings, mark COMPLETED',
  },
  {
    name: 'Manas Tiwari',
    email: 'manas.tiwari@example.com',
    role: 'TEACHER' as UserRole,
    label: 'Teacher',
    icon: <PersonIcon fontSize="small" />,
    color: 'secondary' as const,
    desc: 'Schedule availability slots, manage student bookings, mark COMPLETED',
  },
  {
    name: 'Prince Agnihotri',
    email: 'prince.agnihotri@example.com',
    role: 'ADMIN' as UserRole,
    label: 'Admin',
    icon: <AdminIcon fontSize="small" />,
    color: 'warning' as const,
    desc: 'Full platform privileges: manage all sessions, schedule, override & inspect',
  },
];

export function MuiAuthScreen({ onAuthSuccess }: MuiAuthScreenProps) {
  const [tabIndex, setTabIndex] = useState<number>(0); // 0: Login, 1: Register
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [seedSuccessMsg, setSeedSuccessMsg] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('Password@123');

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('STUDENT');
  const [regSpecialization, setRegSpecialization] = useState('Full Stack Web Development & Node.js');
  const [regExperience, setRegExperience] = useState<number>(5);
  const [regPassword, setRegPassword] = useState('Password@123');
  const [regConfirmPassword, setRegConfirmPassword] = useState('Password@123');

  // 1-Click Quick Demo Login
  const handleQuickDemoSelect = async (demo: typeof DEMO_USERS[0]) => {
    setLoginEmail(demo.email);
    setLoginPassword('Password@123');
    setErrorMsg(null);
    setSeedSuccessMsg(null);
    setTabIndex(0);

    try {
      setLoading(true);
      const res = await api.login({
        email: demo.email,
        password: 'Password@123',
      });
      onAuthSuccess(res.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Quick login failed. Database may need initialization.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Cloud Database Seeder
  const handleSeedData = async (autoLoginEmail?: string) => {
    setSeeding(true);
    setErrorMsg(null);
    setSeedSuccessMsg(null);
    try {
      await api.seedDemoData();
      setSeedSuccessMsg('Database seeded successfully in MongoDB Atlas! Demo accounts & sessions are ready.');
      if (autoLoginEmail) {
        const res = await api.login({
          email: autoLoginEmail,
          password: 'Password@123',
        });
        onAuthSuccess(res.user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Database seeding failed. Please check backend connection.');
    } finally {
      setSeeding(false);
    }
  };

  // Handle Standard Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      setErrorMsg('Please enter both email address and password.');
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
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Registration (Creates User & Logs In)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword) {
      setErrorMsg('Please complete all required fields.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter matching passwords.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
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
        specialization: regRole === 'TEACHER' ? regSpecialization.trim() : undefined,
        experience: regRole === 'TEACHER' ? Number(regExperience) : undefined,
      });
      onAuthSuccess(res.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f4f5f7',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        py: { xs: 4, sm: 6 },
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        {/* Brand Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 52,
              height: 52,
              borderRadius: 3,
              bgcolor: 'primary.main',
              color: '#ffffff',
              boxShadow: '0 8px 16px rgba(15, 23, 42, 0.15)',
              mb: 1.5,
            }}
          >
            <SchoolIcon sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Mentora Session Booking
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Role-Based Teacher Booking Platform • Node.js, TypeScript & MongoDB
          </Typography>
        </Box>

        {/* Main Card */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
          }}
        >
          {/* Quick 1-Click Demo Profiles */}
          <Box sx={{ bgcolor: '#f8fafc', p: 2.5, borderBottom: '1px solid #e2e8f0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  ⚡
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  1-Click Demo Profiles (Pre-configured RBAC)
                </Typography>
              </Box>

              <Button
                size="small"
                variant="outlined"
                startIcon={seeding ? <CircularProgress size={12} color="inherit" /> : <SyncIcon sx={{ fontSize: '0.9rem' }} />}
                onClick={() => handleSeedData()}
                disabled={seeding || loading}
                sx={{
                  fontSize: '0.72rem',
                  textTransform: 'none',
                  py: 0.3,
                  px: 1,
                  fontWeight: 600,
                  borderRadius: 1.5,
                }}
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
                  disabled={loading || seeding}
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    bgcolor: '#ffffff',
                    borderWidth: 1.5,
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      bgcolor: '#f1f5f9',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                    },
                  }}
                />
              ))}
            </Box>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 1, fontSize: '0.7rem' }}>
              💡 Click any demo profile above to instantly sign in with full role privileges (Default password: <code>Password@123</code>).
            </Typography>
          </Box>

          {/* Tabs: Sign In vs Create Account */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2.5, bgcolor: '#ffffff' }}>
            <Tabs
              value={tabIndex}
              onChange={(_, val) => {
                setTabIndex(val);
                setErrorMsg(null);
                setSeedSuccessMsg(null);
              }}
              variant="fullWidth"
            >
              <Tab
                icon={<LoginIcon fontSize="small" />}
                iconPosition="start"
                label="Sign In"
                sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.9rem', py: 1.8 }}
              />
              <Tab
                icon={<RegisterIcon fontSize="small" />}
                iconPosition="start"
                label="Create Account (Register)"
                sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.9rem', py: 1.8 }}
              />
            </Tabs>
          </Box>

          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            {/* Feedback Notifications */}
            {seedSuccessMsg && (
              <Alert severity="success" sx={{ mb: 2.5 }} onClose={() => setSeedSuccessMsg(null)}>
                {seedSuccessMsg}
              </Alert>
            )}

            {errorMsg && (
              <Alert
                severity="error"
                sx={{ mb: 2.5 }}
                action={
                  errorMsg.includes('Invalid email or password') || errorMsg.includes('failed') ? (
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => handleSeedData(loginEmail || 'abhishek.singh@example.com')}
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
                    Tip: If MongoDB Atlas was freshly created, click &quot;Seed Database Now&quot; to initialize all demo accounts.
                  </Typography>
                )}
              </Alert>
            )}

            {/* TAB 0: SIGN IN FORM */}
            {tabIndex === 0 && (
              <Box component="form" onSubmit={handleLoginSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
                <TextField
                  label="Email Address"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@example.com"
                  fullWidth
                  required
                  autoFocus
                  size="medium"
                  helperText="Use one of the demo emails above or your registered account"
                />

                <TextField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  fullWidth
                  required
                  size="medium"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
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
                  size="large"
                  disabled={loading || seeding}
                  startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <LockIcon />}
                  sx={{
                    py: 1.4,
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)',
                  }}
                >
                  {loading ? 'Authenticating & Verifying...' : 'Sign In to Platform'}
                </Button>
              </Box>
            )}

            {/* TAB 1: CREATE ACCOUNT (REGISTER) FORM */}
            {tabIndex === 1 && (
              <Box component="form" onSubmit={handleRegisterSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Full Name"
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. Saurabh Agnihotri"
                  fullWidth
                  required
                  size="small"
                />

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                  <TextField
                    label="Email Address"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="saurabh@example.com"
                    fullWidth
                    required
                    size="small"
                  />
                  <TextField
                    label="Phone Number"
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    fullWidth
                    required
                    size="small"
                  />
                </Box>

                <TextField
                  select
                  label="Role (RBAC Access Level)"
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  fullWidth
                  size="small"
                  helperText={
                    regRole === 'STUDENT'
                      ? 'Student: Browse and book mentorship slots, view learning history.'
                      : regRole === 'TEACHER'
                      ? 'Teacher: Schedule availability slots, accept bookings, mark sessions complete.'
                      : 'Admin: Full platform privileges, override bookings, view global analytics.'
                  }
                >
                  <MenuItem value="STUDENT">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SchoolIcon fontSize="small" color="primary" />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>STUDENT (Learner)</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="TEACHER">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon fontSize="small" color="secondary" />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>TEACHER (Mentor / Instructor)</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="ADMIN">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AdminIcon fontSize="small" color="warning" />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>ADMIN (Platform Administrator)</Typography>
                    </Box>
                  </MenuItem>
                </TextField>

                {/* Additional fields if registering as Teacher */}
                {regRole === 'TEACHER' && (
                  <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'secondary.main', textTransform: 'uppercase' }}>
                      👨‍🏫 Teacher Profile Details
                    </Typography>
                    <TextField
                      label="Specialization / Subject"
                      value={regSpecialization}
                      onChange={(e) => setRegSpecialization(e.target.value)}
                      placeholder="e.g. Data Structures, Cloud Architecture"
                      fullWidth
                      required
                      size="small"
                    />
                    <TextField
                      label="Years of Experience"
                      type="number"
                      value={regExperience}
                      onChange={(e) => setRegExperience(Math.max(1, parseInt(e.target.value) || 1))}
                      fullWidth
                      required
                      size="small"
                      slotProps={{
                        htmlInput: { min: 1, max: 50 },
                      }}
                    />
                  </Box>
                )}

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                  <TextField
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    fullWidth
                    required
                    size="small"
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                              {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                  <TextField
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Re-type password"
                    fullWidth
                    required
                    size="small"
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small">
                              {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading || seeding}
                  startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <CheckIcon />}
                  sx={{
                    mt: 1,
                    py: 1.3,
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    borderRadius: 2,
                  }}
                >
                  {loading ? 'Creating Account & Initializing...' : 'Create Account & Enter Platform'}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Footer info */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            Mentora Teacher Booking System • Production-Ready RBAC Architecture
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
