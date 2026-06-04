import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";
import Link from "next/link";
import { ShopDetailClient } from "./ShopDetailClient";

function formatNaira(amount: number): string {
  const abs = Math.abs(Math.round(amount));
  const formatted = new Intl.NumberFormat("en-US").format(abs);
  return (amount < 0 ? "-₦" : "₦") + formatted;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function ShopDetailPage({
  params,
}: {
  params: { shopId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "superadmin") redirect("/login");

  const supabase = createServiceRoleSupabaseClient();
  const { shopId } = params;

  // Fetch shop + owner + stats in parallel
  const [
    { data: shop },
    { data: owner },
    { count: productCount },
    { count: customerCount },
    { count: salesCount },
    { data: salesRevenue },
    { data: openCredit },
    { count: expenseCount },
  ] = await Promise.all([
    supabase.from("shops").select("id, name, plan, created_at, address, phone").eq("id", shopId).single(),
    supabase.from("users").select("email, role").eq("shop_id", shopId).eq("role", "owner").maybeSingle(),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("shop_id", shopId).eq("archived", false),
    supabase.from("customers").select("*", { count: "exact", head: true }).eq("shop_id", shopId),
    supabase.from("sales").select("*", { count: "exact", head: true }).eq("shop_id", shopId),
    supabase.from("sales").select("total_amount").eq("shop_id", shopId),
    supabase.from("credit_sales").select("amount, amount_paid").eq("shop_id", shopId).neq("status", "paid"),
    supabase.from("expenses").select("*", { count: "exact", head: true }).eq("shop_id", shopId),
  ]);

  if (!shop) notFound();

  const totalRevenue = (salesRevenue ?? []).reduce((s, r) => s + (r.total_amount ?? 0), 0);
  const outstandingCredit = (openCredit ?? []).reduce((s, c) => s + ((c.amount ?? 0) - (c.amount_paid ?? 0)), 0);

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back */}
      <div className="flex items-center gap-3">
        <Link
          href="/superadmin/shops"
          className="w-9 h-9 rounded-xl border flex items-center justify-center transition-colors bg-white hover:bg-gray-50"
          style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {shop.name}
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Registered {formatDate(shop.created_at)}
          </p>
        </div>
      </div>

      {/* Shop Info + Plan Change */}
      <ShopDetailClient shop={shop} ownerEmail={owner?.email ?? "—"} />

      {/* Stats Grid */}
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: "var(--text-muted)" }}
        >
          Shop Statistics
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Total Revenue", value: formatNaira(totalRevenue), accent: true },
            { label: "Outstanding Credit", value: formatNaira(outstandingCredit), warn: outstandingCredit > 0 },
            { label: "Active Products", value: (productCount ?? 0).toLocaleString() },
            { label: "Total Sales", value: (salesCount ?? 0).toLocaleString() },
            { label: "Customers", value: (customerCount ?? 0).toLocaleString() },
            { label: "Expenses Logged", value: (expenseCount ?? 0).toLocaleString() },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border p-4 bg-white"
              style={{
                borderColor: stat.warn ? "var(--warning-border)" : "var(--border-color)",
              }}
            >
              <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>
                {stat.label}
              </p>
              <p
                className="text-lg font-bold"
                style={{
                  color: stat.accent
                    ? "var(--accent)"
                    : stat.warn
                    ? "var(--warning)"
                    : "var(--text-primary)",
                }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
