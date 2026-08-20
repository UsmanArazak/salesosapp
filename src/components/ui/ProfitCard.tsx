"use client";

import { useState } from "react";

interface ProfitCardProps {
  netProfit: string;
  cogsSold: string;
  expensesToday: string;
  isProfit: boolean;
}

export function ProfitCard({ netProfit, cogsSold, expensesToday, isProfit }: ProfitCardProps) {
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
        <div className="mt-5 pt-4 border-t" style={{ borderColor: isProfit ? "var(--accent-border)" : "var(--danger-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Deductions
            </span>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold transition-all"
              style={{
                background: showInfo ? "var(--accent)" : "rgba(255,255,255,0.6)",
                color: showInfo ? "#ffffff" : "var(--accent)",
              }}
            >
              i
            </button>
          </div>

          {showInfo && (
            <div
              className="mb-4 p-3.5 rounded-xl text-xs relative overflow-hidden transition-all"
              style={{ background: "rgba(255,255,255,0.6)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{ background: isProfit ? "var(--accent)" : "var(--danger)" }}
              ></div>
              <div className="space-y-2" style={{ color: "var(--text-primary)" }}>
                <p>
                  <span className="font-semibold">COGS (Cost of Goods):</span> The original buying price of all items sold today.
                </p>
                <p>
                  <span className="font-semibold">Expenses:</span> Money spent today on daily shop operations.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Cost of Goods (COGS)</span>
              <span className="text-sm font-semibold" style={{ color: "var(--danger)" }}>−{cogsSold}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Expenses</span>
              <span className="text-sm font-semibold" style={{ color: "var(--danger)" }}>−{expensesToday}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
