// PURPOSE: Shows starter warehouse analytics using sample sales data and production chart dependencies.
// USAGE: Rendered at `/analytics` inside `AppLayout`.

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { useApi } from "../hooks/useApi";
import { listRecentTransactions } from "../services/salesService";
import { formatINR } from "../utils/formatters";

export function AnalyticsPage() {
  const transactions = useApi(() => listRecentTransactions(30));
  const chartData = (transactions.data || []).slice(-10).map((transaction) => ({
    date: transaction.date.slice(5),
    revenue: transaction.total,
  }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Revenue trend" description="Last 10 recorded transactions from the starter data set." />
        <CardBody>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                />
                <Tooltip formatter={(value) => formatINR(value)} />
                <Bar dataKey="revenue" fill="#278560" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
