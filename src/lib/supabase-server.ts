import { createClient } from '@supabase/supabase-js';

// URL y clave del proyecto Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
