import { supabase } from '@/lib/supabase';
import type { InventoryItem, NewInventoryItem } from '@/lib/types';

export async function fetchInventory(): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createInventoryItem(input: NewInventoryItem): Promise<void> {
  const { error } = await supabase.from('inventory_items').insert(input);
  if (error) throw new Error(error.message);
}

export async function setInventoryQuantity(id: string, quantity: number): Promise<void> {
  const { error } = await supabase
    .from('inventory_items')
    .update({ quantity })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteInventoryItem(id: string): Promise<void> {
  const { error } = await supabase.from('inventory_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
