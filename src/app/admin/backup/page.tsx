'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Database,
  Archive,
  Download,
  FileCode,
  Wrench,
  Users,
  CreditCard,
  Receipt,
  Shield,
  Mail,
  LayoutDashboard,
  Server,
  RefreshCw,
  CheckCircle2,
  Clock,
  HardDrive,
  ShieldCheck,
  Sparkles,
  FileJson,
  Check,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import AdminNav from '@/components/AdminNav';
import {
  fetchBackupHistory,
  downloadBackupFile,
  getBackupDownloadUrl,
} from '../../../lib/api';
import { createSupabaseBrowserClient } from '../../../lib/supabase/client';
import type { AuditLogEntry } from '../../../types/admin-suite';

const GRANULAR_MODULES = [
  {
    id: 'tickets',
    title: 'Tickets & Órdenes',
    description: 'Órdenes de servicio, datos de clientes, números de serie, diagnósticos técnicos y notas de QC.',
    icon: Wrench,
    accentBorder: 'border-cyan-500/30 hover:border-cyan-500/60',
    iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    btnClass: 'bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 border-cyan-500/40',
  },
  {
    id: 'users',
    title: 'Usuarios & Permisos',
    description: 'Directorio del personal y clientes con roles RBAC asignados, sanitizados sin hashes ni contraseñas.',
    icon: Users,
    accentBorder: 'border-indigo-500/30 hover:border-indigo-500/60',
    iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    btnClass: 'bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 border-indigo-500/40',
  },
  {
    id: 'payments',
    title: 'Pagos & Movimientos de Caja',
    description: 'Movimientos de caja, pagos en efectivo, transferencias, Mercado Pago y estados de cobro.',
    icon: CreditCard,
    accentBorder: 'border-emerald-500/30 hover:border-emerald-500/60',
    iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    btnClass: 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border-emerald-500/40',
  },
  {
    id: 'invoices',
    title: 'Facturas Emitidas',
    description: 'Comprobantes fiscales emitidos, correlatividades, datos tributarios CUIT/DNI e importes totales.',
    icon: Receipt,
    accentBorder: 'border-blue-500/30 hover:border-blue-500/60',
    iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    btnClass: 'bg-blue-500/15 text-blue-300 hover:bg-blue-500/25 border-blue-500/40',
  },
  {
    id: 'audit',
    title: 'Registros de Auditoría',
    description: 'Trazabilidad completa e inmutable de eventos operacionales, cambios de estado y acciones administrativas.',
    icon: Shield,
    accentBorder: 'border-purple-500/30 hover:border-purple-500/60',
    iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    btnClass: 'bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 border-purple-500/40',
  },
  {
    id: 'invitations',
    title: 'Invitaciones del Personal',
    description: 'Tokens de acceso temporal para onboarding de técnicos y personal con fecha de expiración.',
    icon: Mail,
    accentBorder: 'border-amber-500/30 hover:border-amber-500/60',
    iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    btnClass: 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border-amber-500/40',
  },
  {
    id: 'dashboard',
    title: 'Métricas del Dashboard',
    description: 'Instantánea de métricas clave, productividad por técnico, ingresos estimados y tiempos medios.',
    icon: LayoutDashboard,
    accentBorder: 'border-rose-500/30 hover:border-rose-500/60',
    iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    btnClass: 'bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border-rose-500/40',
  },
  {
    id: 'config',
    title: 'Configuración del Sistema',
    description: 'Metadatos del tenant, catálogos de precios activos, versión de ElectroFix OS y entorno operativo.',
    icon: Server,
    accentBorder: 'border-teal-500/30 hover:border-teal-500/60',
    iconBg: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    btnClass: 'bg-teal-500/15 text-teal-300 hover:bg-teal-500/25 border-teal-500/40',
  },
];

function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return 'Sin respaldos registrados';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diffSec < 60) return 'Hace instantes';
    if (diffSec < 3600) return `Hace ${Math.floor(diffSec / 60)} min`;
    if (diffSec < 86400) return `Hace ${Math.floor(diffSec / 3600)} h`;
    return `Hace ${Math.floor(diffSec / 86400)} días`;
  } catch {
    return 'Reciente';
  }
}

