import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient, hasValidWorkshopRole } from '../../../lib/supabase/server';

async function LoginSessionGuard({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user already has an active session and valid role, bypass login form directly to /admin
  if (user && hasValidWorkshopRole(user)) {
    redirect('/admin');
  }

  return <>{children}</>;
}

export default function AuthLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs font-medium">
          Comprobando sesión activa...
        </div>
      }
    >
      <LoginSessionGuard>{children}</LoginSessionGuard>
    </Suspense>
  );
}
