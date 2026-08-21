"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { archiveProduct, restoreProduct } from "@/app/actions/products";

export type ProductRow = {
  id: string;
  name: string;
  category: string;
  buying_price: number;
  selling_price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  archived?: boolean;
};

function formatNaira(n: number) {
  return "₦" + new Intl.NumberFormat("en-US").format(Math.round(n));
}

export function InventoryList({
  products,
  archivedProducts = [],
}: {
  products: ProductRow[];
  archivedProducts?: ProductRow[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [query, setQuery] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentList = activeTab === "active" ? products : archivedProducts;

  const filtered = currentList.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
  );

  async function handleArchive(id: string, name: string) {
    if (!confirm(`Archive "${name}"?\n\nIt will be moved to your Archived Products list.`)) return;
    setActionId(id);
    const result = await archiveProduct(id);
    setActionId(null);
    if ("error" in result) {
      alert("Failed: " + result.error);
      return;
    }
    startTransition(() => router.refresh());
  }

  async function handleRestore(id: string) {
    setActionId(id);
    const result = await restoreProduct(id);
    setActionId(null);
    if ("error" in result) {
      alert("Failed: " + result.error);
      return;
    }
    startTransition(() => router.refresh());
  }

  const lowStockCount = products.filter(
    (p) => p.stock_quantity <= p.low_stock_threshold && p.stock_quantity > 0
  ).length;

  const outOfStockCount = products.filter((p) => p.stock_quantity === 0).length;

  return (
    <div className="space-y-5">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Inventory
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Manage stock, buying costs, and selling prices
          </p>
        </div>
        <Link
          href="/inventory/new"
          id="add-product-btn"
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white transition-all active:scale-[0.97] shadow-sm flex-shrink-0"
          style={{ background: "var(--accent)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Product
        </Link>
      </div>

      {/* ── Segmented Tab Switcher (Active vs Archived) ── */}
      <div
        className="p-1 rounded-2xl flex items-center gap-1 border bg-white"
        style={{ borderColor: "var(--border-color)" }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("active")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "active" ? "shadow-xs" : ""
          }`}
          style={{
            background: activeTab === "active" ? "var(--accent-dim)" : "transparent",
            color: activeTab === "active" ? "var(--accent)" : "var(--text-muted)",
          }}
        >
          <span>📦 Active Inventory</span>
          <span
            className="text-[10px] px-1.5 py-0.2 rounded-md font-bold"
            style={{
              background: activeTab === "active" ? "var(--accent)" : "var(--bg-card)",
              color: activeTab === "active" ? "#ffffff" : "var(--text-muted)",
            }}
          >
            {products.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("archived")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "archived" ? "shadow-xs" : ""
          }`}
          style={{
            background: activeTab === "archived" ? "var(--icon-neutral-bg)" : "transparent",
            color: activeTab === "archived" ? "var(--text-primary)" : "var(--text-muted)",
          }}
        >
          <span>📁 Archived</span>
          <span
            className="text-[10px] px-1.5 py-0.2 rounded-md font-bold"
            style={{
              background: activeTab === "archived" ? "var(--text-primary)" : "var(--bg-card)",
              color: activeTab === "archived" ? "#ffffff" : "var(--text-muted)",
            }}
          >
            {archivedProducts.length}
          </span>
        </button>
      </div>

      {/* ── Stock Alert Banner Notice (Active Tab only) ── */}
      {activeTab === "active" && (lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="flex gap-2">
          {outOfStockCount > 0 && (
            <Link
              href="/inventory/alerts"
              className="flex-1 p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all"
              style={{
                background: "var(--icon-danger-bg)",
                borderColor: "var(--icon-danger-text)",
                color: "var(--icon-danger-text)",
              }}
            >
              <span>🔴 {outOfStockCount} Out of Stock</span>
              <span>Restock →</span>
            </Link>
          )}
          {lowStockCount > 0 && (
            <Link
              href="/inventory/alerts"
              className="flex-1 p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all"
              style={{
                background: "var(--icon-warning-bg)",
                borderColor: "var(--icon-warning-text)",
                color: "var(--icon-warning-text)",
              }}
            >
              <span>⚠️ {lowStockCount} Low Stock</span>
              <span>View →</span>
            </Link>
          )}
        </div>
      )}

      {/* ── Search Input ── */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
          </svg>
        </div>
        <input
          type="text"
          placeholder={activeTab === "active" ? "Search product in stock..." : "Search archived products..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-2xl pl-10 pr-9 py-3 text-xs font-medium transition-all focus:outline-none bg-white border"
          style={{
            borderColor: "var(--border-color)",
            color: "var(--text-primary)",
          }}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 text-sm"
          >
            &times;
          </button>
        )}
      </div>

      {/* ── Product List ── */}
      {filtered.length === 0 ? (
        <div
          className="rounded-[24px] border p-10 text-center bg-white"
          style={{ borderColor: "var(--border-color)" }}
        >
          {currentList.length === 0 ? (
            <>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl"
                style={{ background: "var(--icon-neutral-bg)", color: "var(--icon-neutral-text)" }}
              >
                {activeTab === "active" ? "📦" : "📁"}
              </div>
              <p className="font-bold text-sm mb-1" style={{ color: "var(--text-primary)" }}>
                {activeTab === "active" ? "No products in stock yet" : "No archived products"}
              </p>
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                {activeTab === "active"
                  ? "Add products to start recording sales and tracking your profit automatically."
                  : "Products you archive will be stored here with 1-click restore capability."}
              </p>
              {activeTab === "active" && (
                <Link
                  href="/inventory/new"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white shadow-xs"
                  style={{ background: "var(--accent)" }}
                >
                  + Add Your First Product
                </Link>
              )}
            </>
          ) : (
            <>
              <p className="text-2xl mb-2">🔍</p>
              <p className="font-semibold text-xs" style={{ color: "var(--text-primary)" }}>
                No results for &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                Try searching with a different product name
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((product) => {
            const isOutOfStock = product.stock_quantity === 0;
            const isLow = !isOutOfStock && product.stock_quantity <= product.low_stock_threshold;
            const isWorking = actionId === product.id;

            return (
              <div
                key={product.id}
                className="rounded-[24px] p-4 transition-all border bg-white"
                style={{
                  borderColor: isOutOfStock
                    ? "var(--icon-danger-bg)"
                    : isLow
                    ? "var(--icon-warning-bg)"
                    : "var(--border-color)",
                  boxShadow: "var(--card-shadow)",
                  opacity: isWorking || isPending ? 0.6 : 1,
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  {/* Name & Stock status badge */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                        {product.name}
                      </p>
                      {activeTab === "active" && (
                        <>
                          {isOutOfStock ? (
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase"
                              style={{ background: "var(--icon-danger-bg)", color: "var(--icon-danger-text)" }}
                            >
                              OUT OF STOCK
                            </span>
                          ) : isLow ? (
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase"
                              style={{ background: "var(--icon-warning-bg)", color: "var(--icon-warning-text)" }}
                            >
                              LOW STOCK ({product.stock_quantity} left)
                            </span>
                          ) : (
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase"
                              style={{ background: "var(--icon-success-bg)", color: "var(--icon-success-text)" }}
                            >
                              IN STOCK ({product.stock_quantity})
                            </span>
                          )}
                        </>
                      )}

                      {activeTab === "archived" && (
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase"
                          style={{ background: "var(--icon-neutral-bg)", color: "var(--icon-neutral-text)" }}
                        >
                          ARCHIVED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {activeTab === "active" ? (
                      <>
                        <Link
                          href={`/inventory/${product.id}/edit`}
                          className="px-2.5 py-1 rounded-xl text-xs font-bold transition-all border bg-stone-50"
                          style={{ borderColor: "var(--border-color)", color: "var(--accent)" }}
                          title="Edit product"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleArchive(product.id, product.name)}
                          disabled={isWorking}
                          className="p-1.5 rounded-xl text-stone-400 hover:text-red-600 transition-colors"
                          title="Archive product"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                            <polyline points="21 8 21 21 3 21 3 8" />
                            <rect x="1" y="3" width="22" height="5" />
                            <line x1="10" y1="12" x2="14" y2="12" />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRestore(product.id)}
                        disabled={isWorking}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all active:scale-95 shadow-xs"
                        style={{ background: "var(--accent)" }}
                      >
                        {isWorking ? "Restoring..." : "♻️ Restore"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Selling & Cost Price Details */}
                <div
                  className="pt-2.5 border-t flex items-center justify-between text-xs font-medium"
                  style={{ borderColor: "var(--border-color)" }}
                >
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Selling Price: </span>
                    <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                      {formatNaira(product.selling_price)}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Buying Cost: </span>
                    <span className="font-semibold" style={{ color: "var(--text-muted)" }}>
                      {formatNaira(product.buying_price)}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Margin: </span>
                    <span className="font-bold" style={{ color: "var(--success)" }}>
                      +{formatNaira(product.selling_price - product.buying_price)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
