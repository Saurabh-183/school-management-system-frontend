/**
 * Utility functions for formatting and UI helpers
 */

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(dateString: string | Date): string {
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTimeUTC(dateString: string | Date): string {
  const d = new Date(dateString);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  });
}

export function formatDateTime(dateString: string | Date): string {
  const d = new Date(dateString);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function getDurationMinutes(startTime: string | Date, endTime: string | Date): number {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  return Math.max(0, Math.round((end - start) / (1000 * 60)));
}

export function getDaysList(numDays: number = 7): { dateStr: string; dayName: string; dayNumber: number; isToday: boolean }[] {
  const days = [];
  const now = new Date();
  for (let i = 0; i < numDays; i++) {
    const d = new Date();
    d.setDate(now.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = d.getDate();
    days.push({
      dateStr,
      dayName,
      dayNumber,
      isToday: i === 0,
    });
  }
  return days;
}

export function getInitials(name?: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
