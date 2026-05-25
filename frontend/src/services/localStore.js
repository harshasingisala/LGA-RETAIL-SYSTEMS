// PURPOSE: Provides browser-persisted development data until backend integration is restored.
// USAGE: Local service modules read and update inventory and sales through these helpers.

import { products as seedProducts, transactions as seedTransactions } from "../data/sampleData";

const INVENTORY_KEY = "lga:dev:inventory";
const SALES_KEY = "lga:dev:sales";

function readStorage(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function normalizeProduct(product, index) {
  return {
    ...product,
    sku: product.sku || product.id,
    barcode: product.barcode || `890000000${String(index + 1).padStart(3, "0")}`,
    unit_price: product.unit_price ?? product.unitPrice,
    gst_rate: product.gst_rate ?? 5,
    reorder_level: product.reorder_level ?? product.reorderLevel,
    is_active: true,
  };
}

export function getLocalProducts() {
  const initialProducts = seedProducts.map(normalizeProduct);
  return readStorage(INVENTORY_KEY, initialProducts);
}

export function saveLocalProducts(products) {
  writeStorage(INVENTORY_KEY, products);
}

export function getLocalSales() {
  return readStorage(SALES_KEY, seedTransactions);
}

export function saveLocalSales(sales) {
  writeStorage(SALES_KEY, sales);
}
