export type Page = 'shop' | 'quote' | 'filaments' | 'manage';

export interface Filament {
  id: string;
  name: string;
  material: string;
  color: string;
  color_hex: string | null;
  best_used_for: string;
  in_stock: boolean;
  created_at: string;
}

export type NewFilament = Omit<Filament, 'id' | 'created_at' | 'in_stock'>;

export interface InventoryItem {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  quantity: number;
  image_url: string | null;
  created_at: string;
}

export type NewInventoryItem = Omit<InventoryItem, 'id' | 'created_at' | 'quantity'> & {
  quantity: number;
};

export interface NewQuoteRequest {
  customer_name: string;
  customer_email: string;
  material: string;
  color: string;
  comment: string | null;
  file_path: string;
  file_name: string;
}
