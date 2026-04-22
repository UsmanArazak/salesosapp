"use client";

import { useState } from "react";
import Link from "next/link";

export type SaleRow = {
  id: string;
  total_amount: number;
  payment_method: string;
  created_at: string;
  notes: string;
  sale_items: {
    quantity: number;
    unit_price: number;
    products: { name: string } | null;
  }[];
  credit_sales?: {
    customers: { name: string } | null;
  }[];
};

function formatNaira(n: number) {
  return "₦" + new Intl.NumberFormat("en-US").format(Math.round(n));
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-NG", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function PaymentBadge({ method }: { method: string }) {
  if (method === "cash") {
    return (
      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md" style={{ background: "rgba(22,163,74,0.1)", color: "var(--success)" }}>
        CASH
      </span>
    );
  }
  if (method === "transfer") {
    return (
      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
        TRANSFER
      </span>
    );
  }
  return (
    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md" style={{ background: "var(--warning-dim)", color: "var(--warning)" }}>
      CREDIT
    </span>
  );
}

export function SalesList({ sales }: { sales: SaleRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = sales.filter((s) => {
    const term = query.toLowerCase();
    const itemMatch = s.sale_items.some((i) => i.products?.name.toLowerCase().includes(term));
    const custMatch = s.credit_sales?.some((c) => c.customers?.name.toLowerCase().includes(term));
    return itemMatch || custMatch;
  });

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Sales History
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            {sales.length} record{sales.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/dashboard/sales/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.97] shadow-sm"
          style={{ background: "var(--accent)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Record Sale
        </Link>
      </div>

      {/* ── Search Bar ── */}
      <div className="relative mb-5">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--text-muted)" }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search by product or customer name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl border pl-10 pr-4 py-2.5 text-sm focus:outline-none transition-colors"
          style={{
            background: "var(--bg-surface)",
            borderColor: "var(--border-color)",
            color: "var(--text-primary)",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border-color)")}
        />
      </div>

      {/* ── Sales List ── */}
      {filtered.length === 0 ? (
        <div
          className="rounded-2xl border p-10 text-center bg-white"
          style={{ borderColor: "var(--border-color)" }}
        >
          {sales.length === 0 ? (
            <>
              <p className="text-3xl mb-3">🧾</p>
              <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                No sales yet
              </p>
              <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                Record your first sale to start tracking revenue
              </p>
              <Link
                href="/dashboard/sales/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: "var(--accent)" }}
              >
                Record Sale
              </Link>
            </>
          ) : (
            <>
              <p className="text-3xl mb-3">🔍</p>
              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                No results for &ldquo;{query}&rdquo;
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((sale) => {
            const customerName = sale.credit_sales?.[0]?.customers?.name;
            return (
              <div
                key={sale.id}
                className="rounded-2xl border bg-white px-4 py-3.5"
                style={{ borderColor: "var(--border-color)" }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                      {formatNaira(sale.total_amount)}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {formatDate(sale.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <PaymentBadge method={sale.payment_method} />
                    {customerName && (
                      <span className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
                        👤 {customerName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t mt-2" style={{ borderColor: "var(--border-color)" }}>
                  <p className="text-xs mb-1 font-medium" style={{ color: "var(--text-dim)" }}>Items:</p>
                  <ul className="space-y-0.5">
                    {sale.sale_items.map((item, idx) => (
                      <li key={idx} className="text-xs flex justify-between" style={{ color: "var(--text-muted)" }}>
                        <span className="truncate pr-2">
                          {item.quantity}x {item.products?.name || "Unknown"}
                        </span>
                        <span>{formatNaira(item.unit_price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
