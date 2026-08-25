"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createCustomer } from "@/app/actions/customers";
import { DismissableHelpBanner } from "@/components/ui/DismissableHelpBanner";

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

    try {
      const result = await createCustomer({ name, phone });
      if ("error" in result) {
        setError(result.error);
        setLoading(false);
        return;
      }
      router.refresh();
      router.push("/customers");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Header */}
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
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Add Customer
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Save customer details for credit tracking
          </p>
        </div>
      </div>

      <DismissableHelpBanner
        storageKey="new-customer"
        message="When a customer buys on credit, save their details here so you can track how much they owe."
      />

      {/* Form Card */}
      <div
        className="rounded-2xl border p-5 bg-white space-y-4"
        style={{ borderColor: "var(--border-color)", boxShadow: "var(--card-shadow)" }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-dim)" }}>
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              placeholder="e.g. Samuel Adebayo"
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
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08012345678"
              className="w-full rounded-2xl border px-3.5 py-2.5 text-xs focus:outline-none transition-colors"
              style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
            />
          </div>

          {error && (
            <div className="rounded-xl px-3 py-2 text-xs font-semibold bg-red-50 border border-red-200 text-red-600">
              {error}
            </div>
          )}

          <div className="pt-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full font-bold py-2.5 rounded-2xl text-xs text-white transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm"
              style={{ background: "var(--accent)" }}
            >
              {loading ? "Saving Customer..." : "Add Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
