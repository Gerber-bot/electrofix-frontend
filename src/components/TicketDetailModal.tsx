'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Printer,
  ShieldCheck,
  Save,
  Clock,
  User,
  Phone,
  Droplets,
} from 'lucide-react';
import { RepairTicket, TicketStatus } from '../types/ticket';
import { updateTicket, cleanNoteWithAi } from '../lib/api';

interface TicketDetailModalProps {
  ticket: RepairTicket;
  onClose: () => void;
  onTicketUpdated: (updatedTicket: RepairTicket) => void;
  onOpenPrint: (ticket: RepairTicket) => void;
}

const STATUS_LABELS: Record<TicketStatus, { label: string; color: string }> = {
  RECEIVED: { label: 'Recibido en Mostrador', color: 'bg-slate-700 text-slate-200' },
  DIAGNOSING: { label: 'En Revisión Técnica', color: 'bg-indigo-950 text-indigo-300 border-indigo-700/50' },
  WAITING_APPROVAL: { label: 'Esperando OK Cliente', color: 'bg-amber-950 text-amber-300 border-amber-700/50' },
  WAITING_PARTS: { label: 'Esperando Repuesto', color: 'bg-rose-950 text-rose-300 border-rose-700/50' },
  IN_REPAIR: { label: 'En Banco de Trabajo', color: 'bg-blue-950 text-blue-300 border-blue-700/50' },
  QC_CHECK: { label: 'Control de Calidad (5 pts)', color: 'bg-purple-950 text-purple-300 border-purple-700/50' },
  READY_FOR_PICKUP: { label: 'Listo para Retirar', color: 'bg-emerald-950 text-emerald-300 border-emerald-700/50' },
  DELIVERED: { label: 'Entregado y Cobrado', color: 'bg-zinc-800 text-zinc-400 border-zinc-700' },
};

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  onClose,
  onTicketUpdated,
  onOpenPrint,
}) => {
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [technicalDiagnosis, setTechnicalDiagnosis] = useState(ticket.technicalDiagnosis || '');
  const [qcPassed, setQcPassed] = useState(ticket.qcPassed || false);
  const [finalCost, setFinalCost] = useState(ticket.finalCost ? String(ticket.finalCost) : '');
  const [estimatedCost, setEstimatedCost] = useState(ticket.estimatedCost ? String(ticket.estimatedCost) : '');
  const [isPaid, setIsPaid] = useState(ticket.isPaid || false);

  const [saving, setSaving] = useState(false);
  const [aiCleaning, setAiCleaning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // AI clean-note handler
  const handleAiClean = async () => {
    if (!technicalDiagnosis.trim()) {
      setError('Escribe primero las notas crudas del trabajo realizado para que la IA pueda pulirlas.');
      return;
    }
    setError(null);
    try {
      setAiCleaning(true);
      const res = await cleanNoteWithAi(technicalDiagnosis, `${ticket.deviceType} ${ticket.brandModel}`);
      if (res?.cleanedReport) {
        setTechnicalDiagnosis(res.cleanedReport);
        setSuccessMsg('¡Informe técnico refinado con éxito por IA!');
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      setError(err?.message || 'Error al conectar con el servicio de IA');
    } finally {
      setAiCleaning(false);
    }
  };

  const handleSave = async () => {
    setError(null);

    // Rule enforcement: transitioning to READY_FOR_PICKUP requires 5-point QC check
    if (status === 'READY_FOR_PICKUP' && !qcPassed) {
      setError('⚠️ Para pasar a "Listo para Retirar" es obligatorio marcar el Control de Calidad de 5 puntos aprobado.');
      return;
    }

    try {
      setSaving(true);
      const updated = await updateTicket(ticket.id, {
        status,
        technicalDiagnosis: technicalDiagnosis.trim() || undefined,
        qcPassed,
        finalCost: finalCost ? parseFloat(finalCost) : undefined,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
        isPaid,
      });

      onTicketUpdated(updated);
      setSuccessMsg('Cambios guardados correctamente');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar el ticket');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <span className="font-mono font-bold text-sm">#{String(ticket.orderNumber).padStart(4, '0')}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg text-white">{ticket.brandModel}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {ticket.deviceType}
                </span>
                {ticket.liquidDamageRisk && (
                  <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40 font-medium">
                    <Droplets className="w-3 h-3" /> Humedad
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono">Token: {ticket.trackingToken}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPrint(ticket)}
              title="Imprimir ticket térmico"
              className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-xl transition flex items-center gap-1 text-xs"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Ticket</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-xs bg-red-950/60 border border-red-800 text-red-200 rounded-xl flex items-center gap-2 animate-shake">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 text-xs bg-emerald-950/60 border border-emerald-800 text-emerald-200 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Customer & Issue quick info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-semibold text-slate-200">{ticket.customerName}</span>
                <span>(DNI: {ticket.customerDni})</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{ticket.customerPhone}</span>
              </div>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Falla inicial:</span>
              <p className="text-slate-200 italic mt-0.5">{ticket.reportedIssue}</p>
            </div>
          </div>

          {/* Status changer */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Estado de la Reparación
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(STATUS_LABELS) as TicketStatus[]).map((st) => {
                const isSelected = status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      setStatus(st);
                      // If transitioning to ready for pickup and qc not set, warn softly
                      if (st === 'READY_FOR_PICKUP' && !qcPassed) {
                        setError('Nota: Para "Listo para Retirar", asegúrate de aprobar el Control de Calidad abajo.');
                      } else {
                        setError(null);
                      }
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left transition ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 ring-2 ring-cyan-500/20'
                        : 'border-slate-800 bg-slate-950 hover:bg-slate-800/80 text-slate-400'
                    }`}
                  >
                    {STATUS_LABELS[st].label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Technical Diagnosis with AI clean-note button */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                Informe Técnico / Diagnóstico de Banco
              </label>
              <button
                type="button"
                onClick={handleAiClean}
                disabled={aiCleaning || !technicalDiagnosis.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 shadow-md shadow-cyan-500/20 transition disabled:opacity-50 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                {aiCleaning ? 'Mejorando con IA...' : '✨ Mejorar informe con IA'}
              </button>
            </div>
            <textarea
              rows={4}
              value={technicalDiagnosis}
              onChange={(e) => setTechnicalDiagnosis(e.target.value)}
              placeholder="Escribe aquí los apuntes técnicos (ej: 'cambie modulo display y pin de carga testeado ok'). Luego presiona 'Mejorar informe con IA' para generar una descripción profesional que el cliente verá en su portal."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition leading-relaxed font-sans"
            />
          </div>

          {/* 5-point Quality Control Check (Mandatory for READY_FOR_PICKUP) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={qcPassed}
                  onChange={(e) => {
                    setQcPassed(e.target.checked);
                    if (e.target.checked && error?.includes('Control de Calidad')) {
                      setError(null);
                    }
                  }}
                  className="w-5 h-5 rounded text-cyan-500 bg-slate-900 border-slate-700 focus:ring-cyan-500 cursor-pointer"
                />
                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Control de Calidad de 5 puntos aprobado
                </span>
              </label>
              {qcPassed ? (
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/50 font-semibold">
                  QC OK
                </span>
              ) : (
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-medium">
                  Pendiente
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400">
              Protocolo obligatorio antes de entrega: (1) Carga y batería estable, (2) Cámaras frontal/trasera, (3)
              Audio y micrófono, (4) Táctil y pantalla sin zonas muertas, (5) Conectividad WiFi/Bluetooth/Red.
            </p>
          </div>

          {/* Pricing and Payment */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Costo Estimado ($)</label>
              <input
                type="number"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Costo Final Cobrado ($)</label>
              <input
                type="number"
                value={finalCost}
                onChange={(e) => setFinalCost(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-semibold text-emerald-400"
              />
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:bg-slate-900 transition">
                <input
                  type="checkbox"
                  checked={isPaid}
                  onChange={(e) => setIsPaid(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-slate-200">Abonado / Pagado</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl shadow-lg shadow-cyan-500/20 transition active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};
