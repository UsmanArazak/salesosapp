import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";
import { POSClient } from "./POSClient";
import Link from "next/link";

export default async function NewSalePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const supabase = createServiceRoleSupabaseClient();

  // Fetch products and customers in parallel
  const [
    { data: products },
    { data: customers }
  ] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, selling_price, stock_quantity")
      .eq("shop_id", session.user.shopId)
      .eq("archived", false)
      .gt("stock_quantity", 0) // Only sellable items
      .order("name"),
    supabase
      .from("customers")
      .select("id, name")
      .eq("shop_id", session.user.shopId)
      .order("name")
  ]);

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard/sales"
          className="w-9 h-9 rounded-xl border flex items-center justify-center transition-colors bg-white"
          style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Record Sale
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Add items to cart and checkout
          </p>
        </div>
      </div>

      <POSClient 
        products={products ?? []} 
        customers={customers ?? []} 
      />
    </div>
  );
}
