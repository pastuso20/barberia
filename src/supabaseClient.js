import { createClient } from '@supabase/supabase-js';

// Usamos valores por defecto vacíos si las variables no están definidas
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Limpiamos la URL de posibles espacios o comillas accidentales
const cleanUrl = supabaseUrl.trim().replace(/['"]/g, '');
const cleanKey = supabaseAnonKey.trim().replace(/['"]/g, '');

// Solo creamos el cliente si tenemos ambos valores
export const supabase = (cleanUrl && cleanKey) 
  ? createClient(cleanUrl, cleanKey) 
  : null;
