// PURPOSE: Centralizes display formatting for money, dates, percentages, and compact text.
// USAGE: Import these helpers in pages and components to keep UI formatting consistent.

export function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

export function formatCurrency(amount) {
  return formatINR(amount);
}

export function formatDate(isoString) {
  if (!isoString) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(isoString));
}

export function formatPercent(value, decimals = 1) {
  return `${Number(value || 0).toFixed(decimals)}%`;
}

export function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) {
    return text || "";
  }

  return `${text.slice(0, Math.max(0, maxLength - 3))}...`;
}
