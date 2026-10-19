'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  FileCheck2,
  Receipt,
  Download,
  Printer,
  Sparkles,
  QrCode,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Cpu,
  Layers,
  Activity,
  Calendar,
  User,
  Phone,
  HardDrive,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { AdminNav } from '../../../../../components/AdminNav';
import { ThermalReceipt } from '../../../../../components/ThermalReceipt';
import { getTicketPdfUrl, getDiagnosticPdfUrl, getPaymentPdfUrl, fetchTicketById } from '../../../../../lib/api';
import { RepairTicket } from '../../../../../types/ticket';

export default function TicketDetailedReportPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [ticket, setTicket] = useState<RepairTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showThermal, setShowThermal] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadTicket = async () => {
      setLoading(true);
      try {
        const data = await fetchTicketById(id);
        setTicket(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar ticket');
      } finally {
        setLoading(false);
      }
    };

    loadTicket();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col font-sans">
        <AdminNav subtitle="Cargando informe técnico..." />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-400">Generando reporte digital del ticket...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col font-sans">
        <AdminNav subtitle="Error de reporte" />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h2 className="text-lg font-bold text-white">No se pudo cargar el reporte</h2>
            <p className="text-xs text-slate-400">{error || 'El ticket solicitado no existe.'}</p>
            <button
              onClick={() => router.push('/admin/reports')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-xl transition"
            >
              Volver a Reportes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const trackingUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/track?token=${ticket.trackingToken}`
    : `https://electrofix.com/track?token=${ticket.trackingToken}`;

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      <AdminNav
        badge={`ORDEN #${ticket.orderNumber}`}
        badgeColor="from-cyan-500 to-blue-600"
        subtitle={`Vista de Documento Oficial • ${ticket.brandModel}`}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Actions & Back Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/admin/reports"
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Centro de Reportes</span>
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowThermal(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Imprimir Ticket Térmico</span>
            </button>

            <a
              href={getTicketPdfUrl(ticket.id)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl transition shadow-md shadow-cyan-600/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Orden Recepción PDF</span>
            </a>

            <a
              href={getDiagnosticPdfUrl(ticket.id)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-md shadow-indigo-600/20"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Diagnóstico Técnico PDF</span>
            </a>

            <a
              href={getPaymentPdfUrl(ticket.id)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition shadow-md shadow-emerald-600/20"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Recibo de Pago PDF</span>
            </a>
          </div>
        </div>

        {/* Printable Report Document Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-black text-2xl tracking-tight text-white">
                  ELECTRO<span className="text-cyan-400">FIX</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  DOCUMENTO OFICIAL
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Laboratorio & Servicio Técnico de Precisión • CUIT 30-71829340-9
              </p>
            </div>

            <div className="sm:text-right">
              <div className="text-xs font-mono uppercase tracking-widest text-slate-400">Orden de Servicio</div>
              <div className="text-2xl font-black font-mono text-cyan-400">#{ticket.orderNumber}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {new Date(ticket.createdAt).toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>

          {/* Customer & Hardware Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Box */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Datos del Cliente</span>
              </h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Nombre:</span>
                  <span className="font-semibold text-white">{ticket.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">DNI / CUIT:</span>
                  <span className="font-mono text-slate-200">{ticket.customerDni}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Teléfono:</span>
                  <span className="font-mono text-slate-200">{ticket.customerPhone}</span>
                </div>
              </div>
            </div>

            {/* Device Box */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5" />
                <span>Dispositivo & Serie</span>
              </h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tipo:</span>
                  <span className="font-medium text-slate-200">{ticket.deviceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Marca / Modelo:</span>
                  <span className="font-semibold text-white">{ticket.brandModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">IMEI / Serie:</span>
                  <span className="font-mono text-slate-200">{ticket.serialOrImei || 'No informado'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Issues and Diagnoses */}
          <div className="space-y-4">
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Falla Reportada en Recepción
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {ticket.reportedIssue}
              </p>
            </div>

            <div className="bg-indigo-950/20 border border-indigo-900/40 rounded-2xl p-5 space-y-2">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Diagnóstico de Laboratorio & Asistente IA</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {ticket.technicalDiagnosis ||
                  'En proceso de revisión técnica bajo microscopio, pruebas de impedancia y osciloscopio.'}
              </p>
            </div>
          </div>

          {/* Benchmarks & QC Status */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Protocolo de Control de Calidad (5 Puntos)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Línea VBUS y Carga (5.1V)</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Impedancia Placa Base</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Salud y Resistencia Batería</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Digitalizador & Sensores</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>WiFi / RF / Micrófonos</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 font-semibold text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>QC Passed: {ticket.qcPassed ? 'APROBADO' : 'PENDIENTE'}</span>
              </div>
            </div>
          </div>

          {/* Financial Highlights & QR */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800">
            <div className="space-y-2 text-center sm:text-left">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Estado Financiero de la Reparación
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-emerald-400">
                  ${Number(ticket.finalCost || ticket.estimatedCost || 0).toLocaleString('es-AR')}
                </span>
                <span className="text-xs text-slate-400">ARS</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    ticket.isPaid
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                      : 'bg-amber-950/80 text-amber-400 border border-amber-800'
                  }`}
                >
                  {ticket.isPaid ? '✓ PAGADO / COBRADO' : '⏳ PENDIENTE DE COBRO'}
                </span>
                <span className="text-xs text-slate-400">
                  Garantía Escrita: 90 Días
                </span>
              </div>
            </div>

            {/* QR Tracking Code */}
            <div className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-lg">
              <QRCodeSVG value={trackingUrl} size={90} level="M" />
              <div className="text-left font-mono text-slate-900">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Escaneá con celular
                </div>
                <div className="text-xs font-bold text-slate-900">Seguimiento 24/7</div>
                <div className="text-[10px] text-slate-600 mt-1 max-w-[120px] truncate">
                  Token: {ticket.trackingToken}
                </div>
              </div>
            </div>
          </div>

          {/* Legal Warranty Disclaimer */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 text-[11px] text-amber-200/90 leading-relaxed space-y-1">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Cláusula de Daño Líquido & Disposición Legal</span>
            </div>
            <p>
              Garantía de 90 días limitada exclusivamente a los repuestos instalados y fallas directas de mano de obra.
              {ticket.liquidDamageRisk
                ? ' AVISO: El cliente ha aceptado el riesgo de humedad previa en el dispositivo; la garantía queda excluida ante fallas progresivas de sulfatación.'
                : ' Dispositivo sin indicios visibles de humedad.'}
            </p>
          </div>
        </div>
      </main>

      {/* Thermal Receipt Modal */}
      {showThermal && (
        <ThermalReceipt
          ticket={ticket}
          onClose={() => setShowThermal(false)}
        />
      )}
    </div>
  );
}
