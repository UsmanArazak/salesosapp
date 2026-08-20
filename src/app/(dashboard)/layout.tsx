import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardNav } from "@/components/ui/DashboardNav";
import { PWAInstallBanner } from "@/components/ui/PWAInstallBanner";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-dvh" style={{ background: "var(--bg-base)" }}>
      <DashboardNav />
      <PWAInstallBanner />

      {/* Main content — offset for sidebar (desktop) and header+bottom-nav (mobile) */}
      <main
        className="md:ml-56 pt-14 md:pt-0 pb-28 md:pb-0 min-h-dvh"
        style={{ background: "var(--bg-base)" }}>
        <div className="max-w-5xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
