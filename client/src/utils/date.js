import { format, parseISO, isValid } from 'date-fns';

export function parseDateSafe(dateInput) {
  if (!dateInput) return null;
  const date = typeof dateInput === 'string' ? parseISO(dateInput) : new Date(dateInput);
  return isValid(date) ? date : null;
}

export function formatEventDate(dateInput, formatStr = 'EEE, dd MMM yyyy • hh:mm a') {
  const d = parseDateSafe(dateInput);
  if (!d) return 'Date TBD';
  return format(d, formatStr);
}

export function formatDateBadge(dateInput) {
  const d = parseDateSafe(dateInput);
  if (!d) return { day: 'TBD', date: '--', month: '---' };
  
  return {
    day: format(d, 'EEE').toUpperCase(),
    date: format(d, 'dd'),
    month: format(d, 'MMM').toUpperCase(),
    year: format(d, 'yyyy')
  };
}

export function formatTimeLeft(seconds) {
  if (seconds <= 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
