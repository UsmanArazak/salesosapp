"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { archiveProduct } from "@/app/actions/products";

export type ProductRow = {
  id: string;
  name: string;
  category: string;
  buying_price: number;
  selling_price: number;
  stock_quantity: number;
  low_stock_threshold: number;
};

function formatNaira(n: number) {
  return "₦" + new Intl.NumberFormat("en-US").format(Math.round(n));
}

export function InventoryList({ products }: { products: ProductRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
  );

  async function handleArchive(id: string, name: string) {
    if (!confirm(`Archive "${name}"?\n\nIt will be removed from your product list.`)) return;
    setArchivingId(id);
    const result = await archiveProduct(id);
    setArchivingId(null);
    if ("error" in result) {
      alert("Failed: " + result.error);
      return;
    }
    startTransition(() => router.refresh());
  }

  const lowStockCount = products.filter(
    (p) => p.stock_quantity <= p.low_stock_threshold
  ).length;

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Inventory
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            {products.length} product{products.length !== 1 ? "s" : ""}
            {lowStockCount > 0 && (
              <span
                className="ml-2 inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "var(--warning-dim)", color: "var(--warning)" }}
              >
                ⚠ {lowStockCount} low stock
              </span>
            )}
          </p>
        </div>
        <Link
          href="/inventory/new"
          id="add-product-btn"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.97] shadow-sm"
          style={{ background: "var(--accent)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Product
        </Link>
      </div>

      {/* ── Search Bar ── */}
      <div className="relative mb-5">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--text-muted)" }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search products or category..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl border pl-10 pr-4 py-2.5 text-sm focus:outline-none transition-colors"
          style={{
            background: "var(--bg-surface)",
            borderColor: "var(--border-color)",
            color: "var(--text-primary)",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border-color)")}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Product List ── */}
      {filtered.length === 0 ? (
        <div
          className="rounded-2xl border p-10 text-center"
          style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)" }}
        >
          {products.length === 0 ? (
            <>
              <p className="text-3xl mb-3">📦</p>
              <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                No products yet
              </p>
              <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                Add your first product to get started
              </p>
              <Link
                href="/inventory/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: "var(--accent)" }}
              >
                Add Product
              </Link>
            </>
          ) : (
            <>
              <p className="text-3xl mb-3">🔍</p>
              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                No results for &ldquo;{query}&rdquo;
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                Try a different search term
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((product) => {
            const isLow = product.stock_quantity <= product.low_stock_threshold;
            const isArchiving = archivingId === product.id;

            return (
              <div
                key={product.id}
                className="rounded-2xl border bg-white px-4 py-3.5 flex items-center gap-3 transition-all"
                style={{
                  borderColor: isLow ? "var(--warning-border)" : "var(--border-color)",
                  opacity: isArchiving || isPending ? 0.5 : 1,
                }}
              >
                {/* Product icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                  style={{ background: "var(--bg-elevated)" }}
                >
                  📦
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                      {product.name}
                    </p>
                    {isLow && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
                        style={{
                          background: "var(--warning-dim)",
                          color: "var(--warning)",
                        }}
                      >
                        LOW STOCK
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {product.category && (
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {product.category}
                      </span>
                    )}
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>·</span>
                    <span
                      className="text-xs font-medium"
                      style={{ color: isLow ? "var(--warning)" : "var(--text-muted)" }}
                    >
                      Qty: {product.stock_quantity}
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                    {formatNaira(product.selling_price)}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    Cost: {formatNaira(product.buying_price)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                  <Link
                    href={`/inventory/${product.id}/edit`}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ color: "var(--accent)" }}
                    title="Edit"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => handleArchive(product.id, product.name)}
                    disabled={isArchiving}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ color: "var(--text-muted)" }}
                    title="Archive"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                      <polyline points="21 8 21 21 3 21 3 8" />
                      <rect x="1" y="3" width="22" height="5" />
                      <line x1="10" y1="12" x2="14" y2="12" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
