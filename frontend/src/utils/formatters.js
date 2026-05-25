// PURPOSE: Centralizes display formatting for money, dates, percentages, and compact text.
// USAGE: Import these helpers in pages and components to keep UI formatting consistent.

// PURPOSE: Centralizes display formatting for money, dates, percentages, and compact text.
// USAGE: Import these helpers in pages and components to keep UI formatting consistent.

export function formatINR(amount) {
  const num = Number(amount);
  if (isNaN(num)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(num);
}

export function formatCurrency(amount) {
  return formatINR(amount);
}

export function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function formatPercent(value, decimals = 1) {
  return `${Number(value || 0).toFixed(decimals)}%`;
}

export function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text || '';
  return `${text.slice(0, Math.max(0, maxLength - 3))}...`;
}
