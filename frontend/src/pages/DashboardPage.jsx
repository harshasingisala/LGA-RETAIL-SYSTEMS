// PURPOSE: Displays operational status and confirms the frontend can reach the backend health endpoint.
// USAGE: Rendered at `/dashboard` inside `AppLayout`.

import { Badge } from "../components/ui/Badge";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { useApi } from "../hooks/useApi";
import { getHealth } from "../services/healthService";
import { getLowStockItems } from "../services/inventoryService";
import { getSalesSummary } from "../services/salesService";
import { formatINR, formatPercent } from "../utils/formatters";

function healthTone(status) {
  if (status === "ok" || status === "connected" || status === "local") {
    return "green";
  }
  if (status === "degraded") {
    return "amber";
  }
  return "red";
}

export function DashboardPage() {
  const health = useApi(getHealth);
  const lowStock = useApi(getLowStockItems);
  const sales = useApi(getSalesSummary);

  return (
    <div className="space-y-4">
      <section className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardBody>
            <p className="text-sm font-medium text-slate-500">Today revenue</p>
            <p className="mt-2 text-2xl font-bold text-ink">
              {sales.data ? formatINR(sales.data.totalRevenue) : formatINR(0)}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm font-medium text-slate-500">Units moved</p>
            <p className="mt-2 text-2xl font-bold text-ink">{sales.data?.totalUnits || 0}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm font-medium text-slate-500">Low stock SKUs</p>
            <p className="mt-2 text-2xl font-bold text-ink">{lowStock.data?.length || 0}</p>
          </CardBody>
        </Card>
      </section>

      <Card>
        <CardHeader
          title="Backend health"
          description="Live API status fetched through the service layer."
          action={
            <button
              type="button"
              className="rounded-md px-3 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
              onClick={() => health.execute().catch(() => undefined)}
            >
              Refresh
            </button>
          }
        />
        <CardBody>
          {health.loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 w-40 rounded bg-slate-200" />
              <div className="h-20 rounded bg-slate-100" />
            </div>
          ) : null}

          {health.error ? (
            <div className="space-y-3">
              <Badge tone="red">API unavailable</Badge>
              <p className="text-sm text-red-700">{health.error.message}</p>
              {health.error.data ? (
                <pre className="overflow-x-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
                  {JSON.stringify(health.error.data, null, 2)}
                </pre>
              ) : null}
            </div>
          ) : null}

          {health.data ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
                <div className="mt-2">
                  <Badge tone={healthTone(health.data.status)}>{health.data.status}</Badge>
                </div>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Database</p>
                <div className="mt-2">
                  <Badge tone={healthTone(health.data.database)}>{health.data.database}</Badge>
                </div>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Version</p>
                <p className="mt-2 font-semibold text-ink">{health.data.version}</p>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Environment</p>
                <p className="mt-2 font-semibold text-ink">{health.data.environment}</p>
              </div>
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Stock pressure" description="Items at or below reorder level." />
        <CardBody>
          <div className="space-y-3">
            {(lowStock.data || []).slice(0, 4).map((item) => {
              const stockRatio = (item.stock / item.reorderLevel) * 100;
              return (
                <div key={item.id} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.category}</p>
                  </div>
                  <Badge tone="amber">{formatPercent(stockRatio, 0)} of target</Badge>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
