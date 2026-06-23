"use server";

import { createServiceRoleSupabaseClient } from "@/lib/supabase";

export type WaitlistResult =
  | { success: true }
  | { error: string };

export async function joinWaitlist(formData: FormData): Promise<WaitlistResult> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const whatsapp = (formData.get("whatsapp") as string)?.trim();

  if (!name || !email || !whatsapp) {
    return { error: "Please fill in all fields." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  const supabase = createServiceRoleSupabaseClient();

  // Check for duplicates
  const { data: existing } = await supabase
    .from("waitlist")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    return { error: "This email is already on the waitlist!" };
  }

  const { error } = await supabase.from("waitlist").insert({
    name,
    email,
    whatsapp,
    joined_at: new Date().toISOString(),
  });

  if (error) return { error: "Something went wrong. Please try again." };

  return { success: true };
}
