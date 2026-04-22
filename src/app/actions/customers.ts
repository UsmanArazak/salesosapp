"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";

type ActionResult = { success: true } | { error: string };

export async function createCustomer(data: { name: string; phone?: string }): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Not authenticated" };

  if (!data.name.trim()) return { error: "Customer name is required" };

  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase.from("customers").insert({
    shop_id: session.user.shopId,
    name: data.name.trim(),
    phone: data.phone?.trim() || "",
    total_debt: 0,
  });

  if (error) return { error: "Failed to create customer" };

  revalidatePath("/dashboard/customers");
  return { success: true };
}

export async function recordRepayment(customerId: string, amountToPay: number): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Not authenticated" };

  if (amountToPay <= 0) return { error: "Payment amount must be greater than zero." };

  const shopId = session.user.shopId;
  const supabase = createServiceRoleSupabaseClient();

  // 1. Fetch customer to get total incoming debt
  const { data: customer, error: custErr } = await supabase
    .from("customers")
    .select("total_debt")
    .eq("id", customerId)
    .eq("shop_id", shopId)
    .single();

  if (custErr || !customer) return { error: "Customer not found." };
  if (customer.total_debt === 0) return { error: "Customer has no outstanding debt." };
  if (amountToPay > customer.total_debt) return { error: "Payment amount exceeds total debt." };

  // 2. Fetch all unpaid/partial credit sales for this customer (oldest first)
  const { data: creditSales, error: creditErr } = await supabase
    .from("credit_sales")
    .select("id, amount, amount_paid")
    .eq("customer_id", customerId)
    .eq("shop_id", shopId)
    .neq("status", "paid")
    .order("created_at", { ascending: true }); // Oldest debt gets paid off first

  if (creditErr || !creditSales || creditSales.length === 0) {
    return { error: "Could not find active credit records." };
  }

  // 3. Apply payment sequentially
  let remainingPayment = amountToPay;

  for (const record of creditSales) {
    if (remainingPayment <= 0) break;

    const remainingOnRecord = record.amount - record.amount_paid;
    if (remainingOnRecord <= 0) continue;

    const amountToApplyToThisRecord = Math.min(remainingOnRecord, remainingPayment);
    const newAmountPaid = record.amount_paid + amountToApplyToThisRecord;
    const newStatus = newAmountPaid >= record.amount ? "paid" : "partial";

    await supabase
      .from("credit_sales")
      .update({
        amount_paid: newAmountPaid,
        status: newStatus
      })
      .eq("id", record.id);

    remainingPayment -= amountToApplyToThisRecord;
  }

  // 4. Update total debt on customer
  const newTotalDebt = customer.total_debt - amountToPay;
  await supabase
    .from("customers")
    .update({ total_debt: newTotalDebt })
    .eq("id", customerId);

  revalidatePath(`/dashboard/customers/${customerId}`);
  revalidatePath("/dashboard/customers");
  revalidatePath("/dashboard");

  return { success: true };
}
