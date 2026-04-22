"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";

export type SaleItemInput = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

export type RecordSaleInput = {
  items: SaleItemInput[];
  paymentMethod: "cash" | "transfer" | "credit";
  notes: string;
  customerId?: string;      // if selecting existing
  newCustomerName?: string; // if creating new inline
  newCustomerPhone?: string;
};

type ActionResult = { success: true } | { error: string };

export async function recordSale(input: RecordSaleInput): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Not authenticated." };

  const shopId = session.user.shopId;
  const supabase = createServiceRoleSupabaseClient();

  if (!input.items || input.items.length === 0) {
    return { error: "Sale must have at least one item." };
  }

  // 1. Validate credit sale requirements
  let finalCustomerId = input.customerId;
  if (input.paymentMethod === "credit") {
    if (!finalCustomerId && !input.newCustomerName?.trim()) {
      return { error: "A customer is required for credit sales." };
    }
  }

  // Calculate total amount
  const totalAmount = input.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  if (totalAmount <= 0) return { error: "Total sale amount must be greater than zero." };

  // 2. Fetch current stock and costs for all products
  const productIds = input.items.map((i) => i.productId);
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, stock_quantity, buying_price, name")
    .eq("shop_id", shopId)
    .in("id", productIds);

  if (productsError || !products) return { error: "Failed to fetch product details." };

  // 3. Verify stock levels
  for (const item of input.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return { error: `Product not found (ID: ${item.productId}).` };
    if (product.stock_quantity < item.quantity) {
      return { error: `Not enough stock for ${product.name}. You asked for ${item.quantity} but only ${product.stock_quantity} are left.` };
    }
  }

  // 4. Create customer if new inline customer is provided
  if (input.paymentMethod === "credit" && !finalCustomerId && input.newCustomerName?.trim()) {
    const { data: newCust, error: custErr } = await supabase
      .from("customers")
      .insert({
        shop_id: shopId,
        name: input.newCustomerName.trim(),
        phone: input.newCustomerPhone?.trim() || "",
        total_debt: 0 // Will update below
      })
      .select("id")
      .single();
    
    if (custErr || !newCust) return { error: "Failed to create new customer." };
    finalCustomerId = newCust.id;
  }

  // 5. Start saving data (We do it sequentially since RPC transaction isn't set up)
  // Step A: Insert Sale
  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .insert({
      shop_id: shopId,
      total_amount: totalAmount,
      payment_method: input.paymentMethod,
      notes: input.notes.trim()
    })
    .select("id")
    .single();

  if (saleError || !sale) return { error: "Failed to record sale." };

  // Step B: Insert Sale Items (Snapshotting cost)
  const lineItems = input.items.map((item) => {
    const cost = products.find((p) => p.id === item.productId)?.buying_price || 0;
    return {
      sale_id: sale.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      unit_cost: cost // Snapshotted
    };
  });

  const { error: itemsError } = await supabase.from("sale_items").insert(lineItems);
  if (itemsError) return { error: "Recorded sale, but failed to save line items." };

  // Step C: Deduct Stock
  for (const item of input.items) {
    const product = products.find((p) => p.id === item.productId);
    if (product) {
      const newStock = product.stock_quantity - item.quantity;
      await supabase
        .from("products")
        .update({ stock_quantity: newStock })
        .eq("id", product.id)
        .eq("shop_id", shopId);
    }
  }

  // Step D: Handle Credit Sale tracking
  if (input.paymentMethod === "credit" && finalCustomerId) {
    // Insert into credit_sales
    await supabase.from("credit_sales").insert({
      shop_id: shopId,
      customer_id: finalCustomerId,
      sale_id: sale.id,
      amount: totalAmount,
      amount_paid: 0,
      status: "unpaid"
    });

    // Fetch customer's current debt
    const { data: custInfo } = await supabase
      .from("customers")
      .select("total_debt")
      .eq("id", finalCustomerId)
      .eq("shop_id", shopId)
      .single();
    
    // Update customer total debt
    if (custInfo) {
      await supabase
        .from("customers")
        .update({ total_debt: custInfo.total_debt + totalAmount })
        .eq("id", finalCustomerId)
        .eq("shop_id", shopId);
    }
  }

  revalidatePath("/dashboard/sales");
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard/customers");
  revalidatePath("/dashboard");
  
  return { success: true };
}
