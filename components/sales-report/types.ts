export type SaleRow = {
  id: string;
  invoiceNumber: string;
  cashierId: string;
  cashierName: string;
  subtotal: string;
  discountAmount: string;
  taxAmount: string;
  totalAmount: string;
  status: "COMPLETED" | "VOIDED";
  soldAt: Date | string;
  createdAt: Date | string;
};

export type SalesAggregates = {
  transactions: number;
  completedTransactions: number;
  voidedTransactions: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  voidedTotal: number;
};
