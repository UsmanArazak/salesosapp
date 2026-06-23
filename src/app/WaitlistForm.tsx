"use client";

import { useState, useRef } from "react";
import { joinWaitlist } from "@/app/actions/waitlist";

export function WaitlistForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const result = await joinWaitlist(formData);

    if ("success" in result) {
      setStatus("success");
      formRef.current?.reset();
    } else {
      setStatus("error");
      setErrorMsg(result.error);
    }
  }

  if (status === "success") {
    return (
      <div className="text-center space-y-4 py-8">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
          style={{ background: "rgba(249,115,22,0.1)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth={2.5} className="w-8 h-8">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-stone-900">You&apos;re on the list!</h3>
        <p className="text-sm text-stone-500 max-w-xs mx-auto">
          We&apos;ll reach out on WhatsApp when early access opens. Get ready.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mx-auto">
      <div>
        <input
          type="text"
          name="name"
          placeholder="Your full name"
          required
          className="w-full px-4 py-3.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all"
        />
      </div>

      <div>
        <input
          type="email"
          name="email"
          placeholder="Email address"
          required
          className="w-full px-4 py-3.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all"
        />
      </div>

      <div className="flex items-center border border-stone-200 bg-white rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-orange-500/30 focus-within:border-orange-400 transition-all">
        <span className="px-4 text-sm text-stone-500 border-r border-stone-200 py-3.5 bg-stone-50 shrink-0">
          🇳🇬 +234
        </span>
        <input
          type="tel"
          name="whatsapp"
          placeholder="WhatsApp number"
          required
          className="flex-1 px-4 py-3.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none bg-transparent"
        />
      </div>

      {status === "error" && (
        <p className="text-xs text-red-500 font-medium">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-4 rounded-xl text-sm font-bold text-white bg-stone-900 transition-all hover:bg-stone-800 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "loading" ? "Joining..." : "Join the Waitlist →"}
      </button>

      <p className="text-center text-xs text-stone-400">
        Early access members get premium perks. No spam, ever.
      </p>
    </form>
  );
}
