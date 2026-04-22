import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";
import { DashboardNav } from "@/components/ui/DashboardNav";

async function getShopName(shopId: string): Promise<string> {
  try {
    const supabase = createServiceRoleSupabaseClient();
    const { data } = await supabase
      .from("shops")
      .select("name")
      .eq("id", shopId)
      .single();
    return data?.name ?? "My Shop";
  } catch {
    return "My Shop";
  }
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const shopName = await getShopName(session.user.shopId);

  return (
    <div className="min-h-dvh" style={{ background: "var(--bg-base)" }}>
      <DashboardNav shopName={shopName} />

      {/* Main content — offset for sidebar (desktop) and header+bottom-nav (mobile) */}
      <main
        className="md:ml-56 pt-14 md:pt-0 pb-20 md:pb-0 min-h-dvh"
        style={{ background: "var(--bg-base)" }}>
        <div className="max-w-5xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
