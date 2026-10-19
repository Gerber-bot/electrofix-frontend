'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Wrench,
  Plus,
  Search,
  RefreshCw,
  Printer,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Laptop,
  Gamepad2,
  Monitor,
  ExternalLink,
  Clock,
  Sparkles,
  CheckCircle2,
  Inbox,
  Microscope,
  Cpu,
  PackageCheck,
  User,
  Users,
  Phone,
  Loader2,
  Filter,
  GripVertical,
  AlertTriangle,
  LayoutDashboard,
  Mail,
  Activity,
  CreditCard,
  FileText,
} from 'lucide-react';
import { RepairTicket, TicketStatus } from '../../types/ticket';
import { fetchTickets, fetchTenant, updateTicket, cleanNoteWithAi } from '../../lib/api';
import { NewTicketModal } from '../../components/NewTicketModal';
import { TicketDetailModal } from '../../components/TicketDetailModal';
import { ThermalReceipt } from '../../components/ThermalReceipt';
import AdminNav from '@/components/AdminNav';

type PriorityLevel = 'ALTA' | 'MEDIA' | 'BAJA';

interface KanbanColumnConfig {
  id: TicketStatus;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  topAccent: string;
  dotColor: string;
  badgeStyle: string;
  iconColor: string;
}

const KANBAN_COLUMNS: KanbanColumnConfig[] = [
  {
    id: 'RECEIVED',
    title: 'Recibido',
    subtitle: 'Ingreso en mostrador',
    icon: Inbox,
    topAccent: 'border-t-blue-400',
    dotColor: 'bg-blue-400',
    badgeStyle: 'bg-blue-950/80 text-blue-300 border-blue-800/60',
    iconColor: 'text-blue-400',
  },
  {
    id: 'DIAGNOSING',
    title: 'En Revisión',
    subtitle: 'Diagnóstico inicial',
    icon: Microscope,
    topAccent: 'border-t-yellow-400',
    dotColor: 'bg-yellow-400',
    badgeStyle: 'bg-yellow-950/80 text-yellow-300 border-yellow-800/60',
    iconColor: 'text-yellow-400',
  },
  {
    id: 'WAITING_APPROVAL',
    title: 'Esperando Aprobación',
    subtitle: 'Confirmación de cliente',
    icon: Clock,
    topAccent: 'border-t-orange-400',
    dotColor: 'bg-orange-400',
    badgeStyle: 'bg-orange-950/80 text-orange-300 border-orange-800/60',
    iconColor: 'text-orange-400',
  },
  {
    id: 'IN_REPAIR',
    title: 'En Banco',
    subtitle: 'Microelectrónica activa',
    icon: Cpu,
    topAccent: 'border-t-cyan-400',
    dotColor: 'bg-cyan-400',
    badgeStyle: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60',
    iconColor: 'text-cyan-400',
  },
  {
    id: 'QC_CHECK',
    title: 'Control Calidad',
    subtitle: 'Protocolo de 5 puntos',
    icon: ShieldCheck,
    topAccent: 'border-t-purple-400',
    dotColor: 'bg-purple-400',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-800/60',
    iconColor: 'text-purple-400',
  },
  {
    id: 'READY_FOR_PICKUP',
    title: 'Listo p/ Retirar',
    subtitle: 'Avisar y entregar',
    icon: PackageCheck,
    topAccent: 'border-t-emerald-400',
    dotColor: 'bg-emerald-400',
    badgeStyle: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
    iconColor: 'text-emerald-400',
  },
  {
    id: 'DELIVERED',
    title: 'Entregado',
    subtitle: 'Orden finalizada',
    icon: CheckCircle2,
    topAccent: 'border-t-slate-500',
    dotColor: 'bg-slate-400',
    badgeStyle: 'bg-slate-800/90 text-slate-300 border-slate-700',
    iconColor: 'text-slate-400',
  },
];

function computePriority(ticket: RepairTicket): PriorityLevel {
  if (ticket.liquidDamageRisk || ticket.status === 'WAITING_APPROVAL') {
    return 'ALTA';
  }
  const cost = Number(ticket.finalCost || ticket.estimatedCost || 0);
  if (cost >= 60000 || ticket.status === 'IN_REPAIR') {
    return 'MEDIA';
  }
  return 'BAJA';
}

