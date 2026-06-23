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
    console.error("[Waitlist Admin] Error fetching waitlist:", error.message);
    return [];
  }

  return data ?? [];
}

export default async function WaitlistAdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "superadmin") redirect("/login");

  const entries = await getWaitlistData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Waitlist
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            People who signed up for early access
          </p>
        </div>
        <div
          className="px-4 py-2 rounded-xl text-sm font-bold"
          style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
        >
          {entries.length} {entries.length === 1 ? "sign-up" : "sign-ups"}
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl border overflow-hidden bg-white"
        style={{ borderColor: "var(--border-color)" }}
      >
        {entries.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <p className="text-2xl">📋</p>
            <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
              No waitlist sign-ups yet.
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
                      {entries.length - i}
                    </td>
                    <td className="px-5 py-3.5 font-semibold" style={{ color: "var(--text-primary)" }}>
                      {entry.name}
                    </td>
                    <td className="px-5 py-3.5" style={{ color: "var(--text-muted)" }}>
                      <a href={`mailto:${entry.email}`} className="hover:underline">
                        {entry.email}
                      </a>
                    </td>
                    <td className="px-5 py-3.5" style={{ color: "var(--text-muted)" }}>
                      <a
                        href={`https://wa.me/${entry.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
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
