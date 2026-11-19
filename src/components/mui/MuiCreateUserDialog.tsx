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
} from '@mui/material';
import { User } from '@/lib/types';

interface MuiCreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { fullName: string; email: string; phone: string }) => Promise<User>;
}

export function MuiCreateUserDialog({
  open,
  onClose,
  onSubmit,
}: MuiCreateUserDialogProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setError('All fields are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });
      setFullName('');
      setEmail('');
      setPhone('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to register student');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        Register Student Account (API 1)
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Full Name"
            size="small"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Saurabh Agnihotri"
            fullWidth
            required
          />

          <TextField
            label="Email Address (Unique)"
            type="email"
            size="small"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. saurabh.agnihotri@example.com"
            helperText="Email must be unique across the platform"
            fullWidth
            required
          />

          <TextField
            label="Phone Number"
            type="tel"
            size="small"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +91 98765 43210"
            fullWidth
            required
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={14} color="inherit" /> : null}
          >
            {isSubmitting ? 'Registering...' : 'Create Student'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
