export type InventoryCategory = 'bebidas' | 'empaques' | 'alimentos' | 'limpieza' | 'otro';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  subcategory?: string;
  quantity: number;
  unit: string;
  minStock: number;
  costPerUnit: number;
  barcode?: string;
  lastUpdated: Date;
}
