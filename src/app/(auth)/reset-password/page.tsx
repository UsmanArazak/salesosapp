"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createPublicSupabaseClient } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createPublicSupabaseClient();
      const { error: resetErr } = await supabase.auth.updateUser({
        password: password,
      });

      if (resetErr) {
        setError(resetErr.message);
        setLoading(false);
        return;
      }

      try {
        // Sign out of the temporary Supabase recovery session safely
        await supabase.auth.signOut();
      } catch (signOutErr) {
        console.warn("Temporary Supabase session signout warning:", signOutErr);
      }

      setSuccess(true);
    } catch (err) {
      console.error("Password Reset Error:", err);
      const message = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
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
          New Password
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          Set your new shop account password
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
              <p className="font-bold mb-1">Password reset success!</p>
              <p className="text-xs text-stone-500">
                You can now log in using your new password.
              </p>
            </div>
            <Link
              href="/login"
              className="block w-full text-center font-semibold py-3 rounded-xl text-sm text-white transition-all active:scale-[0.98]"
              style={{ background: "var(--accent)" }}
            >
              Go to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <label
                htmlFor="new-password"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-dim)" }}
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  placeholder="Minimum 6 characters"
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

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-dim)" }}
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocused("confirm")}
                  onBlur={() => setFocused(null)}
                  placeholder="Re-enter your password"
                  className="w-full rounded-xl pl-4 pr-12 py-3 text-sm border transition-colors focus:outline-none"
                  style={{
                    background: "var(--bg-elevated)",
                    borderColor: focused === "confirm" ? "var(--accent)" : "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors p-1"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
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
              type="submit"
              disabled={loading}
              className="w-full font-semibold py-3 rounded-xl text-sm text-white transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              style={{ background: "var(--accent)" }}
            >
              {loading ? "Updating password..." : "Update Password"}
            </button>
          </form>
        )}
      </div>

      <p className="mt-8 text-xs" style={{ color: "var(--text-muted)" }}>
        SalesOS · 2026
      </p>
    </div>
  );
}
