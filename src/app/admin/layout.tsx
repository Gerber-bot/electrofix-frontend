import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient, hasValidWorkshopRole } from '../../lib/supabase/server';

async function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login');
  }

  if (!hasValidWorkshopRole(user)) {
    redirect('/auth/login?error=unauthorized');
  }

  return <>{children}</>;
}

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs font-medium">
          Verificando credenciales de acceso al taller...
        </div>
      }
    >
      <AdminAuthGuard>{children}</AdminAuthGuard>
    </Suspense>
  );
}
