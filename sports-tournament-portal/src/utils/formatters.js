// ─────────────────────────────────────────────
//  Formatter utilities
// ─────────────────────────────────────────────

/** Format ISO date string → "Nov 5, 2026" */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : ''));
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Format ISO date → short month abbreviation, e.g. "NOV" */
export function formatMonthAbbr(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase();
}

/** Format ISO date → day number, e.g. "5" */
export function formatDay(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.getDate();
}

/** Format 24h time "14:30" → "2:30 PM" */
export function formatTime(timeStr) {
  if (!timeStr) return '—';
  const [h, m] = timeStr.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour   = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** Format ISO datetime string → readable date+time */
export function formatDateTime(isoStr) {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  return d.toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/** Capitalize first letter of each word */
export function titleCase(str) {
  if (!str) return '';
  return str.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

/** Returns CSS class for status badge */
export function statusBadgeClass(status = '') {
  const map = {
    'upcoming':    'badge-upcoming',
    'ongoing':     'badge-ongoing',
    'completed':   'badge-completed',
    'scheduled':   'badge-scheduled',
    'in progress': 'badge-in-progress',
  };
  return map[status.toLowerCase()] ?? 'badge-completed';
}

/** Generate a simple UUID-like string for IDs */
export function generateId(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
