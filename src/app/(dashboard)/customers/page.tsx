import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";
import { CustomerList } from "./CustomerList";

export default async function CustomersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const supabase = createServiceRoleSupabaseClient();
  const { data: customers } = await supabase
    .from("customers")
    .select("id, name, phone, total_debt")
    .eq("shop_id", session.user.shopId)
    .order("name", { ascending: true });

  return <CustomerList customers={customers ?? []} />;
}
