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
  Container,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  School as SchoolIcon,
  LockOutlined as LockIcon,
  Login as LoginIcon,
  HourglassTop as TrialIcon,
  CheckCircle as CheckIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { User } from '@/lib/types';

interface MuiAuthScreenProps {
  onAuthSuccess: (user: User) => void;
}

export function MuiAuthScreen({ onAuthSuccess }: MuiAuthScreenProps) {
  const [tabIndex, setTabIndex] = useState<number>(0); // 0: Sign In, 1: Student Trial Register
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state (Student 72-Hour Trial)
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regOrganization, setRegOrganization] = useState('');
  const [regClassGrade, setRegClassGrade] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

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
      setErrorMsg(err.message || 'Authentication failed. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Student 72-Hour Trial Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !regFullName.trim() ||
      !regEmail.trim() ||
      !regPhone.trim() ||
      !regOrganization.trim() ||
      !regClassGrade.trim() ||
      !regPassword
    ) {
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
        role: 'STUDENT',
        organization: regOrganization.trim(),
        classGrade: regClassGrade.trim(),
      });
      onAuthSuccess(res.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check your details or try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f1f5f9',
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
              width: 54,
              height: 54,
              borderRadius: 3,
              bgcolor: 'primary.main',
              color: '#ffffff',
              boxShadow: '0 8px 20px rgba(15, 23, 42, 0.18)',
              mb: 1.5,
            }}
          >
            <SchoolIcon sx={{ fontSize: 30 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Mentora Learning & Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Enterprise Role-Based Academic Management • Super Admin, Admin, Teacher & Student Portals
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
          {/* Tabs: Sign In vs Student Trial Registration */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2.5, bgcolor: '#ffffff' }}>
            <Tabs
              value={tabIndex}
              onChange={(_, val) => {
                setTabIndex(val);
                setErrorMsg(null);
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
                icon={<TrialIcon fontSize="small" />}
                iconPosition="start"
                label="Student 72h Free Trial"
                sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.9rem', py: 1.8 }}
              />
            </Tabs>
          </Box>

          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            {/* Feedback Notifications */}
            {errorMsg && (
              <Alert severity="error" sx={{ mb: 2.5 }}>
                {errorMsg}
              </Alert>
            )}

            {/* TAB 0: SIGN IN FORM */}
            {tabIndex === 0 && (
              <Box component="form" onSubmit={handleLoginSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
                <TextField
                  label="Email Address (Username)"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@school.edu or user@example.com"
                  fullWidth
                  required
                  autoFocus
                  size="medium"
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
                  disabled={loading}
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
                  {loading ? 'Authenticating & Verifying...' : 'Sign In to Portal'}
                </Button>
              </Box>
            )}

            {/* TAB 1: STUDENT 72-HOUR FREE TRIAL FORM */}
            {tabIndex === 1 && (
              <Box component="form" onSubmit={handleRegisterSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Alert
                  severity="warning"
                  icon={<TrialIcon fontSize="inherit" />}
                  sx={{ py: 1, fontSize: '0.8rem', borderRadius: 2 }}
                >
                  <strong>72-Hour Student Free Trial:</strong> Public registration is strictly for students to evaluate the platform for 72 hours. An onboarding email with your credentials will be dispatched immediately. Teachers & Admins must be provisioned after login by their respective administrators.
                </Alert>

                <TextField
                  label="Student Full Name"
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
                    placeholder="student@example.com"
                    fullWidth
                    required
                    size="small"
                  />
                  <TextField
                    label="Mobile Number"
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    fullWidth
                    required
                    size="small"
                  />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                  <TextField
                    label="School / Organization / Institute"
                    value={regOrganization}
                    onChange={(e) => setRegOrganization(e.target.value)}
                    placeholder="e.g. Delhi Public School"
                    fullWidth
                    required
                    size="small"
                  />
                  <TextField
                    label="Assigned Class / Grade"
                    value={regClassGrade}
                    onChange={(e) => setRegClassGrade(e.target.value)}
                    placeholder="e.g. Class 12-A"
                    fullWidth
                    required
                    size="small"
                  />
                </Box>

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
                  disabled={loading}
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
                  {loading ? 'Creating Student Account...' : 'Register & Start 72-Hour Free Trial'}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Security Footer */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            <SecurityIcon sx={{ fontSize: 14 }} /> Mentora Secure Institutional Portal • Hierarchical RBAC Isolation Enforced
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
