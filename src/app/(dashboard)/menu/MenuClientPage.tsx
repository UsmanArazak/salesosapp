"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

const menuItems = [
  {
    href: "/reports",
    label: "Business Performance",
    description: "View revenue insights and metrics",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <path d="M18 20V10" />
        <path d="M12 20V4" />
        <path d="M6 20v-6" />
      </svg>
    ),
  },
  {
    href: "/shop",
    label: "Shop Profile",
    description: "Manage bank accounts and contact info",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
];

export function MenuClientPage() {
  return (
    <div className="space-y-4">
      {/* Links List */}
      <div className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "var(--border-color)" }}>
        {menuItems.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-between p-4 transition-colors hover:bg-gray-50 active:bg-gray-100 ${
              index !== menuItems.length - 1 ? "border-b" : ""
            }`}
            style={{ borderColor: "var(--border-color)" }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" 
                style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}
              >
                {item.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{item.label}</h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{item.description}</p>
              </div>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-gray-400">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        ))}
      </div>

      {/* Sign Out Action */}
      <div className="rounded-2xl border bg-white overflow-hidden mt-6" style={{ borderColor: "var(--border-color)" }}>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center justify-between p-4 transition-colors hover:bg-red-50 active:bg-red-100 text-left"
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-red-100 text-red-600" 
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-600">Sign out</h3>
              <p className="text-xs mt-0.5 text-red-500/80">Log out of your SalesOS account</p>
            </div>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-red-400">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
