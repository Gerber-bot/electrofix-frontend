'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Mail,
  UserPlus,
  Copy,
  Check,
  RefreshCw,
  ArrowLeft,
  Calendar,
  Shield,
  LayoutDashboard,
  Users,
  Activity,
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  ExternalLink,
  CreditCard,
  FileText,
  Sparkles,
} from 'lucide-react';
import { InvitationEntry } from '../../../../types/admin-suite';
import { UserRole } from '../../../../types/user';
import { fetchInvitations, createInvitation } from '../../../../lib/api';
import { createSupabaseBrowserClient } from '../../../../lib/supabase/client';
import AdminNav from '@/components/AdminNav';

const ROLE_INFO: Record<
  UserRole,
  { label: string; description: string; badgeClasses: string }
> = {
  admin: {
    label: 'Administrador',
    description: 'Acceso total: auditoría, finanzas, métricas y control de usuarios.',
    badgeClasses: 'bg-rose-950/80 text-rose-300 border-rose-800/70',
  },
  taller: {
    label: 'Jefe de Taller',
    description: 'Gestión técnica, inventario de repuestos, órdenes y asignación.',
    badgeClasses: 'bg-blue-950/80 text-blue-300 border-blue-800/70',
  },
  tecnico: {
    label: 'Técnico Especialista',
    description: 'Diagnósticos en banco de trabajo, reparaciones y control de calidad.',
    badgeClasses: 'bg-amber-950/80 text-amber-300 border-amber-800/70',
  },
  operador: {
    label: 'Operador / Recepción',
    description: 'Atención en mostrador, recepción de equipos, clientes y entregas.',
    badgeClasses: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/70',
  },
  cliente: {
    label: 'Cliente',
    description: 'Acceso exclusivo al seguimiento y confirmación de presupuestos.',
    badgeClasses: 'bg-slate-800 text-slate-300 border-slate-700',
  },
};

