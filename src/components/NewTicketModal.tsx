'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, Smartphone, Wrench, ShieldAlert } from 'lucide-react';
import { createTicket } from '../lib/api';
import { RepairTicket } from '../types/ticket';

interface NewTicketModalProps {
  onClose: () => void;
  onTicketCreated: (ticket: RepairTicket) => void;
}

export const NewTicketModal: React.FC<NewTicketModalProps> = ({ onClose, onTicketCreated }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerDni: '',
    customerPhone: '',
    deviceType: 'Celular',
    brandModel: '',
    serialOrImei: '',
    reportedIssue: '',
    liquidDamageRisk: false,
    estimatedCost: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.customerName || !formData.customerDni || !formData.customerPhone || !formData.brandModel || !formData.reportedIssue) {
      setError('Por favor completá los campos obligatorios (*)');
      return;
    }

    try {
      setLoading(true);
      const created = await createTicket({
        customerName: formData.customerName.trim(),
        customerDni: formData.customerDni.trim().replace(/\D/g, ''),
        customerPhone: formData.customerPhone.trim(),
        deviceType: formData.deviceType,
        brandModel: formData.brandModel.trim(),
        serialOrImei: formData.serialOrImei.trim() || undefined,
        reportedIssue: formData.reportedIssue.trim(),
        liquidDamageRisk: formData.liquidDamageRisk,
        estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined,
      });

      onTicketCreated(created);
    } catch (err: any) {
      setError(err?.message || 'Error al registrar el ingreso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">Nuevo Ingreso a Taller</h2>
              <p className="text-xs text-slate-400">Registrar orden técnica y generar ticket térmico con QR</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-red-950/50 border border-red-800/80 text-red-200 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Customer section */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Datos del Cliente</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nombre y Apellido *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">DNI / Documento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 35111222"
                  value={formData.customerDni}
                  onChange={(e) => setFormData({ ...formData, customerDni: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Teléfono / WhatsApp *</label>
              <input
                type="text"
                required
                placeholder="Ej. 3794112233"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          {/* Device section */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Datos del Dispositivo</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Tipo de Equipo *</label>
                <select
                  value={formData.deviceType}
                  onChange={(e) => setFormData({ ...formData, deviceType: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                >
                  <option value="Celular">Celular</option>
                  <option value="Notebook">Notebook</option>
                  <option value="PC de Escritorio">PC de Escritorio</option>
                  <option value="Consola (PS4/PS5/Xbox)">Consola</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Marca y Modelo Exacto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Samsung A32 o iPhone 13"
                  value={formData.brandModel}
                  onChange={(e) => setFormData({ ...formData, brandModel: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">N° Serie / IMEI (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej. 354890123456789"
                  value={formData.serialOrImei}
                  onChange={(e) => setFormData({ ...formData, serialOrImei: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Presupuesto Estimado ($)</label>
                <input
                  type="number"
                  placeholder="Ej. 65000"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Falla Reportada por el Cliente *</label>
              <textarea
                required
                rows={2}
                placeholder="Ej. Se cayó y no da imagen, suena pero la pantalla queda en negro..."
                value={formData.reportedIssue}
                onChange={(e) => setFormData({ ...formData, reportedIssue: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          {/* Moisture / Liquid Risk check */}
          <div className="pt-2">
            <label className="flex items-start gap-3 p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 cursor-pointer hover:bg-amber-950/30 transition">
              <input
                type="checkbox"
                checked={formData.liquidDamageRisk}
                onChange={(e) => setFormData({ ...formData, liquidDamageRisk: e.target.checked })}
                className="mt-1 w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-amber-500"
              />
              <div className="text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-400">
                  <ShieldAlert className="w-4 h-4" />
                  Riesgo por humedad o contacto con líquidos
                </div>
                <p className="text-slate-400 mt-0.5">
                  Marca este casillero si el equipo cayó al agua o tiene sulfato. Se imprimirá la cláusula legal de deslinde por corrosión latente en el ticket térmico.
                </p>
              </div>
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl shadow-lg shadow-cyan-500/20 transition active:scale-95 disabled:opacity-50"
            >
              <Wrench className="w-4 h-4" />
              {loading ? 'Registrando...' : 'Crear Orden e Imprimir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
