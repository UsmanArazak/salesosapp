import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";
import { EditProductClient } from "./EditProductClient";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const supabase = createServiceRoleSupabaseClient();
  const { data: product } = await supabase
    .from("products")
    .select("id, name, category, buying_price, selling_price, stock_quantity, low_stock_threshold")
    .eq("id", params.id)
    .eq("shop_id", session.user.shopId) // ownership check
    .eq("archived", false)
    .single();

  if (!product) notFound();

  return <EditProductClient product={product} />;
}
