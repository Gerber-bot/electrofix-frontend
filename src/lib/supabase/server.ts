import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { User } from '@supabase/supabase-js';

export const ALLOWED_ROLES = ['admin', 'taller', 'tecnico', 'operador'];

export function getUserRole(user: User | null): string | null {
  if (!user) return null;
  return (
    (user.app_metadata?.role as string | undefined) ||
    (user.user_metadata?.role as string | undefined) ||
    null
  );
}

export function isUserAdmin(user: User | null): boolean {
  if (!user) return false;
  const role = getUserRole(user);
  return role?.toLowerCase() === 'admin';
}

export function hasValidWorkshopRole(user: User | null): boolean {
  if (!user) return false;

  const explicitRole = getUserRole(user);

  // If no custom role metadata is set yet, allow authenticated workshop users by default
  if (!explicitRole) return true;

  return ALLOWED_ROLES.includes(explicitRole.toLowerCase());
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wtshiydxbqwodvorctva.supabase.co';
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0c2hpeWR4YnF3b2R2b3JjdHZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyNzQ2ODEsImV4cCI6MjEwNzg1MDY4MX0.PvKGyNHfaetk_oZxK_pzHMC18zGsl9uHYGKS73yBhWU';

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Executed inside a Server Component where setting cookies is a no-op
        }
      },
    },
  });
}
