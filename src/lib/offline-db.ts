import Dexie, { Table } from 'dexie';

export interface OfflineSale {
  id?: number; // Auto-incremented ID for Dexie
  cart: {
    productId: string;
    name: string;
    unitPrice: number;
    quantity: number;
    maxStock: number;
  }[];
  paymentMethod: "cash" | "transfer" | "credit";
  notes: string;
  customerData: {
    mode: "existing" | "new";
    id?: string;
    name?: string;
    phone?: string;
  };
  timestamp: number;
}

export interface CachedProduct {
  id: string;
  name: string;
  selling_price: number;
  stock_quantity: number;
}

export interface CachedCustomer {
  id: string;
  name: string;
}

export class SalesOSDB extends Dexie {
  syncQueue!: Table<OfflineSale, number>;
  products!: Table<CachedProduct, string>;
  customers!: Table<CachedCustomer, string>;

  constructor() {
    super('SalesOSDB');
    this.version(2).stores({
      syncQueue: '++id, timestamp',
      products: 'id, name', // Cache for POS
      customers: 'id, name'
    });
  }
}

export const db = new SalesOSDB();
