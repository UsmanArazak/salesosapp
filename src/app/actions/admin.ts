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

// ─── Promote a user to superadmin ────────────────────────────────────────────

export async function promoteToSuperAdmin(userId: string): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session || !isSuperAdmin(session.user.role)) return { error: "Forbidden." };

  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase
    .from("users")
    .update({ role: "superadmin" })
    .eq("id", userId);

  if (error) return { error: "Failed to promote user." };
  revalidatePath("/superadmin/users");
  return { success: true };
}

// ─── Demote a superadmin back to owner ───────────────────────────────────────

export async function demoteToOwner(userId: string): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session || !isSuperAdmin(session.user.role)) return { error: "Forbidden." };

  // Prevent self-demotion
  if (session.user.userId === userId) {
    return { error: "You cannot demote your own account." };
  }

  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase
    .from("users")
    .update({ role: "owner" })
    .eq("id", userId);

  if (error) return { error: "Failed to demote user." };
  revalidatePath("/superadmin/users");
  return { success: true };
}

// ─── Delete a shop and all its data ──────────────────────────────────────────

export async function deleteShop(shopId: string): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session || !isSuperAdmin(session.user.role)) {
    return { error: "Forbidden." };
  }

  const supabase = createServiceRoleSupabaseClient();

  // 1. Fetch sales to delete sale_items first
  const { data: sales, error: salesFetchErr } = await supabase
    .from("sales")
    .select("id")
    .eq("shop_id", shopId);

  if (salesFetchErr) {
    console.error("Error fetching shop sales for deletion:", salesFetchErr.message);
    return { error: "Failed to query shop sales records." };
  }

  const saleIds = (sales ?? []).map((s) => s.id);

  if (saleIds.length > 0) {
    // Delete sale items
    const { error: itemsErr } = await supabase
      .from("sale_items")
      .delete()
      .in("sale_id", saleIds);

    if (itemsErr) {
      console.error("Error deleting sale items:", itemsErr.message);
      return { error: "Failed to delete shop sale items." };
    }
  }

  // 2. Delete credit sales
  const { error: creditErr } = await supabase
    .from("credit_sales")
    .delete()
    .eq("shop_id", shopId);

  if (creditErr) {
    console.error("Error deleting credit sales:", creditErr.message);
    return { error: "Failed to delete shop credit sales." };
  }

  // 3. Delete sales
  const { error: salesErr } = await supabase
    .from("sales")
    .delete()
    .eq("shop_id", shopId);

  if (salesErr) {
    console.error("Error deleting sales:", salesErr.message);
    return { error: "Failed to delete shop sales." };
  }

  // 4. Delete products
  const { error: productsErr } = await supabase
    .from("products")
    .delete()
    .eq("shop_id", shopId);

  if (productsErr) {
    console.error("Error deleting products:", productsErr.message);
    return { error: "Failed to delete shop products." };
  }

  // 5. Delete customers
  const { error: customersErr } = await supabase
    .from("customers")
    .delete()
    .eq("shop_id", shopId);

  if (customersErr) {
    console.error("Error deleting customers:", customersErr.message);
    return { error: "Failed to delete shop customers." };
  }

  // 6. Delete expenses
  const { error: expensesErr } = await supabase
    .from("expenses")
    .delete()
    .eq("shop_id", shopId);

  if (expensesErr) {
    console.error("Error deleting expenses:", expensesErr.message);
    return { error: "Failed to delete shop expenses." };
  }

  // 7. Delete users
  const { error: usersErr } = await supabase
    .from("users")
    .delete()
    .eq("shop_id", shopId);

  if (usersErr) {
    console.error("Error deleting users:", usersErr.message);
    return { error: "Failed to delete shop users." };
  }

  // 8. Delete shop itself
  const { error: shopErr } = await supabase
    .from("shops")
    .delete()
    .eq("id", shopId);

  if (shopErr) {
    console.error("Error deleting shop:", shopErr.message);
    return { error: "Failed to delete shop." };
  }

  revalidatePath("/superadmin");
  revalidatePath("/superadmin/shops");
  return { success: true };
}

