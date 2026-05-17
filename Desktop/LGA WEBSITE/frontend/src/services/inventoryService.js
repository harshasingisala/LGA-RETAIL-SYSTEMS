// PURPOSE: Defines the frontend inventory service boundary for current sample data and future API calls.
// USAGE: Inventory pages import these functions instead of reaching into data files or HTTP clients.

import { products } from "../data/sampleData";

export async function listInventoryItems() {
  return products;
}

export async function getLowStockItems() {
  return products.filter((product) => product.stock <= product.reorderLevel);
}
