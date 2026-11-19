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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, p: 0.5, pr: 1.5, borderRadius: 2, bgcolor: '#f4f4f5' }}>
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  bgcolor: currentUser.role === 'ADMIN' ? 'warning.main' : currentUser.role === 'TEACHER' ? 'secondary.main' : 'primary.main',
                }}
              >
                {currentUser.fullName.charAt(0)}
              </Avatar>
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', lineHeight: 1 }}>
                  {currentUser.fullName}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  {currentUser.email}
                </Typography>
              </Box>
              <Chip
                icon={getRoleIcon(currentUser.role)}
                label={currentUser.role}
                size="small"
                color={getRoleColor(currentUser.role)}
                sx={{ height: 22, fontSize: '0.68rem', fontWeight: 700 }}
              />

              {/* If Admin, allow switching active student context */}
              {currentUser.role === 'ADMIN' && users.length > 0 && (
                <FormControl size="small" sx={{ minWidth: 140, ml: 1, display: { xs: 'none', lg: 'inline-flex' } }}>
                  <Select
                    value={activeUserId}
                    onChange={(e) => onUserChange(e.target.value)}
                    displayEmpty
                    sx={{
                      height: 28,
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      bgcolor: '#ffffff',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e4e4e7' },
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

              <Tooltip title="Sign Out">
                <IconButton size="small" onClick={onLogout} sx={{ color: 'text.secondary', ml: 0.5 }}>
                  <LogoutIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ) : (
            <Button
              variant="outlined"
              size="small"
              startIcon={<LoginIcon />}
              onClick={onOpenAuthModal}
              sx={{ fontWeight: 600, borderColor: '#d4d4d8' }}
            >
              Sign In / Switch Role
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
