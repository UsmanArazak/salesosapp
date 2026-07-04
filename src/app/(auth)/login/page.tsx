"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });

    if (result?.error) {
      setLoading(false);
      setError("Invalid email or password. Please try again.");
      return;
    }

    const session = await getSession();
    setLoading(false);

    if (session?.user?.role === "superadmin") {
      window.location.href = "/superadmin";
    } else {
      window.location.href = "/dashboard";
    }
  }

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Brand */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2.5 mb-2">
          <Image
            src="/logo.png"
            alt="SalesOS Logo"
            width={36}
            height={36}
            className="rounded-xl"
          />
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
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="login-password"
                className="block text-sm font-medium"
                style={{ color: "var(--text-dim)" }}
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold hover:underline"
                style={{ color: "var(--accent)" }}
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                placeholder="••••••••"
                className="w-full rounded-xl pl-4 pr-12 py-3 text-sm border transition-colors focus:outline-none"
                style={{
                  background: "var(--bg-elevated)",
                  borderColor: focused === "password" ? "var(--accent)" : "var(--border-color)",
                  color: "var(--text-primary)",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-3.24-3.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
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
        SalesOS · 2026
      </p>
    </div>
  );
}
