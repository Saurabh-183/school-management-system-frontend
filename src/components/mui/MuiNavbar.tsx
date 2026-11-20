'use client';

import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  FormControl,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  School as SchoolIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  Code as CodeIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  SupervisorAccount as AdminIcon,
  Person as TeacherIcon,
  SwapHoriz as SwitchIcon,
} from '@mui/icons-material';
import { User, UserRole } from '@/lib/types';

interface MuiNavbarProps {
  users: User[];
  currentUser: User | null;
  activeUserId: string;
  onUserChange: (userId: string) => void;
  onOpenCreateSession: () => void;
  onOpenCreateUser: () => void;
  onOpenInspector: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export function MuiNavbar({
  users,
  currentUser,
  activeUserId,
  onUserChange,
  onOpenCreateSession,
  onOpenCreateUser,
  onOpenInspector,
  onOpenAuthModal,
  onLogout,
}: MuiNavbarProps) {
  const getRoleColor = (role?: UserRole): 'primary' | 'secondary' | 'warning' | 'default' => {
    switch (role) {
      case 'ADMIN':
        return 'warning';
      case 'TEACHER':
        return 'secondary';
      case 'STUDENT':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getRoleIcon = (role?: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return <AdminIcon sx={{ fontSize: '0.9rem' }} />;
      case 'TEACHER':
        return <TeacherIcon sx={{ fontSize: '0.9rem' }} />;
      default:
        return <SchoolIcon sx={{ fontSize: '0.9rem' }} />;
    }
  };

  const canSchedule = currentUser?.role === 'TEACHER' || currentUser?.role === 'ADMIN';

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: '#ffffff',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64, px: { xs: 2, sm: 3 } }}>
        {/* Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SchoolIcon fontSize="small" />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Mentora
              </Typography>
              <Chip label="Node.js • TypeScript" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600 }} />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main' }} />
              REST API Connected :5000
            </Typography>
          </Box>
        </Box>

        {/* Center / Right: Authentication & Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* User Status / Active Profile */}
          {currentUser ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 0.6, pr: 1.2, pl: 1, borderRadius: 2, bgcolor: '#f1f5f9', border: '1px solid #e2e8f0' }}>
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  bgcolor: currentUser.role === 'ADMIN' ? 'warning.main' : currentUser.role === 'TEACHER' ? 'secondary.main' : 'primary.main',
                }}
              >
                {currentUser.fullName.charAt(0)}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', lineHeight: 1.1, color: '#0f172a' }}>
                  {currentUser.fullName}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                  {currentUser.email}
                </Typography>
              </Box>

              {/* Prominent Role Badge */}
              <Chip
                icon={getRoleIcon(currentUser.role)}
                label={`ROLE: ${currentUser.role}`}
                size="small"
                color={getRoleColor(currentUser.role)}
                sx={{
                  height: 24,
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.03em',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                }}
              />

              {/* If Admin, allow switching active student context */}
              {currentUser.role === 'ADMIN' && users.length > 0 && (
                <FormControl size="small" sx={{ minWidth: 140, ml: 0.5, display: { xs: 'none', lg: 'inline-flex' } }}>
                  <Select
                    value={activeUserId}
                    onChange={(e) => onUserChange(e.target.value)}
                    displayEmpty
                    sx={{
                      height: 26,
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      bgcolor: '#ffffff',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
                    }}
                  >
                    {users.map((u) => (
                      <MenuItem key={u._id} value={u._id} sx={{ fontSize: '0.75rem' }}>
                        Act as: {u.fullName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Switch Role Button */}
              <Tooltip title="Switch to another user or demo profile">
                <Button
                  size="small"
                  variant="text"
                  startIcon={<SwitchIcon sx={{ fontSize: '0.85rem' }} />}
                  onClick={onOpenAuthModal}
                  sx={{
                    fontSize: '0.72rem',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 1,
                    py: 0.3,
                    color: 'text.secondary',
                    '&:hover': { color: 'primary.main', bgcolor: '#e2e8f0' },
                  }}
                >
                  Switch Role
                </Button>
              </Tooltip>

              {/* Logout Button */}
              <Tooltip title="Log Out & Remove Session Token">
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<LogoutIcon sx={{ fontSize: '0.85rem' }} />}
                  onClick={onLogout}
                  sx={{
                    fontSize: '0.72rem',
                    textTransform: 'none',
                    fontWeight: 700,
                    py: 0.2,
                    px: 1,
                    height: 26,
                    borderRadius: 1.5,
                  }}
                >
                  Log Out
                </Button>
              </Tooltip>
            </Box>
          ) : (
            <Button
              variant="contained"
              size="small"
              startIcon={<LoginIcon />}
              onClick={onOpenAuthModal}
              sx={{ fontWeight: 700 }}
            >
              Sign In / Register
            </Button>
          )}

          {/* Schedule Slot (Teacher / Admin) */}
          <Tooltip title={canSchedule ? 'Create Teacher Availability Slot' : 'Login as Teacher or Admin to schedule slots'}>
            <span>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={onOpenCreateSession}
                disabled={!canSchedule}
                sx={{ fontWeight: 600 }}
              >
                Schedule Slot
              </Button>
            </span>
          </Tooltip>

          {/* Quick Register Student Modal */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<PersonAddIcon />}
            onClick={onOpenCreateUser}
            sx={{ display: { xs: 'none', lg: 'inline-flex' }, fontWeight: 500 }}
          >
            Register Student
          </Button>

          {/* API Inspector */}
          <Tooltip title="View MongoDB Aggregation Pipelines & REST Specs">
            <IconButton size="small" onClick={onOpenInspector} sx={{ border: '1px solid #e4e4e7' }}>
              <CodeIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
