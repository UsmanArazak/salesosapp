import Dexie, { type Table } from "dexie";

export type PendingSale = {
  id?: number;
  createdAt: string;
  payload: unknown;
};

export type PendingExpense = {
  id?: number;
  createdAt: string;
  payload: unknown;
};

export type PendingProductChange = {
  id?: number;
  createdAt: string;
  payload: unknown;
};

export class SalesOSLocal extends Dexie {
  pendingSales!: Table<PendingSale, number>;
  pendingExpenses!: Table<PendingExpense, number>;
  pendingProducts!: Table<PendingProductChange, number>;

  constructor() {
    super("SalesOSLocal");

    this.version(1).stores({
      pendingSales: "++id, createdAt",
      pendingExpenses: "++id, createdAt",
      pendingProducts: "++id, createdAt",
    });
  }
}

export const salesOSLocal = new SalesOSLocal();
