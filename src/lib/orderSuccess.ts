/** What the payment page hands to the order-success page, so the page knows an order was really placed. */
export interface OrderSuccessState {
  placedOrderId: string;
}

/** The id of the order just placed, or null when this page was opened without placing one. */
export const placedOrderIdFrom = (state: unknown): string | null => {
  const id = (state as Partial<OrderSuccessState> | null | undefined)?.placedOrderId;
  return typeof id === 'string' && id.trim() !== '' ? id : null;
};
