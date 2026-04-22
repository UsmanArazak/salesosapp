"use client";

import { useState } from "react";
import { recordRepayment } from "@/app/actions/customers";

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
    if (val > totalDebt) return setError(`Cannot pay more than the total debt (₦${totalDebt})`);

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
    <div className="fixed border-0 inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl" style={{ borderColor: "var(--border-color)", borderStyle: "solid", borderWidth: 1 }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Log Repayment</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 font-bold">&times;</button>
        </div>

        <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
          Outstanding Balance: <span className="font-bold text-black text-sm">₦{totalDebt.toLocaleString()}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-dim)" }}>
              Amount Paying (₦)
            </label>
            <input
              type="number"
              required
              max={totalDebt}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
              placeholder="e.g. 5000"
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
              style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
            />
          </div>

          {error && (
            <div className="rounded-xl px-4 py-3 text-[11px] border leading-tight" style={{ background: "var(--danger-dim)", borderColor: "var(--danger)", color: "#dc2626" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !amount}
            className="w-full font-bold py-3 rounded-xl text-sm text-white transition-all active:scale-[0.98] disabled:opacity-60 shadow-sm"
            style={{ background: "var(--success)" }}
          >
            {loading ? "Processing..." : "Confirm Repayment"}
          </button>
        </form>
      </div>
    </div>
  );
}
