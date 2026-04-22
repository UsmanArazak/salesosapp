import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";
import Link from "next/link";

function formatNaira(amount: number): string {
  const abs = Math.abs(Math.round(amount));
  const formatted = new Intl.NumberFormat("en-US").format(abs);
  return (amount < 0 ? "-₦" : "₦") + formatted;
}

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const supabase = createServiceRoleSupabaseClient();
  const shopId = session.user.shopId;

  // -- Date Boundaries --
  const now = new Date();
  
  // Today
  const todayISO = now.toISOString().split("T")[0];

  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayISO = yesterday.toISOString().split("T")[0];
  
  // This Month
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01T00:00:00.000Z`;
  const monthYMD = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  // -- Fetch core records for the entire month --
  const [{ data: salesMonth }, { data: expensesMonth }] = await Promise.all([
    supabase
      .from("sales")
      .select("id, total_amount, created_at")
      .eq("shop_id", shopId)
      .gte("created_at", monthStart),
    supabase
      .from("expenses")
      .select("amount, date")
      .eq("shop_id", shopId)
      .gte("date", monthYMD)
  ]);

  const salesM = salesMonth ?? [];
  const expensesM = expensesMonth ?? [];

  // Need sale items to calculate COGS securely from snapshots
  const saleIds = salesM.map((s) => s.id);
  const { data: saleItemsRaw } = saleIds.length > 0 
    ? await supabase.from("sale_items").select("sale_id, unit_cost, quantity").in("sale_id", saleIds)
    : { data: [] };
  const saleItems = saleItemsRaw ?? [];

  // -- Computations --

  // Helpers to filter
  const isTodayDate = (isoString: string) => isoString.startsWith(todayISO);
  const isYesterdayDate = (isoString: string) => isoString.startsWith(yesterdayISO);

  // TODAY
  const salesTodayRows = salesM.filter(s => isTodayDate(s.created_at));
  const idsToday = salesTodayRows.map(s => s.id);
  const revenueToday = salesTodayRows.reduce((sum, s) => sum + s.total_amount, 0);
  const cogsToday = saleItems.filter(i => idsToday.includes(i.sale_id)).reduce((sum, i) => sum + (i.unit_cost * i.quantity), 0);
  const expToday = expensesM.filter(e => isTodayDate(e.date)).reduce((sum, e) => sum + e.amount, 0);
  const profitToday = revenueToday - cogsToday - expToday;

  // YESTERDAY
  const salesYestRows = salesM.filter(s => isYesterdayDate(s.created_at));
  const idsYest = salesYestRows.map(s => s.id);
  const revenueYest = salesYestRows.reduce((sum, s) => sum + s.total_amount, 0);
  const cogsYest = saleItems.filter(i => idsYest.includes(i.sale_id)).reduce((sum, i) => sum + (i.unit_cost * i.quantity), 0);
  const expYest = expensesM.filter(e => isYesterdayDate(e.date)).reduce((sum, e) => sum + e.amount, 0);
  const profitYest = revenueYest - cogsYest - expYest;

  // MONTH TOTALS
  const revenueMonth = salesM.reduce((sum, s) => sum + s.total_amount, 0);
  const cogsMonth = saleItems.reduce((sum, i) => sum + (i.unit_cost * i.quantity), 0);
  const expMonth = expensesM.reduce((sum, e) => sum + e.amount, 0);
  const profitMonth = revenueMonth - cogsMonth - expMonth;

  // Trend comparison
  const profitDiff = profitToday - profitYest;
  const isProfitUp = profitDiff >= 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="w-9 h-9 rounded-xl border flex items-center justify-center transition-colors bg-white hover:bg-gray-50"
          style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Financial Reports
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Your real profit mapped out
          </p>
        </div>
      </div>

      {/* TODAY VS YESTERDAY HIGHLIGHT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* TODAY */}
        <div className="rounded-2xl border p-5" style={{ background: profitToday >= 0 ? "var(--success-surface)" : "var(--danger-surface)", borderColor: profitToday >= 0 ? "var(--success-border)" : "var(--danger-border)" }}>
           <h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: profitToday >= 0 ? "var(--success)" : "var(--danger)" }}>Today&apos;s Profit</h2>
           <p className="text-4xl font-black mb-1" style={{ color: profitToday >= 0 ? "var(--success)" : "var(--danger)" }}>{formatNaira(profitToday)}</p>
           
           <div className="flex items-center gap-1.5 mt-2 text-xs font-medium" style={{ color: isProfitUp ? "var(--success)" : "var(--danger)" }}>
              {profitYest === 0 ? null : isProfitUp ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                  <span>Up {formatNaira(profitDiff)} from yesterday</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>
                  <span>Down {formatNaira(Math.abs(profitDiff))} from yesterday</span>
                </>
              )}
           </div>

           <div className="mt-4 pt-4 border-t" style={{ borderColor: profitToday >= 0 ? "var(--success-border)" : "var(--danger-border)", opacity: 0.8 }}>
              <div className="flex justify-between text-xs mb-1">
                 <span>Revenue</span>
                 <span className="font-bold">{formatNaira(revenueToday)}</span>
              </div>
              <div className="flex justify-between text-xs mb-1 text-red-700">
                 <span>COGS</span>
                 <span>-{formatNaira(cogsToday)}</span>
              </div>
              <div className="flex justify-between text-xs text-red-700">
                 <span>Expenses</span>
                 <span>-{formatNaira(expToday)}</span>
              </div>
           </div>
        </div>

        {/* YESTERDAY */}
        <div className="rounded-2xl border p-5 bg-white" style={{ borderColor: "var(--border-color)" }}>
           <h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-dim)" }}>Yesterday&apos;s Profit</h2>
           <p className="text-3xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>{formatNaira(profitYest)}</p>
           
           <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--border-color)" }}>
              <div className="flex justify-between text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                 <span>Revenue</span>
                 <span className="font-medium text-black">{formatNaira(revenueYest)}</span>
              </div>
              <div className="flex justify-between text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                 <span>COGS</span>
                 <span className="font-medium">-{formatNaira(cogsYest)}</span>
              </div>
              <div className="flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
                 <span>Expenses</span>
                 <span className="font-medium">-{formatNaira(expYest)}</span>
              </div>
           </div>
        </div>
      </div>

      {/* MONTHLY SUMMARY CARD */}
      <div className="rounded-2xl border p-6 bg-white" style={{ borderColor: "var(--border-color)" }}>
         <h2 className="text-sm font-bold mb-6" style={{ color: "var(--text-primary)" }}>This Month (Aggregate)</h2>

         <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b" style={{ borderColor: "var(--border-color)" }}>
               <div className="font-medium" style={{ color: "var(--text-muted)" }}>Total Monthly Revenue</div>
               <div className="font-bold text-lg">{formatNaira(revenueMonth)}</div>
            </div>
            <div className="flex justify-between items-center pb-4 border-b" style={{ borderColor: "var(--border-color)" }}>
               <div className="font-medium" style={{ color: "var(--text-muted)" }}>Total Cost of Goods Sold</div>
               <div className="font-medium text-red-600">-{formatNaira(cogsMonth)}</div>
            </div>
            <div className="flex justify-between items-center pb-4 border-b" style={{ borderColor: "var(--border-color)" }}>
               <div className="font-medium" style={{ color: "var(--text-muted)" }}>Total Monthly Expenses</div>
               <div className="font-medium text-red-600">-{formatNaira(expMonth)}</div>
            </div>
            <div className="flex justify-between items-center pt-2">
               <div className="font-bold text-sm tracking-wide uppercase" style={{ color: "var(--text-primary)" }}>Net Monthly Profit</div>
               <div className="font-black text-xl" style={{ color: profitMonth >= 0 ? "var(--success)" : "var(--danger)" }}>
                  {formatNaira(profitMonth)}
               </div>
            </div>
         </div>
      </div>
      
    </div>
  );
}
