"use client";

import { useState } from "react";
import Link from "next/link";
import { RepaymentModal } from "./RepaymentModal";

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
  customer,
  creditHistory,
}: {
  customer: Customer;
  creditHistory: CreditRecord[];
}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {modalOpen && (
        <RepaymentModal 
          customerId={customer.id} 
          totalDebt={customer.total_debt} 
          onClose={() => setModalOpen(false)} 
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/customers"
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
