export interface Product {
  id: string;
  name: string;
  type: 'bebida' | 'comida' | 'acompanamiento' | 'otro';
  category: string;
  ingredients: Ingredient[];
  productionCost: number;
  publicPrice: number;
  profit: number;
  profitPercentage: number;
  isActive: boolean;
  createdAt: Date;
}

export interface Ingredient {
  inventoryItemId: string;
  name: string;
  quantity: number;
  unit: string;
}
