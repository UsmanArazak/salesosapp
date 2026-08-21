"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProductForm } from "@/components/ui/ProductForm";
import { updateProduct } from "@/app/actions/products";
import type { ProductRow } from "@/app/(dashboard)/inventory/InventoryList";

export function EditProductClient({ product }: { product: ProductRow }) {
  const router = useRouter();

  async function handleSubmit(data: Parameters<typeof updateProduct>[1]) {
    const result = await updateProduct(product.id, data);
    if ("success" in result) {
      router.push("/inventory");
      router.refresh();
    }
    return result;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/inventory"
          className="w-9 h-9 rounded-2xl border flex items-center justify-center transition-colors bg-white"
          style={{
            borderColor: "var(--border-color)",
            color: "var(--text-muted)",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Edit Product
          </h1>
          <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
            Update product details &amp; stock levels for {product.name}
          </p>
        </div>
      </div>

      <ProductForm
        initial={{
          name: product.name,
          category: product.category,
          buyingPrice: String(product.buying_price),
          sellingPrice: String(product.selling_price),
          stockQuantity: String(product.stock_quantity),
          lowStockThreshold: String(product.low_stock_threshold),
        }}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
        backHref="/inventory"
      />
    </div>
  );
}
