export const ORDER_STATUS: Record<string, string> = {
  NEW: "Order placed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  COMPLETED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

export const PAYMENT_STATUS: Record<string, string> = {
  PENDING: "Awaiting payment",
  PAID: "Paid",
  FAILED: "Payment failed",
  CANCELLED: "Payment cancelled",
  REFUNDED: "Refunded",
  PARTIALLY_REFUNDED: "Partially refunded",
};

export const PAYMENT_METHOD: Record<string, string> = {
  CASH_ON_DELIVERY: "Pay on pickup / delivery",
  BANK_TRANSFER: "Invoice",
  PAYPAL: "PayPal",
  PAYONEER: "Payoneer",
  BANK_CARD: "Credit / debit card",
};

export const ONLINE_METHODS = new Set(["PAYPAL", "PAYONEER", "BANK_CARD"]);
