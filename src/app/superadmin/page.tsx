import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNaira(amount: number): string {
  const abs = Math.abs(Math.round(amount));
  const formatted = new Intl.NumberFormat("en-US").format(abs);
  return (amount < 0 ? "-₦" : "₦") + formatted;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function todayLabel(): string {
  return new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  description,
  icon,
  highlight = false,
}: {
  label: string;
  value: string;
  description?: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className="rounded-2xl border p-4 h-full"
      style={{
        background: highlight ? "var(--admin-accent-dim)" : "var(--admin-bg-surface)",
        borderColor: highlight ? "var(--admin-accent-border)" : "var(--admin-border)",
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
        style={{
          background: highlight ? "var(--admin-accent)" : "var(--admin-bg-elevated)",
          color: highlight ? "#fff" : "var(--admin-text-muted)",
        }}
      >
        {icon}
      </div>
      <p className="text-xs font-medium mb-1" style={{ color: "var(--admin-text-muted)" }}>
        {label}
      </p>
      <p
        className="text-2xl font-bold leading-tight"
        style={{ color: highlight ? "var(--admin-accent)" : "var(--admin-text-primary)" }}
      >
        {value}
      </p>
      {description && (
        <p className="text-xs mt-1" style={{ color: "var(--admin-text-muted)" }}>
          {description}
        </p>
      )}
    </div>
  );
}

// ─── Plan Badge ───────────────────────────────────────────────────────────────

function PlanBadge({ plan }: { plan: string }) {
  const isPro = plan === "pro";
  return (
    <span
      className="inline-block text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md"
      style={{
        background: isPro ? "var(--admin-accent-dim)" : "rgba(107,114,128,0.1)",
        color: isPro ? "var(--admin-accent)" : "var(--admin-text-muted)",
      }}
    >
      {isPro ? "Pro" : "Free"}
    </span>
  );
}

// ─── Data Fetching ────────────────────────────────────────────────────────────

async function getPlatformStats() {
  const supabase = createServiceRoleSupabaseClient();

  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01T00:00:00.000Z`;

  // Run all counts + data fetches in parallel
  const [
    { count: totalShops },
    { count: totalUsers },
    { count: freeShops },
    { count: proShops },
    { count: newShopsMonth },
    { count: totalSalesCount },
    { data: allSalesRevenue },
    { data: shopsRaw },
    { data: usersRaw },
  ] = await Promise.all([
    supabase.from("shops").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("shops").select("*", { count: "exact", head: true }).eq("plan", "free"),
    supabase.from("shops").select("*", { count: "exact", head: true }).eq("plan", "pro"),
    supabase.from("shops").select("*", { count: "exact", head: true }).gte("created_at", monthStart),
    supabase.from("sales").select("*", { count: "exact", head: true }),
    supabase.from("sales").select("total_amount"),
    supabase.from("shops").select("id, name, plan, created_at").order("created_at", { ascending: false }).limit(10),
    supabase.from("users").select("id, shop_id, email").eq("role", "owner"),
  ]);

  const totalRevenue = (allSalesRevenue ?? []).reduce((sum, s) => sum + (s.total_amount ?? 0), 0);

  // Join owner email onto recent shops in memory
  const recentShops = (shopsRaw ?? []).map((shop) => ({
    ...shop,
    ownerEmail: (usersRaw ?? []).find((u) => u.shop_id === shop.id)?.email ?? "—",
  }));

  return {
    totalShops: totalShops ?? 0,
    totalUsers: totalUsers ?? 0,
    freeShops: freeShops ?? 0,
    proShops: proShops ?? 0,
    newShopsMonth: newShopsMonth ?? 0,
    totalSalesCount: totalSalesCount ?? 0,
    totalRevenue,
    recentShops,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SuperAdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "superadmin") redirect("/login");

  const stats = await getPlatformStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--admin-text-primary)" }}>
          Platform Overview
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--admin-text-muted)" }}>
          {todayLabel()}
        </p>
      </div>

      {/* ── Row 1: Plan Breakdown ─────────────────────────── */}
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: "var(--admin-text-muted)" }}
        >
          Shops &amp; Users
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Total Shops"
            value={stats.totalShops.toLocaleString()}
            description="All registered shops"
            highlight
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            }
          />
          <StatCard
            label="Total Users"
            value={stats.totalUsers.toLocaleString()}
            description="All owner accounts"
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
            label="Free Plan"
            value={stats.freeShops.toLocaleString()}
            description="On the free tier"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            }
          />
          <StatCard
            label="Pro Plan"
            value={stats.proShops.toLocaleString()}
            description="Paying customers"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            }
          />
        </div>
      </div>

      {/* ── Row 2: Activity ────────────────────────────────── */}
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: "var(--admin-text-muted)" }}
        >
          Platform Activity
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard
            label="New Shops This Month"
            value={stats.newShopsMonth.toLocaleString()}
            description="Registered this calendar month"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            }
          />
          <StatCard
            label="Total Sales Recorded"
            value={stats.totalSalesCount.toLocaleString()}
            description="All transactions platform-wide"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            }
          />
          <StatCard
            label="Total Revenue Processed"
            value={formatNaira(stats.totalRevenue)}
            description="Sum of all sales across all shops"
            highlight
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
            }
          />
        </div>
      </div>

      {/* ── Recent Shops Table ─────────────────────────────── */}
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: "var(--admin-text-muted)" }}
        >
          Recently Registered Shops
        </p>

        <div
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: "var(--admin-border)", background: "var(--admin-bg-surface)" }}
        >
          {stats.recentShops.length === 0 ? (
            <div className="py-16 text-center text-sm" style={{ color: "var(--admin-text-muted)" }}>
              No shops registered yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className="border-b text-xs font-semibold uppercase tracking-wider"
                    style={{
                      borderColor: "var(--admin-border)",
                      background: "var(--admin-bg-elevated)",
                      color: "var(--admin-text-muted)",
                    }}
                  >
                    <th className="text-left px-5 py-3">Shop Name</th>
                    <th className="text-left px-5 py-3">Owner Email</th>
                    <th className="text-left px-5 py-3">Plan</th>
                    <th className="text-left px-5 py-3">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentShops.map((shop, i) => (
                    <tr
                      key={shop.id}
                      className="border-b last:border-0 transition-colors"
                      style={{
                        borderColor: "var(--admin-border)",
                        background: i % 2 === 1 ? "var(--admin-bg-elevated)" : "transparent",
                      }}
                    >
                      <td
                        className="px-5 py-3.5 font-semibold"
                        style={{ color: "var(--admin-text-primary)" }}
                      >
                        {shop.name}
                      </td>
                      <td className="px-5 py-3.5" style={{ color: "var(--admin-text-muted)" }}>
                        {shop.ownerEmail}
                      </td>
                      <td className="px-5 py-3.5">
                        <PlanBadge plan={shop.plan} />
                      </td>
                      <td className="px-5 py-3.5" style={{ color: "var(--admin-text-muted)" }}>
                        {formatDate(shop.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
