'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  Verified as VerifiedIcon,
  SupervisorAccount as AdminIcon,
} from '@mui/icons-material';
import { Teacher, User } from '@/lib/types';
import { api } from '@/lib/api';

interface MuiTeacherTableProps {
  teachers: Teacher[];
  currentUser?: User | null;
  onScheduleForTeacher: (teacherId: string) => void;
  onTeacherCreated?: () => void;
}

export function MuiTeacherTable({
  teachers,
  currentUser,
  onScheduleForTeacher,
  onTeacherCreated,
}: MuiTeacherTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Admin Add Teacher Dialog State
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paginatedTeachers = teachers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleAddTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !specialization.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await api.createTeacher({
        fullName: name.trim(),
        email: email.trim(),
        specialization: specialization.trim(),
        experience: Number(experience),
      });
      setIsAddTeacherOpen(false);
      setName('');
      setEmail('');
      setSpecialization('');
      setExperience(5);
      if (onTeacherCreated) onTeacherCreated();
    } catch (err: any) {
      setError(err.message || 'Failed to create teacher profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAdmin = currentUser?.role === 'ADMIN';
  const isTeacher = currentUser?.role === 'TEACHER';
  const isStudent = currentUser?.role === 'STUDENT';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header bar with RBAC Add Teacher action */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
            Faculty & Mentor Directory
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Verified instructors and subject matter experts ({teachers.length} registered)
          </Typography>
        </Box>

        {/* RBAC: Only Admin can add teachers */}
        {isAdmin && (
          <Button
            variant="contained"
            size="small"
            color="warning"
            startIcon={<PersonAddIcon />}
            onClick={() => setIsAddTeacherOpen(true)}
            sx={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'none', borderRadius: 2 }}
          >
            Add New Teacher (Admin Only)
          </Button>
        )}
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Mentor Name</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Domain Specialization</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Experience</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>RBAC Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTeachers.map((teacher) => {
              const isMyProfile =
                isTeacher &&
                (currentUser?.email === teacher.email || currentUser?.teacherId === teacher._id);

              return (
                <TableRow key={teacher._id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {teacher.fullName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {teacher.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{teacher.specialization}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {teacher.experience} years
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {isStudent ? (
                      <Chip
                        icon={<VerifiedIcon sx={{ fontSize: '0.85rem' }} />}
                        label="Verified Mentor"
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontSize: '0.72rem', fontWeight: 600 }}
                      />
                    ) : isAdmin || isMyProfile ? (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => onScheduleForTeacher(teacher._id)}
                        sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                      >
                        Schedule Slot (API 2)
                      </Button>
                    ) : (
                      <Chip
                        label="Colleague"
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.72rem', color: 'text.secondary' }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 20]}
          component="div"
          count={teachers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* Admin Add Teacher Dialog */}
      <Dialog
        open={isAddTeacherOpen}
        onClose={() => !isSubmitting && setIsAddTeacherOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AdminIcon color="warning" />
          Add Teacher Profile (Admin Only)
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dr. Ramesh Kumar"
            fullWidth
            required
            size="small"
          />
          <TextField
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ramesh@example.com"
            fullWidth
            required
            size="small"
          />
          <TextField
            label="Domain Specialization"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            placeholder="e.g. Machine Learning, Cloud Systems"
            fullWidth
            required
            size="small"
          />
          <TextField
            label="Years of Experience"
            type="number"
            value={experience}
            onChange={(e) => setExperience(Math.max(1, parseInt(e.target.value) || 1))}
            fullWidth
            required
            size="small"
            slotProps={{ htmlInput: { min: 1, max: 50 } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setIsAddTeacherOpen(false)} disabled={isSubmitting} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleAddTeacherSubmit}
            disabled={isSubmitting}
            variant="contained"
            color="warning"
            startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <PersonAddIcon />}
            sx={{ fontWeight: 700 }}
          >
            {isSubmitting ? 'Adding...' : 'Create Teacher'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
