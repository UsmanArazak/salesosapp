import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MenuClientPage } from "./MenuClientPage";

export const metadata = {
  title: "Menu - SalesOS",
};

export default async function MenuPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Menu
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          Access settings and additional features
        </p>
      </div>

      <MenuClientPage />
    </div>
  );
}
