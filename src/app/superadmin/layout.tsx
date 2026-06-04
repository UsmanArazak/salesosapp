import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AdminNav } from "@/components/ui/AdminNav";

export default async function SuperAdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "superadmin") redirect("/dashboard");

  return (
    <div className="min-h-dvh" style={{ background: "var(--bg-base)" }}>
      <AdminNav adminEmail={session.user.email ?? undefined} />

      {/* Main content — offset for sidebar (desktop) and header+bottom-nav (mobile) */}
      <main
        className="md:ml-56 pt-14 md:pt-0 pb-20 md:pb-0 min-h-dvh"
        style={{ background: "var(--bg-base)" }}
      >
        <div className="max-w-5xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}

