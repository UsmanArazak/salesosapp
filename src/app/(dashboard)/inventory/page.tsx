import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";
import { InventoryList } from "./InventoryList";

export default async function InventoryPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const supabase = createServiceRoleSupabaseClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, category, buying_price, selling_price, stock_quantity, low_stock_threshold")
    .eq("shop_id", session.user.shopId)
    .eq("archived", false)
    .order("name");

  return <InventoryList products={products ?? []} />;
}
