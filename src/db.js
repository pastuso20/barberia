import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchHaircuts() {
  const { data, error } = await supabase
    .from('haircuts')
    .select('*')
    .order('date', { ascending: true })
    .order('id', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function insertHaircut({ barber, service, price, date }) {
  const { data, error } = await supabase
    .from('haircuts')
    .insert([{ barber, service, price, date }])
    .select();
  if (error) throw error;
  return data?.[0];
}

export async function removeHaircut(id) {
  const { error } = await supabase
    .from('haircuts')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
