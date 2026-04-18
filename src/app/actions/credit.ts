export {};

export {};

export type CreditActionNotImplemented = {
  error: "NOT_IMPLEMENTED";
};

export async function creditNotImplemented(): Promise<CreditActionNotImplemented> {
  return { error: "NOT_IMPLEMENTED" };
}

