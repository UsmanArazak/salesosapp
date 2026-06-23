import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function getWaitlistData() {
  const supabase = createServiceRoleSupabaseClient();

  const { data, error } = await supabase
    .from("waitlist")
    .select("id, name, email, whatsapp, joined_at")
    .order("joined_at", { ascending: false });

  if (error) {
    console.error("[Waitlist Admin] Error:", error.message);
    return [];
  }

  return data ?? [];
}

export default async function WaitlistAdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "superadmin") redirect("/login");

  const entries = await getWaitlistData();
  const total = entries.length;

  // Signups in the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentCount = entries.filter(
    (e) => new Date(e.joined_at) >= sevenDaysAgo
  ).length;

  // Signups today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayCount = entries.filter(
    (e) => new Date(e.joined_at) >= todayStart
  ).length;

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Waitlist
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          People who signed up for early access
        </p>
      </div>

      {/* Big Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Total Signups — Big Hero Card */}
        <div
          className="sm:col-span-1 rounded-2xl border p-6 flex flex-col justify-between"
          style={{
            background: "linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(249,115,22,0.02) 100%)",
            borderColor: "rgba(249,115,22,0.25)",
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
            Total Sign-ups
          </p>
          <div>
            <p
              className="text-6xl font-extrabold tracking-tight mt-3 leading-none"
              style={{ color: "var(--accent)" }}
            >
              {total}
            </p>
            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
              People waiting for early access
            </p>
          </div>
        </div>

        {/* This Week */}
        <div
          className="rounded-2xl border p-6 bg-white flex flex-col justify-between"
          style={{ borderColor: "var(--border-color)" }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            This Week
          </p>
          <div>
            <p className="text-5xl font-extrabold tracking-tight mt-3 leading-none" style={{ color: "var(--text-primary)" }}>
              {recentCount}
            </p>
            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
              Sign-ups in the last 7 days
            </p>
          </div>
        </div>

        {/* Today */}
        <div
          className="rounded-2xl border p-6 bg-white flex flex-col justify-between"
          style={{ borderColor: "var(--border-color)" }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Today
          </p>
          <div>
            <p className="text-5xl font-extrabold tracking-tight mt-3 leading-none" style={{ color: "var(--text-primary)" }}>
              {todayCount}
            </p>
            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
              Sign-ups since midnight
            </p>
          </div>
        </div>

      </div>

      {/* Signups Table */}
      <div
        className="rounded-2xl border overflow-hidden bg-white"
        style={{ borderColor: "var(--border-color)" }}
      >
        {entries.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <p className="text-3xl">📋</p>
            <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
              No sign-ups yet. Share your waitlist link!
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Make sure the <code className="bg-gray-100 px-1 rounded">waitlist</code> table exists in Supabase.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="border-b text-xs font-semibold uppercase tracking-wider"
                  style={{
                    borderColor: "var(--border-color)",
                    background: "var(--bg-elevated)",
                    color: "var(--text-muted)",
                  }}
                >
                  <th className="text-left px-5 py-3">#</th>
                  <th className="text-left px-5 py-3">Name</th>
                  <th className="text-left px-5 py-3">Email</th>
                  <th className="text-left px-5 py-3">WhatsApp</th>
                  <th className="text-left px-5 py-3">Signed Up</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <tr
                    key={entry.id}
                    className="border-b last:border-0"
                    style={{
                      borderColor: "var(--border-color)",
                      background: i % 2 === 1 ? "var(--bg-elevated)" : "transparent",
                    }}
                  >
                    <td className="px-5 py-3.5 text-xs" style={{ color: "var(--text-muted)" }}>
                      {total - i}
                    </td>
                    <td className="px-5 py-3.5 font-semibold" style={{ color: "var(--text-primary)" }}>
                      {entry.name}
                    </td>
                    <td className="px-5 py-3.5" style={{ color: "var(--text-muted)" }}>
                      <a href={`mailto:${entry.email}`} className="hover:underline">
                        {entry.email}
                      </a>
                    </td>
                    <td className="px-5 py-3.5">
                      <a
                        href={`https://wa.me/${entry.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline font-medium"
                        style={{ color: "#25D366" }}
                      >
                        {entry.whatsapp}
                      </a>
                    </td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: "var(--text-muted)" }}>
                      {formatDate(entry.joined_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