export default function InvitationsManagementPage() {
  const [invitations, setInvitations] = useState<InvitationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [roleInput, setRoleInput] = useState<UserRole>('tecnico');
  const [errorMsg, setErrorMsg] = useState('');
  const [createdInvite, setCreatedInvite] = useState<{
    email: string;
    role: string;
    token: string;
    inviteUrl: string;
  } | null>(null);

  // Clipboard copy feedback
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const getAuthToken = async (): Promise<string | undefined> => {
    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session?.access_token;
    } catch {
      return undefined;
    }
  };

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      const data = await fetchInvitations(token);
      setInvitations(data || []);
    } catch {
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setErrorMsg('Por favor introduce un correo electrónico válido');
      return;
    }

    try {
      setActionLoading(true);
      setErrorMsg('');
      const token = await getAuthToken();
      const result = await createInvitation(
        { email: emailInput.trim(), role: roleInput },
        token,
      );

      setCreatedInvite(result);
      await loadInvitations();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al generar la invitación');
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (urlOrToken: string, id: string) => {
    const fullUrl = urlOrToken.startsWith('http')
      ? urlOrToken
      : `${window.location.origin}/auth/invite/${urlOrToken}`;

    navigator.clipboard.writeText(fullUrl);
    setCopiedToken(id);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const metrics = useMemo(() => {
    return {
      total: invitations.length,
      active: invitations.filter((i) => i.status === 'active').length,
      used: invitations.filter((i) => i.status === 'used').length,
      expired: invitations.filter((i) => i.status === 'expired').length,
    };
  }, [invitations]);

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Unified Global Admin Navigation */}
      <AdminNav />

      {/* Page Title & Controls Bar */}
      <div className="border-b border-slate-800/80 bg-[#050811]/90 backdrop-blur-xl">
        <div className="max-w-[1780px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/users"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition shadow-sm"
              title="Volver a Gestión de Usuarios"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-slate-950 shadow-md shadow-amber-500/20">
              <Mail className="w-4 h-4 stroke-[2.5]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base text-white tracking-tight">
                  Invitaciones al Sistema
                </h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-800/70">
                  Onboarding Seguro
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Genera enlaces de invitación con expiración para incorporar nuevos miembros del equipo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadInvitations}
              title="Refrescar invitaciones"
              className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            <button
              onClick={() => {
                setCreatedInvite(null);
                setEmailInput('');
                setErrorMsg('');
                setShowModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl shadow-lg shadow-amber-500/20 transition hover:scale-[1.01] active:scale-95"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Nueva Invitación</span>
            </button>
          </div>
        </div>

        {/* Metrics Subbar */}
        <div className="border-t border-slate-900 bg-[#050811]/60 px-4 sm:px-6 py-2.5">
          <div className="max-w-[1780px] mx-auto flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Total invitaciones:</span>
              <span className="font-semibold text-white">{metrics.total}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-400">Activas:</span>
              <span className="font-semibold text-emerald-400">{metrics.active}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-slate-400">Aceptadas:</span>
              <span className="font-semibold text-blue-400">{metrics.used}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-slate-400">Expiradas:</span>
              <span className="font-semibold text-rose-400">{metrics.expired}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Table */}
      <main className="max-w-[1780px] w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col">
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm flex-1 flex flex-col justify-between">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold tracking-wider uppercase text-[11px]">
                  <th className="py-3 px-4">Correo Destinatario</th>
                  <th className="py-3 px-4">Rol Asignado</th>
                  <th className="py-3 px-4">Token de Seguridad</th>
                  <th className="py-3 px-4">Creada</th>
                  <th className="py-3 px-4">Expira</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Enlace / Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                        <span>Cargando invitaciones...</span>
                      </div>
                    </td>
                  </tr>
                ) : invitations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Mail className="w-8 h-8 text-slate-600 mb-1" />
                        <span className="text-slate-300 font-medium text-sm">
                          No hay invitaciones creadas
                        </span>
                        <span className="text-xs text-slate-500 max-w-sm">
                          Haz clic en &quot;+ Nueva Invitación&quot; para enviar un enlace de acceso
                          con rol asignado a técnicos u operadores.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  invitations.map((inv) => {
                    const roleConfig = ROLE_INFO[inv.role as UserRole] || {
                      label: inv.role,
                      badgeClasses: 'bg-slate-800 text-slate-400 border-slate-700',
                    };

                    const statusBadge =
                      inv.status === 'used'
                        ? {
                            label: 'Usada',
                            classes: 'bg-blue-950/90 text-blue-300 border-blue-800/80',
                          }
                        : inv.status === 'expired'
                        ? {
                            label: 'Expirada',
                            classes: 'bg-rose-950/90 text-rose-300 border-rose-800/80',
                          }
                        : {
                            label: 'Activa',
                            classes: 'bg-emerald-950/90 text-emerald-300 border-emerald-800/80',
                          };

                    const isCopied = copiedToken === inv.id;

                    return (
                      <tr key={inv.id} className="hover:bg-slate-800/40 transition group">
                        {/* Email */}
                        <td className="py-3.5 px-4 font-semibold text-white whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{inv.email}</span>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${roleConfig.badgeClasses}`}
                          >
                            {roleConfig.label}
                          </span>
                        </td>

                        {/* Token */}
                        <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap text-[11px]">
                          {inv.token.substring(0, 10)}...{inv.token.substring(inv.token.length - 6)}
                        </td>

                        {/* Created */}
                        <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                          {formatDate(inv.created_at)}
                        </td>

                        {/* Expires */}
                        <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>{formatDate(inv.expires_at)}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusBadge.classes}`}
                          >
                            {statusBadge.label}
                          </span>
                        </td>

                        {/* Link & Copy */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => copyToClipboard(inv.token, inv.id)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition"
                              title="Copiar enlace de invitación"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-400 font-medium">¡Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Copiar Enlace</span>
                                </>
                              )}
                            </button>

                            <Link
                              href={`/auth/invite/${inv.token}`}
                              target="_blank"
                              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                              title="Abrir enlace de invitación"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* New Invitation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-950/80 text-amber-300 border border-amber-800/60">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Generar Invitación a la Plataforma</h3>
                  <p className="text-xs text-slate-400">
                    Crea un pase seguro con rol predefinido válido por 48 horas
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* If invite was created, show copy success dialog */}
            {createdInvite ? (
              <div className="p-6 space-y-4">
                <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-800/80 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <h4 className="font-bold text-white text-sm">¡Invitación generada con éxito!</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Comparte el siguiente enlace con{' '}
                    <strong className="text-white">{createdInvite.email}</strong> para que
                    configure su contraseña y comience:
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2">
                  <input
                    type="text"
                    readOnly
                    value={createdInvite.inviteUrl}
                    className="bg-transparent text-xs text-cyan-300 font-mono flex-1 focus:outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(createdInvite.inviteUrl, 'modal-invite')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
                  >
                    {copiedToken === 'modal-invite' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition"
                  >
                    Listo, Cerrar
                  </button>
                </div>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Correo Electrónico del Destinatario:
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="tecnico@electrofix.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Rol en el Sistema:
                  </label>
                  <div className="space-y-2">
                    {(Object.keys(ROLE_INFO) as UserRole[])
                      .filter((r) => r !== 'cliente')
                      .map((roleKey) => {
                        const info = ROLE_INFO[roleKey];
                        const isSelected = roleInput === roleKey;
                        return (
                          <label
                            key={roleKey}
                            onClick={() => setRoleInput(roleKey)}
                            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                              isSelected
                                ? 'bg-amber-950/30 border-amber-500/80 shadow-md'
                                : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <input
                              type="radio"
                              name="role"
                              checked={isSelected}
                              onChange={() => setRoleInput(roleKey)}
                              className="mt-0.5 text-amber-500 focus:ring-0 cursor-pointer"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs text-white">
                                  {info.label}
                                </span>
                                <span
                                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${info.badgeClasses}`}
                                >
                                  {roleKey}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                                {info.description}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>
                    El token expira automáticamente a las 48 horas y solo permite un registro único.
                  </span>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Generando...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Generar Enlace</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
