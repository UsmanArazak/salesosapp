import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";

// ─── Formatting helpers ──────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getDaysAgo(iso: string): number {
  const diffTime = Math.abs(Date.now() - new Date(iso).getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// ─── UI Components ───────────────────────────────────────────────────────────

function AnalyticsCard({
  title,
  value,
  subtitle,
  trend,
  trendType = "neutral",
  icon,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  trendType?: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
}) {
  const trendColor =
    trendType === "positive"
      ? "var(--success)"
      : trendType === "negative"
      ? "var(--danger)"
      : "var(--text-muted)";

  return (
    <div
      className="rounded-2xl border p-5 bg-white transition-all hover:shadow-sm"
      style={{ borderColor: "var(--border-color)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          {title}
        </span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}
        >
          {icon}
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
          {value}
        </span>
        {trend && (
          <span className="text-xs font-bold" style={{ color: trendColor }}>
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ─── Data Fetching ────────────────────────────────────────────────────────────

async function getRetentionMetrics() {
  const supabase = createServiceRoleSupabaseClient();

  // Daily Active Shops definition: recorded a sale today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayStartISO = todayStart.toISOString();

  // 7 days ago threshold
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // 14 days ago threshold
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const fourteenDaysAgoISO = fourteenDaysAgo.toISOString();

  // 30 days ago threshold
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

  const [
    { data: allShops },
    { data: allOwners },
    { data: salesToday },
    { data: salesLast14Days },
    { data: salesLast30Days },
    { data: allSalesSummary },
  ] = await Promise.all([
    supabase.from("shops").select("id, name, created_at, plan"),
    supabase.from("users").select("shop_id, email").eq("role", "owner"),
    supabase.from("sales").select("shop_id").gte("created_at", todayStartISO),
    supabase.from("sales").select("shop_id, created_at").gte("created_at", fourteenDaysAgoISO),
    supabase.from("sales").select("shop_id, created_at").gte("created_at", thirtyDaysAgoISO),
    supabase.from("sales").select("shop_id"),
  ]);

  const shops = allShops ?? [];
  const owners = allOwners ?? [];

  // 1. Daily Active Shops (DAS)
  const dasSet = new Set((salesToday ?? []).map((s) => s.shop_id));
  const dailyActiveShops = dasSet.size;

  // Helper mapping from shop_id -> owner email
  const shopOwnerEmailMap = new Map<string, string>();
  owners.forEach((o) => {
    if (o.shop_id) shopOwnerEmailMap.set(o.shop_id, o.email);
  });

  // 2. Dormant Shops (No sales in 7+ Days)
  // To find dormant: get sales in the last 7 days.
  const activeShopIds7Days = new Set<string>();
  (salesLast14Days ?? []).forEach((sale) => {
    if (new Date(sale.created_at) >= sevenDaysAgo) {
      activeShopIds7Days.add(sale.shop_id);
    }
  });

  const dormantShops = shops
    .filter((shop) => {
      // Must not have had a sale in the last 7 days
      if (activeShopIds7Days.has(shop.id)) return false;
      // Must be created more than 7 days ago (otherwise just new)
      if (new Date(shop.created_at) > sevenDaysAgo) return false;
      return true;
    })
    .map((shop) => ({
      ...shop,
      email: shopOwnerEmailMap.get(shop.id) ?? "No Owner",
      daysIdle: getDaysAgo(shop.created_at),
    }));

  // 3. Avg. Sales per active shop (last 30 days)
  const salesCountByShop30D: Record<string, number> = {};
  (salesLast30Days ?? []).forEach((s) => {
    salesCountByShop30D[s.shop_id] = (salesCountByShop30D[s.shop_id] || 0) + 1;
  });
  const activeShopsCount30D = Object.keys(salesCountByShop30D).length;
  const totalSales30D = (salesLast30Days ?? []).length;
  const avgSalesPerActiveShop =
    activeShopsCount30D > 0
      ? parseFloat((totalSales30D / activeShopsCount30D).toFixed(1))
      : 0;

  // 4. Zero Sales Shops (Ever)
  const salesEverShopIds = new Set((allSalesSummary ?? []).map((s) => s.shop_id));
  const zeroSalesShops = shops
    .filter((shop) => !salesEverShopIds.has(shop.id))
    .map((shop) => ({
      ...shop,
      email: shopOwnerEmailMap.get(shop.id) ?? "No Owner",
      daysRegistered: getDaysAgo(shop.created_at),
    }));

  // 5. Week-on-Week Active Shop Growth
  const activeThisWeek = new Set<string>();
  const activeLastWeek = new Set<string>();

  (salesLast14Days ?? []).forEach((sale) => {
    const saleDate = new Date(sale.created_at);
    if (saleDate >= sevenDaysAgo) {
      activeThisWeek.add(sale.shop_id);
    } else {
      activeLastWeek.add(sale.shop_id);
    }
  });

  const thisWeekCount = activeThisWeek.size;
  const lastWeekCount = activeLastWeek.size;

  let wowGrowthPct = 0;
  if (lastWeekCount > 0) {
    wowGrowthPct = Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100);
  } else if (thisWeekCount > 0) {
    wowGrowthPct = 100;
  }

  return {
    dailyActiveShops,
    dormantShops,
    avgSalesPerActiveShop,
    zeroSalesShops,
    wowGrowthPct,
    thisWeekCount,
    lastWeekCount,
    totalShopsCount: shops.length,
  };
}

export default async function SuperAdminAnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "superadmin") redirect("/login");

  const metrics = await getRetentionMetrics();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Retention & Activation Analytics
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          Monitor your customer lifespans, engagement, and conversion drop-offs.
        </p>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Daily Active Shops"
          value={metrics.dailyActiveShops}
          subtitle="Shops that transacted today"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <AnalyticsCard
          title="Dormant Shops (7d+)"
          value={metrics.dormantShops.length}
          subtitle="No sales in over a week"
          trend={`${Math.round((metrics.dormantShops.length / (metrics.totalShopsCount || 1)) * 100)}% of total`}
          trendType={metrics.dormantShops.length > 0 ? "negative" : "neutral"}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />

        <AnalyticsCard
          title="Avg Sales (30 Days)"
          value={`${metrics.avgSalesPerActiveShop} sales`}
          subtitle="Depth of use per active shop"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />

        <AnalyticsCard
          title="Weekly Growth (WoW)"
          value={metrics.thisWeekCount}
          subtitle={`${metrics.lastWeekCount} active shops last week`}
          trend={`${metrics.wowGrowthPct >= 0 ? "+" : ""}${metrics.wowGrowthPct}%`}
          trendType={metrics.wowGrowthPct > 0 ? "positive" : metrics.wowGrowthPct < 0 ? "negative" : "neutral"}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2M2 4h2v14H2z" />
            </svg>
          }
        />
      </div>

      {/* Detailed Action Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 🚨 Dormant Shops (Actionable List) */}
        <div className="rounded-2xl border p-5 bg-white space-y-4" style={{ borderColor: "var(--border-color)" }}>
          <div>
            <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
              Dormant Shops (Need Re-Engagement)
            </h3>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Shops registered &gt; 7 days ago that recorded 0 transactions in the last week.
            </p>
          </div>

          <div className="max-h-[350px] overflow-y-auto border rounded-xl divide-y" style={{ borderColor: "var(--border-color)" }}>
            {metrics.dormantShops.length === 0 ? (
              <p className="text-sm text-center py-10" style={{ color: "var(--text-muted)" }}>
                Awesome! No dormant shops currently.
              </p>
            ) : (
              metrics.dormantShops.map((shop) => (
                <div key={shop.id} className="p-3 flex items-center justify-between text-sm">
                  <div>
                    <h4 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                      {shop.name}
                    </h4>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {shop.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold px-2 py-0.5 rounded uppercase" style={{ background: "var(--danger-dim)", color: "var(--danger)" }}>
                      {shop.daysIdle} days idle
                    </span>
                    <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
                      Joined {formatDate(shop.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ⚠️ Zero Sales Shops (Needs Activation Support) */}
        <div className="rounded-2xl border p-5 bg-white space-y-4" style={{ borderColor: "var(--border-color)" }}>
          <div>
            <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
              Zero Sales Recorded (Onboarding Friction)
            </h3>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Registered accounts that have never successfully completed a checkout.
            </p>
          </div>

          <div className="max-h-[350px] overflow-y-auto border rounded-xl divide-y" style={{ borderColor: "var(--border-color)" }}>
            {metrics.zeroSalesShops.length === 0 ? (
              <p className="text-sm text-center py-10" style={{ color: "var(--text-muted)" }}>
                All registered shops have recorded at least one transaction!
              </p>
            ) : (
              metrics.zeroSalesShops.map((shop) => (
                <div key={shop.id} className="p-3 flex items-center justify-between text-sm">
                  <div>
                    <h4 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                      {shop.name}
                    </h4>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {shop.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold px-2 py-0.5 rounded uppercase" style={{ background: "var(--warning-dim)", color: "var(--warning)" }}>
                      {shop.daysRegistered} days old
                    </span>
                    <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
                      Joined {formatDate(shop.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
