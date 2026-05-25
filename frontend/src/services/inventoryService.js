// PURPOSE: Serves local inventory records while the application is under development.
// USAGE: Pages use these functions with the same shape expected from a future API.

import { getLocalProducts } from "./localStore";

export async function getProducts({ search = "", category = "", pageSize = 50, page = 1 } = {}) {
  const searchText = search.trim().toLowerCase();
  const matched = getLocalProducts()
    .filter((product) => product.is_active)
    .filter((product) => !searchText || product.name.toLowerCase().includes(searchText))
    .filter((product) => !category || product.category === category)
    .sort((a, b) => a.name.localeCompare(b.name));
  const from = (page - 1) * pageSize;

  return {
    items: matched.slice(from, from + pageSize),
    total: matched.length,
  };
}

export async function listInventoryItems() {
  const { items } = await getProducts({ pageSize: 100 });
  return items;
}

export async function getProductByBarcode(barcode) {
  const product = getLocalProducts().find(
    (item) => item.barcode === barcode && item.is_active,
  );
  if (!product) throw new Error("Product not found.");
  return product;
}

export async function getProductById(id) {
  const product = getLocalProducts().find((item) => item.id === id);
  if (!product) throw new Error("Product not found.");
  return product;
}

export async function getLowStockItems() {
  return getLocalProducts()
    .filter((product) => product.is_active && product.stock <= product.reorderLevel)
    .sort((a, b) => a.stock - b.stock);
}

export async function getProductCategories() {
  return [...new Set(getLocalProducts().map((product) => product.category))].sort();
}
