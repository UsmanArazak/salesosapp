import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";
import { ExpenseList } from "./ExpenseList";

export default async function ExpensesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const supabase = createServiceRoleSupabaseClient();
  const { data: expenses } = await supabase
    .from("expenses")
    .select("id, amount, category, description, date")
    .eq("shop_id", session.user.shopId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  return <ExpenseList expenses={expenses ?? []} />;
}
