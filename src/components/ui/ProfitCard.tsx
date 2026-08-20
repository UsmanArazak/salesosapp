"use client";

import { useState } from "react";

interface ProfitCardProps {
  netProfit: string;
  salesToday: string;
  cogsSold: string;
  expensesToday: string;
  isProfit: boolean;
}

export function ProfitCard({ netProfit, salesToday, cogsSold, expensesToday, isProfit }: ProfitCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div
      className="rounded-[20px] p-6 transition-all"
      style={{
        background: isProfit ? "var(--accent-dim)" : "var(--danger-dim)",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p
            className="text-xs font-bold uppercase tracking-wider mb-2"
            style={{ color: isProfit ? "var(--accent)" : "var(--danger)" }}
          >
            Net Profit Today
          </p>
          <p
            className="text-4xl font-bold tracking-tight"
            style={{ color: isProfit ? "var(--accent)" : "var(--danger)" }}
          >
            {netProfit}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div
        className="my-5 border-t"
        style={{ borderColor: isProfit ? "var(--accent-border)" : "var(--danger-border)" }}
      ></div>

      {/* Dropdown Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-sm font-semibold transition-opacity active:opacity-70"
        style={{ color: isProfit ? "var(--accent)" : "var(--danger)" }}
      >
        <span>{isOpen ? "Hide breakdown" : "View breakdown"}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expanded Breakdown */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t space-y-3" style={{ borderColor: isProfit ? "var(--accent-border)" : "var(--danger-border)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Revenue</span>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-bold"
                style={{ borderColor: "var(--accent-border)", color: "var(--accent)" }}
              >
                i
              </button>
            </div>
            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{salesToday}</span>
          </div>

          {showInfo && (
            <div className="p-3 rounded-xl text-xs mb-2" style={{ background: "rgba(255,255,255,0.6)", color: "var(--text-primary)" }}>
              <strong>Revenue:</strong> Total money received from sales today.<br/>
              <strong>COGS:</strong> Cost price of the items sold.<br/>
              <strong>Expenses:</strong> Daily running costs logged today.
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>Cost of Goods (COGS)</span>
            <span className="text-sm font-semibold" style={{ color: "var(--danger)" }}>−{cogsSold}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>Expenses</span>
            <span className="text-sm font-semibold" style={{ color: "var(--danger)" }}>−{expensesToday}</span>
          </div>
        </div>
      )}
    </div>
  );
}