function getPriorityBadge(priority: PriorityLevel) {
  switch (priority) {
    case 'ALTA':
      return {
        label: 'Alta prioridad',
        classes: 'bg-rose-950/80 text-rose-300 border-rose-800/70',
      };
    case 'MEDIA':
      return {
        label: 'Prioridad media',
        classes: 'bg-amber-950/80 text-amber-300 border-amber-800/70',
      };
    case 'BAJA':
      return {
        label: 'Prioridad normal',
        classes: 'bg-slate-800/90 text-slate-300 border-slate-700/80',
      };
  }
}

function formatTimeInStage(dateStr: string): string {
  const updated = new Date(dateStr).getTime();
  const now = Date.now();
  const diffHours = Math.max(0, Math.floor((now - updated) / (1000 * 60 * 60)));

  if (diffHours < 1) return 'En esta etapa hace instantes';
  if (diffHours < 24) return `En esta etapa hace ${diffHours} h`;
  const days = Math.floor(diffHours / 24);
  return `En esta etapa hace ${days} ${days === 1 ? 'día' : 'días'}`;
}

function DeviceCategoryIcon({ type }: { type: string }) {
  const normalized = type.toLowerCase();
  if (normalized.includes('notebook') || normalized.includes('laptop')) {
    return <Laptop className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
  }
  if (normalized.includes('consola') || normalized.includes('ps') || normalized.includes('xbox')) {
    return <Gamepad2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
  }
  if (normalized.includes('pc') || normalized.includes('escritorio')) {
    return <Monitor className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
  }
  return <Smartphone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
}

