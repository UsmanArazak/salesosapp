import Image from "next/image";
import { WaitlistForm } from "./WaitlistForm";
import { CyclingText } from "./CyclingText";

export default function Home() {
  return (
    <div className="min-h-dvh flex flex-col font-sans select-none" style={{ background: "#FAFAF9", color: "#1C1917" }}>

      {/* ── HEADER ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#FAFAF9]/80 backdrop-blur-md border-b border-stone-200/60">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="SalesOS Logo" width={32} height={32} className="rounded-xl shadow-sm" />
            <span className="font-extrabold text-xl tracking-tight text-stone-900">SalesOS</span>
          </div>
          <div
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold border uppercase tracking-wide"
            style={{ background: "rgba(249,115,22,0.08)", borderColor: "rgba(249,115,22,0.25)", color: "#EA580C" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            Early Access
          </div>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <main className="flex-grow">

        {/* Top section */}
        <section className="relative overflow-hidden">

          {/* Radial glow background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(249,115,22,0.12) 0%, transparent 70%)",
            }}
          />

          <div className="relative max-w-3xl mx-auto px-6 pt-20 pb-16 text-center space-y-8">

            {/* Top pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200/80">
              🇳🇬 Built for Nigerian Small Business Owners
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-stone-900 leading-[1.1]">
              The smarter way to{" "}
              <span className="relative inline-block">
                <span className="relative z-10">
                  <CyclingText />
                </span>
                <span
                  className="absolute bottom-1 left-0 right-0 h-3 rounded-sm -z-0"
                  style={{ background: "rgba(249,115,22,0.15)" }}
                />
              </span>
              <br />
              your shop
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-stone-500 max-w-lg mx-auto leading-relaxed">
              Record sales without internet, track your stock, manage customer credit, and see your daily profit — all from your phone. No notebook, no stress.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { icon: "📦", label: "Inventory Tracking" },
                { icon: "💰", label: "Instant Profit View" },
                { icon: "👤", label: "Customer Credit" },
                { icon: "📵", label: "Works Offline" },
              ].map((f) => (
                <span
                  key={f.label}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border"
                  style={{ background: "#fff", borderColor: "#E7E5E4", color: "#44403C" }}
                >
                  <span>{f.icon}</span>
                  {f.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Waitlist Form Section */}
        <section className="max-w-lg mx-auto px-6 pb-24">
          <div
            className="rounded-3xl border p-8 shadow-xl"
            style={{
              background: "#fff",
              borderColor: "#E7E5E4",
              boxShadow: "0 8px 40px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            {/* Form header */}
            <div className="text-center mb-8 space-y-2">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm"
                style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)" }}
              >
                <Image src="/logo.png" alt="SalesOS" width={32} height={32} className="rounded-lg" />
              </div>
              <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">Join the Waitlist</h2>
              <p className="text-sm text-stone-500 max-w-xs mx-auto">
                Be first in line. Early members get <span className="font-semibold text-orange-600">exclusive premium perks</span> when we launch.
              </p>
            </div>

            <WaitlistForm />
          </div>

          {/* Trust indicators */}
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-stone-400 font-medium">
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-orange-400">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Your data is safe
            </span>
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-orange-400">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Takes 30 seconds
            </span>
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-orange-400">
                <path d="M18 8h1a4 4 0 010 8h-1" />
                <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
                <line x1="6" y1="1" x2="6" y2="4" />
                <line x1="10" y1="1" x2="10" y2="4" />
                <line x1="14" y1="1" x2="14" y2="4" />
              </svg>
              No spam, ever
            </span>
          </div>
        </section>

        {/* Bottom divider strip */}
        <div className="border-t border-stone-200/60 bg-stone-50 py-10 px-6">
          <div className="max-w-3xl mx-auto">
            <p className="text-center text-xs font-semibold uppercase tracking-widest text-stone-400 mb-6">
              Designed for shops like these
            </p>
            <div className="flex flex-wrap justify-center gap-x-10 gap-y-3 text-sm font-bold text-stone-400/70">
              {["Provision Stores", "Boutiques", "Electronics Shops", "Pharmacies", "Food Vendors", "Hardware Stores"].map((s) => (
                <span key={s} className="hover:text-stone-600 transition-colors">{s}</span>
              ))}
            </div>
          </div>
        </div>

      </main>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="border-t border-stone-200/60 bg-stone-900 text-stone-400 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="SalesOS" width={20} height={20} className="rounded-md opacity-70" />
            <span className="font-bold text-white">SalesOS</span>
            <span className="text-stone-600">© 2026. All rights reserved.</span>
          </div>
          <span className="text-stone-500">Built with ❤️ for Nigerian shop owners</span>
        </div>
      </footer>

    </div>
  );
}
