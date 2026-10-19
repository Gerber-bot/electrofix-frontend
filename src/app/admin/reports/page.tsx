'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  FileText,
  Search,
  Download,
  Printer,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ExternalLink,
  Receipt,
  FileCheck2,
  RefreshCw,
  Wrench,
  Smartphone,
  AlertCircle,
  Eye,
} from 'lucide-react';
import AdminNav from '@/components/AdminNav';
import { fetchTickets, getTicketPdfUrl, getDiagnosticPdfUrl, getPaymentPdfUrl } from '../../../lib/api';
import { RepairTicket } from '../../../types/ticket';

export default function ReportsAdminPage() {
  const [tickets, setTickets] = useState<RepairTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [customTicketId, setCustomTicketId] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchTickets();
      setTickets(data);
    } catch (err) {
      console.error('Error fetching tickets for reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesSearch =
        searchTerm === '' ||
        t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.customerDni.includes(searchTerm) ||
        t.brandModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(t.orderNumber).includes(searchTerm) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchTerm, filterStatus]);

  const handleDownload = async (url: string, filename: string, id: string) => {
    setDownloadingId(id);
    try {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setTimeout(() => setDownloadingId(null), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      <AdminNav
        badge="PDF ENGINE"
        badgeColor="from-blue-600 to-indigo-600"
        subtitle="Generación Vectorial de Órdenes, Diagnósticos y Recibos con PDFKit"
      />

      <main className="flex-1 max-w-[1780px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Banner Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/20 to-slate-900 border border-blue-500/20 p-6 sm:p-8 shadow-2xl">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Motor PDFKit Vectorial • Cero Dependencias Externas</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Centro de Reportes & Comprobantes Oficiales
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Descargá e imprimí al instante las órdenes de trabajo para recepción en mostrador, los informes de
              diagnóstico técnico con notas de laboratorio IA y los recibos oficiales de cobro y garantía.
            </p>
          </div>
        </div>

        {/* Quick Direct PDF Generator Box */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Generación Rápida por ID / Token</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              placeholder="Ingresá UUID, N° de Orden o Token..."
              value={customTicketId}
              onChange={(e) => setCustomTicketId(e.target.value)}
              className="w-full sm:flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                disabled={!customTicketId.trim()}
                onClick={() =>
                  handleDownload(
                    getTicketPdfUrl(customTicketId.trim()),
                    `orden-${customTicketId.trim()}.pdf`,
                    'quick-ticket',
                  )
                }
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl transition shadow-md shadow-cyan-600/20"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Orden Trabajo</span>
              </button>
              <button
                disabled={!customTicketId.trim()}
                onClick={() =>
                  handleDownload(
                    getDiagnosticPdfUrl(customTicketId.trim()),
                    `diagnostico-${customTicketId.trim()}.pdf`,
                    'quick-diag',
                  )
                }
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl transition shadow-md shadow-indigo-600/20"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Diagnóstico</span>
              </button>
              <button
                disabled={!customTicketId.trim()}
                onClick={() =>
                  handleDownload(
                    getPaymentPdfUrl(customTicketId.trim()),
                    `recibo-${customTicketId.trim()}.pdf`,
                    'quick-pay',
                  )
                }
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl transition shadow-md shadow-emerald-600/20"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Recibo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, DNI, modelo u orden..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="RECEIVED">Recibido</option>
              <option value="DIAGNOSING">En Diagnóstico</option>
              <option value="WAITING_APPROVAL">Esperando Aprobación</option>
              <option value="IN_REPAIR">En Reparación</option>
              <option value="QC_CHECK">Control de Calidad</option>
              <option value="READY_FOR_PICKUP">Listo para Retirar</option>
              <option value="DELIVERED">Entregado</option>
            </select>

            <button
              onClick={loadData}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
              title="Recargar"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tickets Table / Card Grid */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-slate-200">
              Órdenes Registradas ({filteredTickets.length})
            </h3>
            <span className="text-xs text-slate-400">
              Formato Vectorial A4 y Recibo Térmico disponible
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
              Cargando tickets y reportes...
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              No se encontraron reparaciones para los filtros aplicados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">Orden</th>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Dispositivo</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4">Costo</th>
                    <th className="py-3 px-4">Pago</th>
                    <th className="py-3 px-4 text-right">Descargas PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {filteredTickets.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-800/40 transition group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                        #{t.orderNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{t.customerName}</div>
                        <div className="text-[11px] text-slate-400">DNI: {t.customerDni}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200 font-medium">{t.brandModel}</div>
                        <div className="text-[11px] text-slate-400">{t.deviceType}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-emerald-400">
                        ${Number(t.finalCost || t.estimatedCost || 0).toLocaleString('es-AR')}
                      </td>
                      <td className="py-3.5 px-4">
                        {t.isPaid ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Abonado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400">
                            <Clock className="w-3.5 h-3.5" />
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* HTML Preview Link */}
                          <Link
                            href={`/admin/tickets/${t.id}/report`}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title="Vista Previa Detallada HTML"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          {/* Orden Recepción PDF */}
                          <button
                            onClick={() =>
                              handleDownload(
                                getTicketPdfUrl(t.id),
                                `orden-${t.orderNumber}.pdf`,
                                `t-${t.id}`,
                              )
                            }
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-800/70 text-cyan-300 hover:text-white transition text-[11px] font-medium"
                            title="Descargar Orden de Trabajo"
                          >
                            <FileText className="w-3 h-3 text-cyan-400" />
                            <span>Orden</span>
                          </button>

                          {/* Diagnóstico PDF */}
                          <button
                            onClick={() =>
                              handleDownload(
                                getDiagnosticPdfUrl(t.id),
                                `diagnostico-${t.orderNumber}.pdf`,
                                `d-${t.id}`,
                              )
                            }
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-800/70 text-indigo-300 hover:text-white transition text-[11px] font-medium"
                            title="Descargar Informe Técnico"
                          >
                            <FileCheck2 className="w-3 h-3 text-indigo-400" />
                            <span>Diagnóstico</span>
                          </button>

                          {/* Recibo de Pago PDF */}
                          <button
                            onClick={() =>
                              handleDownload(
                                getPaymentPdfUrl(t.id),
                                `recibo-${t.orderNumber}.pdf`,
                                `p-${t.id}`,
                              )
                            }
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/70 text-emerald-300 hover:text-white transition text-[11px] font-medium"
                            title="Descargar Recibo Oficial"
                          >
                            <Receipt className="w-3 h-3 text-emerald-400" />
                            <span>Recibo</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
