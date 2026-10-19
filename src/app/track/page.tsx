'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Wrench,
  Search,
  CheckCircle2,
  Clock,
  Smartphone,
  ShieldCheck,
  AlertCircle,
  ThumbsUp,
  Check,
  ShieldAlert,
  ArrowLeft,
  Calendar,
  FileText,
} from 'lucide-react';
import { RepairTicket, TicketStatus } from '../../types/ticket';
import { searchTicketsByDni, fetchTicketByToken, approveTicketBudget, updateTicket } from '../../lib/api';
import { AiChatWidget } from '../../components/AiChatWidget';

const PROGRESS_STEPS: Array<{ key: TicketStatus; label: string; desc: string }> = [
  { key: 'RECEIVED', label: '1. Recibido', desc: 'Ingreso a laboratorio' },
  { key: 'DIAGNOSING', label: '2. En Revisión', desc: 'Diagnóstico técnico' },
  { key: 'WAITING_APPROVAL', label: '3. Presupuesto', desc: 'Aprobación del cliente' },
  { key: 'IN_REPAIR', label: '4. En Banco', desc: 'Reparación en curso' },
  { key: 'QC_CHECK', label: '5. Control de Calidad', desc: 'Test de 5 puntos' },
  { key: 'READY_FOR_PICKUP', label: '6. Listo p/ Retirar', desc: 'Listo en mostrador' },
  { key: 'DELIVERED', label: '7. Entregado', desc: 'Finalizado y con garantía' },
];

function getStepIndex(status: TicketStatus): number {
  switch (status) {
    case 'RECEIVED':
      return 0;
    case 'DIAGNOSING':
      return 1;
    case 'WAITING_APPROVAL':
      return 2;
    case 'WAITING_PARTS':
    case 'IN_REPAIR':
      return 3;
    case 'QC_CHECK':
      return 4;
    case 'READY_FOR_PICKUP':
      return 5;
    case 'DELIVERED':
      return 6;
    default:
      return 0;
  }
}

