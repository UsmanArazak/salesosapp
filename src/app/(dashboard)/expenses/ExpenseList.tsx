"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateExpense, deleteExpense } from "@/app/actions/expenses";

type ExpenseRow = {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
};

type DatePeriod = "today" | "this_week" | "this_month" | "all";

function getLagosTodayISO(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date()); // YYYY-MM-DD
}

function isDateInPeriod(dateStr: string, period: DatePeriod): boolean {
  if (period === "all") return true;
  const todayISO = getLagosTodayISO();
  if (period === "today") return dateStr === todayISO;

  if (period === "this_month") {
    const [year, month] = todayISO.split("-");
    return dateStr.startsWith(`${year}-${month}`);
  }

  if (period === "this_week") {
    const today = new Date(todayISO);
    const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const check = new Date(dateStr);
    return check >= monday && check <= sunday;
  }

  return true;
}

export function ExpenseList({ expenses }: { expenses: ExpenseRow[] }) {
  const router = useRouter();
  const [period, setPeriod] = useState<DatePeriod>("this_month");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Edit State
  const [editingExpense, setEditingExpense] = useState<ExpenseRow | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDate, setEditDate] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const categories = ["All", "Rent", "Stock", "Transport", "Salary", "Other"];
  const editCategories = ["Rent", "Stock", "Transport", "Salary", "Other"];

  const filtered = expenses.filter((e) => {
    const matchCategory = categoryFilter === "All" || e.category === categoryFilter;
    const matchPeriod = isDateInPeriod(e.date, period);
    return matchCategory && matchPeriod;
  });

  const totalFilteredAmount = filtered.reduce((sum, e) => sum + (e.amount || 0), 0);

  function openEditModal(e: ExpenseRow) {
    setEditingExpense(e);
    setEditAmount(String(e.amount));
    setEditCategory(e.category);
    setEditDescription(e.description || "");
    setEditDate(e.date);
    setEditError("");
  }

  async function handleSaveEdit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!editingExpense) return;
    const numAmount = parseFloat(editAmount);
    if (!numAmount || numAmount <= 0) {
      setEditError("Please enter a valid amount greater than zero.");
      return;
    }
    if (!editCategory) {
      setEditError("Please select a category.");
      return;
    }
    if (!editDate) {
      setEditError("Please enter a date.");
      return;
    }

    setSavingEdit(true);
    setEditError("");

    try {
      const res = await updateExpense(editingExpense.id, {
        amount: numAmount,
        category: editCategory,
        description: editDescription.trim(),
        date: editDate,
      });
      setSavingEdit(false);

      if ("error" in res) {
        setEditError(res.error);
        return;
      }

      setEditingExpense(null);
      router.refresh();
    } catch (err: unknown) {
      setSavingEdit(false);
      setEditError(err instanceof Error ? err.message : "Failed to update expense.");
    }
  }

  async function handleDeleteExpense(id: string) {
    if (!confirm("Are you sure you want to delete this expense record?")) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await deleteExpense(id);
      setDeletingId(null);
      if ("error" in res) {
        alert(res.error);
      } else {
        router.refresh();
      }
    } catch {
      setDeletingId(null);
      alert("Failed to delete expense.");
    }
  }

  const periodLabels: Record<DatePeriod, string> = {
    today: "Expenses Today",
    this_week: "Expenses This Week",
    this_month: "Expenses This Month",
    all: "All Recorded Expenses",
  };

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
          href="/expenses/new"
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

      {/* ── Period Selector Buttons ── */}
      <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl border bg-stone-100/70 mb-4" style={{ borderColor: "var(--border-color)" }}>
        {(["today", "this_week", "this_month", "all"] as DatePeriod[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
              period === p
                ? "bg-white text-stone-900 shadow-2xs"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            {p === "today" ? "Today" : p === "this_week" ? "This Week" : p === "this_month" ? "This Month" : "All"}
          </button>
        ))}
      </div>

      {/* ── Total Expense Metric Card ── */}
      <div
        className="rounded-2xl border p-4 mb-5 flex items-center justify-between gap-4 bg-white"
        style={{
          background: "linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(239,68,68,0.02) 100%)",
          borderColor: "rgba(239,68,68,0.25)",
        }}
      >
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "#dc2626" }}>
            {periodLabels[period]}
          </p>
          <p className="text-2xl font-black tracking-tight" style={{ color: "#dc2626" }}>
            ₦{totalFilteredAmount.toLocaleString("en-US")}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            {filtered.length} expense{filtered.length !== 1 ? "s" : ""} {categoryFilter !== "All" ? `in ${categoryFilter}` : ""}
          </p>
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(239,68,68,0.12)", color: "#dc2626" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
      </div>

      {/* ── Category Filter Pills ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar mb-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategoryFilter(c)}
            className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors border"
            style={{
              background: categoryFilter === c ? "var(--accent-dim)" : "var(--bg-elevated)",
              borderColor: categoryFilter === c ? "var(--accent-border)" : "var(--border-color)",
              color: categoryFilter === c ? "var(--accent)" : "var(--text-dim)",
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* ── Expense List ── */}
      {filtered.length === 0 ? (
        <div
          className="rounded-2xl border p-10 text-center bg-white"
          style={{ borderColor: "var(--border-color)" }}
        >
          <p className="text-3xl mb-3">💸</p>
          <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
            No expenses found
          </p>
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            {categoryFilter === "All"
              ? "No expenses logged for this selected period."
              : `No ${categoryFilter.toLowerCase()} expenses found for this period.`}
          </p>
          <Link
            href="/expenses/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm"
            style={{ background: "var(--accent)" }}
          >
            + Log An Expense
          </Link>
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
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md"
                      style={{ background: "rgba(0,0,0,0.06)", color: "var(--text-dim)" }}
                    >
                      {e.category}
                    </span>
                    <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                      {new Date(e.date).toLocaleDateString("en-NG", {
                        timeZone: "Africa/Lagos",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="font-medium text-sm truncate" style={{ color: "var(--text-primary)" }}>
                    {e.description || "No description"}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="font-bold text-sm" style={{ color: "#dc2626" }}>
                      −₦{e.amount.toLocaleString("en-US")}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(e)}
                      className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors"
                      title="Edit Expense"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === e.id}
                      onClick={() => handleDeleteExpense(e.id)}
                      className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="Delete Expense"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Edit Expense Modal ── */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-5 border shadow-xl space-y-4"
            style={{ borderColor: "var(--border-color)" }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
                Edit Expense
              </h3>
              <button
                type="button"
                onClick={() => setEditingExpense(null)}
                className="text-stone-400 hover:text-stone-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-dim)" }}>
                  Amount (₦) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
                  style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-dim)" }}>
                  Category *
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {editCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setEditCategory(cat)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                        editCategory === cat
                          ? "bg-[var(--accent-dim)] border-[var(--accent-border)] text-[var(--accent)]"
                          : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-dim)" }}>
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="e.g. Fuel for generator"
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
                  style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-dim)" }}>
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
                  style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                />
              </div>

              {editError && (
                <div className="text-xs font-semibold p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600">
                  {editError}
                </div>
              )}

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={savingEdit}
                  onClick={() => setEditingExpense(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold border bg-stone-50 hover:bg-stone-100 transition-colors"
                  style={{ borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit || !editAmount}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm"
                  style={{ background: "var(--accent)" }}
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
