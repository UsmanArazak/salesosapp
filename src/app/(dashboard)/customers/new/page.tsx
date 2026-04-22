"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createCustomer } from "@/app/actions/customers";

export default function NewCustomerPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await createCustomer({ name, phone });

    if ("error" in result) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/customers");
      router.refresh();
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/customers"
          className="w-9 h-9 rounded-xl border flex items-center justify-center transition-colors bg-white"
          style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Add Customer
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Create a new manual entry
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div
        className="rounded-2xl border p-5 bg-white"
        style={{ borderColor: "var(--border-color)" }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-dim)" }}>
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              placeholder="e.g. Samuel Adebayo"
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
              style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-dim)" }}>
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08012345678"
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
                {loading ? "Saving..." : "Add Customer"}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
