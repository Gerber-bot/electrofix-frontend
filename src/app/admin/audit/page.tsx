'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Activity,
  Search,
  Filter,
  Calendar,
  RefreshCw,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Code,
  Shield,
  Clock,
  User,
  LayoutDashboard,
  Users,
  Mail,
  CreditCard,
  FileText,
  Sparkles,
} from 'lucide-react';
import { AuditLogEntry, AuditLogsResponse } from '../../../types/admin-suite';
import { fetchAuditLogs } from '../../../lib/api';
import { createSupabaseBrowserClient } from '../../../lib/supabase/client';
import AdminNav from '@/components/AdminNav';

const ROLE_BADGES: Record<string, { label: string; badgeClasses: string }> = {
  admin: {
    label: 'Administrador',
    badgeClasses: 'bg-rose-950/80 text-rose-300 border-rose-800/70',
  },
  taller: {
    label: 'Jefe de Taller',
    badgeClasses: 'bg-blue-950/80 text-blue-300 border-blue-800/70',
  },
  tecnico: {
    label: 'Técnico',
    badgeClasses: 'bg-amber-950/80 text-amber-300 border-amber-800/70',
  },
  operador: {
    label: 'Operador',
    badgeClasses: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/70',
  },
  cliente: {
    label: 'Cliente',
    badgeClasses: 'bg-slate-800 text-slate-300 border-slate-700',
  },
  system: {
    label: 'Sistema',
    badgeClasses: 'bg-purple-950/80 text-purple-300 border-purple-800/70',
  },
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const limit = 15;

  const [loading, setLoading] = useState(true);
  const [searchAction, setSearchAction] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Detail Modal
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

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

  const loadAuditLogs = async (currentPage = page) => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      const res: AuditLogsResponse = await fetchAuditLogs(
        {
          role: selectedRole === 'ALL' ? undefined : selectedRole,
          action: searchAction.trim() || undefined,
          startDate: startDate || undefined,
          endDate: endDate ? `${endDate}T23:59:59Z` : undefined,
          page: currentPage,
          limit,
        },
        token,
      );

      setLogs(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
      setPage(currentPage);
    } catch {
      // In case of error, set fallback empty
      setLogs([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRole, startDate, endDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadAuditLogs(1);
  };

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Unified Global Admin Navigation */}
      <AdminNav />

      {/* Page Title & Controls Bar */}
      <div className="border-b border-slate-800/80 bg-[#050811]/90 backdrop-blur-xl">
        <div className="max-w-[1780px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20">
              <Activity className="w-4 h-4 stroke-[2.5]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base text-white tracking-tight">
                  Registro de Auditoría y Trazabilidad
                </h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-950/90 text-purple-300 border border-purple-800/70">
                  Compliance & Seguridad
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Historial inmutable de eventos, mutaciones y acciones administrativas en tiempo real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadAuditLogs(page)}
              title="Refrescar auditoría"
              className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="border-t border-slate-900 bg-[#050811]/70 px-4 sm:px-6 py-3">
          <div className="max-w-[1780px] mx-auto flex flex-wrap items-center justify-between gap-3">
            {/* Search form */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[260px] max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchAction}
                onChange={(e) => setSearchAction(e.target.value)}
                placeholder="Buscar por acción o endpoint (ej. POST, /tickets)..."
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
              />
            </form>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Role filter */}
              <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] text-slate-400">Rol:</span>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="bg-transparent text-xs text-slate-200 focus:outline-none font-medium cursor-pointer"
                >
                  <option value="ALL" className="bg-slate-900 text-slate-100">
                    Todos los Roles
                  </option>
                  <option value="admin" className="bg-slate-900 text-slate-100">
                    Administrador
                  </option>
                  <option value="taller" className="bg-slate-900 text-slate-100">
                    Jefe de Taller
                  </option>
                  <option value="tecnico" className="bg-slate-900 text-slate-100">
                    Técnico
                  </option>
                  <option value="operador" className="bg-slate-900 text-slate-100">
                    Operador
                  </option>
                </select>
              </div>

              {/* Date Filters */}
              <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] text-slate-400">Desde:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer [color-scheme:dark]"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] text-slate-400">Hasta:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer [color-scheme:dark]"
                />
              </div>

              {(searchAction || selectedRole !== 'ALL' || startDate || endDate) && (
                <button
                  onClick={() => {
                    setSearchAction('');
                    setSelectedRole('ALL');
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="px-2.5 py-1.5 text-xs text-purple-300 hover:text-white bg-purple-950/60 border border-purple-800/60 rounded-xl transition"
                >
                  Limpiar Filtros
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <main className="max-w-[1780px] w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col">
        {/* Table summary stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>
              Total de eventos registrados:{' '}
              <strong className="text-white font-semibold">{total}</strong>
            </span>
          </div>

          <div className="text-xs text-slate-400">
            Página <span className="text-white font-medium">{page}</span> de{' '}
            <span className="text-white font-medium">{totalPages}</span>
          </div>
        </div>

        {/* Audit Table */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm flex-1 flex flex-col justify-between">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold tracking-wider uppercase text-[11px]">
                  <th className="py-3 px-4">Fecha y Hora</th>
                  <th className="py-3 px-4">Usuario / Actor</th>
                  <th className="py-3 px-4">Rol</th>
                  <th className="py-3 px-4">Acción Ejecutada</th>
                  <th className="py-3 px-4">Entidad</th>
                  <th className="py-3 px-4">ID Recurso</th>
                  <th className="py-3 px-4 text-right">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
                        <span>Cargando registros de auditoría...</span>
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Activity className="w-8 h-8 text-slate-600 mb-1" />
                        <span className="text-slate-300 font-medium text-sm">
                          No se encontraron eventos de auditoría
                        </span>
                        <span className="text-xs text-slate-500 max-w-sm">
                          Las operaciones del sistema, altas de tickets, cambios de estado y
                          modificaciones de usuarios se registrarán automáticamente aquí.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const roleConfig = ROLE_BADGES[log.role?.toLowerCase() || ''] || {
                      label: log.role || 'Sin Rol',
                      badgeClasses: 'bg-slate-800 text-slate-400 border-slate-700',
                    };

                    const isError = log.action.includes('[FAILED]');

                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-slate-800/40 transition group"
                      >
                        {/* Timestamp */}
                        <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>{formatDate(log.created_at)}</span>
                          </div>
                        </td>

                        {/* Actor */}
                        <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-[10px] font-bold">
                              <User className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-mono text-[11px] text-slate-300 max-w-[140px] truncate" title={log.user_id || 'Sistema'}>
                              {log.user_id ? log.user_id.substring(0, 12) + '...' : 'Sistema / Anónimo'}
                            </span>
                          </div>
                        </td>

                        {/* Role badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${roleConfig.badgeClasses}`}
                          >
                            {roleConfig.label}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 font-medium text-white whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-md font-mono text-[11px] ${
                              isError
                                ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80'
                                : 'bg-slate-800 text-slate-200'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>

                        {/* Entity */}
                        <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap font-medium">
                          <span className="text-purple-300 bg-purple-950/50 px-2 py-0.5 rounded border border-purple-900/60">
                            {log.entity}
                          </span>
                        </td>

                        {/* Entity ID */}
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                          {log.entity_id ? log.entity_id.substring(0, 14) + (log.entity_id.length > 14 ? '...' : '') : '—'}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                          >
                            <Eye className="w-3.5 h-3.5 text-purple-400" />
                            <span>Ver detalles</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="border-t border-slate-800/80 bg-slate-950/60 px-4 py-3 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              Mostrando registros de la página {page} de {totalPages}
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1 || loading}
                onClick={() => loadAuditLogs(page - 1)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-300 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 rounded-xl transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>

              <button
                disabled={page >= totalPages || loading}
                onClick={() => loadAuditLogs(page + 1)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-300 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 rounded-xl transition"
              >
                <span>Siguiente</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* JSON Metadata Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-950/80 text-purple-300 border border-purple-800/60">
                  <Code className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Detalles del Evento de Auditoría</h3>
                  <p className="text-xs text-slate-400 font-mono">ID: {selectedLog.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/50 p-3 rounded-xl border border-slate-800/70">
                <div>
                  <span className="text-slate-500 block mb-0.5">Acción</span>
                  <span className="font-semibold text-white font-mono">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Entidad</span>
                  <span className="font-semibold text-purple-300">{selectedLog.entity}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Usuario / Actor</span>
                  <span className="font-mono text-slate-300">{selectedLog.user_id || 'Sistema'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Rol</span>
                  <span className="font-medium text-slate-300">{selectedLog.role || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Fecha y Hora</span>
                  <span className="text-slate-300">{formatDate(selectedLog.created_at)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">ID de Recurso</span>
                  <span className="font-mono text-slate-300">{selectedLog.entity_id || '—'}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                  Metadatos y Carga Útil (JSON):
                </span>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 overflow-x-auto">
                  <pre className="text-xs font-mono text-cyan-300">
                    {selectedLog.metadata
                      ? JSON.stringify(selectedLog.metadata, null, 2)
                      : '// Sin metadatos adicionales registrados'}
                  </pre>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
