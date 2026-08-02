export interface POSItemSnapshot {
  id: string; // The DailyInventory ID
  publicId: string; // The DailyInventory publicId
  itemId: string; // The Item (master) ID
  itemPublicId: string; // The Item publicId
  itemName: string;
  category: 'FOOD' | 'DRINK' | 'SNACK';
  sellingPrice: number;
  remainingStock: number;
}

export interface POSCartItem {
  inventoryId: string;
  itemPublicId: string;
  itemName: string;
  sellingPrice: number;
  quantity: number;
  subtotal: number;
}
