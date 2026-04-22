import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";
import Link from "next/link";
import { InventoryList } from "../InventoryList";

export default async function LowStockAlertsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const supabase = createServiceRoleSupabaseClient();
  
  // We cannot easily do a direct comparison of columns in a simple eq() in supabase-js,
  // so we fetch all active and filter in memory since we need exactly stock <= threshold
  const { data: allProducts } = await supabase
    .from("products")
    .select("id, name, category, buying_price, selling_price, stock_quantity, low_stock_threshold")
    .eq("shop_id", session.user.shopId)
    .eq("archived", false)
    .order("name");

  const lowStockProducts = (allProducts ?? []).filter(
    (p) => p.stock_quantity <= p.low_stock_threshold
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="w-9 h-9 rounded-xl border flex items-center justify-center transition-colors bg-white"
          style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Low Stock Alerts
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Items that need restocking immediately
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl border" style={{ borderColor: "var(--warning-border)", background: "var(--warning-dim)" }}>
        <div className="flex items-start gap-3">
           <div className="text-2xl">⚠️</div>
           <div>
             <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Restock Required</h3>
             <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
               You have {lowStockProducts.length} product{lowStockProducts.length !== 1 ? "s" : ""} running below their set threshold.
             </p>
           </div>
        </div>
      </div>

      <InventoryList products={lowStockProducts} />
    </div>
  );
}
