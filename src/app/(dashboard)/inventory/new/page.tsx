"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProductForm } from "@/components/ui/ProductForm";
import { createProduct } from "@/app/actions/products";

export default function NewProductPage() {
  const router = useRouter();

  async function handleSubmit(data: Parameters<typeof createProduct>[0]) {
    const result = await createProduct(data);
    if ("success" in result) {
      router.push("/inventory");
      router.refresh();
    }
    return result;
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/inventory"
          className="w-9 h-9 rounded-xl border flex items-center justify-center transition-colors"
          style={{
            background: "var(--bg-surface)",
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
            Add Product
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Add a new item to your inventory
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div
        className="rounded-2xl border p-5 bg-white"
        style={{ borderColor: "var(--border-color)" }}
      >
        <ProductForm
          onSubmit={handleSubmit}
          submitLabel="Add Product"
          backHref="/inventory"
        />
      </div>
    </div>
  );
}
