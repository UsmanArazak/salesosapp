import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";
import { UserTable } from "./UserTable";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "superadmin") redirect("/login");

  const supabase = createServiceRoleSupabaseClient();

  const [{ data: usersRaw }, { data: shopsRaw }] = await Promise.all([
    supabase
      .from("users")
      .select("id, email, role, shop_id, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("shops").select("id, name"),
  ]);

  const users = (usersRaw ?? []).map((user) => ({
    ...user,
    shopName: (shopsRaw ?? []).find((s) => s.id === user.shop_id)?.name ?? "—",
  }));

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Users
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          {users.length} user{users.length !== 1 ? "s" : ""} registered on the platform
        </p>
      </div>

      <UserTable users={users} currentAdminId={session.user.userId} />
    </div>
  );
}
