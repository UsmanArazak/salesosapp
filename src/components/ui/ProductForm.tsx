"use client";

import { useState } from "react";
import Link from "next/link";
import type { ProductInput } from "@/app/actions/products";

type InitialValues = Partial<{
  name: string;
  category: string;
  buyingPrice: string;
  sellingPrice: string;
  stockQuantity: string;
  lowStockThreshold: string;
}>;

type Props = {
  initial?: InitialValues;
  onSubmit: (data: ProductInput) => Promise<{ error: string } | { success: true }>;
  submitLabel?: string;
  backHref?: string;
};


function Field({
  id,
  label,
  required,
  children,
  hint,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium mb-1.5"
        style={{ color: "var(--text-dim)" }}
      >
        {label}
        {required && <span style={{ color: "var(--accent)" }}> *</span>}
      </label>
      {children}
      {hint && (
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

function Input({
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  min,
  step,
  list,
}: {
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  min?: string;
  step?: string;
  list?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={placeholder}
      required={required}
      min={min}
      step={step}
      list={list}
      className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:outline-none"
      style={{
        background: "var(--bg-elevated)",
        borderColor: focused ? "var(--accent)" : "var(--border-color)",
        color: "var(--text-primary)",
      }}
    />
  );
}

function PriceInput({
  id,
  value,
  onChange,
  placeholder,
  required,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  const [focused, setFocused] = useState(false);

  // Remove commas for processing
  const rawValue = value.replace(/,/g, "").replace(/\D/g, "");
  const displayValue = rawValue ? parseInt(rawValue, 10).toLocaleString("en-US") : "";

  const handleChange = (val: string) => {
    const numeric = val.replace(/\D/g, "");
    onChange(numeric);
  };

  const increment = () => {
    const current = parseInt(rawValue || "0", 10);
    onChange((current + 1000).toString());
  };

  const decrement = () => {
    const current = parseInt(rawValue || "0", 10);
    onChange(Math.max(0, current - 1000).toString());
  };

  return (
    <div className="relative flex items-center">
      <button
        type="button"
        onClick={decrement}
        className="absolute left-2 text-stone-400 hover:text-stone-600 p-1.5 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors"
        tabIndex={-1}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M5 12h14"/></svg>
      </button>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border px-10 py-3 text-sm transition-colors focus:outline-none text-center font-medium"
        style={{
          background: "var(--bg-elevated)",
          borderColor: focused ? "var(--accent)" : "var(--border-color)",
          color: "var(--text-primary)",
        }}
      />
      <button
        type="button"
        onClick={increment}
        className="absolute right-2 text-stone-400 hover:text-stone-600 p-1.5 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors"
        tabIndex={-1}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M12 5v14M5 12h14"/></svg>
      </button>
    </div>
  );
}

export function ProductForm({
  initial = {},
  onSubmit,
  submitLabel = "Save Product",
  backHref = "/dashboard/inventory",
}: Props) {
  const [name, setName] = useState(initial.name ?? "");
  const [buyingPrice, setBuyingPrice] = useState(initial.buyingPrice?.toString() ?? "");
  const [sellingPrice, setSellingPrice] = useState(initial.sellingPrice?.toString() ?? "");
  const [stockQuantity, setStockQuantity] = useState(initial.stockQuantity?.toString() ?? "");
  const [lowStockThreshold, setLowStockThreshold] = useState(
    initial.lowStockThreshold?.toString() ?? ""
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Live margin preview
  const parsedSp = parseFloat(sellingPrice.toString().replace(/,/g, ""));
  const parsedBp = parseFloat(buyingPrice.toString().replace(/,/g, ""));
  const margin =
    !isNaN(parsedSp) && !isNaN(parsedBp)
      ? parsedSp - parsedBp
      : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const bp = parsedBp;
    const sp = parsedSp;
    const sq = parseInt(stockQuantity.toString().replace(/,/g, ""));
    const lst = lowStockThreshold ? parseInt(lowStockThreshold.toString().replace(/,/g, "")) : 0;

    if (isNaN(bp) || bp < 0) return setError("Enter a valid buying price.");
    if (isNaN(sp) || sp < 0) return setError("Enter a valid selling price.");
    if (sp < bp) return setError("Selling price cannot be less than buying price.");
    if (isNaN(sq) || sq < 0) return setError("Enter a valid stock quantity.");
    if (isNaN(lst) || lst < 0) return setError("Enter a valid low stock threshold.");

    setLoading(true);
    const result = await onSubmit({
      name,
      category: "", // Empty category since field was removed for MVP
      buyingPrice: bp,
      sellingPrice: sp,
      stockQuantity: sq,
      lowStockThreshold: lst,
    });
    setLoading(false);

    if ("error" in result) {
      setError(result.error);
    }
    // On success, parent page handles redirect
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Row 1 — Name */}
      <Field id="p-name" label="Product name" required>
        <Input
          id="p-name"
          value={name}
          onChange={setName}
          placeholder="e.g. Indomie Noodles"
          required
        />
      </Field>



      {/* Row 3 — Prices */}
      <div className="grid grid-cols-2 gap-3">
        <Field id="p-buying" label="Buying price (₦)" required>
          <PriceInput
            id="p-buying"
            value={buyingPrice}
            onChange={setBuyingPrice}
            placeholder="0"
            required
          />
        </Field>
        <Field id="p-selling" label="Selling price (₦)" required>
          <PriceInput
            id="p-selling"
            value={sellingPrice}
            onChange={setSellingPrice}
            placeholder="0"
            required
          />
        </Field>
      </div>

      {/* Margin preview */}
      {margin !== null && (
        <div
          className="rounded-xl px-4 py-2.5 flex items-center justify-between text-sm"
          style={{
            background: margin >= 0 ? "rgba(255,83,71,0.06)" : "var(--danger-dim)",
            borderLeft: `3px solid ${margin >= 0 ? "var(--accent)" : "var(--danger)"}`,
          }}
        >
          <span style={{ color: "var(--text-muted)" }}>Profit per unit</span>
          <span
            className="font-bold"
            style={{ color: margin >= 0 ? "var(--accent)" : "var(--danger)" }}
          >
            ₦{margin.toLocaleString("en-US")}
          </span>
        </div>
      )}

      {/* Row 4 — Stock */}
      <div className="grid grid-cols-2 gap-3">
        <Field id="p-stock" label="Stock quantity" required hint="Current units in stock">
          <Input
            id="p-stock"
            type="number"
            value={stockQuantity}
            onChange={setStockQuantity}
            placeholder="0"
            required
            min="0"
            step="1"
          />
        </Field>
        <Field
          id="p-threshold"
          label="Low stock alert at"
          hint="Alert when qty ≤ this"
        >
          <Input
            id="p-threshold"
            type="number"
            value={lowStockThreshold}
            onChange={setLowStockThreshold}
            placeholder="Optional"
            min="0"
            step="1"
          />
        </Field>
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

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Link
          href={backHref}
          className="flex-1 py-3 rounded-xl text-sm font-semibold text-center border transition-all"
          style={{
            borderColor: "var(--border-color)",
            color: "var(--text-dim)",
            background: "var(--bg-elevated)",
          }}
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          id="product-form-submit"
          className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60 shadow-sm"
          style={{ background: "var(--accent)" }}
        >
          {loading ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
