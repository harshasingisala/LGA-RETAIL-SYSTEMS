// PURPOSE: Shows the starter sales workspace with recent transaction data and totals.
// USAGE: Rendered at `/sales` inside `AppLayout`.

import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { useApi } from "../hooks/useApi";
import { listRecentTransactions } from "../services/salesService";
import { formatDate, formatINR } from "../utils/formatters";

export function SalesPage() {
  const transactions = useApi(() => listRecentTransactions(12));
  const rows = transactions.data || [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Sales entry register" description="Recent orders ready to be replaced by persisted sales entries." />
        <CardBody>
          <div className="space-y-3">
            {rows.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between gap-3 rounded-md border border-slate-100 bg-slate-50 px-3 py-3"
              >
                <div>
                  <p className="font-semibold text-ink">{transaction.customer}</p>
                  <p className="text-sm text-slate-500">
                    {transaction.id} - {formatDate(transaction.date)} - {transaction.quantity} units
                  </p>
                </div>
                <p className="shrink-0 text-sm font-bold text-ink">{formatINR(transaction.total)}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
