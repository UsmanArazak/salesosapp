"use server";

import { createServiceRoleSupabaseClient } from "@/lib/supabase";

type RegisterInput = {
  shopName: string;
  email: string;
  password: string;
};

type RegisterResult =
  | { success: true }
  | { error: string };

export async function registerShop(input: RegisterInput): Promise<RegisterResult> {
  const { shopName, email, password } = input;

  if (!shopName.trim() || !email.trim() || !password) {
    return { error: "All fields are required." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const supabase = createServiceRoleSupabaseClient();

  // Step 1: Create the Supabase Auth user (email auto-confirmed for beta)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    if (authError?.message?.toLowerCase().includes("already registered")) {
      return { error: "An account with that email already exists." };
    }
    return { error: authError?.message ?? "Failed to create account. Please try again." };
  }

  const userId = authData.user.id;

  // Step 2: Create the shop record
  const { data: shop, error: shopError } = await supabase
    .from("shops")
    .insert({
      name: shopName.trim(),
      owner_id: userId,
      plan: "free",
    })
    .select("id")
    .single();

  if (shopError || !shop) {
    // Roll back: delete the auth user so they can retry
    await supabase.auth.admin.deleteUser(userId);
    return { error: "Failed to create your shop. Please try again." };
  }

  // Step 3: Create the user profile record linking to the shop
  const { error: userError } = await supabase.from("users").insert({
    id: userId,
    shop_id: shop.id,
    email: email.trim().toLowerCase(),
    role: "owner",
  });

  if (userError) {
    await supabase.auth.admin.deleteUser(userId);
    return { error: "Failed to set up your account. Please try again." };
  }

  return { success: true };
}
