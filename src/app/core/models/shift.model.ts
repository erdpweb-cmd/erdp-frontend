export interface Shift {
  id?: string;
  date: Date;
  receptionUserId: string;
  receptionUserName: string;
  kitchenUserId: string;
  kitchenUserName: string;
  openedAt?: Date;
  openedBy?: string;
  closedAt?: Date;
  closedBy?: string;
  isOpen: boolean;
  totalSales?: number;
  totalExpenses?: number;
  balance?: number;
}
