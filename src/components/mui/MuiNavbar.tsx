'use client';

import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
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
  Security as SecurityIcon,
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
  isImpersonating?: boolean;
  onExitImpersonation?: () => void;
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
  isImpersonating,
  onExitImpersonation,
}: MuiNavbarProps) {
  const getRoleColor = (role?: UserRole): 'primary' | 'secondary' | 'warning' | 'error' | 'default' => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'error';
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
      case 'SUPER_ADMIN':
        return <SecurityIcon sx={{ fontSize: '0.9rem' }} />;
      case 'ADMIN':
        return <AdminIcon sx={{ fontSize: '0.9rem' }} />;
      case 'TEACHER':
        return <TeacherIcon sx={{ fontSize: '0.9rem' }} />;
      default:
        return <SchoolIcon sx={{ fontSize: '0.9rem' }} />;
    }
  };

  const canSchedule = currentUser?.role === 'TEACHER' || currentUser?.role === 'ADMIN';
  const canRegisterStudent = currentUser?.role === 'TEACHER';

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
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: { xs: 56, sm: 64 }, px: { xs: 1.5, sm: 2.5, md: 3 } }}>
        {/* Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          <Box
            sx={{
              width: { xs: 32, sm: 36 },
              height: { xs: 32, sm: 36 },
              borderRadius: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SchoolIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                Mentora
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 0.5 }}>
              <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main' }} />
              Study Management
            </Typography>
          </Box>
        </Box>

        {/* Center / Right: Authentication & Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1.5 } }}>
          {/* User Status / Active Profile */}
          {currentUser ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, p: { xs: 0.4, sm: 0.6 }, pr: { xs: 0.8, sm: 1.2 }, pl: { xs: 0.6, sm: 1 }, borderRadius: 2, bgcolor: '#f1f5f9', border: '1px solid #e2e8f0' }}>
              <Avatar
                sx={{
                  width: { xs: 26, sm: 30 },
                  height: { xs: 26, sm: 30 },
                  fontSize: { xs: '0.75rem', sm: '0.8rem' },
                  fontWeight: 700,
                  bgcolor: currentUser.role === 'SUPER_ADMIN' ? 'error.main' : currentUser.role === 'ADMIN' ? 'warning.main' : currentUser.role === 'TEACHER' ? 'secondary.main' : 'primary.main',
                }}
              >
                {currentUser.fullName.charAt(0)}
              </Avatar>
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
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
                label={currentUser.role}
                size="small"
                color={getRoleColor(currentUser.role)}
                sx={{
                  height: 24,
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  letterSpacing: '0.03em',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  display: { xs: 'none', sm: 'inline-flex' },
                }}
              />

              {/* If in Stealth Impersonation mode, allow immediate return to Super Admin */}
              {isImpersonating && (
                <Button
                  size="small"
                  variant="contained"
                  color="warning"
                  startIcon={<SecurityIcon sx={{ fontSize: '0.85rem' }} />}
                  onClick={onExitImpersonation}
                  sx={{
                    fontSize: '0.72rem',
                    textTransform: 'none',
                    fontWeight: 800,
                    py: 0.2,
                    px: { xs: 0.8, sm: 1.2 },
                    height: 26,
                    borderRadius: 1.5,
                    bgcolor: '#d97706',
                    color: '#ffffff',
                    '&:hover': { bgcolor: '#b45309' },
                  }}
                >
                  <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>Exit Stealth (Return to SA)</Box>
                  <Box component="span" sx={{ display: { xs: 'inline', md: 'none' } }}>Exit SA</Box>
                </Button>
              )}

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
                    px: { xs: 0.6, sm: 1.2 },
                    minWidth: { xs: 32, sm: 'auto' },
                    height: 26,
                    borderRadius: 1.5,
                  }}
                >
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Log Out</Box>
                </Button>
              </Tooltip>
            </Box>
          ) : (
            <Button
              variant="contained"
              size="small"
              startIcon={<LoginIcon />}
              onClick={onOpenAuthModal}
              sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.8125rem' } }}
            >
              Sign In
            </Button>
          )}

          {/* Schedule Slot (Teacher / Admin Only) */}
          {canSchedule && (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={onOpenCreateSession}
              sx={{ fontWeight: 600, px: { xs: 1, sm: 1.5 }, minWidth: { xs: 'auto', sm: 64 }, fontSize: { xs: '0.72rem', sm: '0.8125rem' } }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Schedule Slot</Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Slot</Box>
            </Button>
          )}

          {/* Quick Register Student Modal (Teacher / Admin Only) */}
          {canRegisterStudent && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<PersonAddIcon />}
              onClick={onOpenCreateUser}
              sx={{ display: { xs: 'none', lg: 'inline-flex' }, fontWeight: 500 }}
            >
              Register Student
            </Button>
          )}

          {/* API Inspector */}
          <Tooltip title="View MongoDB Aggregation Pipelines & REST Specs">
            <IconButton size="small" onClick={onOpenInspector} sx={{ border: '1px solid #e4e4e7', display: { xs: 'none', sm: 'inline-flex' } }}>
              <CodeIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
