import { supabase } from '@/lib/supabase';
import type { Filament, NewFilament } from '@/lib/types';

export async function fetchFilaments(): Promise<Filament[]> {
  const { data, error } = await supabase
    .from('filaments')
    .select('*')
    .order('material')
    .order('color');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createFilament(input: NewFilament): Promise<void> {
  const { error } = await supabase.from('filaments').insert({ ...input, in_stock: true });
  if (error) throw new Error(error.message);
}

export async function setFilamentInStock(id: string, inStock: boolean): Promise<void> {
  const { error } = await supabase.from('filaments').update({ in_stock: inStock }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteFilament(id: string): Promise<void> {
  const { error } = await supabase.from('filaments').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
