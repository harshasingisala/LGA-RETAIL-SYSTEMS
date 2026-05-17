// PURPOSE: Primary cashier billing screen. Supports barcode scan, product search,
//          cart management, GST calculation, cash/UPI payment, and invoice print.
// USAGE: Rendered at /billing. Keyboard: F2=focus search, Enter=add, Esc=clear, F9=pay.

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { formatINR } from "../utils/formatters";
import {
  getProductByBarcode,
  getProducts,
} from "../services/inventoryService";
import { createSale } from "../services/salesService";

// ── Cart reducer ─────────────────────────────────────────────

const initialCart = { items: [], discount: 0, paymentMode: "cash", amountPaid: "" };

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find(i => i.product.id === action.product.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.product.id === action.product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { product: action.product, quantity: 1 }],
      };
    }
    case "SET_QTY": {
      const qty = Math.max(1, Number(action.quantity));
      if (!Number.isFinite(qty)) return state;
      return {
        ...state,
        items: state.items.map(i =>
          i.product.id === action.productId ? { ...i, quantity: qty } : i
        ),
      };
    }
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter(i => i.product.id !== action.productId) };
    case "SET_DISCOUNT":
      return { ...state, discount: Math.max(0, Number(action.discount)) || 0 };
    case "SET_PAYMENT_MODE":
      return { ...state, paymentMode: action.mode };
    case "SET_AMOUNT_PAID":
      return { ...state, amountPaid: action.value };
    case "CLEAR":
      return initialCart;
    default:
      return state;
  }
}

function computeTotals(items, discount) {
  let subtotal = 0;
  let gstTotal = 0;
  for (const { product, quantity } of items) {
    const lineBase = product.unit_price * quantity;
    subtotal += lineBase;
    gstTotal += lineBase * (product.gst_rate / 100);
  }
  const total = Math.max(0, subtotal + gstTotal - discount);
  return { subtotal, gstTotal, total };
}

// ── Component ────────────────────────────────────────────────

