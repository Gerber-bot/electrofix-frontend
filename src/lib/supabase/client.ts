import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseBrowserClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wtshiydxbqwodvorctva.supabase.co';
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0c2hpeWR4YnF3b2R2b3JjdHZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyNzQ2ODEsImV4cCI6MjEwNzg1MDY4MX0.PvKGyNHfaetk_oZxK_pzHMC18zGsl9uHYGKS73yBhWU';

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
