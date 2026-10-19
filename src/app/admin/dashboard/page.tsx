'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Shield,
  Users,
  Mail,
  Activity,
  RefreshCw,
  ArrowLeft,
  Wrench,
  Clock,
  Sparkles,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Calendar,
  BarChart3,
  PieChart,
  Layers,
  ArrowUpRight,
  Flame,
  CreditCard,
  FileText,
} from 'lucide-react';
import {
  DashboardMetricsData,
  DashboardChartsData,
  AuditLogEntry,
} from '../../../types/admin-suite';
import {
  fetchDashboardMetrics,
  fetchDashboardCharts,
  fetchAuditLogs,
} from '../../../lib/api';
import { createSupabaseBrowserClient } from '../../../lib/supabase/client';
import AdminNav from '@/components/AdminNav';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetricsData | null>(null);
  const [charts, setCharts] = useState<DashboardChartsData | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | '7days' | 'month'>('7days');

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

  const loadData = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      const [m, c, logsRes] = await Promise.all([
        fetchDashboardMetrics(token).catch(() => null),
        fetchDashboardCharts(token).catch(() => null),
        fetchAuditLogs({ limit: 6 }, token).catch(() => ({ data: [] })),
      ]);

      if (m) setMetrics(m);
      if (c) setCharts(c);
      if (logsRes?.data) setRecentLogs(logsRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Format currencies
  const formatCurrency = (val?: number) => {
    if (val === undefined || isNaN(val)) return '$0';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // SVG Area / Line Chart calculations
  const lineChartData = useMemo(() => {
    if (!charts?.ticketsByDay || charts.ticketsByDay.length === 0) return null;
    const data =
      timeRange === 'today'
        ? charts.ticketsByDay.slice(-1)
        : timeRange === '7days'
        ? charts.ticketsByDay.slice(-7)
        : charts.ticketsByDay;

    const maxCount = Math.max(...data.map((d) => d.count), 5);
    const width = 600;
    const height = 180;
    const padding = 25;

    const points = data.map((d, index) => {
      const x = padding + (index / (Math.max(1, data.length - 1))) * (width - 2 * padding);
      const y = height - padding - (d.count / maxCount) * (height - 2 * padding);
      return { x, y, ...d };
    });

    const pathD = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    const areaD =
      points.length > 0
        ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${
            height - padding
          } Z`
        : '';

    return { points, pathD, areaD, width, height, maxCount };
  }, [charts, timeRange]);

  // Hourly distribution max for height scaling
  const maxHourlyCount = useMemo(() => {
    if (!charts?.hourlyDistribution) return 1;
    return Math.max(...charts.hourlyDistribution.map((h) => h.count), 1);
  }, [charts]);

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Unified Global Admin Navigation */}
      <AdminNav />

      {/* Page Title & Controls Bar */}
      <div className="border-b border-slate-800/80 bg-[#050811]/90 backdrop-blur-xl">
        <div className="max-w-[1780px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <LayoutDashboard className="w-4 h-4 stroke-[2.5]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base text-white tracking-tight">
                  Panel de Métricas & Dashboard de Rendimiento
                </h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-950/90 text-blue-300 border border-blue-800/70">
                  Analytics & KPIs
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Monitoreo operacional, productividad técnica, facturación estimada y flujo de trabajo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              title="Refrescar métricas"
              className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Date Range Subbar */}
        <div className="border-t border-slate-900 bg-[#050811]/60 px-4 sm:px-6 py-2.5">
          <div className="max-w-[1780px] mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>Periodo de visualización:</span>
            </div>

            <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-0.5 rounded-xl">
              <button
                onClick={() => setTimeRange('today')}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
                  timeRange === 'today'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Hoy
              </button>
              <button
                onClick={() => setTimeRange('7days')}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
                  timeRange === '7days'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Últimos 7 días
              </button>
              <button
                onClick={() => setTimeRange('month')}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
                  timeRange === 'month'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Este Mes (14d)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main KPI Grid and Charts */}
      <main className="max-w-[1780px] w-full mx-auto px-4 sm:px-6 py-6 flex-1 space-y-6">
        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Card 1: Equipos en Reparación */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden group hover:border-cyan-500/50 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                En Reparación
              </span>
              <div className="p-2 rounded-xl bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">
              {metrics ? metrics.ticketsInRepair : '—'}
            </div>
            <p className="text-[11px] text-cyan-400 mt-1 flex items-center gap-1 font-medium">
              <span>En banco técnico</span>
            </p>
          </div>

          {/* Card 2: Tickets Creados Hoy */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden group hover:border-blue-500/50 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Ingresos Hoy
              </span>
              <div className="p-2 rounded-xl bg-blue-950/80 text-blue-300 border border-blue-800/60">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">
              {metrics ? metrics.ticketsCreatedToday : '—'}
            </div>
            <p className="text-[11px] text-blue-400 mt-1 font-medium">Recepción en mostrador</p>
          </div>

          {/* Card 3: Equipos Entregados */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden group hover:border-emerald-500/50 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Entregados
              </span>
              <div className="p-2 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">
              {metrics ? metrics.ticketsDelivered : '—'}
            </div>
            <p className="text-[11px] text-emerald-400 mt-1 font-medium">Cobrados y finalizados</p>
          </div>

          {/* Card 4: Diagnósticos IA */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden group hover:border-purple-500/50 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Diagnósticos IA
              </span>
              <div className="p-2 rounded-xl bg-purple-950/80 text-purple-300 border border-purple-800/60">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">
              {metrics ? metrics.aiDiagnosticsCount : '—'}
            </div>
            <p className="text-[11px] text-purple-300 mt-1 font-medium">Gemini 2.5 Flash</p>
          </div>

          {/* Card 5: Tiempo Promedio de Reparación */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden group hover:border-amber-500/50 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Tiempo Promedio
              </span>
              <div className="p-2 rounded-xl bg-amber-950/80 text-amber-300 border border-amber-800/60">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">
              {metrics ? `${metrics.averageRepairTimeHours}h` : '—'}
            </div>
            <p className="text-[11px] text-amber-400 mt-1 font-medium">
              {metrics ? `~${metrics.averageRepairTimeDays} días por equipo` : 'Calculando...'}
            </p>
          </div>

          {/* Card 6: Ingresos Estimados del Mes */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden group hover:border-emerald-400/50 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Facturación Estimada
              </span>
              <div className="p-2 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">
              {metrics ? formatCurrency(metrics.monthlyEstimatedRevenue) : '—'}
            </div>
            <p className="text-[11px] text-emerald-400 mt-1 font-medium">Presupuestos del mes</p>
          </div>
        </div>

        {/* Charts Grid: Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Area Chart: Tickets by Day (2 columns) */}
          <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  <span>Volumen de Órdenes Ingresadas por Día</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Trazabilidad temporal de entradas al taller
                </p>
              </div>
            </div>

            {/* SVG Chart */}
            <div className="w-full overflow-hidden py-2">
              {lineChartData ? (
                <svg
                  viewBox={`0 0 ${lineChartData.width} ${lineChartData.height}`}
                  className="w-full h-48 overflow-visible"
                >
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Guideline lines */}
                  {[0.25, 0.5, 0.75, 1].map((factor) => {
                    const y = lineChartData.height - 25 - factor * (lineChartData.height - 50);
                    return (
                      <line
                        key={factor}
                        x1="20"
                        y1={y}
                        x2={lineChartData.width - 20}
                        y2={y}
                        stroke="#1e293b"
                        strokeDasharray="4 4"
                      />
                    );
                  })}

                  {/* Area fill */}
                  <path d={lineChartData.areaD} fill="url(#areaGradient)" />

                  {/* Stroke path */}
                  <path
                    d={lineChartData.pathD}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data Points */}
                  {lineChartData.points.map((p, i) => (
                    <g key={i} className="group">
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="4.5"
                        className="fill-cyan-400 stroke-slate-950 stroke-2 transition group-hover:r-6"
                      />
                      <text
                        x={p.x}
                        y={lineChartData.height - 8}
                        fontSize="9"
                        textAnchor="middle"
                        fill="#64748b"
                        className="font-mono"
                      >
                        {p.label}
                      </text>
                      <text
                        x={p.x}
                        y={p.y - 10}
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                        fill="#ffffff"
                        className="font-mono opacity-80 group-hover:opacity-100"
                      >
                        {p.count}
                      </text>
                    </g>
                  ))}
                </svg>
              ) : (
                <div className="h-44 flex items-center justify-center text-slate-500 text-xs">
                  Cargando gráfica de tickets...
                </div>
              )}
            </div>

            <div className="border-t border-slate-800/60 pt-3 flex items-center justify-between text-xs text-slate-400">
              <span>Flujo continuo de servicio técnico</span>
              <span className="font-semibold text-white">
                Total periodo:{' '}
                {charts?.ticketsByDay.reduce((acc, curr) => acc + curr.count, 0) || 0} órdenes
              </span>
            </div>
          </div>

          {/* Donut / Status Distribution (1 column) */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-purple-400" />
                <span>Distribución por Estados</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Proporción de tickets en cada fase del embudo
              </p>
            </div>

            <div className="py-3 space-y-2.5">
              {charts?.statusDistribution && charts.statusDistribution.length > 0 ? (
                charts.statusDistribution
                  .filter((s) => s.count > 0 || ['IN_REPAIR', 'READY_FOR_PICKUP', 'DELIVERED', 'RECEIVED'].includes(s.status))
                  .slice(0, 6)
                  .map((item) => (
                    <div key={item.status} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium truncate max-w-[150px]">
                          {item.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-mono text-[11px]">{item.count}</span>
                          <span className="font-bold text-white text-[11px] w-8 text-right">
                            {item.percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(item.percentage, 4)}%` }}
                        />
                      </div>
                    </div>
                  ))
              ) : (
                <div className="py-10 text-center text-xs text-slate-500">
                  Sin tickets registrados aún
                </div>
              )}
            </div>

            <div className="border-t border-slate-800/60 pt-3 text-right">
              <Link
                href="/admin"
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1"
              >
                <span>Ver Kanban Completo</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Charts Grid: Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Technician Productivity Bars */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Productividad por Técnico</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Carga asignada y equipos finalizados
            </p>

            <div className="space-y-4">
              {charts?.productivityByTechnician && charts.productivityByTechnician.length > 0 ? (
                charts.productivityByTechnician.map((tech) => (
                  <div key={tech.name} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{tech.name}</span>
                      <span className="text-[11px] text-emerald-400 font-mono">
                        {tech.completed} completados / {tech.count} asignados
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-emerald-500"
                        style={{
                          width: `${tech.count > 0 ? (tech.completed / tech.count) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-500">
                  No hay técnicos registrados
                </div>
              )}
            </div>
          </div>

          {/* Peak Activity Hours Heatmap / Bars */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Horas Pico de Operación</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Distribución de actividad de 08:00 a 20:00 hs
            </p>

            <div className="h-44 flex items-end justify-between gap-1 pt-4">
              {charts?.hourlyDistribution
                ?.filter((h) => h.hour >= 8 && h.hour <= 20)
                .map((item) => {
                  const heightPercent = Math.max(
                    8,
                    Math.round((item.count / maxHourlyCount) * 100),
                  );
                  return (
                    <div
                      key={item.hour}
                      className="flex-1 flex flex-col items-center gap-1.5 group relative"
                    >
                      <div className="w-full bg-slate-800 rounded-t-md overflow-hidden flex items-end h-32">
                        <div
                          className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-md group-hover:from-amber-500 group-hover:to-amber-300 transition-all"
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 group-hover:text-slate-200">
                        {item.hour}h
                      </span>

                      {/* Tooltip on hover */}
                      <div className="absolute -top-7 hidden group-hover:flex items-center px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-bold text-white whitespace-nowrap z-10 shadow-lg">
                        {item.count} ops
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Quick Activity Feed from Audit */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span>Últimas Acciones en Vivo</span>
                </h3>
                <Link
                  href="/admin/audit"
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                >
                  Ver Todo
                </Link>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Feed en tiempo real del registro de auditoría
              </p>

              <div className="space-y-2.5">
                {recentLogs.length > 0 ? (
                  recentLogs.slice(0, 5).map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-slate-200 truncate font-mono text-[11px]">
                          {log.action}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="text-purple-300 font-medium">{log.entity}</span>
                          <span>•</span>
                          <span>{log.role || 'sistema'}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                        {new Date(log.created_at).toLocaleTimeString('es-AR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-slate-500">
                    Sin eventos registrados aún
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-800/60 pt-3 text-right">
              <Link
                href="/admin/audit"
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 inline-flex items-center gap-1"
              >
                <span>Inspeccionar Registro Completo</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