function TrackContent() {
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState('');
  const [tickets, setTickets] = useState<RepairTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<RepairTicket | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);
  const [approvalSuccess, setApprovalSuccess] = useState(false);

  // Read URL parameters on mount (?token=... or ?dni=...)
  useEffect(() => {
    const token = searchParams.get('token');
    const dni = searchParams.get('dni');

    if (token) {
      setSearchInput(token);
      executeSearchByToken(token);
    } else if (dni) {
      setSearchInput(dni);
      executeSearchByDni(dni);
    }
  }, [searchParams]);

  const executeSearchByToken = async (token: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const ticket = await fetchTicketByToken(token);
      setTickets([ticket]);
      setSelectedTicket(ticket);
    } catch {
      setErrorMsg(`No se encontró ninguna reparación con el código de seguimiento "${token}".`);
      setTickets([]);
      setSelectedTicket(null);
    } finally {
      setLoading(false);
    }
  };

  const executeSearchByDni = async (dni: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const results = await searchTicketsByDni(dni);
      if (results.length === 0) {
        setErrorMsg(`No se encontraron reparaciones registradas con el DNI "${dni}".`);
        setTickets([]);
        setSelectedTicket(null);
      } else {
        setTickets(results);
        setSelectedTicket(results[0]);
      }
    } catch {
      setErrorMsg('Error de conexión al consultar el servidor.');
      setTickets([]);
      setSelectedTicket(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = searchInput.trim();
    if (!clean) return;

    // If search looks like a UUID or token (contains letters or length > 12), search by token
    if (/[a-zA-Z]/.test(clean) && clean.length > 8) {
      executeSearchByToken(clean);
    } else {
      executeSearchByDni(clean);
    }
  };

  const handleApproveBudget = async () => {
    if (!selectedTicket) return;
    try {
      setApproving(true);
      const updated = await approveTicketBudget(selectedTicket.id);
      setSelectedTicket(updated);
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setApprovalSuccess(true);
      setTimeout(() => setApprovalSuccess(false), 5000);
    } catch (err: any) {
      alert(err?.message || 'Error al aprobar el presupuesto');
    } finally {
      setApproving(false);
    }
  };

  const currentStep = selectedTicket ? getStepIndex(selectedTicket.status) : 0;
  const progressPercent = Math.min(100, Math.round(((currentStep + 1) / PROGRESS_STEPS.length) * 100));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition">
              <Wrench className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight">ElectroFix</span>
              <span className="text-xs text-cyan-400 block -mt-1 font-medium">Portal de Seguimiento del Cliente</span>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Inicio</span>
          </Link>
        </div>
      </header>

      {/* Search Bar Section */}
      <section className="py-8 px-4 bg-gradient-to-b from-slate-900/40 to-slate-950 border-b border-slate-800/60">
        <div className="max-w-2xl mx-auto space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800 shadow-xl focus-within:border-cyan-500 transition">
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 absolute left-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Ingresá tu DNI o código de seguimiento..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-transparent pl-11 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !searchInput.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </form>

          {/* Clean production help text */}
          <p className="text-xs text-slate-400 text-center">
            Ingresá el DNI registrado al momento de dejar tu equipo en el laboratorio o el código de tu comprobante.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-sm flex items-center gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Multiple ticket tabs */}
        {tickets.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-slate-400 shrink-0">Reparaciones encontradas:</span>
            {tickets.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition shrink-0 ${
                  selectedTicket?.id === t.id
                    ? 'border-cyan-500 bg-cyan-950/60 text-cyan-300'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Orden #{t.orderNumber} - {t.brandModel}
              </button>
            ))}
          </div>
        )}

        {/* Active Ticket Card */}
        {selectedTicket && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
                    ORDEN #{String(selectedTicket.orderNumber).padStart(4, '0')}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(selectedTicket.createdAt).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <h1 className="text-2xl font-black text-white mt-2 tracking-tight flex items-center gap-2">
                  {selectedTicket.brandModel}
                </h1>
                <p className="text-xs text-slate-400">Titular: {selectedTicket.customerName}</p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block font-medium">Costo Total:</span>
                <span className="text-2xl font-black text-cyan-400">
                  {selectedTicket.finalCost
                    ? `$${Number(selectedTicket.finalCost).toLocaleString('es-AR')}`
                    : selectedTicket.estimatedCost
                    ? `$${Number(selectedTicket.estimatedCost).toLocaleString('es-AR')}`
                    : 'A presupuestar'}
                </span>
                {selectedTicket.isPaid ? (
                  <span className="text-[10px] font-bold text-emerald-400 block">Pagado</span>
                ) : (
                  <span className="text-[10px] text-slate-500 block">Se abona al retirar</span>
                )}
              </div>
            </div>

            {/* REAL-TIME PROGRESS BAR */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400 uppercase tracking-wider">Estado en tiempo real</span>
                <span className="text-cyan-400 font-mono">{progressPercent}% completado</span>
              </div>

              {/* Progress track */}
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-700 ease-out shadow-lg shadow-cyan-500/30"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Steps */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2">
                {PROGRESS_STEPS.map((step, idx) => {
                  const isDone = idx < currentStep;
                  const isCurrent = idx === currentStep;

                  return (
                    <div
                      key={step.key}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        isCurrent
                          ? 'border-cyan-500/80 bg-cyan-950/40 text-cyan-300 ring-2 ring-cyan-500/20'
                          : isDone
                          ? 'border-emerald-800/40 bg-emerald-950/20 text-emerald-400'
                          : 'border-slate-800/50 bg-slate-950/40 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-center mb-1">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : isCurrent ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-slate-700" />
                        )}
                      </div>
                      <span className="font-bold text-[11px] block leading-tight">{step.label}</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">{step.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* WAITING_APPROVAL INTERACTION */}
            {selectedTicket.status === 'WAITING_APPROVAL' && (
              <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-4 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                    <Clock className="w-5 h-5 animate-spin" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Presupuesto pendiente de aprobación</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      El laboratorio técnico ya revisó el equipo y determinó el trabajo requerido. Puedes aprobar el presupuesto ahora mismo para que el técnico comience de inmediato:
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950/80 p-4 rounded-xl border border-amber-900/40 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-slate-400 text-xs block font-medium">Presupuesto a confirmar:</span>
                    <span className="text-2xl font-black text-amber-400">
                      ${Number(selectedTicket.estimatedCost || 0).toLocaleString('es-AR')}
                    </span>
                  </div>
                  <button
                    onClick={handleApproveBudget}
                    disabled={approving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/25 transition active:scale-95 disabled:opacity-50"
                  >
                    <ThumbsUp className="w-4 h-4 stroke-[2.5]" />
                    {approving ? 'Procesando aprobación...' : 'Aprobar Presupuesto y Reparar'}
                  </button>
                </div>

                {approvalSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-700/50 text-xs font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    ¡Presupuesto aprobado! El equipo pasó a estado de reparación activa.
                  </div>
                )}
              </div>
            )}

            {/* READY_FOR_PICKUP BANNER */}
            {selectedTicket.status === 'READY_FOR_PICKUP' && (
              <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">¡Tu equipo está listo para retirar!</h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Superó las pruebas y está disponible en mostrador. Recuerda presentar tu DNI o el número de orden.
                    </p>
                  </div>
                </div>
                {selectedTicket.qcPassed && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    Control de Calidad 5 Puntos Aprobado
                  </span>
                )}
              </div>
            )}

            {/* Technical Report & Details */}
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                Informe del Laboratorio Técnico
              </span>
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-xs leading-relaxed text-slate-300 whitespace-pre-line">
                {selectedTicket.technicalDiagnosis ||
                  'El equipo se encuentra actualmente en proceso de diagnóstico minucioso en nuestro banco de laboratorio.'}
              </div>
            </div>

            {/* Falla declarada */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 space-y-1">
              <span className="font-semibold text-slate-300">Falla inicial declarada en recepción:</span>
              <p className="italic text-slate-300">{selectedTicket.reportedIssue}</p>
            </div>

            {/* Liquid damage clause if applicable */}
            {selectedTicket.liquidDamageRisk && (
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  Equipo ingresado con antecedente o sospecha de humedad / contacto con líquidos. Tratamiento preventivo anti-sulfato aplicado.
                </span>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating AI Chat Assistant */}
      <AiChatWidget customerDni={selectedTicket?.customerDni || searchInput} />
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">Cargando portal de seguimiento...</div>}>
      <TrackContent />
    </Suspense>
  );
}
