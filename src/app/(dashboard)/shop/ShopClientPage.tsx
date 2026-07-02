"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";

type Shop = {
  id: string;
  name: string;
  plan: string;
  address?: string | null;
  phone?: string | null;
  created_at: string;
};

export function ShopClientPage({ shop, ownerEmail }: { shop: Shop; ownerEmail: string }) {
  const isPro = shop.plan === "pro";

  return (
    <div className="space-y-6">
      {/* Shop Info Card */}
      <div
        className="rounded-2xl border p-5 bg-white space-y-4"
        style={{ borderColor: "var(--border-color)" }}
      >
        <div>
          <h2 className="text-xs uppercase tracking-wider font-semibold mb-3" style={{ color: "var(--text-dim)" }}>
            Shop Information
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-0.5">
              <span style={{ color: "var(--text-muted)" }}>Shop Name</span>
              <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                {shop.name}
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span style={{ color: "var(--text-muted)" }}>Owner Email</span>
              <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                {ownerEmail}
              </span>
            </div>
            {shop.phone && (
              <div className="flex justify-between items-center py-0.5">
                <span style={{ color: "var(--text-muted)" }}>Phone Number</span>
                <span style={{ color: "var(--text-primary)" }}>{shop.phone}</span>
              </div>
            )}
            {shop.address && (
              <div className="flex justify-between items-center py-0.5">
                <span style={{ color: "var(--text-muted)" }}>Address</span>
                <span style={{ color: "var(--text-primary)" }}>{shop.address}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-0.5">
              <span style={{ color: "var(--text-muted)" }}>Current Plan</span>
              <span
                className="inline-block text-[11px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-md"
                style={{
                  background: isPro ? "var(--accent-dim)" : "var(--bg-elevated)",
                  color: isPro ? "var(--accent)" : "var(--text-muted)",
                }}
              >
                {isPro ? "Pro" : "Free"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation & Actions Card */}
      <div
        className="rounded-2xl border p-5 bg-white space-y-3"
        style={{ borderColor: "var(--border-color)" }}
      >
        <h2 className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: "var(--text-dim)" }}>
          Actions
        </h2>

        {/* View Reports */}
        <Link
          href="/reports"
          className="w-full flex items-center justify-between p-3 rounded-xl border transition-all active:scale-[0.98] bg-stone-50 hover:bg-stone-100 text-sm font-semibold"
          style={{ borderColor: "var(--border-color)", color: "var(--text-primary)" }}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-base">📊</span>
            <span>View Reports</span>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-stone-400">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center justify-between p-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-all active:scale-[0.98] text-sm font-semibold"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-base">🚪</span>
            <span>Sign Out</span>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
