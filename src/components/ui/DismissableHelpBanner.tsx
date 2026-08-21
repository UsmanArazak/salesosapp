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
      className="mb-5 p-3.5 rounded-[20px] flex items-center gap-3 relative transition-all"
      style={{
        background: "var(--icon-warning-bg)",
        border: "1px solid var(--icon-warning-bg)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
      }}
    >
      {/* Lightbulb Icon Circle */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm shadow-xs bg-white"
        style={{ color: "var(--icon-warning-text)" }}
      >
        💡
      </div>

      {/* Message */}
      <div className="flex-1 min-w-0 pr-6">
        <p className="text-xs font-semibold leading-relaxed" style={{ color: "var(--icon-warning-text)" }}>
          {message}
        </p>
      </div>

      {/* Close button */}
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-colors hover:bg-black/5"
        style={{ color: "var(--icon-warning-text)" }}
        aria-label="Dismiss tip"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
