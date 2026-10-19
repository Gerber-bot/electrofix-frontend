'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Receipt,
  Download,
  Plus,
  RefreshCw,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  Building2,
  ExternalLink,
  X,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import AdminNav from '@/components/AdminNav';
import {
  fetchPayments,
  createPayment,
  fetchInvoices,
  createInvoice,
  fetchBillingSummary,
  createMercadoPagoPreference,
  fetchTickets,
  getPaymentPdfUrl,
} from '../../../lib/api';
import { Payment, Invoice, CashClosingSummary } from '../../../types/commercial';
import { RepairTicket } from '../../../types/ticket';

export default function BillingAdminPage() {
  const [activeTab, setActiveTab] = useState<'payments' | 'invoices'>('payments');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState<CashClosingSummary | null>(null);
  const [tickets, setTickets] = useState<RepairTicket[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showClosingModal, setShowClosingModal] = useState(false);

  // New Payment Form
  const [payTicketId, setPayTicketId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('EFECTIVO');
  const [payNotes, setPayNotes] = useState('');
  const [payReference, setPayReference] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // New Invoice Form
  const [invTicketId, setInvTicketId] = useState('');
  const [invCustomerName, setInvCustomerName] = useState('');
  const [invCustomerTaxId, setInvCustomerTaxId] = useState('');
  const [invAmount, setInvAmount] = useState('');
  const [submittingInvoice, setSubmittingInvoice] = useState(false);

  // MercadoPago Preference state
  const [mpPrefLoading, setMpPrefLoading] = useState(false);
  const [mpPrefResult, setMpPrefResult] = useState<any | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pData, iData, sData, tData] = await Promise.all([
        fetchPayments(),
        fetchInvoices(),
        fetchBillingSummary(),
        fetchTickets(),
      ]);
      setPayments(pData);
      setInvoices(iData);
      setSummary(sData);
      setTickets(tData);
    } catch (err) {
      console.error('Error fetching billing data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Autofill amount when selecting ticket in payment modal
  const handleTicketSelectInPayment = (ticketId: string) => {
    setPayTicketId(ticketId);
    const selected = tickets.find((t) => t.id === ticketId);
    if (selected) {
      const cost = selected.finalCost || selected.estimatedCost || '';
      if (cost) setPayAmount(String(cost));
    }
  };

  const handleTicketSelectInInvoice = (ticketId: string) => {
    setInvTicketId(ticketId);
    const selected = tickets.find((t) => t.id === ticketId);
    if (selected) {
      setInvCustomerName(selected.customerName);
      setInvCustomerTaxId(selected.customerDni);
      const cost = selected.finalCost || selected.estimatedCost || '';
      if (cost) setInvAmount(String(cost));
    }
  };

  const handleRegisterPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) return;

    setSubmittingPayment(true);
    try {
      await createPayment({
        ticketId: payTicketId || undefined,
        amount: Number(payAmount),
        method: payMethod,
        notes: payNotes || undefined,
        reference: payReference || undefined,
      });
      setShowPaymentModal(false);
      setPayAmount('');
      setPayNotes('');
      setPayReference('');
      setPayTicketId('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error al registrar pago');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invCustomerName.trim() || !invAmount || Number(invAmount) <= 0) return;

    setSubmittingInvoice(true);
    try {
      await createInvoice({
        ticketId: invTicketId || undefined,
        customerName: invCustomerName.trim(),
        customerTaxId: invCustomerTaxId.trim() || undefined,
        totalAmount: Number(invAmount),
      });
      setShowInvoiceModal(false);
      setInvCustomerName('');
      setInvCustomerTaxId('');
      setInvAmount('');
      setInvTicketId('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error al emitir factura');
    } finally {
      setSubmittingInvoice(false);
    }
  };

  const handleGenerateMercadoPago = async (ticket: RepairTicket) => {
    setMpPrefLoading(true);
    setMpPrefResult(null);
    try {
      const amount = Number(ticket.finalCost || ticket.estimatedCost || 1000);
      const res = await createMercadoPagoPreference({
        ticketId: ticket.id,
        title: `Reparación #${ticket.orderNumber} - ${ticket.brandModel}`,
        amount,
        customerEmail: 'cliente@electrofix.com',
      });
      setMpPrefResult(res);
    } catch (err: any) {
      alert(err.message || 'Error generando link de MercadoPago');
    } finally {
      setMpPrefLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      <AdminNav
        badge="BILLING & CASH"
        badgeColor="from-emerald-500 to-green-600"
        subtitle="Caja Diaria, Cobranzas, Emisión de Facturas y MercadoPago"
      />

      <main className="flex-1 max-w-[1780px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Banner Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-slate-900 border border-emerald-500/20 p-6 sm:p-8 shadow-2xl">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Control Financiero en Tiempo Real • Facturación Electrónica</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Gestión de Facturación, Cobros & Cierre de Caja
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Administrá los ingresos del taller, registrá pagos en efectivo, transferencias bancarias o cobros
              online con MercadoPago, y generá comprobantes oficiales en PDF.
            </p>
          </div>
        </div>

        {/* 4 Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Cobros de Hoy */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-emerald-500/50 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Cobros de Hoy
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                ${(summary?.totalCollectedToday || 0).toLocaleString('es-AR')}
              </div>
              <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                <span>{summary?.todayTransactionsCount || 0} operaciones hoy</span>
              </div>
            </div>
          </div>

          {/* Card 2: Ingresos del Mes */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-cyan-500/50 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Ingresos del Mes
              </span>
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-300 tracking-tight">
                ${(summary?.monthlyTotal || 0).toLocaleString('es-AR')}
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <span>Total facturado en curso</span>
              </div>
            </div>
          </div>

          {/* Card 3: Cierre de Caja Pendiente */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-indigo-500/50 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Efectivo en Caja Hoy
              </span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black font-mono text-indigo-300 tracking-tight">
                ${(summary?.byMethod.cash || 0).toLocaleString('es-AR')}
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <span>Transferencias: ${(summary?.byMethod.transfer || 0).toLocaleString('es-AR')}</span>
              </div>
            </div>
          </div>

          {/* Card 4: Facturas Emitidas */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-amber-500/50 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Facturas Emitidas
              </span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black font-mono text-amber-300 tracking-tight">
                {invoices.length}
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <span>Total comprobantes registrados</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Header & Modals Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800 self-start">
            <button
              onClick={() => setActiveTab('payments')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'payments'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Pagos y Cobranzas ({payments.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'invoices'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Facturas Oficiales ({invoices.length})</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowClosingModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cierre de Caja Diario</span>
            </button>

            <button
              onClick={() => setShowInvoiceModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>+ Crear Factura</span>
            </button>

            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition shadow-lg shadow-emerald-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Registrar Pago</span>
            </button>

            <button
              onClick={loadData}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
              title="Recargar"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tab Content: Payments Table */}
        {activeTab === 'payments' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
              <h3 className="font-semibold text-sm text-slate-200">
                Historial de Pagos y Transacciones
              </h3>
              <span className="text-xs text-slate-400">
                Integrado con recibos PDF vectoriales
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
                Cargando pagos...
              </div>
            ) : payments.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                No hay pagos registrados aún. Hacé clic en "+ Registrar Pago" para comenzar.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-4">Fecha</th>
                      <th className="py-3 px-4">ID Transacción</th>
                      <th className="py-3 px-4">Orden / Ticket</th>
                      <th className="py-3 px-4">Método</th>
                      <th className="py-3 px-4">Referencia / Notas</th>
                      <th className="py-3 px-4">Monto</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Comprobante</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {payments.map((p) => {
                      const linkedTicket = tickets.find((t) => t.id === p.ticket_id);
                      return (
                        <tr key={p.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                            {new Date(p.created_at).toLocaleString('es-AR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-cyan-400">
                            {(p.id || '').slice(0, 8)}...
                          </td>
                          <td className="py-3 px-4">
                            {linkedTicket ? (
                              <div>
                                <span className="font-semibold text-white">
                                  #{linkedTicket.orderNumber} - {linkedTicket.customerName}
                                </span>
                                <div className="text-[11px] text-slate-400">
                                  {linkedTicket.brandModel}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-500 font-mono">Sin ticket asociado</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                              {p.method}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                            {p.reference || p.notes || '-'}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-400 text-sm">
                            ${Number(p.amount).toLocaleString('es-AR')}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                p.status === 'APPROVED'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : 'bg-amber-950 text-amber-400 border border-amber-800'
                              }`}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <a
                              href={getPaymentPdfUrl(p.id)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
                            >
                              <Download className="w-3 h-3 text-emerald-400" />
                              <span>Recibo PDF</span>
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Invoices Table */}
        {activeTab === 'invoices' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
              <h3 className="font-semibold text-sm text-slate-200">
                Facturas Electrónicas Emitidas
              </h3>
              <span className="text-xs text-slate-400">
                Numeración correlativa legal
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
                Cargando facturas...
              </div>
            ) : invoices.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                No hay facturas emitidas todavía. Hacé clic en "+ Crear Factura" para generar una.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-4">Fecha</th>
                      <th className="py-3 px-4">N° de Factura</th>
                      <th className="py-3 px-4">Cliente / Razón Social</th>
                      <th className="py-3 px-4">CUIT / DNI</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          {new Date(inv.created_at).toLocaleDateString('es-AR')}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-amber-400">
                          {inv.invoice_number}
                        </td>
                        <td className="py-3 px-4 font-semibold text-white">
                          {inv.customer_name}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">
                          {inv.customer_tax_id || 'Consumidor Final'}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400 text-sm">
                          ${Number(inv.total_amount).toLocaleString('es-AR')}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <a
                            href={getPaymentPdfUrl(inv.id)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
                          >
                            <Download className="w-3 h-3 text-amber-400" />
                            <span>Factura PDF</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL: Registrar Pago */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Registrar Pago en Caja</h3>
                  <p className="text-xs text-slate-400">Ingreso de dinero y actualización de ticket</p>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterPayment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Vincular a Orden de Trabajo (Opcional):
                </label>
                <select
                  value={payTicketId}
                  onChange={(e) => handleTicketSelectInPayment(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Sin orden vinculada (cobro suelto) --</option>
                  {tickets.map((t) => (
                    <option key={t.id} value={t.id}>
                      #{t.orderNumber} - {t.customerName} ({t.brandModel}) - ${t.finalCost || t.estimatedCost || 0}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Monto a Cobrar ($ ARS) *:
                </label>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-base font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Método de Pago *:
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="EFECTIVO">Efectivo en Caja</option>
                  <option value="TRANSFERENCIA">Transferencia Bancaria / Alias</option>
                  <option value="MERCADOPAGO">MercadoPago (QR / Link)</option>
                  <option value="CARD">Tarjeta de Débito / Crédito</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  N° de Comprobante / Referencia:
                </label>
                <input
                  type="text"
                  placeholder="Ej: Operación 9482910"
                  value={payReference}
                  onChange={(e) => setPayReference(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Notas adicionales:
                </label>
                <input
                  type="text"
                  placeholder="Ej: Se entregó con templado de regalo"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                >
                  {submittingPayment ? 'Registrando...' : 'Confirmar Cobro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Crear Factura */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Emitir Factura Oficial</h3>
                  <p className="text-xs text-slate-400">Generación con numeración secuencial</p>
                </div>
              </div>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Vincular a Orden de Trabajo:
                </label>
                <select
                  value={invTicketId}
                  onChange={(e) => handleTicketSelectInInvoice(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Sin orden vinculada --</option>
                  {tickets.map((t) => (
                    <option key={t.id} value={t.id}>
                      #{t.orderNumber} - {t.customerName} ({t.brandModel})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Nombre o Razón Social *:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Juan Pérez"
                  value={invCustomerName}
                  onChange={(e) => setInvCustomerName(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  CUIT / CUIL / DNI:
                </label>
                <input
                  type="text"
                  placeholder="20-35492819-4"
                  value={invCustomerTaxId}
                  onChange={(e) => setInvCustomerTaxId(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Monto Total Facturado ($ ARS) *:
                </label>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  value={invAmount}
                  onChange={(e) => setInvAmount(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-base font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingInvoice}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition shadow-lg shadow-amber-600/20 disabled:opacity-50"
                >
                  {submittingInvoice ? 'Emitiendo...' : 'Emitir Factura'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Cierre de Caja Diario */}
      {showClosingModal && summary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Cierre de Caja del Día</h3>
                  <p className="text-xs text-slate-400">Fecha: {summary.date}</p>
                </div>
              </div>
              <button
                onClick={() => setShowClosingModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Efectivo en Mostrador:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    ${summary.byMethod.cash.toLocaleString('es-AR')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Transferencias Bancarias:</span>
                  <span className="font-mono font-bold text-cyan-400">
                    ${summary.byMethod.transfer.toLocaleString('es-AR')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Tarjetas Débito / Crédito:</span>
                  <span className="font-mono font-bold text-indigo-400">
                    ${summary.byMethod.card.toLocaleString('es-AR')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>MercadoPago:</span>
                  <span className="font-mono font-bold text-teal-400">
                    ${summary.byMethod.mercadopago.toLocaleString('es-AR')}
                  </span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-sm font-bold text-white">
                  <span>Total Ingresado Hoy:</span>
                  <span className="font-mono text-emerald-400 text-base">
                    ${summary.totalCollectedToday.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 text-center">
                Total de transacciones procesadas hoy: {summary.todayTransactionsCount}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowClosingModal(false)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition"
              >
                Cerrar Resumen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
