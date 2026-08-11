"use server";

import { createServiceRoleSupabaseClient } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type UpdateShopProfileInput = {
  name: string;
  phone: string;
  address: string;
  bankAccounts: string[];
};

export async function updateShopProfile(
  shopId: string,
  input: UpdateShopProfileInput
): Promise<{ success: true } | { error: string }> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.shopId !== shopId) {
    return { error: "Unauthorized." };
  }

  if (!input.name.trim()) {
    return { error: "Shop name is required." };
  }

  const supabase = createServiceRoleSupabaseClient();
  const filteredBanks = input.bankAccounts.filter(b => b.trim() !== "");
  
  console.log("[updateShopProfile] Saving for shopId:", shopId);
  console.log("[updateShopProfile] Bank accounts to save:", JSON.stringify(filteredBanks));

  const { data, error } = await supabase
    .from("shops")
    .update({
      name: input.name.trim(),
      phone: input.phone.trim(),
      address: input.address.trim(),
      bank_accounts: filteredBanks,
    })
    .eq("id", shopId)
    .select("id, bank_accounts");

  console.log("[updateShopProfile] Supabase response data:", JSON.stringify(data));
  console.log("[updateShopProfile] Supabase response error:", error ? JSON.stringify(error) : "none");

  if (error) {
    console.error("Failed to save shop profile details:", error.message);
    return { error: `Failed to save profile: ${error.message}` };
  }

  if (!data || data.length === 0) {
    console.error("[updateShopProfile] No rows updated! shopId may not exist:", shopId);
    return { error: "No shop found to update. Please try again." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

// Keep older actions compatible if needed, pointing to the unified one
export async function updateShopWhatsApp(
  shopId: string,
  whatsappNumber: string
): Promise<{ success: true } | { error: string }> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.shopId !== shopId) {
    return { error: "Unauthorized." };
  }

  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase
    .from("shops")
    .update({ whatsapp_number: whatsappNumber || null })
    .eq("id", shopId);

  if (error) {
    return { error: "Failed to save. Please try again." };
  }

  revalidatePath("/shop");
  return { success: true };
}
