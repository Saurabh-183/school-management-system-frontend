'use client';

import React, { useState } from 'react';
import {
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
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Teacher, User } from '@/lib/types';
import { Tooltip } from '@mui/material';

interface MuiTeacherTableProps {
  teachers: Teacher[];
  currentUser?: User | null;
  onScheduleForTeacher: (teacherId: string) => void;
}

export function MuiTeacherTable({ teachers, currentUser, onScheduleForTeacher }: MuiTeacherTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const paginatedTeachers = teachers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell>Mentor Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Domain Specialization</TableCell>
            <TableCell>Experience</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedTeachers.map((teacher) => (
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
                {currentUser && currentUser.role === 'STUDENT' ? (
                  <Tooltip title="Role Restriction: Only Teachers or Admins can create availability slots (API 2)">
                    <span>
                      <Button
                        variant="outlined"
                        size="small"
                        disabled
                        sx={{ fontSize: '0.75rem' }}
                      >
                        Schedule Slot
                      </Button>
                    </span>
                  </Tooltip>
                ) : (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => onScheduleForTeacher(teacher._id)}
                    sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                  >
                    Schedule Slot (API 2)
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
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
  );
}
