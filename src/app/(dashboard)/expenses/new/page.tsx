"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { logExpense } from "@/app/actions/expenses";

export default function NewExpensePage() {
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Other");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
       setError("Enter a valid amount.");
       setLoading(false);
       return;
    }

    const result = await logExpense({ amount: val, category, description, date });

    if ("error" in result) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/expenses");
      router.refresh(); // Used safely here since no NextAuth session race condition is happening on sub-pages
    }
  }

  const categories = ["Rent", "Stock", "Transport", "Salary", "Other"];

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/expenses"
          className="w-9 h-9 rounded-xl border flex items-center justify-center transition-colors bg-white"
          style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Log Expense
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Record money spent on your shop
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div
        className="rounded-2xl border p-5 bg-white"
        style={{ borderColor: "var(--border-color)" }}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-dim)" }}>
              Amount (₦) *
            </label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
              placeholder="e.g. 2000"
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
              style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-dim)" }}>
              Category *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-colors ${category === c ? "border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent)]" : "border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-dim)]"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-dim)" }}>
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Transport to market"
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
              style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-dim)" }}>
              Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
              style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
            />
          </div>

          {error && (
            <div className="rounded-xl px-4 py-3 text-sm border" style={{ background: "var(--danger-dim)", borderColor: "var(--danger)", color: "#dc2626" }}>
              {error}
            </div>
          )}

          <div className="pt-2">
             <button
                type="submit"
                disabled={loading}
                className="w-full font-bold py-3 rounded-xl text-sm text-white transition-all active:scale-[0.98] disabled:opacity-60 shadow-sm"
                style={{ background: "var(--accent)" }}
             >
                {loading ? "Saving..." : "Log Expense"}
             </button>
          </div>

        </form>
      </div>
    </div>
  );
}
