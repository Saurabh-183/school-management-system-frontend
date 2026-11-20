'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';
import { api } from '@/lib/api';
import { User } from '@/lib/types';

interface MuiEnrollStudentDialogProps {
  open: boolean;
  onClose: () => void;
  currentUser: User | null;
  onStudentEnrolled?: () => void;
}

export function MuiEnrollStudentDialog({
  open,
  onClose,
  currentUser,
  onStudentEnrolled,
}: MuiEnrollStudentDialogProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+919876543210');
  const [password, setPassword] = useState('Password@123');
  const [classGrade, setClassGrade] = useState('Class 12-A');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !password) {
      setError('Student name, email, and password are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.createStudent({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        classGrade: classGrade.trim() || 'Class 12-A',
        organization: currentUser?.organization || 'Delhi Public School (DPS Campus)',
      });

      setFullName('');
      setEmail('');
      onClose();
      if (onStudentEnrolled) onStudentEnrolled();
    } catch (err: any) {
      setError(err.message || 'Failed to enroll student.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ fontWeight: 800, pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <SchoolIcon color="primary" /> Enroll Student in My Class
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Enrolling a student grants them full permanent access under your faculty section (<strong>{currentUser?.fullName}</strong> • {currentUser?.organization}). An official welcome onboarding email with their credentials will be dispatched automatically.
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Student Full Name"
            size="small"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Rohan Sharma"
            fullWidth
            required
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <TextField
              label="Email Address (Login Username)"
              type="email"
              size="small"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rohan@example.com"
              fullWidth
              required
            />
            <TextField
              label="Mobile Number"
              size="small"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+919876543210"
              fullWidth
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <TextField
              label="Assigned Class / Grade Section"
              size="small"
              value={classGrade}
              onChange={(e) => setClassGrade(e.target.value)}
              placeholder="e.g. Class 12-B"
              fullWidth
              required
            />
            <TextField
              label="Initial Password"
              size="small"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="Emailed to student upon enrollment"
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <SchoolIcon />}
            sx={{ fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
          >
            {isSubmitting ? 'Enrolling...' : 'Enroll Student & Send Email'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
