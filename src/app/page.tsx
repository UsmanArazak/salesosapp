import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-dvh flex flex-col bg-[#f4f4f5]" style={{ background: "var(--bg-base)" }}>
      {/* ── HEADER/NAV ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b" style={{ borderColor: "var(--border-color)" }}>
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="SalesOS Logo"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="font-bold text-xl tracking-tight" style={{ color: "var(--text-primary)" }}>
              SalesOS
            </span>
          </div>

          <div className="flex items-center gap-3">
            {session ? (
              <Link
                href={session.user.role === "superadmin" ? "/superadmin" : "/dashboard"}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98] shadow-sm"
                style={{ background: "var(--accent)" }}
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors hover:bg-gray-50"
                  style={{ color: "var(--text-dim)" }}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98] shadow-sm"
                  style={{ background: "var(--accent)" }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ─────────────────────────────────────────────── */}
      <main className="flex-1">
        <section className="max-w-4xl mx-auto px-4 pt-16 pb-12 text-center space-y-6">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
            Designed for Small Retailers
          </div>

          <h1
            className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.15]"
            style={{ color: "var(--text-primary)" }}
          >
            Track your shop sales, profit, and customer debt
          </h1>

          <p className="text-base sm:text-lg max-w-xl mx-auto leading-relaxed" style={{ color: "var(--text-dim)" }}>
            Stop using pen and paper. SalesOS helps you record transactions, manage stock levels, monitor expenses, and check your net profit in real-time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            {session ? (
              <Link
                href={session.user.role === "superadmin" ? "/superadmin" : "/dashboard"}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white shadow-md transition-all active:scale-[0.98]"
                style={{ background: "var(--accent)" }}
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white shadow-md transition-all active:scale-[0.98]"
                  style={{ background: "var(--accent)" }}
                >
                  Create Free Account
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold bg-white border transition-colors hover:bg-gray-50"
                  style={{ borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                >
                  Sign In to Shop
                </Link>
              </>
            )}
          </div>
        </section>

        {/* ── FEATURES GRID ────────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              Simple tools built for your daily business routine
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Feature 1 */}
            <div
              className="rounded-2xl border p-5 bg-white space-y-3"
              style={{ borderColor: "var(--border-color)" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
              </div>
              <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                Track Net Profit
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Automatically calculate daily and monthly profits after subtracting expenses and cost of goods sold.
              </p>
            </div>

            {/* Feature 2 */}
            <div
              className="rounded-2xl border p-5 bg-white space-y-3"
              style={{ borderColor: "var(--border-color)" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                Stock Management
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Monitor stock quantities, define restock thresholds, and receive automatic alerts when items run low.
              </p>
            </div>

            {/* Feature 3 */}
            <div
              className="rounded-2xl border p-5 bg-white space-y-3"
              style={{ borderColor: "var(--border-color)" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                Customer Credit
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Track credit sales, view individual customer profiles, and record repayments with sequential FIFO settlement.
              </p>
            </div>

            {/* Feature 4 */}
            <div
              className="rounded-2xl border p-5 bg-white space-y-3"
              style={{ borderColor: "var(--border-color)" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
              </div>
              <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                Expense Logging
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Log shop utilities, rent, employee salaries, transport, and packaging to keep track of where money goes.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="border-t bg-white" style={{ borderColor: "var(--border-color)" }}>
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="SalesOS Logo"
              width={24}
              height={24}
              className="rounded-md"
            />
            <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
              SalesOS
            </span>
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            &copy; 2026 SalesOS. Smart retail OS.
          </p>
        </div>
      </footer>
    </div>
  );
}
