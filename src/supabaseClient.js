import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'YOUR_SUPABASE_PROJECT_URL') {
    console.error('❌ Supabase credentials missing from frontend! Update your VITE_ variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
