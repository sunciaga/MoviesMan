export function qs(selector, parent = document) {
    return parent.querySelector(selector);
};

export function qsa(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}

export function statusBadge(status) {
  const map = {
    'confirmed': 'badge-active',
    'pending':     'badge-pending',
    'cancelled':   'badge-cancelled',
  };
  const cls = map[status?.toLowerCase()] || 'badge-pending';
  return `<span class="badge ${cls}">${status}</span>`;
};

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}