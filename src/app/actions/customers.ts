export {};

export {};

export type CustomersActionNotImplemented = {
  error: "NOT_IMPLEMENTED";
};

export async function customersNotImplemented(): Promise<CustomersActionNotImplemented> {
  return { error: "NOT_IMPLEMENTED" };
}

