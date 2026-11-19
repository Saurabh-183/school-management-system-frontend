'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Teacher } from '@/lib/types';

interface MuiCreateSessionDialogProps {
  open: boolean;
  onClose: () => void;
  teachers: Teacher[];
  onSubmit: (data: { teacherId: string; startTime: string; endTime: string }) => Promise<void>;
  defaultTeacherId?: string;
}

export function MuiCreateSessionDialog({
  open,
  onClose,
  teachers,
  onSubmit,
  defaultTeacherId = '',
}: MuiCreateSessionDialogProps) {
  const [teacherId, setTeacherId] = useState(defaultTeacherId);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setDate(new Date().toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (defaultTeacherId) setTeacherId(defaultTeacherId);
    else if (teachers.length > 0 && !teacherId) setTeacherId(teachers[0]._id);
  }, [defaultTeacherId, teachers, teacherId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!teacherId) {
      setError('Please select a teacher.');
      return;
    }
    if (!date) {
      setError('Please select a date.');
      return;
    }

    const startISO = new Date(`${date}T${startTime}:00.000Z`);
    const endISO = new Date(`${date}T${endTime}:00.000Z`);

    if (endISO.getTime() <= startISO.getTime()) {
      setError('endTime must be strictly greater than startTime.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        teacherId,
        startTime: startISO.toISOString(),
        endTime: endISO.toISOString(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create session');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        Schedule Mentor Availability (API 2)
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          {/* Teacher Dropdown */}
          <FormControl fullWidth size="small">
            <InputLabel>Mentor / Teacher</InputLabel>
            <Select
              label="Mentor / Teacher"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              required
            >
              {teachers.map((t) => (
                <MenuItem key={t._id} value={t._id}>
                  {t.fullName} ({t.specialization} • {t.experience} yrs exp)
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Date Picker */}
          <TextField
            label="Session Date"
            type="date"
            size="small"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
            required
          />

          {/* Start & End Times */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="Start Time (UTC)"
              type="time"
              size="small"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
              required
            />
            <TextField
              label="End Time (UTC)"
              type="time"
              size="small"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
              required
            />
          </Box>
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
            {isSubmitting ? 'Scheduling...' : 'Publish Slot'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
