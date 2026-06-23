import Image from "next/image";
import { WaitlistForm } from "./WaitlistForm";
import { CyclingText } from "./CyclingText";

export default function Home() {
  return (
    <div className="min-h-dvh flex flex-col font-sans" style={{ background: "#FAFAF9", color: "#1C1917" }}>

      {/* ── HEADER ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#FAFAF9]/80 backdrop-blur-md border-b border-stone-200/60">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="SalesOS Logo" width={30} height={30} className="rounded-lg shadow-sm" />
            <span className="font-bold text-lg tracking-tight text-stone-900">SalesOS</span>
          </div>
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
            style={{ background: "rgba(249,115,22,0.08)", borderColor: "rgba(249,115,22,0.2)", color: "#F97316" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            Early Access Opening Soon
          </div>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto space-y-8">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
            Built for Nigerian Small Business Owners
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-stone-900 leading-[1.1]">
            Finally, a smarter way to{" "}
            <span className="underline decoration-orange-500 decoration-wavy decoration-2 inline-block">
              <CyclingText />
            </span>{" "}
            your shop
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-stone-500 max-w-lg mx-auto leading-relaxed">
            SalesOS lets you record sales offline, track inventory, manage customer credit, and see your daily profit — all from your phone. No notebook needed.
          </p>

          {/* Features pills */}
          <div className="flex flex-wrap justify-center gap-2 text-xs font-semibold">
            {["📦 Inventory Tracking", "💰 Daily Profit", "👤 Customer Credit", "📵 Works Offline"].map((f) => (
              <span key={f} className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                {f}
              </span>
            ))}
          </div>

          {/* Waitlist Form */}
          <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm mt-4">
            <div className="mb-6 space-y-1">
              <h2 className="text-lg font-bold text-stone-900">Join the Waitlist</h2>
              <p className="text-sm text-stone-500">
                Be among the first to get access. Early members get exclusive premium perks.
              </p>
            </div>
            <WaitlistForm />
          </div>

        </div>
      </main>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="border-t border-stone-200/60 py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Image src="/logo.png" alt="SalesOS" width={20} height={20} className="rounded-md opacity-60" />
          <span className="text-xs font-semibold text-stone-400">SalesOS</span>
        </div>
        <p className="text-xs text-stone-400">© 2026 SalesOS. All rights reserved.</p>
      </footer>

    </div>
  );
}
