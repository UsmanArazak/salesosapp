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
  const { error } = await supabase
    .from("shops")
    .update({
      name: input.name.trim(),
      phone: input.phone.trim() || null,
      address: input.address.trim() || null,
      bank_accounts: input.bankAccounts.filter(b => b.trim() !== ""),
    })
    .eq("id", shopId);

  if (error) {
    console.error("Failed to save shop profile details:", error.message);
    return { error: "Failed to save profile. Please try again." };
  }

  revalidatePath("/shop");
  revalidatePath("/dashboard");
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
