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

type CreditRecord = {
  id: string;
  amount: number;
  amount_paid: number;
  status: string;
  created_at: string;
  sales?: { notes: string } | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function StatusBadge({ status }: { status: string }) {
  if (status === "paid") {
    return <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md text-green-700 bg-green-100">PAID</span>;
  }
  if (status === "partial") {
    return <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md text-blue-700 bg-blue-100">PARTIAL</span>;
  }
  return <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md" style={{ color: "var(--warning)", background: "var(--warning-dim)" }}>UNPAID</span>;
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
  const [deleting, setDeleting] = useState(false);

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

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete ${customer.name}? This cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    const res = await deleteCustomer(customer.id);
    setDeleting(false);

    if ("error" in res) {
      alert(res.error);
    } else {
      router.push("/customers");
      router.refresh();
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {modalOpen && (
        <RepaymentModal 
          customerId={customer.id} 
          totalDebt={customer.total_debt} 
          onClose={() => setModalOpen(false)} 
        />
      )}

      {/* Edit Customer Modal */}
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
                className="text-stone-400 hover:text-stone-600 text-lg leading-none"
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
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none transition-colors"
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
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none transition-colors"
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

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/customers"
            className="w-9 h-9 rounded-xl border flex items-center justify-center transition-colors bg-white hover:bg-gray-50"
            style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold truncate max-w-[200px]" style={{ color: "var(--text-primary)" }}>
              {customer.name}
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {customer.phone || "No phone linked"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditName(customer.name);
              setEditPhone(customer.phone || "");
              setEditError("");
              setEditModalOpen(true);
            }}
            className="p-2.5 rounded-xl border bg-white hover:bg-stone-50 transition-colors text-stone-700 shadow-2xs"
            style={{ borderColor: "var(--border-color)" }}
            title="Edit Customer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2.5 rounded-xl border text-red-600 hover:bg-red-50 border-red-200 transition-colors disabled:opacity-50"
            title="Delete Customer"
          >
            {deleting ? (
              <span className="text-xs font-bold">...</span>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Debt Card */}
      <div className="p-6 rounded-2xl border" style={{ borderColor: customer.total_debt > 0 ? "var(--warning-border)" : "var(--border-color)", background: customer.total_debt > 0 ? "var(--warning-dim)" : "var(--bg-surface)" }}>
         <h2 className="text-xs uppercase tracking-wider font-semibold mb-2" style={{ color: "var(--text-dim)" }}>Total Outstanding Debt</h2>
         <p className="text-4xl font-black mb-4" style={{ color: customer.total_debt > 0 ? "var(--warning)" : "var(--success)" }}>
           ₦{customer.total_debt.toLocaleString("en-US")}
         </p>
         
         <button 
           onClick={() => setModalOpen(true)}
           disabled={customer.total_debt <= 0}
           className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
           style={{ background: "var(--success)" }}
         >
           Record Repayment
         </button>
      </div>

      {/* Credit History Log */}
      <div>
        <h3 className="text-sm font-bold mb-3 px-1" style={{ color: "var(--text-primary)" }}>Credit Purchase History</h3>
        
        {creditHistory.length === 0 ? (
           <p className="text-sm text-center py-6 py-10 rounded-2xl border bg-white" style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}>
             No credit history found.
           </p>
        ) : (
           <div className="space-y-3">
             {creditHistory.map((record) => (
                <div key={record.id} className="p-4 rounded-xl border bg-white flex justify-between items-start gap-4" style={{ borderColor: "var(--border-color)" }}>
                   <div className="min-w-0">
                     <p className="font-bold text-sm">₦{record.amount.toLocaleString()}</p>
                     <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{formatDate(record.created_at)}</p>
                     {record.sales?.notes && (
                       <p className="text-xs mt-1.5 italic truncate" style={{ color: "var(--text-dim)" }}>
                         &ldquo;{record.sales.notes}&rdquo;
                       </p>
                     )}
                   </div>
                   <div className="flex flex-col items-end flex-shrink-0 gap-1.5">
                      <StatusBadge status={record.status} />
                      <span className="text-[10px] font-medium" style={{ color: "var(--text-dim)" }}>
                         Paid: ₦{record.amount_paid.toLocaleString()}
                      </span>
                   </div>
                </div>
             ))}
           </div>
        )}
      </div>

    </div>
  );
}
