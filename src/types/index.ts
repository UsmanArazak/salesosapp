export type Plan = "free" | "pro";
export type UserRole = "owner" | "superadmin";

export interface Shop {
  id: string;
  name: string;
  ownerId: string;
  plan: Plan;
  createdAt: string;
  address: string;
  phone: string;
}

export interface User {
  id: string;
  shopId: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  category: string;
  buyingPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  sku: string;
}

export interface Sale {
  id: string;
  shopId: string;
  totalAmount: number;
  paymentMethod: string;
  createdAt: string;
  notes: string;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
}

export interface Customer {
  id: string;
  shopId: string;
  name: string;
  phone: string;
  totalDebt: number;
}

export interface CreditSale {
  id: string;
  shopId: string;
  customerId: string;
  amount: number;
  amountPaid: number;
  dueDate: string;
  status: string;
}

export interface Expense {
  id: string;
  shopId: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface Subscription {
  id: string;
  shopId: string;
  plan: Plan;
  status: string;
  paystackRef: string;
  renewedAt: string;
  expiresAt: string;
}

declare module "next-auth" {
  interface Session {
    user: {
      userId: string;
      shopId: string;
      role: UserRole;
      email?: string | null;
    };
  }

  interface User {
    id: string;
    shopId: string;
    role: UserRole;
    email?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    shopId?: string;
    role?: UserRole;
  }
}

export type Plan = "free" | "pro";
export type Role = "owner" | "superadmin";

export interface Shop {
  id: string;
  name: string;
  ownerId: string;
  plan: Plan;
  createdAt: string;
  address: string;
  phone: string;
}

export interface User {
  id: string;
  shopId: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  category: string;
  buyingPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  sku: string;
}

export interface Sale {
  id: string;
  shopId: string;
  totalAmount: number;
  paymentMethod: string;
  createdAt: string;
  notes: string;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
}

export interface Customer {
  id: string;
  shopId: string;
  name: string;
  phone: string;
  totalDebt: number;
}

export interface CreditSale {
  id: string;
  shopId: string;
  customerId: string;
  amount: number;
  amountPaid: number;
  dueDate: string;
  status: string;
}

export interface Expense {
  id: string;
  shopId: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface Subscription {
  id: string;
  shopId: string;
  plan: Plan;
  status: string;
  paystackRef: string;
  renewedAt: string;
  expiresAt: string;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      shopId: string;
      role: Role;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    shopId?: string;
    role?: Role;
  }
}

export type Plan = "free" | "pro";
export type UserRole = "owner" | "superadmin";
export type CreditSaleStatus = "pending" | "partial" | "paid" | "overdue";
export type PaymentMethod = "cash" | "transfer" | "pos" | "card" | "other";
export type SubscriptionStatus = "active" | "past_due" | "cancelled" | "trialing";

export interface Shop {
  id: string;
  name: string;
  ownerId: string;
  plan: Plan;
  createdAt: string;
  address: string;
  phone: string;
}

export interface User {
  id: string;
  shopId: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  category: string;
  buyingPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  sku: string;
}

export interface Sale {
  id: string;
  shopId: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
  notes: string;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
}

export interface Customer {
  id: string;
  shopId: string;
  name: string;
  phone: string;
  totalDebt: number;
}

export interface CreditSale {
  id: string;
  shopId: string;
  customerId: string;
  amount: number;
  amountPaid: number;
  dueDate: string;
  status: CreditSaleStatus;
}

export interface Expense {
  id: string;
  shopId: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface Subscription {
  id: string;
  shopId: string;
  plan: Plan;
  status: SubscriptionStatus;
  paystackRef: string;
  renewedAt: string;
  expiresAt: string;
}

