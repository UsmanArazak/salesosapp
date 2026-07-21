"use server";

import { createServiceRoleSupabaseClient } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

  return { success: true };
}
