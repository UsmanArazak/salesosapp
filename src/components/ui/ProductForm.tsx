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

const CATEGORY_SUGGESTIONS = [
  "Food & Drinks",
  "Toiletries",
  "Clothing",
  "Electronics",
  "Household",
  "Stationery",
  "Medicine",
  "Raw Materials",
  "Other",
];

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

export function ProductForm({
  initial = {},
  onSubmit,
  submitLabel = "Save Product",
  backHref = "/dashboard/inventory",
}: Props) {
  const [name, setName] = useState(initial.name ?? "");
  const [category, setCategory] = useState(initial.category ?? "");
  const [buyingPrice, setBuyingPrice] = useState(initial.buyingPrice ?? "");
  const [sellingPrice, setSellingPrice] = useState(initial.sellingPrice ?? "");
  const [stockQuantity, setStockQuantity] = useState(initial.stockQuantity ?? "");
  const [lowStockThreshold, setLowStockThreshold] = useState(
    initial.lowStockThreshold ?? "5"
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Live margin preview
  const margin =
    sellingPrice && buyingPrice
      ? parseFloat(sellingPrice) - parseFloat(buyingPrice)
      : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const bp = parseFloat(buyingPrice);
    const sp = parseFloat(sellingPrice);
    const sq = parseInt(stockQuantity);
    const lst = parseInt(lowStockThreshold);

    if (isNaN(bp) || bp < 0) return setError("Enter a valid buying price.");
    if (isNaN(sp) || sp < 0) return setError("Enter a valid selling price.");
    if (sp < bp) return setError("Selling price cannot be less than buying price.");
    if (isNaN(sq) || sq < 0) return setError("Enter a valid stock quantity.");
    if (isNaN(lst) || lst < 0) return setError("Enter a valid low stock threshold.");

    setLoading(true);
    const result = await onSubmit({
      name,
      category,
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

      {/* Row 2 — Category */}
      <Field id="p-category" label="Category">
        <Input
          id="p-category"
          value={category}
          onChange={setCategory}
          placeholder="e.g. Food & Drinks"
          list="category-list"
        />
        <datalist id="category-list">
          {CATEGORY_SUGGESTIONS.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </Field>

      {/* Row 3 — Prices */}
      <div className="grid grid-cols-2 gap-3">
        <Field id="p-buying" label="Buying price (₦)" required>
          <Input
            id="p-buying"
            type="number"
            value={buyingPrice}
            onChange={setBuyingPrice}
            placeholder="0"
            required
            min="0"
            step="0.01"
          />
        </Field>
        <Field id="p-selling" label="Selling price (₦)" required>
          <Input
            id="p-selling"
            type="number"
            value={sellingPrice}
            onChange={setSellingPrice}
            placeholder="0"
            required
            min="0"
            step="0.01"
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
            placeholder="5"
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
