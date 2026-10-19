'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  Wrench,
  Lock,
  Mail,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Shield,
  Clock,
} from 'lucide-react';
import { validateInvitationToken, acceptInvitation } from '../../../../lib/api';
import { InvitationEntry } from '../../../../types/admin-suite';
import { createSupabaseBrowserClient } from '../../../../lib/supabase/client';

const ROLE_LABELS: Record<string, { label: string; badgeClasses: string }> = {
  admin: {
    label: 'Administrador',
    badgeClasses: 'bg-rose-950/80 text-rose-300 border-rose-800/70',
  },
  taller: {
    label: 'Jefe de Taller',
    badgeClasses: 'bg-blue-950/80 text-blue-300 border-blue-800/70',
  },
  tecnico: {
    label: 'Técnico Especialista',
    badgeClasses: 'bg-amber-950/80 text-amber-300 border-amber-800/70',
  },
  operador: {
    label: 'Operador / Recepción',
    badgeClasses: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/70',
  },
  cliente: {
    label: 'Cliente',
    badgeClasses: 'bg-slate-800 text-slate-300 border-slate-700',
  },
};

function AcceptInvitationContent() {
  const router = useRouter();
  const params = useParams();
  const token = typeof params?.token === 'string' ? params.token : '';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invitation, setInvitation] = useState<InvitationEntry | null>(null);
  const [errorReason, setErrorReason] = useState<string | null>(null);

  // Form
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setErrorReason('Token de invitación no provisto en el enlace');
      setLoading(false);
      return;
    }

    const checkToken = async () => {
      try {
        setLoading(true);
        const res = await validateInvitationToken(token);
        if (res.valid && res.invitation) {
          setInvitation(res.invitation);
        } else {
          setErrorReason(res.reason || 'Esta invitación no es válida o ya ha expirado.');
        }
      } catch (err: unknown) {
        setErrorReason(err instanceof Error ? err.message : 'Error al validar invitación');
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (password.length < 8) {
      setFormError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Las contraseñas no coinciden');
      return;
    }

    try {
      setSubmitting(true);
      await acceptInvitation({ token, password });

      // Automatically sign in via Supabase client if available
      try {
        const supabase = createSupabaseBrowserClient();
        if (invitation?.email) {
          await supabase.auth.signInWithPassword({
            email: invitation.email,
            password,
          });
        }
      } catch {
        // Fallback: user can log in on the login page
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push('/admin');
      }, 2000);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error al procesar la invitación');
    } finally {
      setSubmitting(false);
    }
  };

  const roleInfo = invitation
    ? ROLE_LABELS[invitation.role] || {
        label: invitation.role,
        badgeClasses: 'bg-slate-800 text-slate-300 border-slate-700',
      }
    : null;

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-cyan-500 selection:text-slate-950 font-sans">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 shadow-xl shadow-cyan-500/20 mb-3">
            <Wrench className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">ElectroFix</h1>
          <p className="text-xs text-slate-400 mt-1">
            Sistema Integral de Gestión de Reparaciones & Laboratorio
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              <span className="text-xs font-medium">Validando token de invitación...</span>
            </div>
          ) : errorReason ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-800/80 text-rose-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Enlace de Invitación No Válido</h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{errorReason}</p>
              </div>

              <div className="pt-2">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition"
                >
                  Ir al Inicio de Sesión
                </Link>
              </div>
            </div>
          ) : isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">¡Bienvenido al Equipo!</h2>
                <p className="text-xs text-slate-300 mt-1">
                  Tu cuenta ha sido creada exitosamente con los permisos asignados.
                </p>
                <p className="text-[11px] text-cyan-400 font-medium mt-3">
                  Redirigiendo a tu espacio de trabajo...
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6 border-b border-slate-800 pb-5">
                <h2 className="text-lg font-bold text-white">Aceptar Invitación</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Crea tu contraseña de acceso para comenzar a operar.
                </p>

                {/* Assigned credentials review */}
                <div className="mt-4 p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Email registrado:</span>
                    <span className="font-semibold text-white">{invitation?.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Rol asignado:</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        roleInfo?.badgeClasses || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {roleInfo?.label}
                    </span>
                  </div>
                </div>
              </div>

              {formError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Contraseña (mínimo 8 caracteres):
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Confirmar Contraseña:
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Configurando cuenta...</span>
                    </>
                  ) : (
                    <>
                      <span>Activar Mi Cuenta</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-500 mt-6">
          ¿Ya posees una cuenta activa?{' '}
          <Link href="/auth/login" className="text-cyan-400 hover:underline">
            Iniciar Sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050811] flex items-center justify-center text-slate-400 text-xs font-medium">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
        </div>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  );
}

