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
        className="block text-xs font-bold uppercase tracking-wider mb-1.5"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
        {required && <span style={{ color: "var(--accent)" }}> *</span>}
      </label>
      {children}
      {hint && (
        <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>
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
}: {
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  min?: string;
  step?: string;
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
      className="w-full rounded-2xl border px-3.5 py-2.5 text-xs font-medium transition-all focus:outline-none bg-white"
      style={{
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

  const rawValue = value.replace(/,/g, "").replace(/\D/g, "");
  const displayValue = rawValue ? parseInt(rawValue, 10).toLocaleString("en-US") : "";

  const handleChange = (val: string) => {
    const numeric = val.replace(/\D/g, "");
    onChange(numeric);
  };

  const increment = () => {
    const current = parseInt(rawValue || "0", 10);
    onChange((current + 500).toString());
  };

  const decrement = () => {
    const current = parseInt(rawValue || "0", 10);
    onChange(Math.max(0, current - 500).toString());
  };

  return (
    <div className="relative flex items-center">
      <button
        type="button"
        onClick={decrement}
        className="absolute left-1.5 w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
        tabIndex={-1}
      >
        −
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
        className="w-full rounded-2xl border px-8 py-2.5 text-xs font-bold text-center transition-all focus:outline-none bg-white"
        style={{
          borderColor: focused ? "var(--accent)" : "var(--border-color)",
          color: "var(--text-primary)",
        }}
      />
      <button
        type="button"
        onClick={increment}
        className="absolute right-1.5 w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
        tabIndex={-1}
      >
        +
      </button>
    </div>
  );
}

export function ProductForm({
  initial = {},
  onSubmit,
  submitLabel = "Save Product",
  backHref = "/inventory",
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

  // Live margin calculation
  const parsedSp = parseFloat(sellingPrice.toString().replace(/,/g, ""));
  const parsedBp = parseFloat(buyingPrice.toString().replace(/,/g, ""));
  const margin =
    !isNaN(parsedSp) && !isNaN(parsedBp)
      ? parsedSp - parsedBp
      : null;

  const marginPct =
    margin !== null && parsedSp > 0
      ? Math.round((margin / parsedSp) * 100)
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
      category: "", // Keep clean without rigid categories
      buyingPrice: bp,
      sellingPrice: sp,
      stockQuantity: sq,
      lowStockThreshold: lst,
    });
    setLoading(false);

    if ("error" in result) {
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div
        className="rounded-[24px] p-5 space-y-4 bg-white border"
        style={{ borderColor: "var(--border-color)", boxShadow: "var(--card-shadow)" }}
      >
        {/* Product Name */}
        <Field id="p-name" label="Product Name" required>
          <Input
            id="p-name"
            value={name}
            onChange={setName}
            placeholder="e.g. Coca-Cola 50cl"
            required
          />
        </Field>

        {/* Buying & Selling Prices */}
        <div className="grid grid-cols-2 gap-3">
          <Field id="p-buying" label="Buying Cost (₦)" required>
            <PriceInput
              id="p-buying"
              value={buyingPrice}
              onChange={setBuyingPrice}
              placeholder="0"
              required
            />
          </Field>
          <Field id="p-selling" label="Selling Price (₦)" required>
            <PriceInput
              id="p-selling"
              value={sellingPrice}
              onChange={setSellingPrice}
              placeholder="0"
              required
            />
          </Field>
        </div>

        {/* Profit Margin Preview Card */}
        {margin !== null && (
          <div
            className="rounded-2xl p-3.5 flex items-center justify-between text-xs transition-all border"
            style={{
              background: margin >= 0 ? "var(--icon-success-bg)" : "var(--icon-danger-bg)",
              borderColor: margin >= 0 ? "var(--icon-success-text)" : "var(--icon-danger-text)",
              color: margin >= 0 ? "var(--icon-success-text)" : "var(--icon-danger-text)",
            }}
          >
            <div>
              <p className="font-bold uppercase text-[10px] tracking-wider opacity-80">
                Profit Margin per Item
              </p>
              <p className="font-extrabold text-sm mt-0.5">
                ₦{margin.toLocaleString("en-US")}
              </p>
            </div>
            {marginPct !== null && (
              <span
                className="font-bold text-xs px-2.5 py-1 rounded-xl bg-white/70 shadow-xs"
                style={{ color: margin >= 0 ? "var(--icon-success-text)" : "var(--icon-danger-text)" }}
              >
                {marginPct >= 0 ? `+${marginPct}%` : `${marginPct}%`} margin
              </span>
            )}
          </div>
        )}

        {/* Stock Quantities */}
        <div className="grid grid-cols-2 gap-3">
          <Field id="p-stock" label="Initial Stock Qty" required hint="Current units in shop">
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
            label="Low Stock Alert At"
            hint="Notify when stock ≤ this"
          >
            <Input
              id="p-threshold"
              type="number"
              value={lowStockThreshold}
              onChange={setLowStockThreshold}
              placeholder="e.g. 5"
              min="0"
              step="1"
            />
          </Field>
        </div>

        {/* Error Notice */}
        {error && (
          <div
            className="rounded-2xl px-4 py-3 text-xs font-bold border"
            style={{
              background: "var(--icon-danger-bg)",
              borderColor: "var(--icon-danger-text)",
              color: "var(--icon-danger-text)",
            }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Link
          href={backHref}
          className="flex-1 py-3.5 rounded-2xl text-xs font-bold text-center border bg-white text-stone-600 transition-colors hover:bg-stone-50"
          style={{ borderColor: "var(--border-color)" }}
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          id="product-form-submit"
          className="flex-1 py-3.5 rounded-2xl text-xs font-bold text-white transition-all active:scale-[0.97] disabled:opacity-60 shadow-xs"
          style={{ background: "var(--accent)" }}
        >
          {loading ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
