"use client";

import { useState } from "react";
import Link from "next/link";

type ExpenseRow = {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
};

export function ExpenseList({ expenses }: { expenses: ExpenseRow[] }) {
  const [filter, setFilter] = useState("All");

  const categories = ["All", "Rent", "Stock", "Transport", "Salary", "Other"];

  const filtered = expenses.filter(
    (e) => filter === "All" || e.category === filter
  );

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Expenses
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            Log and track daily costs
          </p>
        </div>
        <Link
          href="/dashboard/expenses/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.97] shadow-sm flex-shrink-0"
          style={{ background: "var(--accent)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Log Expense
        </Link>
      </div>

      {/* ── Filter Pills ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar mb-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-colors border"
            style={{
              background: filter === c ? "var(--accent-dim)" : "var(--bg-elevated)",
              borderColor: filter === c ? "var(--accent-border)" : "var(--border-color)",
              color: filter === c ? "var(--accent)" : "var(--text-dim)",
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* ── List ── */}
      {filtered.length === 0 ? (
        <div
          className="rounded-2xl border p-10 text-center bg-white"
          style={{ borderColor: "var(--border-color)" }}
        >
           <p className="text-3xl mb-3">💸</p>
           <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
             No expenses found
           </p>
           <p className="text-sm" style={{ color: "var(--text-muted)" }}>
             {filter === "All" ? "Log your first expense to track costs." : `No ${filter.toLowerCase()} expenses recorded.`}
           </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((e) => (
            <div
              key={e.id}
              className="rounded-2xl border bg-white p-4 transition-all"
              style={{ borderColor: "var(--border-color)" }}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md" style={{ background: "rgba(0,0,0,0.06)", color: "var(--text-dim)" }}>
                       {e.category}
                    </span>
                    <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                       {new Date(e.date).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <p className="font-medium text-sm truncate" style={{ color: "var(--text-primary)" }}>
                    {e.description || "No description"}
                  </p>
                </div>
                
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-sm" style={{ color: "#dc2626" }}>
                    −₦{e.amount.toLocaleString("en-US")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
