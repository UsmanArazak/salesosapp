export {};

export {};

export type SalesActionNotImplemented = {
  error: "NOT_IMPLEMENTED";
};

export async function salesNotImplemented(): Promise<SalesActionNotImplemented> {
  return { error: "NOT_IMPLEMENTED" };
}

