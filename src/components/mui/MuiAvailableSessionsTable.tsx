'use client';

import React, { useState, useEffect } from 'react';
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
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  CalendarMonth as CalendarIcon,
  Schedule as ScheduleIcon,
  BookOnline as BookIcon,
  Refresh as RefreshIcon,
  MenuBook as MenuBookIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { Session, User } from '@/lib/types';
import { useDebounce } from '@/lib/useDebounce';
import { formatTimeUTC, getDurationMinutes } from '@/lib/utils';
import { MuiLearningResourcesDialog } from '../learning/MuiLearningResourcesDialog';

interface MuiAvailableSessionsTableProps {
  sessions: Session[];
  totalSessions: number;
  selectedDate: string;
  onDateChange: (date: string) => void;
  page: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeUser: User | null;
  currentUser: User | null;
  onOpenAuthModal: () => void;
  onBookSession: (sessionId: string) => Promise<void>;
  isLoading: boolean;
  onRefresh: () => void;
}

export function MuiAvailableSessionsTable({
  sessions,
  totalSessions,
  selectedDate,
  onDateChange,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  searchQuery,
  onSearchChange,
  activeUser,
  currentUser,
  onOpenAuthModal,
  onBookSession,
  isLoading,
  onRefresh,
}: MuiAvailableSessionsTableProps) {
  // Local search state for instant typing with debounced prop notification
  const [searchInput, setSearchInput] = useState(searchQuery);
  const debouncedSearch = useDebounce(searchInput, 350);

  // Sync debounced search to parent handler
  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  const [bookingId, setBookingId] = useState<string | null>(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState('ALL');
  const [selectedSessionForResources, setSelectedSessionForResources] = useState<Session | null>(null);

  // Available unique specializations
  const specializations = React.useMemo(() => {
    const set = new Set<string>();
    sessions.forEach((s) => {
      if (s.teacher?.specialization) set.add(s.teacher.specialization);
    });
    return Array.from(set);
  }, [sessions]);

  // Client-side specialization filter
  const displayedSessions = React.useMemo(() => {
    if (selectedSpecialization === 'ALL') return sessions;
    return sessions.filter((s) => s.teacher?.specialization === selectedSpecialization);
  }, [sessions, selectedSpecialization]);

  const handleBook = async (sessionId: string) => {
    try {
      setBookingId(sessionId);
      await onBookSession(sessionId);
    } finally {
      setBookingId(null);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Control Bar: MUI Calendar Date Picker, Debounced Search, Specialization Dropdown */}
      <Paper sx={{ p: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
        {/* MUI Date Calendar Selector */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Session Date (MUI Calendar)"
            value={selectedDate ? dayjs(selectedDate) : null}
            onChange={(newVal) => {
              if (newVal && newVal.isValid()) {
                onDateChange(newVal.format('YYYY-MM-DD'));
              }
            }}
            slotProps={{
              textField: {
                size: 'small',
                sx: { minWidth: { xs: '100%', sm: 200 }, width: { xs: '100%', sm: 'auto' } },
              },
            }}
          />
        </LocalizationProvider>

        {/* Debounced Search */}
        <TextField
          label="Search Mentor or Subject"
          size="small"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="e.g. Abhishek Singh, Node.js..."
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: searchInput ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchInput('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
          sx={{ flex: 1, minWidth: { xs: '100%', sm: 220 } }}
        />

        {/* Specialization Filter Dropdown */}
        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 }, width: { xs: '100%', sm: 'auto' } }}>
          <InputLabel>Specialization</InputLabel>
          <Select
            label="Specialization"
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
          >
            <MenuItem value="ALL">All Specializations</MenuItem>
            {specializations.map((spec) => (
              <MenuItem key={spec} value={spec}>
                {spec}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Refresh Button */}
        <Tooltip title="Refresh available slots">
          <IconButton onClick={onRefresh} sx={{ border: '1px solid #e4e4e7', display: { xs: 'none', sm: 'inline-flex' } }}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Paper>

      {/* Main MUI Table */}
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 700 }} aria-label="available sessions table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 700 }}>Mentor Details</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 700 }}>Specialization & Exp</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 700 }}>Time Window (UTC)</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 700 }}>Duration</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 700 }}>Status</TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'nowrap', fontWeight: 700 }}>Action (API 4)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={32} />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                    Executing MongoDB Aggregation Pipeline ($match, $lookup, $unwind, $sort)...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : displayedSessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <ScheduleIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="subtitle2" color="text.primary">
                    No Available Sessions Found
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 400, mx: 'auto', mt: 0.5 }}>
                    No sessions match the selected date ({selectedDate}) or search filter. Use "Schedule Slot" above to add availability.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              displayedSessions.map((session) => {
                const duration = getDurationMinutes(session.startTime, session.endTime);
                const isBookingThis = bookingId === session._id;

                return (
                  <TableRow
                    key={session._id}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    {/* Mentor Details */}
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {session.teacher?.fullName || 'Assigned Mentor'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {session.teacher?.email}
                      </Typography>
                    </TableCell>

                    {/* Specialization & Experience */}
                    <TableCell>
                      <Typography variant="body2">
                        {session.teacher?.specialization}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {session.teacher?.experience} years experience
                      </Typography>
                    </TableCell>

                    {/* Time Window (UTC) */}
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                        {formatTimeUTC(session.startTime)} – {formatTimeUTC(session.endTime)}
                      </Typography>
                    </TableCell>

                    {/* Duration */}
                    <TableCell>
                      <Chip
                        label={`${duration} mins`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem', fontWeight: 500 }}
                      />
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Chip
                        label={session.status}
                        size="small"
                        color="success"
                        sx={{
                          bgcolor: '#ecfdf5',
                          color: '#047857',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                        }}
                      />
                    </TableCell>

                    {/* Actions: Notes & Booking */}
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          color="secondary"
                          startIcon={<MenuBookIcon fontSize="small" />}
                          onClick={() => setSelectedSessionForResources(session)}
                          sx={{ fontSize: '0.72rem', py: 0.6, fontWeight: 700, textTransform: 'none', borderRadius: 1.5 }}
                        >
                          Notes & Lectures
                        </Button>

                        {!currentUser ? (
                          <Button
                            variant="outlined"
                            size="small"
                            color="primary"
                            onClick={onOpenAuthModal}
                            sx={{ fontSize: '0.75rem', py: 0.6, fontWeight: 600 }}
                          >
                            Sign In to Book
                          </Button>
                        ) : currentUser.role === 'TEACHER' ? (
                          <Tooltip title="Teachers manage their own schedule. Switch to a Student account to book.">
                            <span>
                              <Button
                                variant="outlined"
                                size="small"
                                disabled
                                sx={{ fontSize: '0.72rem', py: 0.6 }}
                              >
                                Teacher Slot
                              </Button>
                            </span>
                          </Tooltip>
                        ) : (
                          <Button
                            variant="contained"
                            size="small"
                            color="primary"
                            startIcon={isBookingThis ? <CircularProgress size={14} color="inherit" /> : <BookIcon />}
                            disabled={isBookingThis || !activeUser}
                            onClick={() => handleBook(session._id)}
                            sx={{ fontSize: '0.75rem', py: 0.6, fontWeight: 600 }}
                          >
                            {isBookingThis
                              ? 'Booking...'
                              : activeUser
                              ? `Book for ${activeUser.fullName.split(' ')[0]}`
                              : 'Book Slot'}
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* MUI TablePagination (Server-side + Client-side) */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalSessions}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => onPageChange(newPage)}
          onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
        />
      </TableContainer>

      {/* In-App Learning Portal: Notes, Video Lectures & Documents */}
      <MuiLearningResourcesDialog
        open={Boolean(selectedSessionForResources)}
        onClose={() => setSelectedSessionForResources(null)}
        session={selectedSessionForResources}
        currentUser={currentUser}
        onResourceAdded={onRefresh}
      />
    </Box>
  );
}
