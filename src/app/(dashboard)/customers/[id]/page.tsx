import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";
import { CustomerProfileClient } from "./CustomerProfileClient";

export default async function CustomerProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const supabase = createServiceRoleSupabaseClient();

  // 1. Fetch Customer
  const { data: customer } = await supabase
    .from("customers")
    .select("id, name, phone, total_debt")
    .eq("id", params.id)
    .eq("shop_id", session.user.shopId)
    .single();

  if (!customer) notFound();

  // 2. Fetch Credit History (most recent first)
  const { data: creditHistory } = await supabase
    .from("credit_sales")
    .select("id, amount, amount_paid, status, created_at, sales(notes)")
    .eq("customer_id", customer.id)
    .eq("shop_id", session.user.shopId)
    .order("created_at", { ascending: false });

  // TS requires casting due to complex recursive joins from Supabase matching the expected type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (
    <CustomerProfileClient 
      customer={customer} 
      creditHistory={(creditHistory as any) ?? []} 
    />
  );
}
