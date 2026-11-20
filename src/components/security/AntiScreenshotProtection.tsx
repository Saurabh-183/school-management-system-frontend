'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Snackbar, Alert } from '@mui/material';
import { Lock as LockIcon, Security as SecurityIcon } from '@mui/icons-material';
import { User } from '@/lib/types';

interface AntiScreenshotProtectionProps {
  currentUser: User | null;
  children: React.ReactNode;
}

export function AntiScreenshotProtection({ currentUser, children }: AntiScreenshotProtectionProps) {
  const [isWindowBlurred, setIsWindowBlurred] = useState<boolean>(false);
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string>('');
  const [isScreenFlash, setIsScreenFlash] = useState<boolean>(false);

  useEffect(() => {
    // Only apply protective DRM & capture deterrents when student is logged in
    if (!currentUser) return;

    // 1. Keyboard event listener for screenshot & printing shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen Key
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        e.stopPropagation();
        triggerCaptureBlock('Screenshots are disabled. Screen capture is strictly prohibited on this educational platform.');
        return false;
      }

      // Ctrl + P (Print / Save as PDF)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        e.stopPropagation();
        triggerCaptureBlock('Printing and PDF exporting are disabled for intellectual property protection.');
        return false;
      }

      // Ctrl + S (Save webpage)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        triggerCaptureBlock('Saving webpage content is prohibited.');
        return false;
      }

      // Ctrl + Shift + I / F12 (Inspect Element)
      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'C' || e.key === 'c'))
      ) {
        e.preventDefault();
        e.stopPropagation();
        triggerCaptureBlock('Developer inspection tools are disabled.');
        return false;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        // Clear clipboard immediately if OS captured buffer
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('').catch(() => {});
        }
        triggerCaptureBlock('Screenshots are disabled for educational content protection.');
      }
    };

    const triggerCaptureBlock = (msg: string) => {
      setWarningMessage(msg);
      setShowWarning(true);
      setIsScreenFlash(true);
      setTimeout(() => setIsScreenFlash(false), 900);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('').catch(() => {});
      }
    };

    // 2. Window Blur / Screen Recording Tool Detection
    // When external snippet / screen recording software (OBS, Snipping Tool) takes focus,
    // window blur triggers. For students, we obscure content to prevent background recording.
    const handleBlur = () => {
      if (currentUser.role === 'STUDENT') {
        setIsWindowBlurred(true);
      }
    };

    const handleFocus = () => {
      setIsWindowBlurred(false);
    };

    // 3. Prevent Context Menu (Right Click) on protective pages
    const handleContextMenu = (e: MouseEvent) => {
      if (currentUser.role === 'STUDENT') {
        e.preventDefault();
        setWarningMessage('Right-click context menu is restricted on academic content.');
        setShowWarning(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [currentUser]);

  const studentName = currentUser?.fullName || 'Student';
  const studentEmail = currentUser?.email || 'student@example.com';
  const studentOrg = currentUser?.organization || 'Mentora Academy';
  const watermarkText = `${studentOrg} • ${studentName} (${studentEmail}) • CONFIDENTIAL DRM PROTECTED`;

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        // Disable text selection and callouts
        userSelect: currentUser?.role === 'STUDENT' ? 'none' : 'auto',
        WebkitUserSelect: currentUser?.role === 'STUDENT' ? 'none' : 'auto',
      }}
    >
      {/* Blackout Flash Shield on Screenshot Attempt */}
      {isScreenFlash && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: '#000000',
            zIndex: 999999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            gap: 2,
          }}
        >
          <LockIcon sx={{ fontSize: 64, color: '#ef4444' }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            🔒 Screenshot Capture Blocked
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            Academic intellectual property is protected against unauthorized copying.
          </Typography>
        </Box>
      )}

      {/* Unfocused Privacy Shield (Anti-Screen Recording) */}
      {isWindowBlurred && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(16px)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            p: 4,
            textAlign: 'center',
            gap: 2,
          }}
        >
          <SecurityIcon sx={{ fontSize: 72, color: 'primary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            🛡️ Content Protection Active
          </Typography>
          <Typography variant="body1" sx={{ color: '#cbd5e1', maxWidth: 480 }}>
            The application window is unfocused. Learning materials are hidden to prevent unauthorized screen recording and background captures.
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Click anywhere on the window to resume your learning session.
          </Typography>
        </Box>
      )}

      {/* Forensic Diagonal Repeating DRM Watermark for Students */}
      {currentUser && currentUser.role === 'STUDENT' && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 9999,
            opacity: 0.045,
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(5, 1fr)',
            alignItems: 'center',
            justifyItems: 'center',
            transform: 'rotate(-25deg) scale(1.3)',
          }}
        >
          {Array.from({ length: 15 }).map((_, i) => (
            <Typography
              key={i}
              variant="caption"
              sx={{
                fontWeight: 900,
                fontSize: '0.9rem',
                color: '#000000',
                letterSpacing: '0.12em',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              {watermarkText}
            </Typography>
          ))}
        </Box>
      )}

      {/* Main App Content */}
      {children}

      {/* Warning Snackbar */}
      <Snackbar
        open={showWarning}
        autoHideDuration={4000}
        onClose={() => setShowWarning(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity="error"
          icon={<LockIcon />}
          onClose={() => setShowWarning(false)}
          sx={{ width: '100%', boxShadow: 4, fontWeight: 700 }}
        >
          {warningMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
