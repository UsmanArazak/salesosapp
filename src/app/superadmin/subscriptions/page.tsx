import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";
import { SubscriptionTable } from "./SubscriptionTable";

export default async function SubscriptionsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "superadmin") redirect("/login");

  const supabase = createServiceRoleSupabaseClient();

  // Fetch subscriptions + shops + owner emails in parallel
  const [{ data: subscriptionsRaw }, { data: shopsRaw }, { data: usersRaw }] =
    await Promise.all([
      supabase
        .from("subscriptions")
        .select("id, shop_id, plan, status, paystack_ref, renewed_at, expires_at")
        .order("renewed_at", { ascending: false }),
      supabase.from("shops").select("id, name"),
      supabase.from("users").select("shop_id, email").eq("role", "owner"),
    ]);

  const subscriptions = (subscriptionsRaw ?? []).map((sub) => ({
    ...sub,
    shopName: (shopsRaw ?? []).find((s) => s.id === sub.shop_id)?.name ?? "—",
    ownerEmail: (usersRaw ?? []).find((u) => u.shop_id === sub.shop_id)?.email ?? "—",
  }));

  // Stats summary
  const activeCount = subscriptions.filter((s) => s.status === "active").length;
  const proCount = subscriptions.filter((s) => s.plan === "pro").length;
  const expiredCount = subscriptions.filter((s) => s.status === "expired").length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Subscriptions
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          {subscriptions.length} subscription record{subscriptions.length !== 1 ? "s" : ""} on the platform
        </p>
      </div>

      {/* Mini stat cards */}
      {subscriptions.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Active", value: activeCount, color: "var(--success)" },
            { label: "Pro Plans", value: proCount, color: "var(--accent)" },
            { label: "Expired", value: expiredCount, color: "var(--warning)" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border p-4 bg-white text-center"
              style={{ borderColor: "var(--border-color)" }}
            >
              <p className="text-2xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      )}

      <SubscriptionTable subscriptions={subscriptions} />
    </div>
  );
}
