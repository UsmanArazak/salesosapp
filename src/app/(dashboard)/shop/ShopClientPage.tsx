"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { updateShopWhatsApp } from "@/app/actions/shop";

type Shop = {
  id: string;
  name: string;
  plan: string;
  address?: string | null;
  phone?: string | null;
  whatsapp_number?: string | null;
  created_at: string;
};

export function ShopClientPage({ shop, ownerEmail }: { shop: Shop; ownerEmail: string }) {
  const isPro = shop.plan === "pro";
  const [whatsapp, setWhatsapp] = useState(shop.whatsapp_number ?? "");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  async function handleSaveWhatsApp() {
    setSaving(true);
    setSaveMsg("");
    const result = await updateShopWhatsApp(shop.id, whatsapp.trim());
    setSaving(false);
    if ("error" in result) {
      setSaveMsg("❌ " + result.error);
    } else {
      setSaveMsg("✅ Saved!");
      setTimeout(() => setSaveMsg(""), 3000);
    }
  }

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

      {/* WhatsApp Number Card */}
      <div
        className="rounded-2xl border p-5 bg-white space-y-3"
        style={{ borderColor: "var(--border-color)" }}
      >
        <div>
          <h2 className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: "var(--text-dim)" }}>
            WhatsApp Number
          </h2>
          <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
            💬 This number is used to send automatic WhatsApp reminders to customers who owe you money. Make sure it is the number you use on WhatsApp.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="e.g. 08012345678"
            className="flex-1 rounded-xl border px-4 py-2.5 text-sm focus:outline-none transition-colors"
            style={{
              background: "var(--bg-elevated)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border-color)")}
          />
          <button
            onClick={handleSaveWhatsApp}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-[0.97] disabled:opacity-60"
            style={{ background: "var(--accent)" }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
        {saveMsg && (
          <p className="text-xs font-medium" style={{ color: saveMsg.startsWith("✅") ? "#16a34a" : "#dc2626" }}>
            {saveMsg}
          </p>
        )}
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
            <span>Business Performance</span>
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