export default function AdminKanbanPage() {
  const [tickets, setTickets] = useState<RepairTicket[]>([]);
  const [tenantName, setTenantName] = useState<string>('ElectroFix Servicio Técnico');
  const [loading, setLoading] = useState(true);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [deviceFilter, setDeviceFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Modals state
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<RepairTicket | null>(null);
  const [printTicket, setPrintTicket] = useState<RepairTicket | null>(null);

  // AI & Micro-interactions state
  const [quickCleaningId, setQuickCleaningId] = useState<string | null>(null);
  const [aiEnhancedIds, setAiEnhancedIds] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ type: 'success' | 'warning'; message: string } | null>(
    null,
  );

  // Drag & drop state
  const [draggedTicketId, setDraggedTicketId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TicketStatus | null>(null);

  const showToast = (message: string, type: 'success' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [ticketsData, tenantData] = await Promise.all([
        fetchTickets(),
        fetchTenant().catch(() => null),
      ]);
      setTickets(ticketsData);
      if (tenantData?.name) {
        setTenantName(tenantData.name);
      }
    } catch (err) {
      console.error('Error loading admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTicketCreated = (newTicket: RepairTicket) => {
    setTickets((prev) => [newTicket, ...prev]);
    setShowNewModal(false);
    setPrintTicket(newTicket);
    showToast(`Orden #${String(newTicket.orderNumber).padStart(4, '0')} creada correctamente.`);
  };

  const handleTicketUpdated = (updated: RepairTicket) => {
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTicket(null);
    showToast(`Orden #${String(updated.orderNumber).padStart(4, '0')} actualizada.`);
  };

  const handleQuickAiClean = async (ticket: RepairTicket) => {
    const sourceText = ticket.technicalDiagnosis?.trim() || ticket.reportedIssue?.trim();
    if (!sourceText) {
      setSelectedTicket(ticket);
      return;
    }

    try {
      setQuickCleaningId(ticket.id);
      const res = await cleanNoteWithAi(sourceText, `${ticket.deviceType} ${ticket.brandModel}`);
      if (res?.cleanedReport) {
        const updated = await updateTicket(ticket.id, {
          technicalDiagnosis: res.cleanedReport,
        });
        setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        setAiEnhancedIds((prev) => ({ ...prev, [ticket.id]: true }));
        showToast(
          `Orden #${String(ticket.orderNumber).padStart(4, '0')}: Informe técnico estructurado con IA.`,
        );
      }
    } catch (err: any) {
      showToast(err?.message || 'No se pudo conectar con el copiloto de IA.', 'warning');
    } finally {
      setQuickCleaningId(null);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, ticketId: string) => {
    setDraggedTicketId(ticketId);
    e.dataTransfer.setData('text/plain', ticketId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTicketId(null);
    setDragOverColumn(null);
  };

  const handleDropOnColumn = async (e: React.DragEvent, targetStatus: TicketStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const ticketId = e.dataTransfer.getData('text/plain') || draggedTicketId;
    setDraggedTicketId(null);

    if (!ticketId) return;
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket || ticket.status === targetStatus) return;

    // Enforce 5-point QC rule before moving to READY_FOR_PICKUP
    if (targetStatus === 'READY_FOR_PICKUP' && !ticket.qcPassed) {
      showToast(
        `Orden #${String(ticket.orderNumber).padStart(4, '0')}: Requiere aprobar el Control de Calidad de 5 puntos antes de pasar a Listo p/ Retirar.`,
        'warning',
      );
      setSelectedTicket(ticket);
      return;
    }

    try {
      const updated = await updateTicket(ticket.id, { status: targetStatus });
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      const targetColumn = KANBAN_COLUMNS.find((c) => c.id === targetStatus);
      showToast(
        `Orden #${String(ticket.orderNumber).padStart(4, '0')} movida a "${targetColumn?.title}".`,
      );
    } catch (err: any) {
      showToast(err?.message || 'Error al mover la orden de estado.', 'warning');
    }
  };

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesSearch =
        !searchQuery.trim() ||
        t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.customerDni.includes(searchQuery.trim()) ||
        t.brandModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.trackingToken.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(t.orderNumber).includes(searchQuery.trim());

      const matchesDevice =
        deviceFilter === 'ALL' ||
        t.deviceType.toLowerCase().includes(deviceFilter.toLowerCase());

      const priority = computePriority(t);
      const matchesPriority = priorityFilter === 'ALL' || priority === priorityFilter;

      return matchesSearch && matchesDevice && matchesPriority;
    });
  }, [tickets, searchQuery, deviceFilter, priorityFilter]);

  // Metrics
  const metrics = useMemo(() => {
    return {
      total: tickets.length,
      waitingApproval: tickets.filter((t) => t.status === 'WAITING_APPROVAL').length,
      inBench: tickets.filter((t) => t.status === 'IN_REPAIR' || t.status === 'DIAGNOSING').length,
      readyForPickup: tickets.filter((t) => t.status === 'READY_FOR_PICKUP').length,
    };
  }, [tickets]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Unified Global Admin Navigation */}
      <AdminNav />

      {/* Page Action Bar */}
      <div className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-[1780px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Brand & Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20">
              <Wrench className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base text-white tracking-tight">
                  {tenantName}
                </h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-800/70">
                  Panel de Taller
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Tablero Kanban & Control de Laboratorio Técnico
              </p>
            </div>
          </div>

          {/* Global Search Input */}
          <div className="relative flex-1 max-w-md min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por cliente, DNI, modelo, #orden o token..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
            />
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              title="Sincronizar tablero"
              className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            <button
              onClick={() => setShowNewModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-xl shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01] active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Nuevo ingreso</span>
            </button>
          </div>
        </div>

        {/* Subheader: Metrics Bar & Quick Filters */}
        <div className="border-t border-slate-900 bg-slate-950/60">
          <div className="max-w-[1780px] mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-4">
            {/* Key Metrics */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800/90">
                <span className="text-slate-400">Total órdenes:</span>
                <span className="font-bold text-white">{metrics.total}</span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-950/30 border border-orange-800/40 text-orange-300">
                <Clock className="w-3.5 h-3.5 text-orange-400" />
                <span>Pendientes de aprobación:</span>
                <span className="font-bold">{metrics.waitingApproval}</span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-cyan-300">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>En laboratorio:</span>
                <span className="font-bold">{metrics.inBench}</span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-300">
                <PackageCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Listos para retirar:</span>
                <span className="font-bold">{metrics.readyForPickup}</span>
              </div>
            </div>

            {/* Filter Selectors */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400 mr-1">
                <Filter className="w-3.5 h-3.5 text-cyan-400" />
                <span>Filtros:</span>
              </div>

              <select
                value={deviceFilter}
                onChange={(e) => setDeviceFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition"
              >
                <option value="ALL">Todos los equipos</option>
                <option value="Celular">Celulares</option>
                <option value="Notebook">Notebooks</option>
                <option value="Consola">Consolas</option>
                <option value="PC">PC / Escritorio</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition"
              >
                <option value="ALL">Todas las prioridades</option>
                <option value="ALTA">Alta prioridad</option>
                <option value="MEDIA">Prioridad media</option>
                <option value="BAJA">Prioridad normal</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Discrete Toast Feedback */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl border shadow-2xl flex items-center gap-3 text-xs font-semibold backdrop-blur-xl ${
              toast.type === 'warning'
                ? 'bg-amber-950/95 border-amber-500/50 text-amber-200'
                : 'bg-slate-900/95 border-cyan-500/50 text-cyan-100'
            }`}
          >
            {toast.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Kanban Board Workspace */}
      <main className="flex-1 max-w-[1780px] w-full mx-auto px-4 sm:px-6 py-5 overflow-x-auto snap-x">
        <div className="grid grid-cols-1 md:flex gap-4 md:min-w-[1520px] pb-6">
          {KANBAN_COLUMNS.map((column) => {
            const ColumnIcon = column.icon;
            const columnTickets = filteredTickets.filter((t) => t.status === column.id);
            const isDropTarget = dragOverColumn === column.id;

            return (
              <section
                key={column.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (dragOverColumn !== column.id) setDragOverColumn(column.id);
                }}
                onDragLeave={() => {
                  if (dragOverColumn === column.id) setDragOverColumn(null);
                }}
                onDrop={(e) => handleDropOnColumn(e, column.id)}
                className={`flex-1 min-w-[235px] bg-slate-900/60 border border-slate-800/80 border-t-2 ${column.topAccent} rounded-2xl p-3 flex flex-col max-h-[calc(100vh-210px)] transition-all duration-150 snap-start ${
                  isDropTarget
                    ? 'ring-2 ring-cyan-500/60 bg-slate-900/90 border-cyan-500/40'
                    : ''
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-2.5 border-b border-slate-800/80 px-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800/80">
                      <ColumnIcon className={`w-3.5 h-3.5 ${column.iconColor}`} />
                    </div>
                    <div>
                      <h2 className="text-xs font-semibold text-white leading-tight">
                        {column.title}
                      </h2>
                      <p className="text-[10px] text-slate-500">{column.subtitle}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${column.badgeStyle}`}
                  >
                    {columnTickets.length}
                  </span>
                </div>

                {/* Column Cards List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                  {columnTickets.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center border border-dashed border-slate-800/70 rounded-xl text-[11px] text-slate-600 gap-1">
                      <ColumnIcon className="w-4 h-4 opacity-40" />
                      <span>Sin órdenes en esta etapa</span>
                    </div>
                  ) : (
                    columnTickets.map((ticket) => {
                      const priority = computePriority(ticket);
                      const priorityBadge = getPriorityBadge(priority);
                      const isCleaningThis = quickCleaningId === ticket.id;
                      const isDraggingThis = draggedTicketId === ticket.id;
                      const hasAiReport =
                        aiEnhancedIds[ticket.id] ||
                        Boolean(ticket.technicalDiagnosis && ticket.technicalDiagnosis.length > 80);

                      return (
                        <article
                          key={ticket.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, ticket.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => setSelectedTicket(ticket)}
                          className={`group bg-slate-900/95 hover:bg-slate-900 border border-slate-800/90 hover:border-slate-700 rounded-xl p-4 shadow-lg shadow-black/25 hover:shadow-xl hover:shadow-cyan-950/10 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 relative ${
                            isDraggingThis ? 'opacity-40 scale-95 ring-2 ring-cyan-400' : ''
                          }`}
                        >
                          {/* Card Header: Order #, Priority Badge & Quick Icons */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-1.5">
                              <div className="flex items-center gap-1.5">
                                <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 cursor-grab active:cursor-grabbing" />
                                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-950 text-cyan-400 border border-slate-800">
                                  #{String(ticket.orderNumber).padStart(4, '0')}
                                </span>
                                <span
                                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${priorityBadge.classes}`}
                                >
                                  {priorityBadge.label}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                {ticket.liquidDamageRisk && (
                                  <span
                                    title="Alerta: Riesgo por humedad / líquidos"
                                    className="p-1 rounded-md bg-amber-950/80 text-amber-400 border border-amber-700/40"
                                  >
                                    <ShieldAlert className="w-3.5 h-3.5" />
                                  </span>
                                )}
                                {ticket.qcPassed && (
                                  <span
                                    title="Control de Calidad de 5 puntos aprobado"
                                    className="p-1 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-700/40"
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPrintTicket(ticket);
                                  }}
                                  title="Imprimir recibo térmico 80mm"
                                  className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-md transition"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Device Model & Customer Subtitle */}
                            <div>
                              <div className="flex items-center gap-1.5">
                                <DeviceCategoryIcon type={ticket.deviceType} />
                                <h3 className="font-semibold text-sm text-white group-hover:text-cyan-200 transition truncate">
                                  {ticket.brandModel}
                                </h3>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 truncate">
                                <span className="inline-flex items-center gap-1 truncate">
                                  <User className="w-3 h-3 text-slate-500 shrink-0" />
                                  {ticket.customerName}
                                </span>
                                <span className="text-slate-700">•</span>
                                <span className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-400">
                                  <Phone className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                                  {ticket.customerPhone}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Card Body: Issue or Technical Report */}
                          <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-2.5 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                {ticket.technicalDiagnosis ? 'Informe Técnico' : 'Falla Reportada'}
                              </span>
                              {hasAiReport && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-800/60">
                                  <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                                  IA
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                              {ticket.technicalDiagnosis || ticket.reportedIssue}
                            </p>
                          </div>

                          {/* Time in stage indicator */}
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {formatTimeInStage(ticket.updatedAt || ticket.createdAt)}
                            </span>
                            {ticket.isPaid && (
                              <span className="text-emerald-400 font-semibold">Abonado</span>
                            )}
                          </div>

                          {/* Card Footer: AI Action Chip + Cost & Detail Link */}
                          <div className="pt-2.5 border-t border-slate-800/80 space-y-2.5">
                            {/* Elegant AI Copilot Chip */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickAiClean(ticket);
                              }}
                              disabled={isCleaningThis}
                              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-950 hover:bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 shadow-sm transition active:scale-[0.99] disabled:opacity-60"
                            >
                              {isCleaningThis ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                                  <span>Generando versión mejorada...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                                  <span>Mejorar informe con IA</span>
                                </>
                              )}
                            </button>

                            {/* Price & Ver detalle */}
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-[10px] text-slate-500 block leading-none">
                                  {ticket.finalCost ? 'Total final' : 'Estimado'}
                                </span>
                                <span className="text-sm font-bold text-white">
                                  {ticket.finalCost
                                    ? `$${Number(ticket.finalCost).toLocaleString('es-AR')}`
                                    : ticket.estimatedCost
                                      ? `~$${Number(ticket.estimatedCost).toLocaleString('es-AR')}`
                                      : 'A presupuestar'}
                                </span>
                              </div>

                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-transform">
                                Ver detalle →
                              </span>
                            </div>
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      {/* Modal: New Ticket */}
      {showNewModal && (
        <NewTicketModal
          onClose={() => setShowNewModal(false)}
          onTicketCreated={handleTicketCreated}
        />
      )}

      {/* Modal: Ticket Technical Detail */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onTicketUpdated={handleTicketUpdated}
          onOpenPrint={(ticket) => {
            setSelectedTicket(null);
            setPrintTicket(ticket);
          }}
        />
      )}

      {/* Modal: Thermal Receipt Print Preview */}
      {printTicket && (
        <ThermalReceipt ticket={printTicket} onClose={() => setPrintTicket(null)} />
      )}
    </div>
  );
}