export default function BackupPage() {
  const [history, setHistory] = useState<AuditLogEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [downloadingModule, setDownloadingModule] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

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

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const token = await getAuthToken();
      const data = await fetchBackupHistory(token);
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Error loading backup history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDownload = async (module: string, format: 'zip' | 'json' = 'json') => {
    const actionKey = `${module}-${format}`;
    setDownloadingModule(actionKey);
    setFeedbackMessage(null);

    try {
      const token = await getAuthToken();
      await downloadBackupFile(module, format, token);
      setFeedbackMessage({
        type: 'success',
        text: `Respaldo (${format.toUpperCase()}) generado y descargado correctamente.`,
      });
      // Refresh history to reflect newly logged backup action
      setTimeout(() => {
        loadHistory();
      }, 1000);
    } catch (err) {
      console.error('Download backup error:', err);
      // Fallback: try direct browser navigation if fetch blob was blocked
      try {
        const url = getBackupDownloadUrl(module, format);
        window.open(url, '_blank');
        setFeedbackMessage({
          type: 'success',
          text: `Descarga iniciada mediante enlace directo.`,
        });
      } catch (fallbackErr) {
        setFeedbackMessage({
          type: 'error',
          text: err instanceof Error ? err.message : 'Error al procesar el respaldo.',
        });
      }
    } finally {
      setDownloadingModule(null);
    }
  };

  // Compute last backup info from history
  const lastBackup = useMemo(() => {
    if (!history || history.length === 0) return null;
    return history[0];
  }, [history]);

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Global Navigation Bar */}
      <AdminNav
        title="ElectroFix Backup Center"
        subtitle="Centro de Respaldos Criptográficos & Exportación Maestra"
        badge="DISASTER RECOVERY"
        badgeColor="from-cyan-500 via-indigo-500 to-purple-600"
      />

      <main className="flex-1 max-w-[1780px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Hero Section */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-br from-[#0B1120] via-[#070D1D] to-[#050811] p-6 sm:p-8 shadow-2xl shadow-black/60">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950/70 border border-cyan-800/70 text-cyan-300 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Seguridad de Datos & Replicación</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/70 border border-emerald-800/70 text-emerald-300 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Prisma & Supabase Conectados</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <Database className="w-8 h-8 sm:w-9 sm:h-9 text-cyan-400 stroke-[2.2]" />
                <span>Centro de Respaldos & Exportación</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-400 max-w-3xl leading-relaxed">
                Genere copias de seguridad portátiles multi-colección comprimidas en ZIP, exportaciones maestras JSON para replicación de base de datos o descargas granulares con registro de auditoría en tiempo real.
              </p>
            </div>

            {/* Quick Metrics / Status Widget */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 self-start lg:self-center shrink-0">
              <div className="px-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Último Respaldo</span>
                </div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {lastBackup
                    ? formatRelativeTime(lastBackup.created_at)
                    : 'Sin registros'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {lastBackup ? formatDate(lastBackup.created_at) : 'Listo para iniciar'}
                </div>
              </div>

              <button
                type="button"
                onClick={loadHistory}
                disabled={loadingHistory}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition shadow-sm disabled:opacity-50"
                title="Recargar historial de respaldos"
              >
                <RefreshCw className={`w-4 h-4 ${loadingHistory ? 'animate-spin text-cyan-400' : ''}`} />
                <span className="text-xs font-semibold">Refrescar</span>
              </button>
            </div>
          </div>

          {/* Feedback Banner */}
          {feedbackMessage && (
            <div
              className={`mt-6 p-4 rounded-2xl border text-sm flex items-center gap-3 transition ${
                feedbackMessage.type === 'success'
                  ? 'bg-emerald-950/50 border-emerald-800/80 text-emerald-200'
                  : 'bg-rose-950/50 border-rose-800/80 text-rose-200'
              }`}
            >
              {feedbackMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <span className="flex-1 font-medium">{feedbackMessage.text}</span>
              <button
                onClick={() => setFeedbackMessage(null)}
                className="text-xs uppercase tracking-wider font-bold opacity-70 hover:opacity-100"
              >
                Cerrar
              </button>
            </div>
          )}
        </section>

        {/* Master Action Cards */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-cyan-400" />
                <span>Respaldos Completos del Sistema</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Paquetes maestros que engloban todos los esquemas, tablas operativas y registros en un solo click.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: ZIP Completo */}
            <div className="relative group rounded-3xl border border-cyan-500/30 bg-[#0B1120] p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-xl shadow-cyan-950/20 hover:border-cyan-500/60 transition duration-300">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition duration-300 pointer-events-none">
                <Archive className="w-36 h-36 text-cyan-400" />
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                    <Archive className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-800/70">
                    RECOMENDADO / 1-CLICK
                  </span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    Respaldo Completo en ZIP
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
                    Genera un contenedor compreso ZIP de alta tasa que incluye todos los archivos de colecciones individuales más el manifiesto con sumas de verificación.
                  </p>
                </div>

                {/* Features list */}
                <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Incluye 8 colecciones JSON + <code className="text-cyan-300 font-mono">manifest.json</code></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Compresión DEFLATE nivel 9 nativa en memoria (sin dependencias binarias)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Apto para almacenamiento fuera de sitio y auditorías periódicas</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 relative z-10">
                <button
                  type="button"
                  onClick={() => handleDownload('zip', 'zip')}
                  disabled={downloadingModule === 'zip-zip'}
                  className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/25 transition transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloadingModule === 'zip-zip' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Comprimiendo colecciones...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-white" />
                      <span>Descargar Respaldo ZIP (.zip)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Card 2: JSON Maestro */}
            <div className="relative group rounded-3xl border border-indigo-500/30 bg-[#0B1120] p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-xl shadow-indigo-950/20 hover:border-indigo-500/60 transition duration-300">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition duration-300 pointer-events-none">
                <FileCode className="w-36 h-36 text-indigo-400" />
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                    <FileJson className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-950/90 text-indigo-300 border border-indigo-800/70">
                    DATABASE REPLICATION
                  </span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    Exportación Maestra JSON
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
                    Estructura monolítica unificada en formato JSON compatible con pipelines de replicación de bases de datos, seeds de Prisma y scripts de restauración automatizada.
                  </p>
                </div>

                {/* Features list */}
                <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Estructura con cabecera de versión, entorno y datos sanitizados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Formato estándar JSON legible por humanos o herramientas CLI</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Inclusión directa de catálogos y configuración de tenant</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 relative z-10">
                <button
                  type="button"
                  onClick={() => handleDownload('all', 'json')}
                  disabled={downloadingModule === 'all-json'}
                  className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-400 hover:to-pink-500 text-white shadow-lg shadow-indigo-500/25 transition transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloadingModule === 'all-json' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Extrayendo base de datos...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-white" />
                      <span>Descargar Master JSON (.json)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Granular Module Grid */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span>Exportación Granular por Módulo</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Descargue archivos JSON independientes de cada colección para auditorías focalizadas o importaciones parciales.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
              8 Módulos Disponibles
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {GRANULAR_MODULES.map((mod) => {
              const Icon = mod.icon;
              const isDownloading = downloadingModule === `${mod.id}-json`;

              return (
                <div
                  key={mod.id}
                  className={`rounded-2xl border ${mod.accentBorder} bg-[#0B1120] p-5 flex flex-col justify-between transition duration-200 shadow-md shadow-black/40 hover:-translate-y-0.5`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2.5 rounded-xl border ${mod.iconBg}`}>
                        <Icon className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded-md border border-slate-800">
                        {mod.id}.json
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-white text-base">
                        {mod.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-3">
                        {mod.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => handleDownload(mod.id, 'json')}
                      disabled={isDownloading}
                      className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition ${mod.btnClass} disabled:opacity-50`}
                    >
                      {isDownloading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Descargando...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Descargar JSON</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Historial de Backups (BackupHistory) */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                <span>Historial de Respaldos Realizados</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Bitácora criptográfica e inmutable registrada automáticamente por AuditService en cada evento de exportación.
              </p>
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-2 self-start sm:self-auto">
              <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 font-medium">
                {history.length} {history.length === 1 ? 'evento registrado' : 'eventos registrados'}
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800/80 bg-[#0B1120] overflow-hidden shadow-xl shadow-black/50">
            {loadingHistory ? (
              <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                <span className="text-sm font-medium">Cargando bitácora de auditoría...</span>
              </div>
            ) : history.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 flex items-center justify-center mx-auto">
                  <Archive className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Sin respaldos previos registrados</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Utilice las opciones superiores de Respaldo Completo ZIP o Exportación Granular para generar la primera copia de seguridad. Cada evento quedará auditado aquí.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#070D1D] text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="px-5 py-3.5 font-bold">Fecha / Hora</th>
                      <th className="px-5 py-3.5 font-bold">Actor</th>
                      <th className="px-5 py-3.5 font-bold">Módulo / Colección</th>
                      <th className="px-5 py-3.5 font-bold">Formato</th>
                      <th className="px-5 py-3.5 font-bold">Registros</th>
                      <th className="px-5 py-3.5 font-bold">Tamaño</th>
                      <th className="px-5 py-3.5 font-bold">Estado</th>
                      <th className="px-5 py-3.5 font-bold text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {history.map((log) => {
                      const meta = log.metadata || {};
                      const format = (meta.format as string) || (log.entity_id?.includes('zip') ? 'zip' : 'json');
                      const moduleName = (meta.module as string) || log.entity_id || 'all';
                      const recordCount = meta.recordCount ?? '-';
                      const sizeBytes = meta.sizeBytes ? formatBytes(meta.sizeBytes) : '-';

                      return (
                        <tr
                          key={log.id}
                          className="hover:bg-slate-900/50 transition duration-150 group"
                        >
                          {/* Fecha / Hora */}
                          <td className="px-5 py-4 whitespace-nowrap text-slate-300">
                            <div className="font-semibold text-white">
                              {formatDate(log.created_at)}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {formatRelativeTime(log.created_at)}
                            </div>
                          </td>

                          {/* Actor */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-medium text-slate-300">
                                {log.role ? log.role.toUpperCase() : 'ADMIN'}
                              </span>
                            </div>
                            {log.user_id && (
                              <div className="text-[10px] text-slate-500 font-mono">
                                ID: {log.user_id.slice(0, 8)}...
                              </div>
                            )}
                          </td>

                          {/* Módulo / Colección */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-800/80 border border-slate-700 text-slate-200">
                              {moduleName === 'all'
                                ? 'Completo (Master)'
                                : moduleName.toUpperCase()}
                            </span>
                          </td>

                          {/* Formato */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                                format === 'zip'
                                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800/70'
                                  : 'bg-indigo-950/80 text-indigo-300 border-indigo-800/70'
                              }`}
                            >
                              {format}
                            </span>
                          </td>

                          {/* Registros */}
                          <td className="px-5 py-4 whitespace-nowrap font-mono text-slate-300">
                            {typeof recordCount === 'number'
                              ? recordCount.toLocaleString('es-AR')
                              : recordCount}
                          </td>

                          {/* Tamaño */}
                          <td className="px-5 py-4 whitespace-nowrap font-mono text-cyan-300 font-medium">
                            {sizeBytes}
                          </td>

                          {/* Estado */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-800/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span>Completado</span>
                            </span>
                          </td>

                          {/* Acción */}
                          <td className="px-5 py-4 whitespace-nowrap text-right">
                            <button
                              type="button"
                              onClick={() => handleDownload(moduleName, format === 'zip' ? 'zip' : 'json')}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                              title="Re-descargar este módulo"
                            >
                              <Download className="w-3 h-3 text-cyan-400" />
                              <span>Descargar</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer System Disclaimer */}
      <footer className="border-t border-slate-800/60 py-6 mt-12 bg-[#050811]/90">
        <div className="max-w-[1780px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-500" />
            <span>ElectroFix Respaldo & Replicación Criptográfica • Cumplimiento RBAC Taller/Admin</span>
          </div>
          <div>
            <span>ElectroFix OS v1.0.0 • Entorno Protegido</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
