"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Brand */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2.5 mb-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-base shadow-sm"
            style={{ background: "var(--accent)" }}
          >
            S
          </div>
          <span className="font-bold text-2xl tracking-tight" style={{ color: "var(--text-primary)" }}>
            SalesOS
          </span>
        </div>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Smart sales management for your shop
        </p>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm rounded-2xl border p-7 shadow-sm"
        style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)" }}
      >
        <h1 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
          Welcome back
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          Sign in to your shop account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label
              htmlFor="login-email"
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--text-dim)" }}
            >
              Email address
            </label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
              placeholder="you@example.com"
              className="w-full rounded-xl px-4 py-3 text-sm border transition-colors focus:outline-none"
              style={{
                background: "var(--bg-elevated)",
                borderColor: focused === "email" ? "var(--accent)" : "var(--border-color)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="login-password"
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--text-dim)" }}
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused(null)}
              placeholder="••••••••"
              className="w-full rounded-xl px-4 py-3 text-sm border transition-colors focus:outline-none"
              style={{
                background: "var(--bg-elevated)",
                borderColor: focused === "password" ? "var(--accent)" : "var(--border-color)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              className="rounded-xl px-4 py-3 text-sm border"
              style={{
                background: "var(--danger-dim)",
                borderColor: "rgba(239,68,68,0.25)",
                color: "#dc2626",
              }}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="w-full font-semibold py-3 rounded-xl text-sm text-white transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            style={{ background: "var(--accent)" }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          Don&apos;t have a shop account?{" "}
          <Link href="/register" className="font-medium" style={{ color: "var(--accent)" }}>
            Create one free
          </Link>
        </p>
      </div>

      <p className="mt-8 text-xs" style={{ color: "var(--text-muted)" }}>
        SalesOS · iDICE Founders Lab · 2026
      </p>
    </div>
  );
}
