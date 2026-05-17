// PURPOSE: All product reads. Queries Supabase tables for real inventory data.
// USAGE: import { getProducts, getProductByBarcode, getLowStockItems } from "./inventoryService"

import { supabase } from "./supabaseClient";

export async function getProducts({ search = "", category = "", pageSize = 50, page = 1 } = {}) {
  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("is_active", true)
    .order("name");

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }
  if (category) {
    query = query.eq("category", category);
  }

  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { items: data, total: count };
}

export async function getProductByBarcode(barcode) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("barcode", barcode)
    .eq("is_active", true)
    .single();

  if (error) throw error;
  return data;
}

export async function getProductById(id) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getLowStockItems() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .lte("stock", "reorder_level")
    .order("stock");

  if (error) throw error;
  return data;
}

export async function getProductCategories() {
  const { data, error } = await supabase
    .from("products")
    .select("category", { count: "exact" })
    .eq("is_active", true)
    .order("category");

  if (error) throw error;
  return [...new Set(data.map(p => p.category))];
}
