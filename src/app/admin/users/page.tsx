'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Ban,
  Search,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Mail,
  Lock,
  UserCog,
  Sparkles,
  LayoutDashboard,
  Activity,
  CreditCard,
  FileText,
} from 'lucide-react';
import { UserItem, UserRole } from '../../../types/user';
import {
  fetchUsers,
  createUser,
  updateUserRole,
  disableUser,
  deleteUser,
} from '../../../lib/api';
import { createSupabaseBrowserClient } from '../../../lib/supabase/client';
import AdminNav from '@/components/AdminNav';

const ROLE_DEFINITIONS: Record<
  UserRole,
  { label: string; description: string; badgeClasses: string }
> = {
  admin: {
    label: 'Administrador',
    description: 'Acceso total al sistema, auditoría, finanzas y control de usuarios.',
    badgeClasses: 'bg-rose-950/80 text-rose-300 border-rose-800/70',
  },
  taller: {
    label: 'Jefe de Taller',
    description: 'Gestión completa de órdenes de reparación, catálogo y repuestos.',
    badgeClasses: 'bg-blue-950/80 text-blue-300 border-blue-800/70',
  },
  tecnico: {
    label: 'Técnico Especialista',
    description: 'Diagnóstico en banco de trabajo, informes técnicos y control de calidad.',
    badgeClasses: 'bg-amber-950/80 text-amber-300 border-amber-800/70',
  },
  operador: {
    label: 'Operador / Recepción',
    description: 'Recepción de equipos en mostrador, carga de clientes y entregas.',
    badgeClasses: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/70',
  },
  cliente: {
    label: 'Cliente',
    description: 'Acceso exclusivo al seguimiento público de sus equipos.',
    badgeClasses: 'bg-slate-800/90 text-slate-300 border-slate-700/80',
  },
};

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [suspendingUser, setSuspendingUser] = useState<UserItem | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);

  // Create form state
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('tecnico');

  // Edit role form state
  const [selectedRole, setSelectedRole] = useState<UserRole>('tecnico');

  // Toast feedback
  const [toast, setToast] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

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

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      const userList = await fetchUsers(token);
      setUsers(userList);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar usuarios';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newPassword) {
      showToast('Por favor completa todos los campos requeridos.', 'warning');
      return;
    }

    if (newPassword.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres.', 'warning');
      return;
    }

    try {
      setActionLoading(true);
      const token = await getAuthToken();
      const created = await createUser(
        {
          email: newEmail.trim().toLowerCase(),
          password: newPassword,
          role: newRole,
        },
        token,
      );

      setUsers((prev) => [created, ...prev.filter((u) => u.id !== created.id)]);
      setShowCreateModal(false);
      setNewEmail('');
      setNewPassword('');
      setNewRole('tecnico');
      showToast(`Usuario ${created.email} creado exitosamente.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al crear usuario';
      showToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setActionLoading(true);
      const token = await getAuthToken();
      const updated = await updateUserRole(editingUser.id, selectedRole, token);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setEditingUser(null);
      showToast(`Rol de ${editingUser.email} actualizado a "${ROLE_DEFINITIONS[selectedRole].label}".`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar rol';
      showToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisableUser = async () => {
    if (!suspendingUser) return;

    try {
      setActionLoading(true);
      const token = await getAuthToken();
      await disableUser(suspendingUser.id, token);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === suspendingUser.id
            ? { ...u, banned_until: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 100).toISOString() }
            : u,
        ),
      );
      setSuspendingUser(null);
      showToast(`Usuario ${suspendingUser.email} suspendido.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al suspender usuario';
      showToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    try {
      setActionLoading(true);
      const token = await getAuthToken();
      await deleteUser(deletingUser.id, token);
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      setDeletingUser(null);
      showToast(`Usuario ${deletingUser.email} eliminado definitivamente.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar usuario';
      showToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const email = u.email || '';
      const matchesSearch =
        !searchQuery.trim() || email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const metrics = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter((u) => u.role === 'admin').length,
      staff: users.filter((u) => u.role === 'taller' || u.role === 'tecnico' || u.role === 'operador').length,
      suspended: users.filter((u) => u.banned_until && new Date(u.banned_until) > new Date()).length,
    };
  }, [users]);

  const isBanned = (u: UserItem) => {
    return Boolean(u.banned_until && new Date(u.banned_until) > new Date());
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Unified Global Admin Navigation */}
      <AdminNav />

      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-[#050811]/90 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Brand & Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20">
              <Users className="w-4 h-4 stroke-[2.5]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base text-white tracking-tight">
                  Gestión de Usuarios y Roles (RBAC)
                </h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-800/70">
                  Control de Accesos
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Administración de credenciales, roles y permisos de seguridad en ElectroFix
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/admin/users/invite"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:text-white bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/50 rounded-xl transition shadow-sm"
              title="Gestionar Enlaces de Invitación"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>Invitaciones</span>
            </Link>

            <button
              onClick={loadUsers}
              title="Actualizar lista de usuarios"
              className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-xl shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01] active:scale-95"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Crear Usuario</span>
            </button>
          </div>
        </div>

        {/* Subheader: Metrics & Filters */}
        <div className="border-t border-slate-900 bg-[#050811]/60">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-4">
            {/* Key Metrics */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800/90">
                <span className="text-slate-400">Total Usuarios:</span>
                <span className="font-bold text-white">{metrics.total}</span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-300">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                <span>Administradores:</span>
                <span className="font-bold">{metrics.admins}</span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-cyan-300">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>Personal Técnico/Taller:</span>
                <span className="font-bold">{metrics.staff}</span>
              </div>

              {metrics.suspended > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-300">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>Suspendidos:</span>
                  <span className="font-bold">{metrics.suspended}</span>
                </div>
              )}
            </div>

            {/* Search & Role Filter */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="relative min-w-[240px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar por email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0B1120] border border-slate-800 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-[#0B1120] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition"
              >
                <option value="ALL">Todos los roles</option>
                <option value="admin">Administrador</option>
                <option value="taller">Jefe de Taller</option>
                <option value="tecnico">Técnico</option>
                <option value="operador">Operador</option>
                <option value="cliente">Cliente</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Discrete Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl border shadow-2xl flex items-center gap-3 text-xs font-semibold backdrop-blur-xl ${
              toast.type === 'error'
                ? 'bg-rose-950/95 border-rose-500/50 text-rose-200'
                : toast.type === 'warning'
                  ? 'bg-amber-950/95 border-amber-500/50 text-amber-200'
                  : 'bg-slate-900/95 border-cyan-500/50 text-cyan-100'
            }`}
          >
            {toast.type === 'error' ? (
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            ) : toast.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6">
        <div className="bg-[#0B1120] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#050811]/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th scope="col" className="px-6 py-3.5">
                    Usuario / Email
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Rol asignado
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Fecha de Alta
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                        <span>Cargando directorio de usuarios...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="w-8 h-8 opacity-40 text-slate-600" />
                        <p className="text-sm font-medium">No se encontraron usuarios</p>
                        <p className="text-xs text-slate-600">
                          {searchQuery || roleFilter !== 'ALL'
                            ? 'Intenta ajustar los filtros de búsqueda'
                            : 'Crea el primer usuario haciendo clic en "+ Crear Usuario"'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const roleInfo = ROLE_DEFINITIONS[user.role] || ROLE_DEFINITIONS.cliente;
                    const banned = isBanned(user);

                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-slate-900/40 transition duration-150 group"
                      >
                        {/* Email / ID */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700/60 flex items-center justify-center text-slate-300 font-bold text-xs uppercase shrink-0">
                              {user.email ? user.email.charAt(0) : 'U'}
                            </div>
                            <div>
                              <span className="font-semibold text-white block text-sm">
                                {user.email || 'Sin email registrado'}
                              </span>
                              <span className="font-mono text-[10px] text-slate-500">
                                ID: {user.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Role Badge */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${roleInfo.badgeClasses}`}
                          >
                            <Shield className="w-3 h-3" />
                            {roleInfo.label}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          {banned ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-950/80 text-rose-300 border border-rose-800/70">
                              <Ban className="w-3 h-3 text-rose-400" />
                              Suspendido
                            </span>
                          ) : user.email_confirmed_at ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/70">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/70">
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                              Pendiente
                            </span>
                          )}
                        </td>

                        {/* Created At */}
                        <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">
                          {user.created_at
                            ? new Date(user.created_at).toLocaleDateString('es-AR', {
                                year: 'numeric',
                                month: 'short',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'N/A'}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Edit Role Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingUser(user);
                                setSelectedRole(user.role);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-medium inline-flex items-center gap-1.5 transition"
                              title="Cambiar rol de usuario"
                            >
                              <UserCog className="w-3.5 h-3.5 text-cyan-400" />
                              <span className="hidden sm:inline">Rol</span>
                            </button>

                            {/* Suspend Button */}
                            {!banned && (
                              <button
                                type="button"
                                onClick={() => setSuspendingUser(user)}
                                className="p-1.5 rounded-lg bg-amber-950/30 hover:bg-amber-900/60 text-amber-400 border border-amber-800/50 transition"
                                title="Suspender acceso de usuario"
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => setDeletingUser(user)}
                              className="p-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/60 text-rose-400 border border-rose-800/50 transition"
                              title="Eliminar usuario definitivamente"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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

      {/* Modal: Crear Usuario */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0B1120] border border-slate-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl shadow-black/80 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Crear Nuevo Usuario</h2>
                  <p className="text-xs text-slate-400">
                    Asigna credenciales y permisos en el sistema
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="ejemplo@electrofix.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-[#050811] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Contraseña Inicial
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#050811] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Rol y Nivel de Acceso
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
                  {(Object.keys(ROLE_DEFINITIONS) as UserRole[]).map((roleKey) => {
                    const info = ROLE_DEFINITIONS[roleKey];
                    const isSelected = newRole === roleKey;
                    return (
                      <div
                        key={roleKey}
                        onClick={() => setNewRole(roleKey)}
                        className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-500/60 ring-1 ring-cyan-500/40'
                            : 'bg-[#050811] border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="newRole"
                          checked={isSelected}
                          onChange={() => setNewRole(roleKey)}
                          className="mt-0.5 text-cyan-500 focus:ring-cyan-400"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-white">
                              {info.label}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${info.badgeClasses}`}
                            >
                              {roleKey}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {info.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-xl shadow-lg shadow-cyan-500/20 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creando...</span>
                    </>
                  ) : (
                    <span>Crear Usuario</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cambiar Rol */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0B1120] border border-slate-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl shadow-black/80 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                  <UserCog className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Modificar Rol de Usuario</h2>
                  <p className="text-xs text-slate-400 truncate max-w-xs">{editingUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateRole} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Selecciona el nuevo rol:
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
                  {(Object.keys(ROLE_DEFINITIONS) as UserRole[]).map((roleKey) => {
                    const info = ROLE_DEFINITIONS[roleKey];
                    const isSelected = selectedRole === roleKey;
                    return (
                      <div
                        key={roleKey}
                        onClick={() => setSelectedRole(roleKey)}
                        className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-500/60 ring-1 ring-cyan-500/40'
                            : 'bg-[#050811] border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="selectedRole"
                          checked={isSelected}
                          onChange={() => setSelectedRole(roleKey)}
                          className="mt-0.5 text-cyan-500 focus:ring-cyan-400"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-white">
                              {info.label}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${info.badgeClasses}`}
                            >
                              {roleKey}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {info.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-xl shadow-lg shadow-cyan-500/20 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Actualizar Rol</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Suspender Usuario */}
      {suspendingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0B1120] border border-amber-800/60 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-950 text-amber-400 border border-amber-800/60">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">¿Suspender usuario?</h3>
                <p className="text-xs text-slate-400">Esta acción bloqueará sus accesos al sistema</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-[#050811] p-3 rounded-xl border border-slate-800">
              El usuario <strong className="text-white">{suspendingUser.email}</strong> ya no podrá
              iniciar sesión ni acceder a ninguna sección del laboratorio.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSuspendingUser(null)}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDisableUser}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-xl transition flex items-center gap-2 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Confirmar Suspensión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Eliminar Usuario */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0B1120] border border-rose-800/60 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-950 text-rose-400 border border-rose-800/60">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">¿Eliminar definitivamente?</h3>
                <p className="text-xs text-slate-400">Esta acción es irreversible</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-[#050811] p-3 rounded-xl border border-slate-800">
              Se eliminará por completo la cuenta y las identidades de{' '}
              <strong className="text-white">{deletingUser.email}</strong>.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition flex items-center gap-2 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Eliminar Usuario</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
