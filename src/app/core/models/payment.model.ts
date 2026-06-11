export type PaymentType = 'salary' | 'bonus' | 'advance' | 'other';

export interface Payment {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  type: PaymentType;
  description: string;
  paymentDate: Date;
  createdAt: Date;
}
