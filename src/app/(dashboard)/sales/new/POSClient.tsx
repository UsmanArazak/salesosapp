"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { recordSale } from "@/app/actions/sales";

export type ProductMini = {
  id: string;
  name: string;
  selling_price: number;
  stock_quantity: number;
};

export type CustomerMini = {
  id: string;
  name: string;
};

type Props = {
  products: ProductMini[];
  customers: CustomerMini[];
};

type CartItem = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  maxStock: number;
};

export function POSClient({ products, customers }: Props) {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [productQuery, setProductQuery] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer" | "credit">("cash");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Credit customer state
  const [customerMode, setCustomerMode] = useState<"existing" | "new">("existing");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");

  const filteredProducts = products.filter(
    (p) =>
      p.stock_quantity > 0 &&
      p.name.toLowerCase().includes(productQuery.toLowerCase()) &&
      !cart.some(c => c.productId === p.id)
  ).slice(0, 5); // show max 5 suggestions

  const totalAmount = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  function addToCart(p: ProductMini) {
    setCart((prev) => [
      ...prev,
      {
        productId: p.id,
        name: p.name,
        unitPrice: p.selling_price,
        quantity: 1,
        maxStock: p.stock_quantity,
      },
    ]);
    setProductQuery("");
  }

  function updateQuantity(id: string, delta: number) {
    setCart((prev) =>
      prev.map((c) => {
        if (c.productId === id) {
          const newQ = c.quantity + delta;
          if (newQ > 0 && newQ <= c.maxStock) {
            return { ...c, quantity: newQ };
          }
        }
        return c;
      })
    );
  }

  function updatePrice(id: string, newPrice: string) {
    const val = parseFloat(newPrice);
    if (isNaN(val) || val < 0) return;
    setCart((prev) =>
      prev.map((c) => (c.productId === id ? { ...c, unitPrice: val } : c))
    );
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((c) => c.productId !== id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (cart.length === 0) return setError("Please add at least one product.");
    if (paymentMethod === "credit") {
      if (customerMode === "existing" && !selectedCustomerId) {
        return setError("Please select a customer for this credit sale.");
      }
      if (customerMode === "new" && !newCustomerName.trim()) {
        return setError("Please enter a new customer name.");
      }
    }

    setLoading(true);
    const result = await recordSale({
      items: cart.map((c) => ({
        productId: c.productId,
        quantity: c.quantity,
        unitPrice: c.unitPrice,
      })),
      paymentMethod,
      notes,
      customerId: customerMode === "existing" ? selectedCustomerId : undefined,
      newCustomerName: customerMode === "new" ? newCustomerName : undefined,
      newCustomerPhone: customerMode === "new" ? newCustomerPhone : undefined,
    });
    setLoading(false);

    if ("error" in result) {
      setError(result.error);
    } else {
      router.push("/sales");
      router.refresh();
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Search & Add Products */}
      <div className="rounded-2xl border p-5 bg-white" style={{ borderColor: "var(--border-color)" }}>
        <h2 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Add Items</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search products to add..."
            value={productQuery}
            onChange={(e) => setProductQuery(e.target.value)}
            className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none transition-colors"
            style={{
              background: "var(--bg-elevated)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border-color)")}
          />
          {productQuery && filteredProducts.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-xl shadow-lg z-10 overflow-hidden" style={{ borderColor: "var(--border-color)" }}>
              {filteredProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="w-full text-left px-4 py-3 text-sm flex justify-between items-center hover:bg-gray-50 border-b last:border-0"
                  style={{ borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                >
                  <span className="font-medium">{p.name} <span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>(Qty: {p.stock_quantity})</span></span>
                  <span className="font-semibold text-xs" style={{ color: "var(--accent)" }}>+ ADD</span>
                </button>
              ))}
            </div>
          )}
          {productQuery && filteredProducts.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-xl shadow-lg z-10 p-4 text-center text-sm" style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}>
              No available products found.
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cart */}
        <div className="rounded-2xl border p-5 bg-white" style={{ borderColor: "var(--border-color)" }}>
          <h2 className="text-sm font-bold mb-4 flex justify-between items-center" style={{ color: "var(--text-primary)" }}>
            <span>Cart</span>
            {cart.length > 0 && (
              <span className="text-xs font-semibold px-2 py-1 rounded-md" style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
                {cart.length} item{cart.length > 1 ? "s" : ""}
              </span>
            )}
          </h2>

          {cart.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>
              Cart is empty. Search for a product above.
            </p>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.productId} className="flex gap-3 pb-4 border-b last:border-0" style={{ borderColor: "var(--border-color)" }}>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>{item.name}</p>
                    <div className="flex items-center gap-1 mt-2">
                       <span className="text-xs" style={{ color: "var(--text-muted)" }}>₦</span>
                       <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updatePrice(item.productId, e.target.value)}
                          className="w-20 text-xs py-1 px-2 border rounded bg-transparent focus:outline-none focus:border-[var(--accent)]"
                          style={{ color: "var(--text-primary)" }}
                       />
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button type="button" onClick={() => removeFromCart(item.productId)} className="text-xs font-bold" style={{ color: "var(--danger)" }}>
                      &times; Remove
                    </button>
                    <div className="flex items-center gap-2 mt-2">
                      <button type="button" onClick={() => updateQuantity(item.productId, -1)} className="w-6 h-6 flex items-center justify-center border rounded-md" style={{ borderColor: "var(--border-color)" }}>-</button>
                      <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.productId, 1)} className="w-6 h-6 flex items-center justify-center border rounded-md" style={{ borderColor: "var(--border-color)" }}>+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Details */}
        <div className="rounded-2xl border p-5 bg-white" style={{ borderColor: "var(--border-color)" }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>Payment</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-dim)" }}>Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {(["cash", "transfer", "credit"] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-colors capitalize ${paymentMethod === method ? "border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent)]" : "border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-dim)]"}`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Selection for Credit */}
          {paymentMethod === "credit" && (
            <div className="mb-4 p-4 rounded-xl border" style={{ borderColor: "var(--warning-border)", background: "var(--warning-dim)" }}>
               <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium" style={{ color: "var(--warning)" }}>Customer Details</label>
                  {customers.length > 0 && (
                    <button 
                      type="button" 
                      onClick={() => setCustomerMode(m => m === "existing" ? "new" : "existing")}
                      className="text-xs underline font-semibold"
                      style={{ color: "var(--warning)" }}
                    >
                      {customerMode === "existing" ? "+ New Customer" : "Select Existing"}
                    </button>
                  )}
               </div>

               {customerMode === "existing" && customers.length > 0 ? (
                 <select
                   value={selectedCustomerId}
                   onChange={(e) => setSelectedCustomerId(e.target.value)}
                   className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none"
                   style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                 >
                   <option value="">-- Select Customer --</option>
                   {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
               ) : (
                 <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Customer Name"
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Phone Number (Optional)"
                      value={newCustomerPhone}
                      onChange={(e) => setNewCustomerPhone(e.target.value)}
                      className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none"
                    />
                 </div>
               )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-dim)" }}>Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Paid in full"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border px-4 py-2 text-sm focus:outline-none"
              style={{ background: "var(--bg-elevated)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl px-4 py-3 text-sm border" style={{ background: "var(--danger-dim)", borderColor: "var(--danger)", color: "#dc2626" }}>
            {error}
          </div>
        )}

        {/* Checkout Button */}
        <div className="flex gap-3">
          <Link
            href="/sales"
            className="flex-1 py-4 rounded-xl text-sm font-semibold text-center border bg-[var(--bg-elevated)] text-[var(--text-dim)]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || cart.length === 0}
            className="flex-1 py-4 rounded-xl text-base font-bold text-white disabled:opacity-60 transition-transform active:scale-[0.98] shadow-sm flex items-center justify-between px-6"
            style={{ background: "var(--accent)" }}
          >
            <span>{loading ? "Saving..." : "Checkout"}</span>
            {!loading && <span>₦{totalAmount.toLocaleString("en-US")}</span>}
          </button>
        </div>
      </form>
    </div>
  );
}
