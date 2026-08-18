"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { voidSale } from "@/app/actions/sales";

export type SaleRow = {
  id: string;
  total_amount: number;
  payment_method: string;
  status?: string | null;
  voided_at?: string | null;
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
    timeZone: "Africa/Lagos",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function isTodayInLagos(isoDate: string): boolean {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const today = formatter.format(new Date());
  const saleDate = formatter.format(new Date(isoDate));
  return today === saleDate;
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
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [confirmSale, setConfirmSale] = useState<SaleRow | null>(null);
  const [voiding, setVoiding] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const filtered = sales.filter((s) => {
    const term = query.toLowerCase();
    const itemMatch = s.sale_items.some((i) => i.products?.name.toLowerCase().includes(term));
    const custMatch = s.credit_sales?.some((c) => c.customers?.name.toLowerCase().includes(term));
    return itemMatch || custMatch;
  });

  async function handleConfirmVoid() {
    if (!confirmSale) return;
    setVoiding(true);
    setErrorMsg("");

    try {
      const result = await voidSale(confirmSale.id);
      setVoiding(false);

      if ("error" in result) {
        setErrorMsg(result.error);
        return;
      }

      setConfirmSale(null);
      router.refresh();
    } catch (err: unknown) {
      setVoiding(false);
      setErrorMsg(err instanceof Error ? err.message : "Failed to void sale.");
    }
  }

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
          href="/sales/new"
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
              <p className="text-4xl mb-3">🧧</p>
              <p className="font-bold text-base mb-1" style={{ color: "var(--text-primary)" }}>
                No sales recorded yet
              </p>
              <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>
                Every time you sell something, record it here.
              </p>
              <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
                Tap <strong>Record Sale</strong>, pick the products sold, choose how the customer paid (cash, transfer, or credit), and SalesOS will instantly show you your profit for the day.
              </p>
              <Link
                href="/sales/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "var(--accent)" }}
              >
                + Record Your First Sale
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
            const isVoided = sale.status === "voided" || Boolean(sale.notes?.startsWith("[VOIDED]"));
            const canVoid = !isVoided && isTodayInLagos(sale.created_at);
            const cleanNotes = sale.notes ? sale.notes.replace(/^\[VOIDED\]\s*/, "").trim() : "";

            return (
              <div
                key={sale.id}
                className={`rounded-2xl border bg-white px-4 py-3.5 transition-opacity ${isVoided ? "opacity-60 bg-stone-50" : ""}`}
                style={{ borderColor: "var(--border-color)" }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold text-sm ${isVoided ? "line-through text-stone-400" : ""}`} style={{ color: isVoided ? undefined : "var(--text-primary)" }}>
                        {formatNaira(sale.total_amount)}
                      </p>
                      {isVoided && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">
                          VOIDED
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {formatDate(sale.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <div className="flex items-center gap-1.5">
                      <PaymentBadge method={sale.payment_method} />
                      {canVoid && (
                        <button
                          type="button"
                          onClick={() => {
                            setErrorMsg("");
                            setConfirmSale(sale);
                          }}
                          className="text-[11px] font-bold px-2 py-0.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 active:scale-[0.97] transition-all"
                          title="Void this sale and return items to inventory"
                        >
                          Void
                        </button>
                      )}
                    </div>
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
                      <li key={idx} className={`text-xs flex justify-between ${isVoided ? "line-through" : ""}`} style={{ color: "var(--text-muted)" }}>
                        <span className="truncate pr-2">
                          {item.quantity}x {item.products?.name || "Unknown"}
                        </span>
                        <span>{formatNaira(item.unit_price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                  {cleanNotes && (
                    <p className="text-xs mt-1.5 italic" style={{ color: "var(--text-muted)" }}>
                      Note: {cleanNotes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Void Confirmation Modal ── */}
      {confirmSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 border shadow-xl space-y-4" style={{ borderColor: "var(--border-color)" }}>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>

            <div>
              <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
                Void this sale?
              </h3>
              <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
                This will reverse the sale of <strong>{formatNaira(confirmSale.total_amount)}</strong>:
              </p>
              <ul className="text-xs mt-2 space-y-1 list-disc list-inside text-stone-600">
                <li>Items sold will be restored back to inventory stock.</li>
                {confirmSale.payment_method === "credit" && (
                  <li>Any customer debt from this credit sale will be removed.</li>
                )}
                <li>The sale will be marked as VOIDED (never deleted).</li>
              </ul>
            </div>

            {errorMsg && (
              <div className="text-xs font-semibold p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600">
                {errorMsg}
              </div>
            )}

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                disabled={voiding}
                onClick={() => setConfirmSale(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold border bg-stone-50 hover:bg-stone-100 transition-colors"
                style={{ borderColor: "var(--border-color)", color: "var(--text-primary)" }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={voiding}
                onClick={handleConfirmVoid}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {voiding ? "Voiding..." : "Yes, Void Sale"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
