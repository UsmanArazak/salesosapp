import Dexie, { Table } from 'dexie';

export interface OfflineSale {
  id?: number; // Auto-incremented ID for Dexie
  cart: any[];
  paymentMethod: "cash" | "transfer" | "credit";
  notes: string;
  customerData: any; // e.g., { mode, id, name, phone }
  timestamp: number;
}

export class SalesOSDB extends Dexie {
  syncQueue!: Table<OfflineSale, number>;

  constructor() {
    super('SalesOSDB');
    this.version(1).stores({
      syncQueue: '++id, timestamp', // Store queued sales
    });
  }
}

export const db = new SalesOSDB();
