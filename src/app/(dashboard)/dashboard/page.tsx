import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";
import Link from "next/link";
import { OnboardingChecklist } from "@/components/ui/OnboardingChecklist";
import { ProfitCard } from "@/components/ui/ProfitCard";

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
      <ProfitCard
        netProfit={formatNaira(stats.netProfit)}
        salesToday={formatNaira(stats.salesToday)}
        cogsSold={formatNaira(stats.cogsSold)}
        expensesToday={formatNaira(stats.expensesToday)}
        isProfit={isProfit}
      />

      {/* ── 3 Core Stat Cards ── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <StatCard
            label="Sales Today"
            value={formatNaira(stats.salesToday)}
            description="Total revenue recorded"
            iconBg="var(--icon-accent-bg)"
            iconColor="var(--icon-accent-text)"
            icon={
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M2.25 4.5c0-.83.67-1.5 1.5-1.5h16.5c.83 0 1.5.67 1.5 1.5v15c0 .83-.67 1.5-1.5 1.5H3.75c-.83 0-1.5-.67-1.5-1.5v-15zM3.75 6v3h16.5V6H3.75zm16.5 6H3.75v7.5h16.5V12z" />
              </svg>
            }
          />
        </div>

        <StatCard
          label="Customer Debt"
          value={formatNaira(stats.outstandingCredit)}
          description="Total owed to your shop"
          href="/customers"
          iconBg={stats.outstandingCredit > 0 ? "var(--icon-warning-bg)" : "var(--icon-neutral-bg)"}
          iconColor={stats.outstandingCredit > 0 ? "var(--icon-warning-text)" : "var(--icon-neutral-text)"}
          icon={
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
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
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
            </svg>
          }
        />
      </div>

      {/* ── Recent Sales Block ── */}
      <div>
        {/* Section header */}
        <div className="flex items-center justify-between mb-4 px-1">
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
          <div className="py-8 text-center rounded-[20px]" style={{ background: "var(--bg-card)" }}>
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
              <div
                key={sale.id}
                className="flex items-center gap-3 rounded-[24px] p-4 transition-all"
                style={{ background: "var(--bg-card)", boxShadow: "var(--card-shadow)" }}
              >
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
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {sale.time}
                    {sale.isCredit && (
                      <span
                        className="ml-2 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md"
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
              label: "Record Sale",
              href: "/sales/new",
              iconBg: "var(--icon-success-bg)",
              iconColor: "var(--icon-success-text)",
              icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M2.25 4.5c0-.83.67-1.5 1.5-1.5h16.5c.83 0 1.5.67 1.5 1.5v15c0 .83-.67 1.5-1.5 1.5H3.75c-.83 0-1.5-.67-1.5-1.5v-15zM3.75 6v3h16.5V6H3.75zm16.5 6H3.75v7.5h16.5V12z" />
                </svg>
              ),
            },
            {
              label: "Add Customer",
              href: "/customers/new",
              iconBg: "var(--icon-neutral-bg)",
              iconColor: "var(--icon-neutral-text)",
              icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
              ),
            },
            {
              label: "View Reports",
              href: "/reports",
              iconBg: "var(--icon-accent-bg)",
              iconColor: "var(--icon-accent-text)",
              icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M18 4h-2v16h2V4zM12 9h-2v11h2V9zM6 14H4v6h2v-6z" />
                </svg>
              ),
            },
            {
              label: "Expenses",
              href: "/expenses",
              iconBg: "var(--icon-danger-bg)",
              iconColor: "var(--icon-danger-text)",
              icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 4l-4 4h3v7h2V8h3l-4-4zm0 16l4-4h-3v-7h-2v7H8l4 4z" />
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
