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
  const [{ data: salesMonth }, { data: expensesMonth }, { data: customersRaw }, { data: productsRaw }] = await Promise.all([
    supabase
      .from("sales")
      .select("id, total_amount, created_at, payment_method, bank_name")
      .eq("shop_id", shopId)
      .neq("status", "voided")
      .gte("created_at", monthStart),
    supabase
      .from("expenses")
      .select("amount, date")
      .eq("shop_id", shopId)
      .gte("date", monthYMD),
    supabase
      .from("customers")
      .select("name, total_debt, phone")
      .eq("shop_id", shopId),
    supabase
      .from("products")
      .select("id, name, stock_quantity")
      .eq("shop_id", shopId)
      .eq("archived", false)
  ]);

  const salesM = salesMonth ?? [];
  const expensesM = expensesMonth ?? [];
  
  // Need sale items to calculate COGS securely from snapshots
  const saleIds = salesM.map((s) => s.id);
  const { data: saleItemsRaw } = saleIds.length > 0 
    ? await supabase.from("sale_items").select("sale_id, product_id, unit_cost, unit_price, quantity").in("sale_id", saleIds)
    : { data: [] };
  const saleItems = saleItemsRaw ?? [];

  // -- Advanced Performance Computations --
  const totalUncollectedDebt = (customersRaw ?? []).reduce((sum, c) => sum + (c.total_debt || 0), 0);
  const topDebtors = (customersRaw ?? [])
    .filter((c) => (c.total_debt || 0) > 0)
    .sort((a, b) => (b.total_debt || 0) - (a.total_debt || 0))
    .slice(0, 3);

  const activeProducts = productsRaw ?? [];
  const soldProductIds = new Set(saleItems.map(i => i.product_id));

  // Dead stock: active products in inventory (stock > 0) that have not been sold this month
  const deadStock = activeProducts
    .filter((p) => p.stock_quantity > 0 && !soldProductIds.has(p.id))
    .slice(0, 3);

  // Product sales performance
  const productStats = activeProducts.map((p) => {
    const itemsForProduct = saleItems.filter((item) => item.product_id === p.id);
    const totalQty = itemsForProduct.reduce((sum, item) => sum + item.quantity, 0);
    const revenue = itemsForProduct.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const cost = itemsForProduct.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
    const profit = revenue - cost;
    return {
      name: p.name,
      qty: totalQty,
      revenue,
      profit,
    };
  }).filter(stat => stat.qty > 0);

  const topSelling = [...productStats].sort((a, b) => b.qty - a.qty).slice(0, 3);
  const mostProfitable = [...productStats].sort((a, b) => b.profit - a.profit).slice(0, 3);

  // Bank Transfer Breakdown
  const transferSales = salesM.filter(s => s.payment_method === "transfer" && s.bank_name);
  const bankBreakdown: Record<string, number> = {};
  for (const s of transferSales) {
    bankBreakdown[s.bank_name] = (bankBreakdown[s.bank_name] || 0) + s.total_amount;
  }
  const bankBreakdownEntries = Object.entries(bankBreakdown).sort((a, b) => b[1] - a[1]);
  const totalTransfers = transferSales.reduce((sum, s) => sum + s.total_amount, 0);

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
            Business Performance
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Track your true profit and cash flow health
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

      {/* PRODUCT PERFORMANCE INSIGHTS */}
      <div className="rounded-2xl border p-6 bg-white space-y-6" style={{ borderColor: "var(--border-color)" }}>
         <div>
            <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Product Insights</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Decisions to make on stock buying and selling.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Top Selling */}
            <div className="space-y-3">
               <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600">🏆 Top Selling (Qty)</h3>
               {topSelling.length === 0 ? (
                  <p className="text-xs text-stone-500">No sales recorded yet.</p>
               ) : (
                  <ul className="space-y-2 text-xs">
                     {topSelling.map((p, idx) => (
                        <li key={idx} className="flex justify-between border-b pb-1">
                           <span className="truncate max-w-[120px] font-medium text-stone-800">{p.name}</span>
                           <span className="font-bold text-stone-900">{p.qty} sold</span>
                        </li>
                     ))}
                  </ul>
               )}
            </div>

            {/* Most Profitable */}
            <div className="space-y-3">
               <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600">💰 Most Profitable</h3>
               {mostProfitable.length === 0 ? (
                  <p className="text-xs text-stone-500">No sales recorded yet.</p>
               ) : (
                  <ul className="space-y-2 text-xs">
                     {mostProfitable.map((p, idx) => (
                        <li key={idx} className="flex justify-between border-b pb-1">
                           <span className="truncate max-w-[120px] font-medium text-stone-800">{p.name}</span>
                           <span className="font-bold text-green-600">{formatNaira(p.profit)}</span>
                        </li>
                     ))}
                  </ul>
               )}
            </div>

            {/* Dead Stock */}
            <div className="space-y-3">
               <h3 className="text-xs font-bold uppercase tracking-wider text-red-600">📉 Dead Stock</h3>
               {deadStock.length === 0 ? (
                  <p className="text-xs text-stone-500">All items are active.</p>
               ) : (
                  <ul className="space-y-2 text-xs">
                     {deadStock.map((p, idx) => (
                        <li key={idx} className="flex justify-between border-b pb-1">
                           <span className="truncate max-w-[120px] font-medium text-stone-800">{p.name}</span>
                           <span className="font-bold text-red-600">{p.stock_quantity} left</span>
                        </li>
                     ))}
                  </ul>
               )}
            </div>
         </div>
      </div>

      {/* CASH FLOW HEALTH CARD */}
      <div className="rounded-2xl border p-6 bg-white space-y-6" style={{ borderColor: "var(--border-color)" }}>
         <div>
            <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Cash Flow Health</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Total amount of money currently owed to you by customers.</p>
         </div>
         
         <div className="p-4 rounded-xl border flex items-center justify-between" style={{ borderColor: "var(--warning-border)", background: "var(--warning-dim)" }}>
            <div className="flex items-center gap-3">
               <span className="text-2xl">⚠️</span>
               <span className="font-semibold text-sm" style={{ color: "var(--warning)" }}>Uncollected Debt</span>
            </div>
            <div className="font-black text-lg" style={{ color: "var(--warning)" }}>
               {formatNaira(totalUncollectedDebt)}
            </div>
         </div>

         {topDebtors.length > 0 && (
            <div className="space-y-3">
               <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">Top Outstanding Debtors</h3>
               <div className="space-y-2">
                  {topDebtors.map((debtor, idx) => (
                     <div key={idx} className="flex justify-between items-center text-xs border-b pb-2">
                        <div>
                           <p className="font-semibold text-stone-800">{debtor.name}</p>
                           <p className="text-[10px] text-stone-500">{debtor.phone || "No phone"}</p>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="font-bold text-red-600">{formatNaira(debtor.total_debt)}</span>
                           {debtor.phone && (
                              <a
                                 href={`https://wa.me/${debtor.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello ${debtor.name}, a friendly reminder from your shop regarding the outstanding balance of ${formatNaira(debtor.total_debt)}.`)}`}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="px-2.5 py-1 bg-green-500 text-white rounded text-[10px] font-bold hover:bg-green-600"
                              >
                                 Remind 💬
                              </a>
                           )}
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}
      </div>

      {/* BANK TRANSFER BREAKDOWN */}
      <div className="rounded-2xl border p-6 bg-white space-y-5" style={{ borderColor: "var(--border-color)" }}>
         <div>
            <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Bank Transfer Breakdown</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Monthly revenue received per bank account via transfer.</p>
         </div>

         {bankBreakdownEntries.length === 0 ? (
            <p className="text-xs py-2" style={{ color: "var(--text-muted)" }}>No bank transfers recorded this month.</p>
         ) : (
            <div className="space-y-3">
               {bankBreakdownEntries.map(([bank, amount]) => {
                  const pct = totalTransfers > 0 ? Math.round((amount / totalTransfers) * 100) : 0;
                  return (
                     <div key={bank}>
                        <div className="flex justify-between items-center text-xs mb-1">
                           <span className="font-semibold text-stone-800">🏦 {bank}</span>
                           <span className="font-bold" style={{ color: "var(--accent)" }}>{formatNaira(amount)}</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                           <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "var(--accent)" }} />
                        </div>
                        <p className="text-[10px] mt-0.5 text-stone-400">{pct}% of all transfers</p>
                     </div>
                  );
               })}
               <div className="flex justify-between items-center pt-3 border-t text-xs font-bold" style={{ borderColor: "var(--border-color)" }}>
                  <span style={{ color: "var(--text-primary)" }}>Total Transfers This Month</span>
                  <span style={{ color: "var(--accent)" }}>{formatNaira(totalTransfers)}</span>
               </div>
            </div>
         )}
      </div>
      
    </div>
  );
}
