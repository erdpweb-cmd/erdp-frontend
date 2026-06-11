export type PromotionType = 'bonus' | 'free_product' | 'discount' | 'coupon';

export interface Promotion {
  id: string;
  name: string;
  type: PromotionType;
  description: string;
  buyQuantity: number;
  getQuantity?: number;
  discountPercentage?: number;
  applicableProductIds: string[];
  isActive: boolean;
  isDaily: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface AppliedPromotion {
  promotionId: string;
  promotionName: string;
  discountAmount: number;
  freeItems: OrderItem[];
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: Date;
}

export interface AppliedCoupon {
  couponId: string;
  code: string;
  discountAmount: number;
}
