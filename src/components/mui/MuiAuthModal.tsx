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
} from '@mui/material';
import {
  Close as CloseIcon,
  Visibility,
  VisibilityOff,
  School as SchoolIcon,
  LockOutlined as LockIcon,
  Login as LoginIcon,
  HourglassTop as TrialIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { User } from '@/lib/types';

interface MuiAuthModalProps {
  open: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export function MuiAuthModal({ open, onClose, onAuthSuccess }: MuiAuthModalProps) {
  const [tabIndex, setTabIndex] = useState<number>(0);
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
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

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
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ m: 0, p: 2.5, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              bgcolor: 'primary.main',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SchoolIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              Mentora Authentication
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Sign In or Student 72-Hour Free Trial
            </Typography>
          </Box>
        </Box>
        <IconButton aria-label="close" onClick={onClose} sx={{ color: (theme) => theme.palette.grey[500] }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2.5 }}>
        <Tabs
          value={tabIndex}
          onChange={(_, val) => {
            setTabIndex(val);
            setErrorMsg(null);
          }}
          variant="fullWidth"
        >
          <Tab icon={<LoginIcon fontSize="small" />} iconPosition="start" label="Sign In" sx={{ textTransform: 'none', fontWeight: 700 }} />
          <Tab icon={<TrialIcon fontSize="small" />} iconPosition="start" label="Student 72h Trial" sx={{ textTransform: 'none', fontWeight: 700 }} />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}

        {tabIndex === 0 && (
          <Box component="form" onSubmit={handleLoginSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Email Address"
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="name@school.edu"
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
              sx={{ py: 1.2, fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Box>
        )}

        {tabIndex === 1 && (
          <Box component="form" onSubmit={handleRegisterSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
            <Alert severity="warning" sx={{ fontSize: '0.78rem', py: 0.5 }}>
              Students evaluate with a 72-hour trial. Credentials will be emailed. Teachers & Admins must be provisioned internally.
            </Alert>
            <TextField
              label="Full Name"
              value={regFullName}
              onChange={(e) => setRegFullName(e.target.value)}
              placeholder="e.g. Saurabh Agnihotri"
              fullWidth
              required
              size="small"
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <TextField
                label="Email"
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="saurabh@example.com"
                fullWidth
                required
                size="small"
              />
              <TextField
                label="Phone"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="+91 98765 43210"
                fullWidth
                required
                size="small"
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <TextField
                label="School / Organization"
                value={regOrganization}
                onChange={(e) => setRegOrganization(e.target.value)}
                placeholder="Delhi Public School"
                fullWidth
                required
                size="small"
              />
              <TextField
                label="Class / Grade"
                value={regClassGrade}
                onChange={(e) => setRegClassGrade(e.target.value)}
                placeholder="Class 12-A"
                fullWidth
                required
                size="small"
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
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
                placeholder="Confirm password"
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
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SchoolIcon />}
              sx={{ mt: 1, py: 1.2, fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
            >
              {loading ? 'Creating Account...' : 'Register & Start 72-Hour Free Trial'}
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
