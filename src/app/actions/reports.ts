export type ReportsActionNotImplemented = {
  error: "NOT_IMPLEMENTED";
};

export async function reportsNotImplemented(): Promise<ReportsActionNotImplemented> {
  return { error: "NOT_IMPLEMENTED" };
}

