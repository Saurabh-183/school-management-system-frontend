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
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { api } from '@/lib/api';
import { User } from '@/lib/types';

interface MuiCreateTeacherDialogProps {
  open: boolean;
  onClose: () => void;
  currentUser: User | null;
  onTeacherCreated?: () => void;
}

export function MuiCreateTeacherDialog({
  open,
  onClose,
  currentUser,
  onTeacherCreated,
}: MuiCreateTeacherDialogProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+919876543210');
  const [password, setPassword] = useState('Password@123');
  const [specialization, setSpecialization] = useState('Full Stack Web Development & Node.js');
  const [experienceYears, setExperienceYears] = useState<number>(5);
  const [assignedClasses, setAssignedClasses] = useState('Class 10-A, Class 12-A');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !password) {
      setError('Full name, email, and password are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const classesArray = assignedClasses
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

      await api.provisionTeacher({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        specialization: specialization.trim(),
        experienceYears: Number(experienceYears) || 5,
        assignedClasses: classesArray.length > 0 ? classesArray : ['Class 12-A'],
        organization: currentUser?.organization || 'Delhi Public School (DPS Campus)',
      });

      setFullName('');
      setEmail('');
      onClose();
      if (onTeacherCreated) onTeacherCreated();
    } catch (err: any) {
      setError(err.message || 'Failed to provision teacher.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ fontWeight: 800, pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonAddIcon color="secondary" /> Provision New Faculty Instructor
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            School Administrators create Teachers for their own institutional facility (<strong>{currentUser?.organization || 'Your Campus'}</strong>). An official onboarding welcome email will be dispatched immediately.
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Teacher Full Name"
            size="small"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Vikram Seth"
            fullWidth
            required
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <TextField
              label="Email Address"
              type="email"
              size="small"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. vikram.seth@example.com"
              fullWidth
              required
            />
            <TextField
              label="Contact Phone"
              size="small"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+919876543210"
              fullWidth
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <TextField
              label="Specialization / Subject"
              size="small"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="e.g. Advanced Mathematics"
              fullWidth
              required
            />
            <TextField
              label="Experience (Years)"
              type="number"
              size="small"
              value={experienceYears}
              onChange={(e) => setExperienceYears(Math.max(1, parseInt(e.target.value) || 1))}
              fullWidth
              required
            />
          </Box>

          <TextField
            label="Assigned Classes / Cohorts (Comma-separated)"
            size="small"
            value={assignedClasses}
            onChange={(e) => setAssignedClasses(e.target.value)}
            placeholder="Class 10-A, Class 12-A"
            helperText="e.g. Class 10-A, Class 12-A"
            fullWidth
          />

          <TextField
            label="Default Password"
            size="small"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="Sent in the official welcome onboarding email"
            fullWidth
            required
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <PersonAddIcon />}
            sx={{ fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
          >
            {isSubmitting ? 'Provisioning...' : 'Provision Teacher & Send Email'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
