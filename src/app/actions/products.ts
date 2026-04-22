"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";

export type ProductInput = {
  name: string;
  category: string;
  buyingPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
};

type ActionResult = { success: true } | { error: string };

function revalidateInventory() {
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard");
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createProduct(input: ProductInput): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Not authenticated." };

  if (!input.name.trim()) return { error: "Product name is required." };
  if (input.sellingPrice < input.buyingPrice) {
    return { error: "Selling price cannot be less than buying price." };
  }

  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase.from("products").insert({
    shop_id: session.user.shopId,
    name: input.name.trim(),
    category: input.category.trim(),
    buying_price: input.buyingPrice,
    selling_price: input.sellingPrice,
    stock_quantity: input.stockQuantity,
    low_stock_threshold: input.lowStockThreshold,
  });

  if (error) return { error: error.message };
  revalidateInventory();
  return { success: true };
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateProduct(
  id: string,
  input: ProductInput
): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Not authenticated." };

  if (!input.name.trim()) return { error: "Product name is required." };

  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase
    .from("products")
    .update({
      name: input.name.trim(),
      category: input.category.trim(),
      buying_price: input.buyingPrice,
      selling_price: input.sellingPrice,
      stock_quantity: input.stockQuantity,
      low_stock_threshold: input.lowStockThreshold,
    })
    .eq("id", id)
    .eq("shop_id", session.user.shopId); // ownership check

  if (error) return { error: error.message };
  revalidateInventory();
  return { success: true };
}

// ─── Archive (soft delete) ────────────────────────────────────────────────────

export async function archiveProduct(id: string): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Not authenticated." };

  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase
    .from("products")
    .update({ archived: true })
    .eq("id", id)
    .eq("shop_id", session.user.shopId); // ownership check

  if (error) return { error: error.message };
  revalidateInventory();
  return { success: true };
}