export function BillingPage() {
  const { profile } = useAuth();
  const [cart, dispatch]       = useReducer(cartReducer, initialCart);
  const [query, setQuery]      = useState("");
  const [results, setResults]  = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError]      = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastSaleId, setLastSaleId] = useState(null);

  const searchRef = useRef(null);
  const payRef    = useRef(null);

  const { subtotal, gstTotal, total } = computeTotals(cart.items, cart.discount);
  const amountPaid = Number(cart.amountPaid) || 0;
  const changeDue  = amountPaid - total;

  // ── Keyboard shortcuts ──────────────────────────────────────
  useEffect(() => {
    function onKey(e) {
      if (e.key === "F2") { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === "F9") { e.preventDefault(); payRef.current?.click(); }
      if (e.key === "Escape") { setQuery(""); setResults([]); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── Product search (debounced 200ms) ────────────────────────
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        // Barcode scan: numeric-only query → exact lookup first
        if (/^\d{8,14}$/.test(query.trim())) {
          try {
            const p = await getProductByBarcode(query.trim());
            handleAddProduct(p);
            setQuery("");
            setResults([]);
            return;
          } catch {
            // not a barcode match — fall through to name search
          }
        }
        const { items } = await getProducts({ search: query.trim(), pageSize: 8 });
        setResults(items);
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleAddProduct = useCallback((product) => {
    if (product.stock === 0) {
      setError(`"${product.name}" is out of stock.`);
      return;
    }
    dispatch({ type: "ADD_ITEM", product });
    setQuery("");
    setResults([]);
    setError("");
    searchRef.current?.focus();
  }, []);

  // ── Billing submission ───────────────────────────────────────
  async function handleConfirmSale() {
    if (!cart.items.length) {
      setError("Add at least one item to the cart.");
      return;
    }
    if (cart.paymentMode === "cash" && amountPaid < total) {
      setError("Amount paid is less than total.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const items = cart.items.map(({ product, quantity }) => ({
        product_id: product.id,
        quantity,
        unit_price: product.unit_price,
        gst_rate: product.gst_rate,
      }));

      const saleId = await createSale({
        cashierId:    profile.id,
        paymentMode:  cart.paymentMode,
        amountPaid:   cart.paymentMode === "cash" ? amountPaid : total,
        discount:     cart.discount,
        items,
      });

      setLastSaleId(saleId);
      dispatch({ type: "CLEAR" });
    } catch (err) {
      setError(err.message || "Sale failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-full min-h-screen gap-0">
      {/* ── Left: product search + cart ───────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Search bar */}
        <div className="border-b border-slate-200 bg-white p-3">
          <div className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20">
            <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
            </svg>
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Scan barcode or search product… (F2)"
              className="flex-1 py-2.5 text-sm outline-none placeholder:text-slate-400"
              autoFocus
            />
            {searching && <span className="text-xs text-slate-400">…</span>}
          </div>

          {/* Dropdown results */}
          {results.length > 0 && (
            <div className="mt-1 rounded-md border border-slate-200 bg-white shadow-lg">
              {results.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleAddProduct(p)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-brand-50"
                >
                  <div>
                    <span className="font-medium text-ink">{p.name}</span>
                    <span className="ml-2 text-xs text-slate-400">{p.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs ${p.stock <= p.reorder_level ? "text-amber-600" : "text-slate-500"}`}>
                      Stock: {p.stock}
                    </span>
                    <span className="font-semibold text-ink">{formatINR(p.unit_price)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-3">
          {cart.items.length === 0 ? (
            <p className="pt-12 text-center text-sm text-slate-400">
              Scan a barcode or search to add products
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="pb-2">Product</th>
                  <th className="pb-2 text-center">Qty</th>
                  <th className="pb-2 text-right">Rate</th>
                  <th className="pb-2 text-right">GST</th>
                  <th className="pb-2 text-right">Total</th>
                  <th className="pb-2"/>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {cart.items.map(({ product, quantity }) => {
                  const lineBase  = product.unit_price * quantity;
                  const lineGst   = lineBase * product.gst_rate / 100;
                  const lineTotal = lineBase + lineGst;
                  return (
                    <tr key={product.id} className="bg-white">
                      <td className="py-2 pr-2">
                        <p className="font-medium text-ink">{product.name}</p>
                        <p className="text-xs text-slate-400">{product.sku} · GST {product.gst_rate}%</p>
                      </td>
                      <td className="py-2 text-center">
                        <input
                          type="number"
                          min="1"
                          max={product.stock}
                          value={quantity}
                          onChange={e => dispatch({ type: "SET_QTY", productId: product.id, quantity: e.target.value })}
                          className="w-14 rounded border border-slate-200 px-1 py-0.5 text-center text-sm outline-none focus:border-brand-500"
                        />
                      </td>
                      <td className="py-2 text-right">{formatINR(product.unit_price)}</td>
                      <td className="py-2 text-right text-slate-500">{formatINR(lineGst)}</td>
                      <td className="py-2 text-right font-semibold">{formatINR(lineTotal)}</td>
                      <td className="py-2 pl-2">
                        <button
                          onClick={() => dispatch({ type: "REMOVE_ITEM", productId: product.id })}
                          className="text-slate-300 hover:text-red-500"
                          aria-label="Remove"
                        >✕</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Right: totals + payment ───────────────────────── */}
      <div className="flex w-80 shrink-0 flex-col border-l border-slate-200 bg-white">
        {/* Success banner */}
        {lastSaleId && (
          <div className="bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            ✓ Sale recorded.{" "}
            <button className="underline" onClick={() => setLastSaleId(null)}>Dismiss</button>
          </div>
        )}

        {/* Totals */}
        <div className="flex-1 p-4 space-y-3">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Subtotal</span><span>{formatINR(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>GST</span><span>{formatINR(gstTotal)}</span>
          </div>

          {/* Discount field */}
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Discount</span>
            <input
              type="number"
              min="0"
              value={cart.discount || ""}
              onChange={e => dispatch({ type: "SET_DISCOUNT", discount: e.target.value })}
              placeholder="0"
              className="w-24 rounded border border-slate-200 px-2 py-0.5 text-right text-sm outline-none focus:border-brand-500"
            />
          </div>

          <div className="border-t border-slate-200 pt-3">
            <div className="flex justify-between text-base font-bold text-ink">
              <span>Total</span><span>{formatINR(total)}</span>
            </div>
          </div>

          {/* Payment mode */}
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payment</p>
            <div className="grid grid-cols-3 gap-1">
              {["cash", "upi", "card"].map(mode => (
                <button
                  key={mode}
                  onClick={() => dispatch({ type: "SET_PAYMENT_MODE", mode })}
                  className={`rounded py-1.5 text-xs font-semibold uppercase transition ${
                    cart.paymentMode === mode
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Cash tendered */}
          {cart.paymentMode === "cash" && (
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Cash tendered
              </p>
              <input
                type="number"
                min={total}
                value={cart.amountPaid}
                onChange={e => dispatch({ type: "SET_AMOUNT_PAID", value: e.target.value })}
                placeholder={formatINR(total)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-right text-base font-bold outline-none focus:border-brand-500"
              />
              {amountPaid >= total && (
                <p className="text-right text-sm text-green-600 font-semibold">
                  Change: {formatINR(changeDue)}
                </p>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="rounded bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="border-t border-slate-200 p-4 space-y-2">
          <button
            ref={payRef}
            onClick={handleConfirmSale}
            disabled={submitting || cart.items.length === 0}
            className="w-full rounded-lg bg-brand-600 py-3 text-base font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {submitting ? "Processing…" : `Confirm Sale (F9) · ${formatINR(total)}`}
          </button>
          <button
            onClick={() => dispatch({ type: "CLEAR" })}
            disabled={submitting}
            className="w-full rounded-lg border border-slate-200 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Clear cart (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
