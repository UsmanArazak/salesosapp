"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";

type ActionResult = { success: true } | { error: string };

export async function logExpense(data: {
  amount: number;
  category: string;
  description: string;
  date: string;
}): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Not authenticated" };

  if (data.amount <= 0) return { error: "Expense amount must be greater than zero." };
  if (!data.category) return { error: "A category is required." };
  if (!data.date) return { error: "A date is required." };

  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase.from("expenses").insert({
    shop_id: session.user.shopId,
    amount: data.amount,
    category: data.category,
    description: data.description.trim(),
    date: data.date,
  });

  if (error) return { error: "Failed to log expense." };

  revalidatePath("/dashboard/expenses");
  revalidatePath("/dashboard");
  
  return { success: true };
}
