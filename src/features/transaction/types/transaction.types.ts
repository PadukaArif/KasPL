export interface CheckoutItem {
  inventoryId: string;
  quantity: number;
}

export interface CheckoutPayload {
  cart: CheckoutItem[];
  businessDate: string; // YYYY-MM-DD format
}

export interface CheckoutSuccessData {
  transactionId: string;
  transactionNumber: string;
  businessDate: string;
  totalItems: number;
  totalQuantity: number;
  grossRevenue: number;
  grossCost: number;
  grossProfit: number;
  netProfit: number;
}
