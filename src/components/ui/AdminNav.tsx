"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    href: "/superadmin",
    label: "Overview",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: "/superadmin/analytics",
    label: "Analytics",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    href: "/superadmin/shops",
    label: "Shops",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: "/superadmin/users",
    label: "Users",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    href: "/superadmin/subscriptions",
    label: "Subscriptions",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    href: "/superadmin/waitlist",
    label: "Waitlist",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="23" y2="8" />
        <line x1="21" y1="6" x2="21" y2="10" />
      </svg>
    ),
  },
];

export function AdminNav({ adminEmail }: { adminEmail?: string }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/superadmin") return pathname === "/superadmin";
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* ── DESKTOP SIDEBAR ─────────────────────────────── */}
      <aside
        className="hidden md:flex fixed left-0 top-0 h-full w-56 flex-col border-r z-30"
        style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)" }}
      >
        {/* Brand */}
        <div
          className="flex items-center gap-2.5 px-5 py-5 border-b"
          style={{ borderColor: "var(--border-color)" }}
        >
          <Image
            src="/logo.png"
            alt="SalesOS Logo"
            width={32}
            height={32}
            className="rounded-lg flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="font-bold text-sm leading-tight truncate" style={{ color: "var(--text-primary)" }}>
              SalesOS
            </p>
            <span
              className="inline-block text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded mt-0.5"
              style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
            >
              Admin Mode
            </span>
          </div>
        </div>

        {/* Admin email */}
        {adminEmail && (
          <div
            className="px-5 py-2.5 border-b text-xs truncate"
            style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}
          >
            {adminEmail}
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  color: active ? "var(--accent)" : "var(--text-muted)",
                  background: active ? "var(--accent-dim)" : "transparent",
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Back to shop */}
        <div className="px-3 pb-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full hover:bg-gray-50"
            style={{ color: "var(--text-muted)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Shop
          </Link>
        </div>

        {/* Sign out */}
        <div className="px-3 py-4 border-t" style={{ borderColor: "var(--border-color)" }}>
          <button
            id="admin-signout-btn"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-gray-50"
            style={{ color: "var(--text-muted)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── MOBILE TOP HEADER ──────────────────────────── */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 border-b z-30"
        style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)" }}
      >
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="SalesOS Logo"
            width={28}
            height={28}
            className="rounded-lg"
          />
          <span className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
            SalesOS
          </span>
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
            style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
          >
            Admin
          </span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-xs font-medium"
          style={{ color: "var(--text-muted)" }}
        >
          Sign out
        </button>
      </header>

      {/* ── MOBILE BOTTOM NAV ──────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 border-t z-30 flex items-stretch"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-color)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors"
              style={{ color: active ? "var(--accent)" : "var(--text-muted)" }}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
