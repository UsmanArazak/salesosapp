export {};

export {};

export type ExpensesActionNotImplemented = {
  error: "NOT_IMPLEMENTED";
};

export async function expensesNotImplemented(): Promise<ExpensesActionNotImplemented> {
  return { error: "NOT_IMPLEMENTED" };
}

