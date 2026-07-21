import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";
import { ShopTable } from "./ShopTable";

export default async function ShopsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "superadmin") redirect("/login");

  const supabase = createServiceRoleSupabaseClient();

  const [{ data: shopsRaw }, { data: usersRaw }] = await Promise.all([
    supabase
      .from("shops")
      .select("id, name, plan, created_at, whatsapp_number")
      .order("created_at", { ascending: false }),
    supabase.from("users").select("id, shop_id, email").eq("role", "owner"),
  ]);

  const shops = (shopsRaw ?? []).map((shop) => ({
    ...shop,
    ownerEmail: (usersRaw ?? []).find((u) => u.shop_id === shop.id)?.email ?? "—",
    whatsappNumber: shop.whatsapp_number ?? undefined,
  }));

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Shops
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          {shops.length} shop{shops.length !== 1 ? "s" : ""} registered on the platform
        </p>
      </div>

      <ShopTable shops={shops} />
    </div>
  );
}
