'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { RepairTicket } from '../types/ticket';
import { Printer, X, ShieldAlert } from 'lucide-react';

interface ThermalReceiptProps {
  ticket: RepairTicket;
  onClose: () => void;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({ ticket, onClose }) => {
  // Direct link to the dedicated customer tracking portal
  const trackingUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/track?token=${ticket.trackingToken}`
    : `http://localhost:3000/track?token=${ticket.trackingToken}`;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(ticket.createdAt).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
      {/* Container styling for screen preview */}
      <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden print:border-none print:shadow-none print:bg-white print:text-black print:max-w-none print:w-auto">
        {/* Header Controls (hidden on print) */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/70 print:hidden">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Ticket Térmico (80mm)</h3>
              <p className="text-[11px] text-slate-400">Vista previa con QR de seguimiento</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 80mm Thermal Receipt Ticket Section */}
        <div className="p-6 flex justify-center bg-slate-950/40 print:p-0 print:bg-white">
          <div
            id="thermal-ticket-content"
            className="w-[300px] bg-white text-black font-mono text-xs p-4 shadow-xl rounded-sm print:shadow-none print:w-[72mm] print:p-2 print:m-0"
          >
            {/* Workshop Header */}
            <div className="text-center pb-2 border-b border-dashed border-gray-400">
              <h2 className="text-base font-black tracking-tight uppercase">
                {ticket.tenant?.name || 'ELECTROFIX SERVICIO TÉCNICO'}
              </h2>
              <p className="text-[10px] text-gray-700">Laboratorio de Microelectrónica</p>
              <p className="text-[10px] text-gray-700">Tel / WhatsApp: {ticket.tenant?.phone || '+54 9 3794 000000'}</p>
            </div>

            {/* Order Number & Timestamp */}
            <div className="py-2 border-b border-dashed border-gray-400 text-center">
              <span className="text-lg font-black tracking-wider block">
                ORDEN TÉCNICA #{String(ticket.orderNumber).padStart(5, '0')}
              </span>
              <p className="text-[10px] text-gray-600 mt-0.5">{formattedDate}</p>
            </div>

            {/* Customer & Device Information */}
            <div className="py-2 space-y-1 border-b border-dashed border-gray-400 text-[11px]">
              <div className="flex justify-between">
                <span className="font-bold">CLIENTE:</span>
                <span className="truncate max-w-[170px] font-semibold">{ticket.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">DNI:</span>
                <span>{ticket.customerDni}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">TELÉFONO:</span>
                <span>{ticket.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">TIPO:</span>
                <span>{ticket.deviceType}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">MODELO:</span>
                <span className="font-bold">{ticket.brandModel}</span>
              </div>
              {ticket.serialOrImei && (
                <div className="flex justify-between text-[10px]">
                  <span>S/N o IMEI:</span>
                  <span>{ticket.serialOrImei}</span>
                </div>
              )}
            </div>

            {/* Issue & Estimated Cost */}
            <div className="py-2 border-b border-dashed border-gray-400 space-y-1">
              <div>
                <span className="font-bold block text-[10px]">FALLA DECLARADA:</span>
                <p className="text-[11px] mt-0.5 leading-tight text-gray-800">{ticket.reportedIssue}</p>
              </div>
              {ticket.estimatedCost && (
                <div className="flex justify-between pt-1 border-t border-dotted border-gray-300 text-[11px] font-bold">
                  <span>PRESUPUESTO ESTIMADO:</span>
                  <span>${Number(ticket.estimatedCost).toLocaleString('es-AR')}</span>
                </div>
              )}
            </div>

            {/* Liquid / Moisture Damage Risk Disclaimer */}
            {ticket.liquidDamageRisk && (
              <div className="py-2 border-b border-dashed border-gray-400 bg-gray-100 p-1.5 my-1 rounded text-[9px] leading-tight text-red-900 border border-gray-300">
                <span className="font-black block uppercase text-[9.5px] text-red-700">
                  ⚠️ CLÁUSULA RIESGO POR HUMEDAD:
                </span>
                El cliente reconoce que el equipo ingresa con signos de humedad o contacto con líquidos.
                Se deslinda al taller de responsabilidad por sulfatación interna latente o fallas sobrevinientes durante el desensamble.
              </div>
            )}

            {/* QR Code for Live Online Tracking */}
            <div className="py-3 flex flex-col items-center justify-center text-center">
              <span className="font-black text-[10px] mb-1 uppercase tracking-wider">
                ESCANEAR PARA SEGUIMIENTO EN VIVO
              </span>
              <div className="p-2 bg-white border border-gray-300 rounded shadow-sm inline-block">
                <QRCodeSVG value={trackingUrl} size={120} level="M" />
              </div>
              <span className="text-[9px] text-gray-600 mt-1.5 font-medium">
                Consulta el estado, avance y aprueba presupuestos online
              </span>
              <span className="text-[8px] text-gray-400 font-mono mt-0.5">Token: {ticket.trackingToken}</span>
            </div>

            {/* Footer / Cut Line */}
            <div className="pt-2 border-t border-dashed border-gray-400 text-center text-[9px] text-gray-600 space-y-0.5">
              <p>Presupuestos válidos por 7 días hábiles.</p>
              <p className="font-bold">¡Gracias por elegir nuestro servicio técnico!</p>
              <p className="text-[8px] text-gray-400 pt-1">- - - - - - CORTE AQUÍ - - - - - -</p>
            </div>
          </div>
        </div>

        {/* Modal Controls (hidden on print) */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex gap-3 justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition"
          >
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl shadow-lg shadow-cyan-500/20 transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            Imprimir Ticket (80mm)
          </button>
        </div>
      </div>

      {/* Strict thermal receipt print stylesheet */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #thermal-ticket-content,
          #thermal-ticket-content * {
            visibility: visible;
          }
          #thermal-ticket-content {
            position: fixed;
            left: 0;
            top: 0;
            width: 72mm;
            margin: 0;
            padding: 3mm;
            background: white !important;
            color: black !important;
          }
          @page {
            size: 80mm auto;
            margin: 0mm;
          }
        }
      `}</style>
    </div>
  );
};
