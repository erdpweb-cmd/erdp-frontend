export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'transfer';

export interface Order {
  id: string;
  orderNumber: number;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  appliedPromotions: AppliedPromotion[];
  appliedCoupon?: AppliedCoupon;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  createdByName: string;
  dispatchedBy?: string;
  dispatchedByName?: string;
  dispatchedAt?: Date;
}

export interface Ingredient {
  inventoryItemId: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  ingredients: Ingredient[];
}

export interface AppliedPromotion {
  promotionId: string;
  promotionName: string;
  discountAmount: number;
  freeItems: OrderItem[];
}

export interface AppliedCoupon {
  couponId: string;
  code: string;
  discountAmount: number;
}
