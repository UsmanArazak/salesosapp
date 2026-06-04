import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-dvh flex flex-col font-sans select-none" style={{ background: "#FAFAF9", color: "#1C1917" }}>
      
      {/* ── HEADER/NAV ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#FAFAF9]/80 backdrop-blur-md border-b border-stone-200/60">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="SalesOS Logo"
              width={34}
              height={34}
              className="rounded-lg shadow-sm"
            />
            <span className="font-bold text-xl tracking-tight text-stone-900">
              SalesOS
            </span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
            <a href="#features" className="hover:text-stone-900 transition-colors">Features</a>
            <a href="#integrations" className="hover:text-stone-900 transition-colors">Integrations</a>
            <a href="#testimonials" className="hover:text-stone-900 transition-colors">Success Stories</a>
            <a href="#pricing" className="hover:text-stone-900 transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            {session ? (
              <Link
                href={session.user.role === "superadmin" ? "/superadmin" : "/dashboard"}
                className="px-5 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] shadow-sm bg-stone-900"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-5 py-2.5 rounded-full text-sm font-semibold text-stone-700 transition-all hover:bg-stone-100"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] shadow-sm bg-stone-900"
                >
                  Start Now
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ─────────────────────────────────────────────── */}
      <main className="flex-grow">
        <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center relative">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-stone-200/50 text-stone-800 border border-stone-200/80 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            CREATE RETAIL POWER
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-stone-900 leading-[1.1] max-w-4xl mx-auto">
            One tool to <span className="underline decoration-orange-500 decoration-wavy decoration-2">manage</span> <br className="hidden sm:inline" />
            your shop and your profits
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-stone-500 max-w-xl mx-auto mt-6 leading-relaxed">
            SalesOS helps small retail shops record daily sales, automate profits calculation, track customer credit, and manage stock levels instantly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            {session ? (
              <Link
                href={session.user.role === "superadmin" ? "/superadmin" : "/dashboard"}
                className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-white shadow-md bg-stone-900 transition-all hover:opacity-90 active:scale-[0.97]"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-white shadow-md bg-stone-900 transition-all hover:opacity-90 active:scale-[0.97]"
                >
                  Start for Free
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-full font-semibold bg-white border border-stone-200 text-stone-800 transition-all hover:bg-stone-50 active:scale-[0.97]"
                >
                  Get a Demo
                </Link>
              </>
            )}
          </div>

          {/* Small partner logos */}
          <div className="mt-20 border-t border-stone-200/80 pt-8 max-w-4xl mx-auto">
            <p className="text-xs uppercase tracking-widest font-semibold text-stone-400 mb-6">
              Empowering local retail shops across the nation
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-sm font-bold text-stone-400/80">
              <span className="hover:text-stone-600 transition-colors">OPay</span>
              <span className="hover:text-stone-600 transition-colors">Monnify</span>
              <span className="hover:text-stone-600 transition-colors">Paystack</span>
              <span className="hover:text-stone-600 transition-colors">Interswitch</span>
              <span className="hover:text-stone-600 transition-colors">PalmPay</span>
            </div>
          </div>
        </section>

        {/* ── FEATURES SECTION ────────────────────────────────────────── */}
        <section id="features" className="max-w-5xl mx-auto px-6 py-16 border-t border-stone-200/60">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-600 border border-orange-200/50">
              FEATURES
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-stone-900">
              Latest tools to manage everything you need
            </h2>
            <p className="text-sm text-stone-500 max-w-md mx-auto">
              Track performance, manage daily checkout flows, and optimize product lines with simple, modern utilities.
            </p>
          </div>

          {/* Feature Cards Grid (Inspired by mock layout) */}
          <div className="space-y-6">
            
            {/* Row 1: Large dashboard card */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-stone-100/80 border border-stone-200/60 rounded-3xl p-8 items-center">
              <div className="md:col-span-5 space-y-4">
                <h3 className="text-2xl font-bold tracking-tight text-stone-900">
                  Dynamic dashboard
                </h3>
                <p className="text-sm text-stone-500 leading-relaxed">
                  SalesOS aggregates all transaction metrics, cost of goods, and operations cost to provide live visual breakdowns of net daily profits.
                </p>
                <Link
                  href="/register"
                  className="inline-block px-5 py-2.5 rounded-full text-xs font-bold text-white bg-stone-900 transition-all hover:opacity-90"
                >
                  Explore all
                </Link>
              </div>

              {/* Chart Mockup Graphic */}
              <div className="md:col-span-7 bg-white rounded-2xl border border-stone-200/80 p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-stone-700">Acme Provisions Ltd</span>
                  <span className="text-stone-400">Weekly net profit</span>
                </div>
                <div className="h-40 flex items-end gap-3 pt-4 border-b border-stone-100 pb-2">
                  <div className="bg-stone-200 w-full rounded-t-md transition-all hover:bg-orange-500" style={{ height: "45%" }} />
                  <div className="bg-stone-200 w-full rounded-t-md transition-all hover:bg-orange-500" style={{ height: "30%" }} />
                  <div className="bg-stone-200 w-full rounded-t-md transition-all hover:bg-orange-500" style={{ height: "70%" }} />
                  <div className="bg-stone-200 w-full rounded-t-md transition-all hover:bg-orange-500" style={{ height: "50%" }} />
                  <div className="bg-orange-500 w-full rounded-t-md shadow-sm" style={{ height: "90%" }} />
                  <div className="bg-stone-200 w-full rounded-t-md transition-all hover:bg-orange-500" style={{ height: "40%" }} />
                  <div className="bg-stone-200 w-full rounded-t-md transition-all hover:bg-orange-500" style={{ height: "60%" }} />
                </div>
                <div className="flex justify-between text-[10px] text-stone-400">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>

            {/* Row 2: Two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card Left: Smart alerts */}
              <div className="bg-stone-100/80 border border-stone-200/60 rounded-3xl p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-stone-900">
                    Smart notifications
                  </h3>
                  <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                    Easily accessible from the notifications index, license alerts, or email alerts, staying close to customer events.
                  </p>
                </div>
                
                {/* Mock UI controls */}
                <div className="bg-white rounded-2xl border border-stone-200/80 p-5 space-y-3">
                  {[
                    { label: "Low stock warnings", active: true },
                    { label: "Daily checkout summaries", active: false },
                    { label: "Customer debt reminders", active: true },
                  ].map((ctrl, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <span className="text-stone-700 font-medium">{ctrl.label}</span>
                      <div
                        className="w-8 h-4 rounded-full p-0.5 transition-colors cursor-pointer"
                        style={{ background: ctrl.active ? "#F97316" : "#E7E5E4" }}
                      >
                        <div
                          className="w-3 h-3 bg-white rounded-full shadow-sm transition-transform"
                          style={{ transform: ctrl.active ? "translateX(16px)" : "translateX(0)" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Right: Task/Debtor list */}
              <div className="bg-stone-100/80 border border-stone-200/60 rounded-3xl p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-stone-900">
                    Debtor management
                  </h3>
                  <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                    Keep track of pending accounts, outstanding balances, and repayment schedules to secure shop liquidity.
                  </p>
                </div>

                {/* Mock list */}
                <div className="bg-white rounded-2xl border border-stone-200/80 p-4 space-y-3">
                  {[
                    { name: "Alhaji Ibrahim", amount: "₦25,000", status: "Overdue" },
                    { name: "Chioma Obi", amount: "₦8,500", status: "Pending" },
                  ].map((debtor, i) => (
                    <div key={i} className="flex justify-between items-center text-xs border-b last:border-0 pb-2 last:pb-0">
                      <div>
                        <p className="font-semibold text-stone-850">{debtor.name}</p>
                        <span className="text-[10px] text-stone-400">{debtor.status}</span>
                      </div>
                      <span className="font-bold text-orange-600">{debtor.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── INTEGRATION DARK BANNER ─────────────────────────────────── */}
        <section id="integrations" className="bg-[#1C1917] text-white py-20 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-stone-800 text-stone-300 border border-stone-700">
              INTEGRATION
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Don’t replace. Integrate.
            </h2>
            <p className="text-sm text-stone-400 max-w-lg mx-auto leading-relaxed">
              SalesOS fits right alongside the utilities you already use. From local bank transfers and instant card processing, to direct WhatsApp sharing of printable checkout slips.
            </p>

            {/* Integration Grid icons mockup */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 pt-8">
              {[
                "Slack", "Notion", "Stripe", "PayPal", "Shopify", "OPay", "Paystack", "Monnify",
                "WhatsApp", "Excel", "GPay", "Visa", "Mastercard", "GSheets", "SMS", "Vercel"
              ].map((name, i) => (
                <div
                  key={i}
                  className="bg-stone-850 border border-stone-800 rounded-xl p-3 flex flex-col items-center justify-center text-[10px] font-bold text-stone-400 gap-1.5 shadow-sm hover:border-orange-500/50 hover:text-white transition-all"
                  style={{ background: "#262524" }}
                >
                  <span className="w-6 h-6 bg-stone-700/60 rounded-md flex items-center justify-center text-xs text-orange-500 font-extrabold">
                    {name[0]}
                  </span>
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
        <section id="testimonials" className="max-w-4xl mx-auto px-6 py-20 text-center space-y-8">
          {/* Quote Icon */}
          <div className="text-5xl font-serif text-orange-500 font-extrabold leading-none">“</div>
          
          <blockquote className="text-lg sm:text-2xl font-semibold tracking-tight text-stone-900 max-w-3xl mx-auto leading-relaxed">
            SalesOS changed how we track inventory. Instead of staying up past midnight counting boxes and doing math on paper, I get exact profit statements directly on my phone by the time we close the store.
          </blockquote>

          <div className="flex flex-col items-center gap-1.5 pt-4">
            <span className="font-bold text-stone-950 text-sm">Fatima Abubakar</span>
            <span className="text-xs text-stone-500">Owner, Fatima Provision Stores</span>
          </div>
        </section>

        {/* ── STATS BAR ────────────────────────────────────────────────── */}
        <section className="bg-stone-100 border-y border-stone-200/80">
          <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl sm:text-4xl font-extrabold text-stone-900">2026</p>
              <p className="text-xs text-stone-400 mt-1 uppercase tracking-wider font-semibold">SalesOS Launched</p>
            </div>
            <div>
              <p className="text-2xl sm:text-4xl font-extrabold text-stone-900">10k+</p>
              <p className="text-xs text-stone-400 mt-1 uppercase tracking-wider font-semibold">Daily Transactions</p>
            </div>
            <div>
              <p className="text-2xl sm:text-4xl font-extrabold text-stone-900">500+</p>
              <p className="text-xs text-stone-400 mt-1 uppercase tracking-wider font-semibold">Active Shop Owners</p>
            </div>
          </div>
        </section>

        {/* ── PRE-FOOTER CTA ──────────────────────────────────────────── */}
        <section id="pricing" className="max-w-4xl mx-auto px-6 py-20 text-center space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight text-stone-900">
            Discover the full scale of SalesOS capabilities
          </h2>
          <p className="text-sm text-stone-500 max-w-md mx-auto">
            Get started for free today. Upgrade anytime to access multi-employee management and automated client notification systems.
          </p>
          <div className="flex justify-center gap-3 pt-4">
            <Link
              href="/register"
              className="px-6 py-3 rounded-full text-xs font-bold text-white bg-stone-900 transition-all hover:opacity-90"
            >
              Start for Free
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 rounded-full text-xs font-semibold bg-white border border-stone-200 text-stone-850 hover:bg-stone-50 transition-all"
            >
              Get a Demo
            </Link>
          </div>
        </section>

      </main>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="border-t border-stone-200/80 bg-stone-900 text-stone-300">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="SalesOS Logo"
                width={28}
                height={28}
                className="rounded-md"
              />
              <span className="font-bold text-white">SalesOS</span>
            </div>
            <p className="text-xs text-stone-400">
              Smart operations client built to optimize sales, stock, and credit accounting interfaces.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#integrations" className="hover:text-white transition-colors">Integrations</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Company</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Inquiries</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>info@salesos.com</li>
              <li>+234 817 999 0000</li>
            </ul>
          </div>

        </div>

        <div className="border-t border-stone-850 py-6 max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4" style={{ borderColor: "#2E2A27" }}>
          <span>&copy; 2026 SalesOS App. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-stone-300">Twitter</a>
            <a href="#" className="hover:text-stone-300">LinkedIn</a>
            <a href="#" className="hover:text-stone-350">GitHub</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
