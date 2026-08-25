"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RepaymentModal } from "./RepaymentModal";
import { deleteCustomer, updateCustomer } from "@/app/actions/customers";

type Customer = {
  id: string;
  name: string;
  phone: string;
  total_debt: number;
};

type PurchasedItem = {
  quantity: number;
  unit_price: number;
  products?: { name: string } | null;
};

type CreditRecord = {
  id: string;
  amount: number;
  amount_paid: number;
  status: string;
  created_at: string;
  sales?: {
    notes?: string | null;
    sale_items?: PurchasedItem[];
  } | {
    notes?: string | null;
    sale_items?: PurchasedItem[];
  }[] | null;
};

function formatNaira(n: number) {
  return "₦" + new Intl.NumberFormat("en-US").format(Math.round(n));
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  if (status === "paid") {
    return (
      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
        PAID
      </span>
    );
  }
  if (status === "partial") {
    return (
      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
        PARTIAL
      </span>
    );
  }
  return (
    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full" style={{ color: "var(--warning)", background: "var(--warning-dim)" }}>
      UNPAID
    </span>
  );
}

export function CustomerProfileClient({
  customer: initialCustomer,
  creditHistory,
}: {
  customer: Customer;
  creditHistory: CreditRecord[];
}) {
  const router = useRouter();
  const [customer, setCustomer] = useState(initialCustomer);
  const [modalOpen, setModalOpen] = useState(false);
  const [statementModalOpen, setStatementModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  function toggleExpand(id: string) {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(customer.name);
  const [editPhone, setEditPhone] = useState(customer.phone || "");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  async function handleSaveCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!editName.trim()) return;

    setEditLoading(true);
    setEditError("");

    try {
      const res = await updateCustomer(customer.id, {
        name: editName.trim(),
        phone: editPhone.trim(),
      });
      setEditLoading(false);

      if ("error" in res) {
        setEditError(res.error);
        return;
      }

      setCustomer((prev) => ({
        ...prev,
        name: editName.trim(),
        phone: editPhone.trim(),
      }));
      setEditModalOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setEditLoading(false);
      setEditError(err instanceof Error ? err.message : "Failed to update customer.");
    }
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    setDeleteError("");
    const res = await deleteCustomer(customer.id);
    setDeleting(false);

    if ("error" in res) {
      setDeleteError(res.error);
    } else {
      router.push("/customers");
      router.refresh();
    }
  }

  // Aggregate all items purchased across credit history
  const allCreditItems: { name: string; qty: number; unitPrice: number; total: number; date: string }[] = [];
  for (const record of creditHistory) {
    const saleObj = (Array.isArray(record.sales) ? record.sales[0] : record.sales) as {
      sale_items?: PurchasedItem[];
    } | undefined | null;
    const items = saleObj?.sale_items ?? [];
    for (const item of items) {
      allCreditItems.push({
        name: item.products?.name || "Product Item",
        qty: item.quantity,
        unitPrice: item.unit_price,
        total: item.unit_price * item.quantity,
        date: formatDate(record.created_at),
      });
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {modalOpen && (
        <RepaymentModal 
          customerId={customer.id} 
          totalDebt={customer.total_debt} 
          onClose={() => setModalOpen(false)} 
        />
      )}

      {/* ── Edit Customer Modal ── */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 border shadow-xl space-y-4" style={{ borderColor: "var(--border-color)" }}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
                Edit Customer Details
              </h3>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 font-bold text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-dim)" }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-2xl border px-3.5 py-2.5 text-xs focus:outline-none transition-colors"
                  style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-dim)" }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="08012345678"
                  className="w-full rounded-2xl border px-3.5 py-2.5 text-xs focus:outline-none transition-colors"
                  style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                />
              </div>

              {editError && (
                <div className="text-xs font-semibold p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600">
                  {editError}
                </div>
              )}

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={editLoading}
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold border bg-stone-50 hover:bg-stone-100 transition-colors"
                  style={{ borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading || !editName.trim()}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm"
                  style={{ background: "var(--accent)" }}
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 border shadow-xl space-y-4" style={{ borderColor: "var(--border-color)" }}>
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.272 0c.967.031 1.71.84 1.71 1.838v.203H8.854v-.203c0-.998.743-1.807 1.71-1.838zM10.5 11.25a.75.75 0 00-1.5 0v6a.75.75 0 001.5 0v-6zm3 0a.75.75 0 00-1.5 0v6a.75.75 0 001.5 0v-6z" clipRule="evenodd" />
              </svg>
            </div>

            <div>
              <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
                Delete {customer.name}?
              </h3>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                This will permanently delete this customer record and their debt history. This action cannot be undone.
              </p>
            </div>

            {deleteError && (
              <div className="text-xs font-semibold p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600">
                {deleteError}
              </div>
            )}

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold border bg-stone-50 hover:bg-stone-100 transition-colors"
                style={{ borderColor: "var(--border-color)", color: "var(--text-primary)" }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {deleting ? "Deleting..." : "Yes, Delete Customer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Printable PDF / Account Statement Modal ── */}
      {statementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border shadow-xl space-y-4 max-h-[90vh] overflow-y-auto" style={{ borderColor: "var(--border-color)" }}>
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--border-color)" }}>
              <div>
                <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
                  Customer Account Statement
                </h3>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Official itemized debt statement for {customer.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStatementModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 font-bold text-lg leading-none"
              >
                &times;
              </button>
            </div>

            {/* Statement Printable Sheet */}
            <div id="printable-statement" className="space-y-4 text-xs text-stone-800 p-2">
              <div className="flex justify-between items-start border-b pb-3 border-stone-200">
                <div>
                  <p className="font-bold text-sm text-stone-900">{customer.name}</p>
                  <p className="text-stone-500">{customer.phone || "No phone linked"}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xs uppercase text-amber-600">Current Balance</p>
                  <p className="font-black text-lg text-amber-600">{formatNaira(customer.total_debt)}</p>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div>
                <p className="font-bold text-xs uppercase text-stone-600 mb-2">Itemized Credit Purchase Log</p>
                {allCreditItems.length === 0 ? (
                  <p className="text-stone-400 italic py-2">No itemized credit purchases found.</p>
                ) : (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-500 font-semibold">
                        <th className="py-1.5">Date</th>
                        <th className="py-1.5">Item</th>
                        <th className="py-1.5 text-center">Qty</th>
                        <th className="py-1.5 text-right">Price</th>
                        <th className="py-1.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {allCreditItems.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-1.5 text-stone-400">{item.date}</td>
                          <td className="py-1.5 font-medium text-stone-800">{item.name}</td>
                          <td className="py-1.5 text-center font-semibold">{item.qty}</td>
                          <td className="py-1.5 text-right">{formatNaira(item.unitPrice)}</td>
                          <td className="py-1.5 text-right font-bold text-stone-900">{formatNaira(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2.5 pt-2 border-t" style={{ borderColor: "var(--border-color)" }}>
              <button
                type="button"
                onClick={() => setStatementModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold border bg-stone-50 hover:bg-stone-100 transition-colors"
                style={{ borderColor: "var(--border-color)", color: "var(--text-primary)" }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2"
                style={{ background: "var(--accent)" }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M7.875 1.5C6.839 1.5 6 2.34 6 3.375v2.25H3.375C2.339 5.625 1.5 6.465 1.5 7.5v6.75c0 1.035.84 1.875 1.875 1.875H6v2.25c0 1.036.84 1.875 1.875 1.875h8.25c1.035 0 1.875-.84 1.875-1.875v-2.25h2.625c1.035 0 1.875-.84 1.875-1.875V7.5c0-1.035-.84-1.875-1.875-1.875H18v-2.25C18 2.34 17.16 1.5 16.125 1.5h-8.25zM16.5 7.5V3.375a.375.375 0 00-.375-.375h-8.25a.375.375 0 00-.375.375V7.5h9z" clipRule="evenodd" />
                </svg>
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/customers"
            className="w-9 h-9 rounded-2xl border flex items-center justify-center transition-colors bg-white hover:bg-stone-50"
            style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="w-4 h-4">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold truncate max-w-[200px]" style={{ color: "var(--text-primary)" }}>
              {customer.name}
            </h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {customer.phone || "No phone linked"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Statement PDF Button */}
          <button
            type="button"
            onClick={() => setStatementModalOpen(true)}
            className="p-2.5 rounded-2xl border bg-white hover:bg-stone-50 transition-colors text-stone-700 shadow-2xs flex items-center gap-1 text-xs font-bold"
            style={{ borderColor: "var(--border-color)" }}
            title="Generate Statement PDF"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-600">
              <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a.375.375 0 01-.375-.375V6.75A3.75 3.75 0 0010.5 3H5.625z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">Statement</span>
          </button>

          {/* Edit Button */}
          <button
            type="button"
            onClick={() => {
              setEditName(customer.name);
              setEditPhone(customer.phone || "");
              setEditError("");
              setEditModalOpen(true);
            }}
            className="p-2.5 rounded-2xl border bg-white hover:bg-stone-50 transition-colors text-stone-700 shadow-2xs"
            style={{ borderColor: "var(--border-color)" }}
            title="Edit Customer"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
            </svg>
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => {
              setDeleteError("");
              setDeleteConfirmOpen(true);
            }}
            className="p-2.5 rounded-2xl border text-red-600 hover:bg-red-50 border-red-200 transition-colors"
            title="Delete Customer"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.272 0c.967.031 1.71.84 1.71 1.838v.203H8.854v-.203c0-.998.743-1.807 1.71-1.838zM10.5 11.25a.75.75 0 00-1.5 0v6a.75.75 0 001.5 0v-6zm3 0a.75.75 0 00-1.5 0v6a.75.75 0 001.5 0v-6z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Total Debt Card ── */}
      <div
        className="p-5 rounded-2xl border bg-white space-y-3"
        style={{
          borderColor: customer.total_debt > 0 ? "var(--warning-border)" : "var(--border-color)",
          boxShadow: "var(--card-shadow)",
        }}
      >
        <div className="flex items-center justify-between">
          <p
            className="text-[10px] uppercase tracking-wider font-bold"
            style={{ color: customer.total_debt > 0 ? "var(--warning)" : "var(--success)" }}
          >
            Total Outstanding Debt
          </p>
          {customer.phone && customer.total_debt > 0 && (
            <a
              href={`https://wa.me/${customer.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                `Hello ${customer.name}, a friendly reminder regarding your outstanding balance of ${formatNaira(customer.total_debt)}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-[10px] font-bold transition-colors flex items-center gap-1 shadow-xs"
            >
              WhatsApp Reminder
            </a>
          )}
        </div>

        <p
          className="text-3xl font-black"
          style={{ color: customer.total_debt > 0 ? "var(--warning)" : "var(--success)" }}
        >
          {formatNaira(customer.total_debt)}
        </p>

        <div className="pt-1 flex gap-2">
          <button
            onClick={() => setModalOpen(true)}
            disabled={customer.total_debt <= 0}
            className="flex-1 px-4 py-2.5 rounded-2xl font-bold text-xs text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed shadow-sm"
            style={{ background: "var(--success)" }}
          >
            Record Repayment
          </button>
          <button
            type="button"
            onClick={() => setStatementModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl font-bold text-xs border bg-stone-50 hover:bg-stone-100 transition-colors"
            style={{ borderColor: "var(--border-color)", color: "var(--text-primary)" }}
          >
            View Itemized Statement
          </button>
        </div>
      </div>

      {/* ── Credit History Log ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>
            Credit Purchase History
          </h3>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            Tap card to view purchased items
          </p>
        </div>

        {creditHistory.length === 0 ? (
          <div
            className="text-xs text-center py-8 rounded-2xl border bg-white"
            style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}
          >
            No credit history found for this customer.
          </div>
        ) : (
          <div className="space-y-2.5">
            {creditHistory.map((record) => {
              const isExpanded = Boolean(expandedIds[record.id]);
              const saleObj = (Array.isArray(record.sales) ? record.sales[0] : record.sales) as {
                notes?: string | null;
                sale_items?: PurchasedItem[];
              } | undefined | null;
              const items: PurchasedItem[] = saleObj?.sale_items ?? [];
              const remainingDebt = Math.max(0, record.amount - record.amount_paid);

              return (
                <div
                  key={record.id}
                  onClick={() => toggleExpand(record.id)}
                  className="p-3.5 rounded-2xl border bg-white cursor-pointer hover:border-orange-300 transition-all select-none"
                  style={{ borderColor: "var(--border-color)", boxShadow: "var(--card-shadow)" }}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                          {formatNaira(record.amount)}
                        </p>
                        <span className="text-[10px] text-stone-400">
                          {isExpanded ? "▲" : "▼"}
                        </span>
                      </div>
                      <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {formatDate(record.created_at)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0 gap-1">
                      <StatusBadge status={record.status} />
                      <span className="text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>
                        Paid: {formatNaira(record.amount_paid)}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Items Breakdown */}
                  {isExpanded && (
                    <div
                      className="mt-3 pt-3 border-t space-y-2.5 animate-fadeIn"
                      style={{ borderColor: "var(--border-color)" }}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                        Items in this Purchase:
                      </p>
                      {items.length === 0 ? (
                        <p className="text-xs italic text-stone-400">No item details recorded for this purchase.</p>
                      ) : (
                        <ul className="space-y-1.5 bg-stone-50 p-3 rounded-2xl border border-stone-100">
                          {items.map((item, idx) => (
                            <li key={idx} className="text-xs flex justify-between items-center text-stone-700">
                              <span className="truncate pr-2 font-medium">
                                {item.quantity}x {item.products?.name || "Product Item"}
                              </span>
                              <span className="font-bold text-stone-900 flex-shrink-0">
                                {formatNaira(item.unit_price * item.quantity)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Balance Breakdown */}
                      <div
                        className="flex justify-between items-center text-xs pt-2 border-t border-dashed"
                        style={{ borderColor: "var(--border-color)" }}
                      >
                        <span className="text-stone-500 font-medium">Remaining on this Bill:</span>
                        <span
                          className="font-bold"
                          style={{ color: remainingDebt > 0 ? "var(--warning)" : "var(--success)" }}
                        >
                          {formatNaira(remainingDebt)}
                        </span>
                      </div>

                      {saleObj?.notes && (
                        <p className="text-xs italic text-stone-500">
                          Note: {saleObj.notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
