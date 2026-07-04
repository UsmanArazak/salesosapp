"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { requestPasswordReset } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const redirectUrl = `${origin}/reset-password`;
    const result = await requestPasswordReset(email, redirectUrl);

    setLoading(false);

    if ("error" in result) {
      setError(result.error);
    } else {
      setSuccess(true);
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
        className="w-full max-w-sm rounded-2xl border p-7 shadow-sm bg-white"
        style={{ borderColor: "var(--border-color)" }}
      >
        <h1 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
          Reset Password
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          We will send a secure recovery link to your inbox
        </p>

        {success ? (
          <div className="space-y-4">
            <div
              className="rounded-xl px-4 py-3.5 text-sm border text-center"
              style={{
                background: "rgba(22,163,74,0.06)",
                borderColor: "rgba(22,163,74,0.2)",
                color: "#16a34a",
              }}
            >
              <p className="font-bold mb-1">Check your inbox!</p>
              <p className="text-xs leading-relaxed text-stone-500">
                We sent a password recovery link to <strong>{email}</strong>.
              </p>
            </div>
            <Link
              href="/login"
              className="block w-full text-center font-semibold py-3 rounded-xl text-sm text-white transition-all active:scale-[0.98]"
              style={{ background: "var(--accent)" }}
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="forgot-email"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-dim)" }}
              >
                Email address
              </label>
              <input
                id="forgot-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="you@example.com"
                className="w-full rounded-xl px-4 py-3 text-sm border transition-colors focus:outline-none"
                style={{
                  background: "var(--bg-elevated)",
                  borderColor: focused ? "var(--accent)" : "var(--border-color)",
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
              type="submit"
              disabled={loading}
              className="w-full font-semibold py-3 rounded-xl text-sm text-white transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              style={{ background: "var(--accent)" }}
            >
              {loading ? "Sending link..." : "Send Recovery Link"}
            </button>

            <div className="text-center pt-2">
              <Link href="/login" className="text-sm font-medium hover:underline" style={{ color: "var(--text-muted)" }}>
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>

      <p className="mt-8 text-xs" style={{ color: "var(--text-muted)" }}>
        SalesOS · 2026
      </p>
    </div>
  );
}
