"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { recordSale } from "@/app/actions/sales";
import { db } from "@/lib/offline-db";
import { useLiveQuery } from "dexie-react-hooks";
import { DismissableHelpBanner } from "@/components/ui/DismissableHelpBanner";

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
  bankAccounts: string[];
};

type CartItem = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  maxStock: number;
};

export function POSClient({ products, customers, bankAccounts }: Props) {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [productQuery, setProductQuery] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer" | "credit">("cash");
  const [selectedBank, setSelectedBank] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Credit customer state
  const [customerMode, setCustomerMode] = useState<"existing" | "new">("existing");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");

  // Offline support state
  const [isOnline, setIsOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const queuedSalesCount = useLiveQuery(() => db.syncQueue.count(), []) ?? 0;

  // Cache data locally on load
  useEffect(() => {
    if (products.length > 0) db.products.bulkPut(products);
    if (customers.length > 0) db.customers.bulkPut(customers);
  }, [products, customers]);

  const cachedProducts = useLiveQuery(() => db.products.toArray(), []) || products;
  const cachedCustomers = useLiveQuery(() => db.customers.toArray(), []) || customers;

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineSales();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function syncOfflineSales() {
    if (syncing) return;
    setSyncing(true);
    try {
      const offlineSales = await db.syncQueue.toArray();
      if (offlineSales.length === 0) return;

      for (const sale of offlineSales) {
        const result = await recordSale({
          items: sale.cart.map((c: CartItem) => ({
            productId: c.productId,
            quantity: c.quantity,
            unitPrice: c.unitPrice,
          })),
          paymentMethod: sale.paymentMethod,
          notes: sale.notes,
          amountPaid: sale.amountPaid,
          bankName: sale.bankName,
          customerId: sale.customerData.id,
          newCustomerName: sale.customerData.name,
          newCustomerPhone: sale.customerData.phone,
        });

        if (!("error" in result)) {
          // If successful, remove from queue
          await db.syncQueue.delete(sale.id!);
        } else {
           console.error("Failed to sync offline sale:", result.error);
        }
      }
    } finally {
      setSyncing(false);
      router.refresh();
    }
  }

  const filteredProducts = cachedProducts.filter(
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
    if (paymentMethod === "transfer" && bankAccounts.length > 0 && !selectedBank) {
      return setError("Please select which bank account received this transfer.");
    }
    if (paymentMethod === "credit") {
      if (customerMode === "existing" && !selectedCustomerId) {
        return setError("Please select a customer for this credit sale.");
      }
      if (customerMode === "new" && !newCustomerName.trim()) {
        return setError("Please enter a new customer name.");
      }
    }

    setLoading(true);

    if (!isOnline) {
      await db.syncQueue.add({
        cart,
        paymentMethod,
        notes,
        amountPaid: parseFloat(amountPaid) || undefined,
        bankName: paymentMethod === "transfer" ? selectedBank : undefined,
        customerData: {
          mode: customerMode,
          id: customerMode === "existing" ? selectedCustomerId : undefined,
          name: customerMode === "new" ? newCustomerName : undefined,
          phone: customerMode === "new" ? newCustomerPhone : undefined,
        },
        timestamp: Date.now()
      });
      setLoading(false);
      setCart([]);
      setProductQuery("");
      setNotes("");
      setError("Success: Saved offline. Will sync when connection is restored.");
      return;
    }

    const payload = {
      items: cart.map((c) => ({
        productId: c.productId,
        quantity: c.quantity,
        unitPrice: c.unitPrice,
      })),
      paymentMethod,
      notes,
      amountPaid: parseFloat(amountPaid) || undefined,
      bankName: paymentMethod === "transfer" ? selectedBank : undefined,
      customerId: customerMode === "existing" ? selectedCustomerId : undefined,
      newCustomerName: customerMode === "new" ? newCustomerName : undefined,
      newCustomerPhone: customerMode === "new" ? newCustomerPhone : undefined,
    };

    // Optimistic update: fire and forget
    recordSale(payload).then((result) => {
      if (!("error" in result)) {
        router.refresh();
      } else {
        console.error("Background sale failed:", result.error);
      }
    });

    setLoading(false);
    setCart([]);
    setNotes("");
    setAmountPaid("");
    router.push("/sales");
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <DismissableHelpBanner
        storageKey="new-sale"
        message="Record a sale: pick the products sold, select how they paid (cash, transfer, or credit), and track your daily profit instantly."
      />

      {/* Offline Status Bar */}
      {(!isOnline || queuedSalesCount > 0) && (
        <div className={`p-3 rounded-xl flex items-center justify-between text-sm ${!isOnline ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-blue-50 border-blue-200 text-blue-800"} border`}>
          <div className="flex items-center gap-2">
            {!isOnline ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            <span className="font-medium">
              {!isOnline ? "You are offline." : "Back online."} {queuedSalesCount > 0 && `${queuedSalesCount} sale(s) pending sync.`}
            </span>
          </div>
          {isOnline && queuedSalesCount > 0 && (
            <button
              onClick={syncOfflineSales}
              disabled={syncing}
              className="px-3 py-1 bg-white rounded shadow-sm text-xs font-semibold disabled:opacity-50"
            >
              {syncing ? "Syncing..." : "Sync Now"}
            </button>
          )}
        </div>
      )}

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

          {/* Bank Selector for Transfer */}
          {paymentMethod === "transfer" && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-dim)" }}>Which bank received this transfer?</label>
              {bankAccounts && bankAccounts.length > 0 ? (
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2.5 text-sm font-medium focus:outline-none transition-colors"
                  style={{ background: "var(--bg-elevated)", borderColor: selectedBank ? "var(--accent)" : "var(--border-color)", color: "var(--text-primary)" }}
                >
                  <option value="">-- Select Bank Account --</option>
                  {bankAccounts.map((bank) => (
                    <option key={bank} value={bank}>🏦 {bank}</option>
                  ))}
                </select>
              ) : (
                <div className="p-3 border rounded-xl text-sm" style={{ borderColor: "var(--border-color)", background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
                  No bank accounts added yet. <Link href="/shop" className="font-semibold" style={{ color: "var(--accent)" }}>Add one in your Shop Profile</Link> to track transfers.
                </div>
              )}
            </div>
          )}

          {/* Customer Selection for Credit */}
          {paymentMethod === "credit" && (
            <div className="mb-4 p-4 rounded-xl border" style={{ borderColor: "var(--warning-border)", background: "var(--warning-dim)" }}>
               <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium" style={{ color: "var(--warning)" }}>Customer Details</label>
                  {cachedCustomers.length > 0 && (
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

               {customerMode === "existing" && cachedCustomers.length > 0 ? (
                 <select
                   value={selectedCustomerId}
                   onChange={(e) => setSelectedCustomerId(e.target.value)}
                   className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none"
                   style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                 >
                   <option value="">-- Select Customer --</option>
                   {cachedCustomers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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

               <div className="mt-4 pt-4 border-t" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
                 <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--warning)" }}>Amount Paid Upfront (₦)</label>
                 <input
                   type="number"
                   placeholder="0"
                   min="0"
                   step="0.01"
                   value={amountPaid}
                   onChange={(e) => setAmountPaid(e.target.value)}
                   className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none"
                   style={{ background: "var(--bg-surface)", borderColor: "var(--warning-border)", color: "var(--text-primary)" }}
                 />
                 <p className="text-xs mt-1.5 opacity-80" style={{ color: "var(--warning)" }}>
                   If they are paying part of it now, enter the amount. The rest will be recorded as debt.
                 </p>
               </div>
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

        {/* Error / Success Message */}
        {error && (
          <div
            className="rounded-xl px-4 py-3 text-sm border font-medium"
            style={{
              background: error.startsWith("Success") ? "rgba(34,197,94,0.1)" : "var(--danger-dim)",
              borderColor: error.startsWith("Success") ? "rgba(34,197,94,0.25)" : "var(--danger)",
              color: error.startsWith("Success") ? "#16a34a" : "#dc2626",
            }}
          >
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
