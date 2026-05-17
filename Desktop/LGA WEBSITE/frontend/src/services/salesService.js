// PURPOSE: All sales reads/writes. The create_sale RPC handles stock deduction
//          atomically in a Postgres transaction — no race conditions possible.
// USAGE: import { createSale, getSalesSummary, getSalesHistory } from "./salesService"

import { supabase } from "./supabaseClient";

// ── Billing ───────────────────────────────────────────────────

/**
 * Creates a complete sale atomically via Postgres RPC.
 * Stock deduction, invoice number generation, and line items are
 * all committed in one transaction or fully rolled back.
 *
 * @param {Object} params
 * @param {string} params.cashierId
 * @param {string} [params.customerName]
 * @param {string} [params.customerPhone]
 * @param {string} params.paymentMode  - 'cash' | 'upi' | 'card' | 'credit' | 'mixed'
 * @param {number} params.amountPaid
 * @param {number} [params.discount]
 * @param {string} [params.notes]
 * @param {Array}  params.items        - [{product_id, quantity, unit_price, gst_rate}]
 * @returns {string} sale id (UUID)
 */
export async function createSale({
  cashierId, customerName, customerPhone,
  paymentMode, amountPaid, discount = 0,
  notes, items,
}) {
  if (!items?.length) throw new Error("A sale must have at least one item.");

  const { data, error } = await supabase.rpc("create_sale", {
    p_cashier_id:     cashierId,
    p_customer_name:  customerName ?? null,
    p_customer_phone: customerPhone ?? null,
    p_payment_mode:   paymentMode,
    p_amount_paid:    amountPaid,
    p_discount:       discount,
    p_notes:          notes ?? null,
    p_items:          JSON.stringify(items),
  });

  if (error) throw error;
  return data;   // sale UUID
}

// ── Reports ───────────────────────────────────────────────────

export async function getSalesSummary({ date } = {}) {
  const day = date ?? new Date().toISOString().slice(0, 10);
  const nextDay = new Date(new Date(day).getTime() + 86_400_000)
    .toISOString()
    .slice(0, 10);

  const { data, error } = await supabase
    .from("sales")
    .select("total_amount, gst_total, status")
    .eq("status", "completed")
    .gte("created_at", `${day}T00:00:00`)
    .lt("created_at", `${nextDay}T00:00:00`);

  if (error) throw error;

  const totalRevenue = data.reduce((s, r) => s + Number(r.total_amount), 0);
  const totalGst     = data.reduce((s, r) => s + Number(r.gst_total), 0);

  return {
    totalRevenue,
    totalGst,
    totalTransactions: data.length,
    date: day,
  };
}

export async function getSalesHistory({ page = 1, pageSize = 20, startDate, endDate } = {}) {
  let query = supabase
    .from("sales")
    .select(`
      id, invoice_number, total_amount, payment_mode, status,
      customer_name, created_at,
      profiles:cashier_id (full_name),
      sale_items (product_name, quantity, unit_price, line_total)
    `, { count: "exact" })
    .order("created_at", { ascending: false });

  if (startDate) query = query.gte("created_at", `${startDate}T00:00:00`);
  if (endDate)   query = query.lte("created_at", `${endDate}T23:59:59`);

  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { sales: data, total: count };
}

export async function getSaleById(id) {
  const { data, error } = await supabase
    .from("sales")
    .select(`
      *, profiles:cashier_id (full_name),
      sale_items (*)
    `)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function voidSale(id, reason) {
  const { data, error } = await supabase
    .from("sales")
    .update({ status: "voided", notes: reason })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  // TODO: restore stock via an RPC (mirror of create_sale)
  return data;
}
