'use client';

import React, { useState, useMemo } from 'react';
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
  TextField,
  InputAdornment,
  Avatar,
  Card,
  CardContent,
} from '@mui/material';
import {
  School as SchoolIcon,
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Class as ClassIcon,
} from '@mui/icons-material';
import { User } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { MuiEnrollStudentDialog } from './MuiEnrollStudentDialog';

interface MuiStudentTableProps {
  students: User[];
  currentUser?: User | null;
  onStudentEnrolled?: () => void;
}

export function MuiStudentTable({
  students,
  currentUser,
  onStudentEnrolled,
}: MuiStudentTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);

  const canEnroll = currentUser?.role === 'TEACHER' || currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN';

  // Filter students based on search term
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students;
    const term = searchTerm.toLowerCase();
    return students.filter(
      (s) =>
        s.fullName?.toLowerCase().includes(term) ||
        s.email?.toLowerCase().includes(term) ||
        s.phone?.toLowerCase().includes(term) ||
        s.classGrade?.toLowerCase().includes(term) ||
        s.organization?.toLowerCase().includes(term)
    );
  }, [students, searchTerm]);

  const paginatedStudents = useMemo(() => {
    return filteredStudents.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredStudents, page, rowsPerPage]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Top Banner / Actions Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SchoolIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Enrolled Students Directory
            </Typography>
            <Chip
              label={`${students.length} Students`}
              color="primary"
              size="small"
              sx={{ fontWeight: 700 }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            Students registered in your academic institution, cohorts, and assigned classes.
          </Typography>
        </Box>

        {canEnroll && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={() => setIsEnrollDialogOpen(true)}
            sx={{
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2,
              px: 2.5,
              py: 1,
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            + Enroll New Student
          </Button>
        )}
      </Box>

      {/* Search Input Bar */}
      <Paper elevation={0} sx={{ p: 1.5, border: '1px solid #e2e8f0', borderRadius: 2 }}>
        <TextField
          size="small"
          placeholder="Search students by name, email, phone, or class..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Paper>

      {/* Students Data Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: '1px solid #e2e8f0',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                STUDENT PROFILE
              </TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                CONTACT INFORMATION
              </TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                INSTITUTION / SCHOOL
              </TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                CLASS / GRADE
              </TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                STATUS
              </TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                ENROLLED DATE
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6 }}>
                  <SchoolIcon sx={{ fontSize: 44, color: '#cbd5e1', mb: 1 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#64748b' }}>
                    No enrolled students found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm
                      ? `No students matching "${searchTerm}"`
                      : 'Enroll students to see them in this directory.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedStudents.map((student) => {
                const initials = student.fullName
                  ? student.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()
                  : 'ST';

                return (
                  <TableRow
                    key={student._id}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            bgcolor: '#3b82f6',
                            color: '#ffffff',
                            fontWeight: 700,
                            width: 36,
                            height: 36,
                            fontSize: '0.85rem',
                          }}
                        >
                          {initials}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                            {student.fullName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {student._id?.slice(-6)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                        <Typography
                          variant="caption"
                          sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#334155' }}
                        >
                          <EmailIcon sx={{ fontSize: 13, color: '#94a3b8' }} /> {student.email}
                        </Typography>
                        {student.phone && (
                          <Typography
                            variant="caption"
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748b' }}
                          >
                            <PhoneIcon sx={{ fontSize: 13, color: '#94a3b8' }} /> {student.phone}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                        {student.organization || 'General Institution'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        icon={<ClassIcon sx={{ fontSize: '14px !important' }} />}
                        label={student.classGrade || 'Class 12-A'}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={student.isTrial ? 'TRIAL (72h)' : 'ACTIVE ENROLLED'}
                        color={student.isTrial ? 'warning' : 'success'}
                        size="small"
                        sx={{ fontWeight: 700, fontSize: '0.68rem' }}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {student.createdAt ? formatDate(student.createdAt) : 'Registered'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredStudents.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </TableContainer>

      {/* Enroll Student Dialog */}
      <MuiEnrollStudentDialog
        open={isEnrollDialogOpen}
        onClose={() => setIsEnrollDialogOpen(false)}
        currentUser={currentUser || null}
        onStudentEnrolled={() => {
          setIsEnrollDialogOpen(false);
          if (onStudentEnrolled) onStudentEnrolled();
        }}
      />
    </Box>
  );
}
