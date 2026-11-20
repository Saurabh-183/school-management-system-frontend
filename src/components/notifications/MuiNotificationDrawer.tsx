'use client';

import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Tooltip,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  Close as CloseIcon,
  Notifications as NotificationsIcon,
  NotificationsNone as NotificationsNoneIcon,
  DoneAll as CheckAllIcon,
  VideoLibrary as VideoIcon,
  Description as DocumentIcon,
  MenuBook as NotesIcon,
  AdminPanelSettings as AdminIcon,
  EventAvailable as BookingIcon,
  CheckCircle as CompletedIcon,
  Info as SystemIcon,
  ArrowForward as ArrowIcon,
  FiberManualRecord as UnreadDotIcon,
} from '@mui/icons-material';
import { AppNotification } from '@/lib/types';

interface MuiNotificationDrawerProps {
  open: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  unreadCount: number;
  isLoading?: boolean;
  onMarkAllAsRead: () => Promise<void>;
  onNotificationClick: (notification: AppNotification) => void;
}

function formatRelativeTime(dateString: string): string {
  try {
    const diff = Date.now() - new Date(dateString).getTime();
    if (diff < 0) return 'Just now';
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recent';
  }
}

function formatExactStamp(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateString;
  }
}

export function MuiNotificationDrawer({
  open,
  onClose,
  notifications,
  unreadCount,
  isLoading = false,
  onMarkAllAsRead,
  onNotificationClick,
}: MuiNotificationDrawerProps) {
  const getNotificationIcon = (notif: AppNotification) => {
    if (notif.relatedResourceType === 'video') {
      return (
        <Avatar sx={{ bgcolor: '#8b5cf6', color: '#ffffff', width: 38, height: 38 }}>
          <VideoIcon sx={{ fontSize: 20 }} />
        </Avatar>
      );
    }
    if (notif.relatedResourceType === 'document') {
      return (
        <Avatar sx={{ bgcolor: '#f59e0b', color: '#ffffff', width: 38, height: 38 }}>
          <DocumentIcon sx={{ fontSize: 20 }} />
        </Avatar>
      );
    }
    if (notif.relatedResourceType === 'notes') {
      return (
        <Avatar sx={{ bgcolor: '#3b82f6', color: '#ffffff', width: 38, height: 38 }}>
          <NotesIcon sx={{ fontSize: 20 }} />
        </Avatar>
      );
    }

    switch (notif.type) {
      case 'ADMIN_UPDATE':
        return (
          <Avatar sx={{ bgcolor: '#ef4444', color: '#ffffff', width: 38, height: 38 }}>
            <AdminIcon sx={{ fontSize: 20 }} />
          </Avatar>
        );
      case 'SESSION_BOOKED':
        return (
          <Avatar sx={{ bgcolor: '#10b981', color: '#ffffff', width: 38, height: 38 }}>
            <BookingIcon sx={{ fontSize: 20 }} />
          </Avatar>
        );
      case 'SESSION_COMPLETED':
        return (
          <Avatar sx={{ bgcolor: '#059669', color: '#ffffff', width: 38, height: 38 }}>
            <CompletedIcon sx={{ fontSize: 20 }} />
          </Avatar>
        );
      default:
        return (
          <Avatar sx={{ bgcolor: '#64748b', color: '#ffffff', width: 38, height: 38 }}>
            <SystemIcon sx={{ fontSize: 20 }} />
          </Avatar>
        );
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100vw', sm: 420 },
            maxWidth: '100vw',
            bgcolor: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      {/* Drawer Header */}
      <Box
        sx={{
          p: 2.5,
          bgcolor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: 'primary.main',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <NotificationsIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                Notifications
              </Typography>
              {unreadCount > 0 && (
                <Chip
                  label={`${unreadCount} New`}
                  size="small"
                  color="error"
                  sx={{ height: 20, fontSize: '0.68rem', fontWeight: 800 }}
                />
              )}
            </Box>
            <Typography variant="caption" color="text.secondary">
              Real-time teacher uploads & administrative alerts
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: '#64748b' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Action Sub-Header */}
      <Box
        sx={{
          px: 2.5,
          py: 1.2,
          bgcolor: '#f1f5f9',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>
          {notifications.length} Total Alerts
        </Typography>
        {unreadCount > 0 && (
          <Button
            size="small"
            startIcon={<CheckAllIcon sx={{ fontSize: 16 }} />}
            onClick={onMarkAllAsRead}
            sx={{
              textTransform: 'none',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'primary.main',
              p: 0,
              '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
            }}
          >
            Mark all as read
          </Button>
        )}
      </Box>

      {/* Notifications List Body */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress size={32} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10, px: 3 }}>
            <NotificationsNoneIcon sx={{ fontSize: 54, color: '#cbd5e1', mb: 1.5 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#334155' }}>
              No notifications yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem', mt: 0.5 }}>
              When teachers upload lectures, notes, or administrators update allocations, alerts will appear here.
            </Typography>
          </Box>
        ) : (
          <List sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, p: 0 }}>
            {notifications.map((notif) => {
              const isUnread = !notif.isRead;
              return (
                <Paper
                  key={notif._id}
                  elevation={0}
                  onClick={() => onNotificationClick(notif)}
                  sx={{
                    p: 1.8,
                    borderRadius: 2,
                    cursor: 'pointer',
                    bgcolor: isUnread ? '#ffffff' : '#f8fafc',
                    border: '1px solid',
                    borderColor: isUnread ? '#bfdbfe' : '#e2e8f0',
                    borderLeft: isUnread ? '4px solid #2563eb' : '1px solid #e2e8f0',
                    boxShadow: isUnread ? '0 2px 6px rgba(37, 99, 235, 0.08)' : 'none',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    '&:hover': {
                      bgcolor: '#ffffff',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                      borderColor: 'primary.main',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    {getNotificationIcon(notif)}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.4 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: isUnread ? 800 : 700,
                            color: isUnread ? '#0f172a' : '#334155',
                            lineHeight: 1.3,
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {notif.title}
                        </Typography>
                        {isUnread && (
                          <Tooltip title="Unread Alert">
                            <UnreadDotIcon sx={{ fontSize: 10, color: 'primary.main', ml: 0.5 }} />
                          </Tooltip>
                        )}
                      </Box>

                      <Typography
                        variant="body2"
                        sx={{
                          color: '#475569',
                          fontSize: '0.8125rem',
                          lineHeight: 1.45,
                          mb: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {notif.message}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 0.5 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#64748b',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <span>From: <strong>{notif.senderName}</strong></span>
                        </Typography>

                        <Tooltip title={formatExactStamp(notif.createdAt)}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#94a3b8',
                              fontSize: '0.7rem',
                              fontWeight: 500,
                              fontFamily: 'monospace',
                            }}
                          >
                            ⏱️ {formatRelativeTime(notif.createdAt)}
                          </Typography>
                        </Tooltip>
                      </Box>

                      {/* Deep-link action button */}
                      <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'primary.main',
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.3,
                          }}
                        >
                          {notif.relatedResourceType === 'video'
                            ? 'Watch In-App Lecture'
                            : notif.relatedResourceType === 'document'
                            ? 'Open Subject Document'
                            : notif.relatedResourceType === 'notes'
                            ? 'View Lecture Notes'
                            : notif.type === 'SESSION_BOOKED'
                            ? 'View Schedule'
                            : notif.type === 'ADMIN_UPDATE'
                            ? 'View Faculty Allocations'
                            : 'Open Module'}{' '}
                          <ArrowIcon sx={{ fontSize: 13 }} />
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </List>
        )}
      </Box>

      {/* Drawer Footer */}
      <Box
        sx={{
          p: 1.8,
          bgcolor: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          textAlign: 'center',
        }}
      >
        <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem' }}>
          Mentora Security Architecture • Instant Academic Notification Dispatch
        </Typography>
      </Box>
    </Drawer>
  );
}
