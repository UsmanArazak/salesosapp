"use client";

import { useState } from "react";
import { recordRepayment } from "@/app/actions/customers";

function formatNaira(n: number) {
  return "₦" + new Intl.NumberFormat("en-US").format(Math.round(n));
}

export function RepaymentModal({
  customerId,
  totalDebt,
  onClose,
}: {
  customerId: string;
  totalDebt: number;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return setError("Please enter a valid amount greater than 0");
    if (val > totalDebt) return setError(`Cannot pay more than total debt (${formatNaira(totalDebt)})`);

    setLoading(true);
    const res = await recordRepayment(customerId, val);

    if ("error" in res) {
      setError(res.error);
      setLoading(false);
    } else {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl space-y-4 border"
        style={{ borderColor: "var(--border-color)" }}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
            Log Debt Repayment
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 font-bold text-stone-500"
          >
            &times;
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Outstanding Balance</p>
            <p className="text-lg font-black text-amber-900 leading-tight mt-0.5">{formatNaira(totalDebt)}</p>
          </div>
          <button
            type="button"
            onClick={() => setAmount(String(totalDebt))}
            className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-2xs"
          >
            Pay Full Debt
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-dim)" }}>
              Amount Paying (₦) *
            </label>
            <input
              type="number"
              required
              max={totalDebt}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
              placeholder="e.g. 5000"
              className="w-full rounded-2xl border px-3.5 py-2.5 text-xs focus:outline-none transition-colors"
              style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
            />
          </div>

          {error && (
            <div className="rounded-xl px-3 py-2 text-xs font-semibold bg-red-50 border border-red-200 text-red-600">
              {error}
            </div>
          )}

          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold border bg-stone-50 hover:bg-stone-100 transition-colors"
              style={{ borderColor: "var(--border-color)", color: "var(--text-primary)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !amount}
              className="flex-1 font-bold py-2.5 rounded-xl text-xs text-white transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm"
              style={{ background: "var(--success)" }}
            >
              {loading ? "Processing..." : "Confirm Repayment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
