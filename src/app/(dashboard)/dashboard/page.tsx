import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";
import Link from "next/link";
import { OnboardingChecklist } from "@/components/ui/OnboardingChecklist";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatNaira(amount: number): string {
  const abs = Math.abs(Math.round(amount));
  const formatted = new Intl.NumberFormat("en-US").format(abs);
  return (amount < 0 ? "-₦" : "₦") + formatted;
}

function todayLabel(): string {
  return new Date().toLocaleDateString("en-NG", {
    timeZone: "Africa/Lagos",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getLagosDates() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const todayISO = formatter.format(new Date());
  const [year, month] = todayISO.split("-");
  const monthStart = `${year}-${month}-01`;
  const todayStart = `${todayISO}T00:00:00+01:00`;
  return { todayISO, monthStart, todayStart };
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-NG", {
    timeZone: "Africa/Lagos",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Data Fetching ────────────────────────────────────────────────────────────

async function getDashboardStats(shopId: string) {
  const supabase = createServiceRoleSupabaseClient();
  const { todayISO, monthStart, todayStart } = getLagosDates();

  const [
    { data: todaySalesRaw },
    { data: products },
    { data: openCredit },
    { data: monthExpensesRaw },
    { data: todayExpensesRaw },
    { count: allSalesCount },
    { count: customerCount },
    { data: recentSalesRaw },
  ] = await Promise.all([
    supabase.from("sales").select("id, total_amount, notes").eq("shop_id", shopId).gte("created_at", todayStart),
    supabase.from("products").select("buying_price, stock_quantity, low_stock_threshold").eq("shop_id", shopId).eq("archived", false),
    supabase.from("credit_sales").select("amount, amount_paid").eq("shop_id", shopId).neq("status", "paid"),
    supabase.from("expenses").select("amount").eq("shop_id", shopId).gte("date", monthStart),
    supabase.from("expenses").select("amount").eq("shop_id", shopId).eq("date", todayISO),
    supabase.from("sales").select("*", { count: "exact", head: true }).eq("shop_id", shopId),
    supabase.from("customers").select("*", { count: "exact", head: true }).eq("shop_id", shopId),
    supabase
      .from("sales")
      .select("id, total_amount, payment_method, notes, created_at, credit_sales(customer_id, customers(name))")
      .eq("shop_id", shopId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const activeTodaySales = (todaySalesRaw ?? []).filter((s) => !s.notes?.startsWith("[VOIDED]"));
  const saleIds = activeTodaySales.map((s) => s.id);
  const { data: todaySaleItems } =
    saleIds.length > 0
      ? await supabase.from("sale_items").select("unit_cost, quantity").in("sale_id", saleIds)
      : { data: [] as { unit_cost: number; quantity: number }[] };

  const salesToday = activeTodaySales.reduce((s, r) => s + (r.total_amount ?? 0), 0);
  const cogsSold = (todaySaleItems ?? []).reduce((s, i) => s + i.unit_cost * i.quantity, 0);
  const expensesToday = (todayExpensesRaw ?? []).reduce((s, e) => s + (e.amount ?? 0), 0);
  const netProfit = salesToday - cogsSold - expensesToday;
  const stockValue = (products ?? []).reduce((s, p) => s + p.buying_price * p.stock_quantity, 0);
  const outstandingCredit = (openCredit ?? []).reduce((s, c) => s + ((c.amount ?? 0) - (c.amount_paid ?? 0)), 0);
  const monthExpenses = (monthExpensesRaw ?? []).reduce((s, e) => s + (e.amount ?? 0), 0);
  const lowStockCount = (products ?? []).filter((p) => p.stock_quantity <= p.low_stock_threshold).length;

  const hasProducts = (products?.length ?? 0) > 0;
  const hasSales = (allSalesCount ?? 0) > 0;
  const hasCustomers = (customerCount ?? 0) > 0;

  // Build recent sales rows (exclude voided)
  const recentSales = (recentSalesRaw ?? [])
    .filter((s) => !s.notes?.startsWith("[VOIDED]"))
    .slice(0, 5)
    .map((s) => {
      // PostgREST returns joined relation as object or array
      const creditArr = Array.isArray(s.credit_sales) ? s.credit_sales : s.credit_sales ? [s.credit_sales] : [];
      const firstCredit = creditArr[0] as { customer_id: string; customers?: { name: string } | { name: string }[] | null } | undefined;
      const customersVal = firstCredit?.customers;
      const customerName = customersVal
        ? Array.isArray(customersVal)
          ? (customersVal[0] as { name: string })?.name
          : (customersVal as { name: string }).name
        : null;

      const isCredit = s.payment_method === "credit";
      return {
        id: s.id,
        amount: s.total_amount ?? 0,
        time: formatTime(s.created_at),
        isCredit,
        customerName: customerName ?? (isCredit ? "Credit Customer" : "Walk-in"),
      };
    });

  return { salesToday, netProfit, cogsSold, expensesToday, stockValue, outstandingCredit, monthExpenses, lowStockCount, hasProducts, hasSales, hasCustomers, recentSales };
}

// ─── Stat Card Component ──────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  description,
  icon,
  iconBg,
  iconColor,
  href,
}: {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  href?: string;
}) {
  const inner = (
    <div
      className="rounded-[20px] p-5 h-full bg-white flex flex-col gap-3 transition-all"
      style={{ boxShadow: "var(--card-shadow)" }}
    >
      {/* Icon circle */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg, color: iconColor }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>
          {label}
        </p>
        <p className="text-xl font-bold leading-tight truncate" style={{ color: "var(--text-primary)" }}>
          {value}
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          {description}
        </p>
      </div>
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
  const isProfit = stats.netProfit >= 0;

  const onboardingSteps = [
    {
      key: "product",
      emoji: "📦",
      title: "Add your first product",
      description: "Add the products you sell: their name, how much you buy them, how much you sell them, and how many you buy.",
      href: "/inventory/new",
      cta: "Add Product",
      done: stats.hasProducts,
    },
    {
      key: "sale",
      emoji: "💰",
      title: "Record your first sale",
      description: "Every time you sell something, record the sale to calculate your profit.",
      href: "/sales/new",
      cta: "Record Sale",
      done: stats.hasSales,
    },
    {
      key: "customer",
      emoji: "👤",
      title: "Add a customer on debt",
      description: "Add customers who owe you money or buy on credit, so you can easily track their debts.",
      href: "/customers/new",
      cta: "Add Customer",
      done: stats.hasCustomers,
    },
  ];

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4">
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
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-white transition-all active:scale-[0.97] shadow-sm flex-shrink-0"
          style={{ background: "var(--accent)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Record Sale
        </Link>
      </div>

      {/* ── Onboarding ── */}
      <OnboardingChecklist steps={onboardingSteps} />

      {/* ── Hero: Net Profit Card ── */}
      <div
        className="rounded-[20px] p-6"
        style={{
          background: "#ffffff",
          boxShadow: "var(--card-shadow)",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
              Net Profit Today
            </p>
            <p
              className="text-4xl font-bold tracking-tight"
              style={{ color: isProfit ? "var(--text-primary)" : "var(--danger)" }}
            >
              {formatNaira(stats.netProfit)}
            </p>
            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
              Revenue − Cost of goods sold − Today&apos;s expenses
            </p>
          </div>
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: isProfit ? "var(--icon-accent-bg)" : "var(--icon-danger-bg)",
              color: isProfit ? "var(--accent)" : "var(--icon-danger-text)",
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

        {/* Breakdown chips */}
        <div
          className="flex flex-wrap gap-4 mt-5 pt-4 border-t text-xs"
          style={{ borderColor: "var(--border-color)" }}
        >
          <div className="flex items-center gap-1.5">
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: "var(--icon-success-bg)", color: "var(--icon-success-text)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <span style={{ color: "var(--text-muted)" }}>Revenue</span>
            <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{formatNaira(stats.salesToday)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: "var(--icon-danger-bg)", color: "var(--icon-danger-text)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </span>
            <span style={{ color: "var(--text-muted)" }}>COGS</span>
            <span className="font-semibold" style={{ color: "var(--danger)" }}>−{formatNaira(stats.cogsSold)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: "var(--icon-danger-bg)", color: "var(--icon-danger-text)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </span>
            <span style={{ color: "var(--text-muted)" }}>Expenses</span>
            <span className="font-semibold" style={{ color: "var(--danger)" }}>−{formatNaira(stats.expensesToday)}</span>
          </div>
        </div>
      </div>

      {/* ── 5 Stat Cards ── */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Sales Today"
          value={formatNaira(stats.salesToday)}
          description="Total revenue recorded"
          iconBg="var(--icon-accent-bg)"
          iconColor="var(--icon-accent-text)"
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
          iconBg="var(--icon-neutral-bg)"
          iconColor="var(--icon-neutral-text)"
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
          iconBg={stats.outstandingCredit > 0 ? "var(--icon-warning-bg)" : "var(--icon-neutral-bg)"}
          iconColor={stats.outstandingCredit > 0 ? "var(--icon-warning-text)" : "var(--icon-neutral-text)"}
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
          iconBg="var(--icon-danger-bg)"
          iconColor="var(--icon-danger-text)"
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
          iconBg={stats.lowStockCount > 0 ? "var(--icon-danger-bg)" : "var(--icon-success-bg)"}
          iconColor={stats.lowStockCount > 0 ? "var(--icon-danger-text)" : "var(--icon-success-text)"}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          }
        />
      </div>

      {/* ── Recent Sales Block ── */}
      <div
        className="rounded-[20px] p-5 bg-white"
        style={{ boxShadow: "var(--card-shadow)" }}
      >
        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            Recent Sales
          </p>
          <Link
            href="/sales"
            className="text-xs font-semibold transition-colors"
            style={{ color: "var(--accent)" }}
          >
            View all →
          </Link>
        </div>

        {stats.recentSales.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No sales recorded yet.</p>
            <Link
              href="/sales/new"
              className="inline-block mt-3 text-xs font-semibold"
              style={{ color: "var(--accent)" }}
            >
              + Record first sale
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center gap-3">
                {/* Avatar circle */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                  style={{
                    background: sale.isCredit ? "var(--icon-warning-bg)" : "var(--icon-success-bg)",
                    color: sale.isCredit ? "var(--icon-warning-text)" : "var(--icon-success-text)",
                  }}
                >
                  {sale.customerName.charAt(0).toUpperCase()}
                </div>

                {/* Name + time */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                    {sale.customerName}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {sale.time}
                    {sale.isCredit && (
                      <span
                        className="ml-2 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full"
                        style={{ background: "var(--icon-warning-bg)", color: "var(--icon-warning-text)" }}
                      >
                        Credit
                      </span>
                    )}
                  </p>
                </div>

                {/* Amount */}
                <p
                  className="text-sm font-bold flex-shrink-0"
                  style={{ color: sale.isCredit ? "var(--icon-warning-text)" : "var(--icon-success-text)" }}
                >
                  +{formatNaira(sale.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
          Quick Actions
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Add Product",
              href: "/inventory/new",
              iconBg: "var(--icon-neutral-bg)",
              iconColor: "var(--icon-neutral-text)",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              ),
            },
            {
              label: "Add Customer",
              href: "/customers/new",
              iconBg: "var(--icon-neutral-bg)",
              iconColor: "var(--icon-neutral-text)",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="16" y1="11" x2="22" y2="11" />
                </svg>
              ),
            },
            {
              label: "View Reports",
              href: "/reports",
              iconBg: "var(--icon-accent-bg)",
              iconColor: "var(--icon-accent-text)",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                  <path d="M18 20V10" />
                  <path d="M12 20V4" />
                  <path d="M6 20v-6" />
                </svg>
              ),
            },
            {
              label: "Expenses",
              href: "/expenses",
              iconBg: "var(--icon-danger-bg)",
              iconColor: "var(--icon-danger-text)",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
              ),
            },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col items-center gap-2.5 rounded-[20px] px-3 py-4 text-sm font-semibold transition-all active:scale-[0.97] bg-white text-center"
              style={{
                boxShadow: "var(--card-shadow)",
                color: "var(--text-primary)",
              }}
            >
              <span
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: action.iconBg, color: action.iconColor }}
              >
                {action.icon}
              </span>
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
