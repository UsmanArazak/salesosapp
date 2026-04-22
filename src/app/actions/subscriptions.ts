export type SubscriptionsActionNotImplemented = {
  error: "NOT_IMPLEMENTED";
};

export async function subscriptionsNotImplemented(): Promise<SubscriptionsActionNotImplemented> {
  return { error: "NOT_IMPLEMENTED" };
}

