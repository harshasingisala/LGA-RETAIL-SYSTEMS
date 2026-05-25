// PURPOSE: Persists development-mode sales and stock movement in browser storage.
// USAGE: Billing and reports call these functions until a real API is connected.

import {
  getLocalProducts,
  getLocalSales,
  saveLocalProducts,
  saveLocalSales,
} from "./localStore";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export async function createSale({
  customerName,
  paymentMode,
  amountPaid,
  discount = 0,
  items,
}) {
  if (!items?.length) throw new Error("A sale must have at least one item.");

  const products = getLocalProducts();
  let subtotal = 0;
  let gstTotal = 0;
  let quantity = 0;

  for (const item of items) {
    const product = products.find((entry) => entry.id === item.product_id);
    if (!product) throw new Error("One of the selected products no longer exists.");
    if (product.stock < item.quantity) throw new Error(`Insufficient stock for "${product.name}".`);

    product.stock -= item.quantity;
    quantity += item.quantity;
    subtotal += product.unit_price * item.quantity;
    gstTotal += product.unit_price * item.quantity * (product.gst_rate / 100);
  }

  const total = Math.max(0, subtotal + gstTotal - discount);
  if (paymentMode === "cash" && amountPaid < total) {
    throw new Error("Amount paid is less than total.");
  }

  const sales = getLocalSales();
  const id = `S-${Date.now()}`;
  sales.unshift({
    id,
    date: new Date().toISOString(),
    customer: customerName || "Walk-in customer",
    quantity,
    total,
    paymentMode,
  });

  saveLocalProducts(products);
  saveLocalSales(sales);
  return id;
}

export async function getSalesSummary({ date } = {}) {
  const day = date || today();
  const sales = getLocalSales().filter((sale) => sale.date.slice(0, 10) === day);

  return {
    totalRevenue: sales.reduce((sum, sale) => sum + Number(sale.total), 0),
    totalGst: 0,
    totalTransactions: sales.length,
    totalUnits: sales.reduce((sum, sale) => sum + Number(sale.quantity), 0),
    date: day,
  };
}

export async function getSalesHistory({ page = 1, pageSize = 20, startDate, endDate } = {}) {
  const matched = getLocalSales()
    .filter((sale) => !startDate || sale.date.slice(0, 10) >= startDate)
    .filter((sale) => !endDate || sale.date.slice(0, 10) <= endDate);
  const from = (page - 1) * pageSize;
  return { sales: matched.slice(from, from + pageSize), total: matched.length };
}

export async function listRecentTransactions(limit = 12) {
  return getLocalSales().slice(0, limit);
}

export async function getSaleById(id) {
  const sale = getLocalSales().find((entry) => entry.id === id);
  if (!sale) throw new Error("Sale not found.");
  return sale;
}

export async function voidSale(id, reason) {
  const sales = getLocalSales();
  const sale = sales.find((entry) => entry.id === id);
  if (!sale) throw new Error("Sale not found.");
  sale.status = "voided";
  sale.notes = reason;
  saveLocalSales(sales);
  return sale;
}
