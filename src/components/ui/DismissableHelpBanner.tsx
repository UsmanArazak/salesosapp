"use client";

import { useState, useEffect } from "react";

type Props = {
  storageKey: string;
  message: string;
};

export function DismissableHelpBanner({ storageKey, message }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem(`help-banner-${storageKey}`);
    if (!isDismissed) {
      setVisible(true);
    }
  }, [storageKey]);

  function handleDismiss() {
    localStorage.setItem(`help-banner-${storageKey}`, "true");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="mb-6 p-4 rounded-2xl border flex items-start gap-3 relative transition-all"
      style={{
        background: "linear-gradient(135deg, rgba(249,115,22,0.06) 0%, rgba(249,115,22,0.02) 100%)",
        borderColor: "rgba(249,115,22,0.25)",
      }}
    >
      {/* Lightbulb Emoji Icon */}
      <span className="text-lg shrink-0 mt-0.5">💡</span>

      {/* Message */}
      <div className="flex-grow pr-6">
        <p className="text-sm font-medium leading-relaxed" style={{ color: "var(--text-primary)" }}>
          {message}
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors hover:bg-stone-100"
        aria-label="Dismiss message"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
