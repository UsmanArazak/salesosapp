"use client";

import { useState } from "react";
import Link from "next/link";

type CustomerRow = {
  id: string;
  name: string;
  phone: string;
  total_debt: number;
};

export function CustomerList({ customers }: { customers: CustomerRow[] }) {
  const [query, setQuery] = useState("");

  const totalOutstandingDebt = customers.reduce((sum, c) => sum + (c.total_debt || 0), 0);
  const debtorsCount = customers.filter((c) => (c.total_debt || 0) > 0).length;

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.phone.includes(query)
  );

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Customers
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            Manage credit and history
          </p>
        </div>
        <Link
          href="/customers/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.97] shadow-sm flex-shrink-0"
          style={{ background: "var(--accent)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Customer
        </Link>
      </div>

      {/* ── Total Debt Summary Card ── */}
      {customers.length > 0 && (
        <div
          className="rounded-2xl border p-4 mb-5 flex items-center justify-between gap-4 bg-white"
          style={{
            background:
              totalOutstandingDebt > 0
                ? "linear-gradient(135deg, rgba(234,88,12,0.06) 0%, rgba(234,88,12,0.02) 100%)"
                : "linear-gradient(135deg, rgba(22,163,74,0.06) 0%, rgba(22,163,74,0.02) 100%)",
            borderColor: totalOutstandingDebt > 0 ? "var(--warning-border)" : "rgba(22,163,74,0.25)",
          }}
        >
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-wider mb-1"
              style={{ color: totalOutstandingDebt > 0 ? "var(--warning)" : "var(--success)" }}
            >
              Total Uncollected Debt
            </p>
            <p
              className="text-2xl font-black tracking-tight"
              style={{ color: totalOutstandingDebt > 0 ? "var(--warning)" : "var(--success)" }}
            >
              ₦{totalOutstandingDebt.toLocaleString("en-US")}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              {debtorsCount > 0
                ? `${debtorsCount} customer${debtorsCount !== 1 ? "s" : ""} owe you money`
                : "All customer debts are cleared!"}
            </p>
          </div>
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: totalOutstandingDebt > 0 ? "rgba(234,88,12,0.12)" : "rgba(22,163,74,0.12)",
              color: totalOutstandingDebt > 0 ? "var(--warning)" : "var(--success)",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
        </div>
      )}

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
          placeholder="Search by name or phone..."
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

      {/* ── List ── */}
      {filtered.length === 0 ? (
        <div
          className="rounded-2xl border p-10 text-center bg-white"
          style={{ borderColor: "var(--border-color)" }}
        >
          {customers.length === 0 ? (
            <>
              <p className="text-4xl mb-3">👥</p>
              <p className="font-bold text-base mb-1" style={{ color: "var(--text-primary)" }}>
                No customers yet
              </p>
              <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>
                Save your regular customers here.
              </p>
              <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
                When a customer buys on <strong>credit</strong>, add them here so you can track how much they owe you and when they pay back. You can also see their full purchase history.
              </p>
              <Link
                href="/customers/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "var(--accent)" }}
              >
                + Add Your First Customer
              </Link>
            </>
          ) : (
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
              No results for &ldquo;{query}&rdquo;
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const hasDebt = c.total_debt > 0;
            return (
              <Link
                key={c.id}
                href={`/customers/${c.id}`}
                className="block rounded-2xl border bg-white p-4 transition-all active:scale-[0.98]"
                style={{ borderColor: hasDebt ? "var(--warning-border)" : "var(--border-color)" }}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 pr-4">
                    <p className="font-bold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                      {c.name}
                    </p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                      {c.phone || "No phone"}
                    </p>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                      Owes You
                    </p>
                    <p className="font-bold text-sm" style={{ color: hasDebt ? "var(--warning)" : "var(--success)" }}>
                      ₦{c.total_debt.toLocaleString("en-US")}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
