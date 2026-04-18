export type ProductsActionNotImplemented = {
  error: "NOT_IMPLEMENTED";
};

export async function productsNotImplemented(): Promise<ProductsActionNotImplemented> {
  return { error: "NOT_IMPLEMENTED" };
}

