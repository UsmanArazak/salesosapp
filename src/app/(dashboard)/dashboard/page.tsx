import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";
import Link from "next/link";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatNaira(amount: number): string {
  const abs = Math.abs(Math.round(amount));
  const formatted = new Intl.NumberFormat("en-US").format(abs);
  return (amount < 0 ? "-₦" : "₦") + formatted;
}

function todayLabel(): string {
  return new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─── Data Fetching ────────────────────────────────────────────────────────────

async function getDashboardStats(shopId: string) {
  const supabase = createServiceRoleSupabaseClient();

  const now = new Date();
  const todayISO = now.toISOString().split("T")[0];
  const todayStart = `${todayISO}T00:00:00.000Z`;
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const [
    { data: todaySalesRaw },
    { data: products },
    { data: openCredit },
    { data: monthExpensesRaw },
    { data: todayExpensesRaw },
  ] = await Promise.all([
    supabase.from("sales").select("id, total_amount").eq("shop_id", shopId).gte("created_at", todayStart),
    supabase.from("products").select("buying_price, stock_quantity, low_stock_threshold").eq("shop_id", shopId).eq("archived", false),
    supabase.from("credit_sales").select("amount, amount_paid").eq("shop_id", shopId).neq("status", "paid"),
    supabase.from("expenses").select("amount").eq("shop_id", shopId).gte("date", monthStart),
    supabase.from("expenses").select("amount").eq("shop_id", shopId).eq("date", todayISO),
  ]);

  const saleIds = (todaySalesRaw ?? []).map((s) => s.id);
  const { data: todaySaleItems } =
    saleIds.length > 0
      ? await supabase.from("sale_items").select("unit_cost, quantity").in("sale_id", saleIds)
      : { data: [] as { unit_cost: number; quantity: number }[] };

  const salesToday = (todaySalesRaw ?? []).reduce((s, r) => s + (r.total_amount ?? 0), 0);
  const cogsSold = (todaySaleItems ?? []).reduce((s, i) => s + i.unit_cost * i.quantity, 0);
  const expensesToday = (todayExpensesRaw ?? []).reduce((s, e) => s + (e.amount ?? 0), 0);
  const grossProfit = salesToday - cogsSold - expensesToday;
  const stockValue = (products ?? []).reduce((s, p) => s + p.buying_price * p.stock_quantity, 0);
  const outstandingCredit = (openCredit ?? []).reduce((s, c) => s + ((c.amount ?? 0) - (c.amount_paid ?? 0)), 0);
  const monthExpenses = (monthExpensesRaw ?? []).reduce((s, e) => s + (e.amount ?? 0), 0);
  const lowStockCount = (products ?? []).filter((p) => p.stock_quantity <= p.low_stock_threshold).length;

  return { salesToday, grossProfit, stockValue, outstandingCredit, monthExpenses, lowStockCount };
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  description,
  icon,
  warning = false,
  href,
}: {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  warning?: boolean;
  href?: string;
}) {
  const iconBg = warning ? "var(--warning-dim)" : "var(--bg-elevated)";
  const iconColor = warning ? "var(--warning)" : "var(--text-muted)";
  const borderColor = warning ? "var(--warning-border)" : "var(--border-color)";

  const inner = (
    <div
      className="rounded-2xl border p-4 h-full bg-white transition-all"
      style={{ borderColor }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
        style={{ background: iconBg, color: iconColor }}
      >
        {icon}
      </div>
      <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      <p className="text-lg font-bold leading-tight truncate" style={{ color: "var(--text-primary)" }}>
        {value}
      </p>
      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
        {description}
      </p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block active:scale-[0.98] transition-transform">
        {inner}
      </Link>
    );
  }
  return inner;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const stats = await getDashboardStats(session.user.shopId);
  const isProfit = stats.grossProfit >= 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Dashboard
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            {todayLabel()}
          </p>
        </div>
        <Link
          href="/sales/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.97] shadow-sm flex-shrink-0"
          style={{ background: "var(--accent)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Record Sale
        </Link>
      </div>

      {/* ── Featured: Gross Profit Card ─── */}
      <div
        className="rounded-2xl border p-5 mb-4"
        style={{
          background: isProfit
            ? "linear-gradient(135deg, rgba(255,83,71,0.07) 0%, rgba(255,83,71,0.02) 100%)"
            : "linear-gradient(135deg, rgba(239,68,68,0.07) 0%, rgba(239,68,68,0.02) 100%)",
          borderColor: isProfit ? "var(--accent-border)" : "rgba(239,68,68,0.25)",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: isProfit ? "var(--accent)" : "#dc2626" }}
            >
              Gross Profit Today
            </p>
            <p
              className="text-4xl font-bold tracking-tight"
              style={{ color: isProfit ? "var(--accent)" : "#dc2626" }}
            >
              {formatNaira(stats.grossProfit)}
            </p>
            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
              Revenue&nbsp;−&nbsp;Cost of goods sold&nbsp;−&nbsp;Today&apos;s expenses
            </p>
          </div>
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: isProfit ? "rgba(255,83,71,0.1)" : "rgba(239,68,68,0.1)",
              color: isProfit ? "var(--accent)" : "#dc2626",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
              {isProfit ? (
                <>
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </>
              ) : (
                <>
                  <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
                  <polyline points="16 17 22 17 22 11" />
                </>
              )}
            </svg>
          </div>
        </div>

        {/* Breakdown row */}
        <div
          className="flex gap-4 mt-4 pt-4 border-t text-xs"
          style={{ borderColor: isProfit ? "rgba(255,83,71,0.15)" : "rgba(239,68,68,0.15)" }}
        >
          <div>
            <span style={{ color: "var(--text-muted)" }}>Revenue</span>
            <span className="ml-1.5 font-semibold" style={{ color: "var(--text-primary)" }}>
              {formatNaira(stats.salesToday)}
            </span>
          </div>
          <div>
            <span style={{ color: "var(--text-muted)" }}>COGS</span>
            <span className="ml-1.5 font-semibold" style={{ color: "#dc2626" }}>
              −{formatNaira(stats.salesToday - stats.grossProfit > 0 ? stats.salesToday - stats.grossProfit : 0)}
            </span>
          </div>
        </div>
      </div>

      {/* ── 5 Stat Cards ─── */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <StatCard
          label="Sales Today"
          value={formatNaira(stats.salesToday)}
          description="Total revenue recorded"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          }
        />

        <StatCard
          label="Stock Value"
          value={formatNaira(stats.stockValue)}
          description="Buying cost of all stock"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          }
        />

        <StatCard
          label="Customer Debt"
          value={formatNaira(stats.outstandingCredit)}
          description="Total owed to your shop"
          href="/customers"
          warning={stats.outstandingCredit > 0}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
          }
        />

        <StatCard
          label="Monthly Expenses"
          value={formatNaira(stats.monthExpenses)}
          description="Total logged this month"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
          }
        />

        <StatCard
          label="Low Stock Alerts"
          value={`${stats.lowStockCount} product${stats.lowStockCount !== 1 ? "s" : ""}`}
          description={stats.lowStockCount > 0 ? "Tap to view & restock" : "All stock levels OK"}
          href="/inventory/alerts"
          warning={stats.lowStockCount > 0}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          }
        />


      </div>

      {/* ── Quick Actions ─── */}
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: "var(--text-muted)" }}
        >
          Quick Actions
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Add Product", href: "/inventory/new", emoji: "📦" },
            { label: "Log Expense", href: "/expenses/new", emoji: "💸" },
            { label: "Add Customer", href: "/customers/new", emoji: "👤" },
            { label: "View Reports", href: "/reports", emoji: "📊" },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-sm font-medium transition-all active:scale-[0.98] bg-white"
              style={{
                borderColor: "var(--border-color)",
                color: "var(--text-primary)",
              }}
            >
              <span className="text-base">{action.emoji}</span>
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
