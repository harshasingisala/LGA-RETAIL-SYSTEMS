// PURPOSE: Produces development-mode analytics from local browser-persisted sales.

import { getLocalSales } from "./localStore";

export async function getRevenueTrend(days = 7) {
  const revenueByDate = {};
  const dates = [];

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    const key = date.toISOString().slice(0, 10);
    dates.push(key);
    revenueByDate[key] = 0;
  }

  for (const sale of getLocalSales()) {
    const key = sale.date.slice(0, 10);
    if (key in revenueByDate) revenueByDate[key] += Number(sale.total);
  }

  return dates.map((date) => ({
    date,
    label: new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    }),
    revenue: revenueByDate[date],
  }));
}

export async function getSalesSummary() {
  const sales = getLocalSales();
  return {
    revenue: sales.reduce((sum, sale) => sum + Number(sale.total), 0),
    gst: 0,
    txCount: sales.length,
    unitsSold: sales.reduce((sum, sale) => sum + Number(sale.quantity), 0),
  };
}

export async function getTopProducts() {
  return [];
}

export async function getCategoryBreakdown() {
  return [];
}
