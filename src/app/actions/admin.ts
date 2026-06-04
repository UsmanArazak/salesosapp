"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";

type ActionResult = { success: true } | { error: string };

function isSuperAdmin(role: string | undefined): boolean {
  return role === "superadmin";
}

// ─── Change a shop's plan ─────────────────────────────────────────────────────

export async function changeShopPlan(
  shopId: string,
  plan: "free" | "pro"
): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session || !isSuperAdmin(session.user.role)) {
    return { error: "Forbidden." };
  }

  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase
    .from("shops")
    .update({ plan })
    .eq("id", shopId);

  if (error) return { error: "Failed to update plan." };

  revalidatePath("/superadmin");
  revalidatePath("/superadmin/shops");
  revalidatePath(`/superadmin/shops/${shopId}`);
  return { success: true };
}
