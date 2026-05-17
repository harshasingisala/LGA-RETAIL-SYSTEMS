// PURPOSE: Defines the frontend sales service boundary for current sample data and future API calls.
// USAGE: Sales and analytics pages import these functions instead of reaching into data files directly.

import { transactions } from "../data/sampleData";

export async function listRecentTransactions(limit = 10) {
  return transactions.slice(0, limit);
}

export async function getSalesSummary() {
  return transactions.reduce(
    (summary, transaction) => ({
      orderCount: summary.orderCount + 1,
      totalRevenue: summary.totalRevenue + transaction.total,
      totalUnits: summary.totalUnits + transaction.quantity,
    }),
    { orderCount: 0, totalRevenue: 0, totalUnits: 0 },
  );
}
