// PURPOSE: Shows the starter inventory workspace with real sample stock data and low-stock visibility.
// USAGE: Rendered at `/inventory` inside `AppLayout`.

import { Badge } from "../components/ui/Badge";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { useApi } from "../hooks/useApi";
import { listInventoryItems } from "../services/inventoryService";
import { formatINR } from "../utils/formatters";

export function InventoryPage() {
  const inventory = useApi(listInventoryItems);
  const items = inventory.data || [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Inventory register" description="Live-ready stock table structure for FMCG SKUs." />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {items.map((item) => {
                  const isLow = item.stock <= item.reorderLevel;
                  return (
                    <tr key={item.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-600">{item.id}</td>
                      <td className="min-w-56 px-4 py-3">
                        <p className="font-semibold text-ink">{item.name}</p>
                        <p className="text-sm text-slate-500">{item.category}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Badge tone={isLow ? "amber" : "green"}>
                          {item.stock} {item.unit}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-ink">
                        {formatINR(item.stock * item.unitPrice)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
