'use client';

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#18181b', // Zinc 900
      light: '#27272a',
      dark: '#09090b',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#4f46e5', // Indigo 600
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    success: {
      main: '#059669', // Emerald 600
      light: '#d1fae5',
    },
    info: {
      main: '#0284c7', // Sky 600
      light: '#e0f2fe',
    },
    text: {
      primary: '#09090b',
      secondary: '#71717a',
    },
    divider: '#e4e4e7',
  },
  typography: {
    fontFamily: 'inherit',
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 12,
          border: '1px solid #e4e4e7',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#f4f4f5',
          color: '#52525b',
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        },
        body: {
          fontSize: '0.8125rem',
          color: '#18181b',
        },
      },
    },
  },
});
