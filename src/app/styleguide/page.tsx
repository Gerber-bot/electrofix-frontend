'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ElectroFixLogo,
  Button,
  TextField,
  Card,
  Badge,
  Chip,
  Toast,
  Modal,
} from '@/components/ui';
import {
  Search,
  Sparkles,
  Wrench,
  ArrowLeft,
  Palette,
  Type,
  Layers,
  Box,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';

const COLOR_SWATCHES = [
  {
    group: 'Fondos & Superficies',
    items: [
      { token: 'brand.bg.DEFAULT', hex: '#050811', usage: 'Fondo base global de la aplicación' },
      { token: 'brand.bg.alt', hex: '#080D1A', usage: 'Secciones alternas y columnas Kanban' },
      { token: 'brand.surface.DEFAULT', hex: '#0B1120', usage: 'Cards estándar, inputs y tablas' },
      { token: 'brand.surface.elevated', hex: '#111A2E', usage: 'Modales, dropdowns y hover cards' },
      { token: 'brand.surface.glass', hex: '#0F172A', usage: 'Headers sticky con backdrop-blur' },
    ],
  },
  {
    group: 'Acentos de Marca & IA',
    items: [
      { token: 'brand.primary.DEFAULT', hex: '#06B6D4', usage: 'CTA principal, foco activo, identidad IA' },
      { token: 'brand.primary.light', hex: '#22D3EE', usage: 'Hover primario, íconos destacados, brillos' },
      { token: 'brand.primary.dark', hex: '#0891B2', usage: 'Estados active/pressed y bordes intensos' },
      { token: 'brand.secondary.DEFAULT', hex: '#3B82F6', usage: 'Degradados junto a cian, enlaces técnicos' },
      { token: 'brand.secondary.dark', hex: '#2563EB', usage: 'Cierre de gradiente en botones primarios' },
    ],
  },
  {
    group: 'Estados Semánticos & Taller',
    items: [
      { token: 'brand.success', hex: '#10B981', usage: 'Listo para entregar, QC aprobado, presupuesto OK' },
      { token: 'brand.warning', hex: '#F59E0B', usage: 'Esperando aprobación, demora, falta repuesto' },
      { token: 'brand.danger', hex: '#F43F5E', usage: 'Prioridad urgente, daño por humedad, error' },
      { token: 'brand.info', hex: '#38BDF8', usage: 'Equipo recibido, aviso informativo neutral' },
    ],
  },
  {
    group: 'Jerarquía de Texto & Bordes',
    items: [
      { token: 'brand.text.DEFAULT', hex: '#F8FAFC', usage: 'Títulos principales, datos clave, montos' },
      { token: 'brand.text.secondary', hex: '#94A3B8', usage: 'Párrafos, descripciones técnicas, subtítulos' },
      { token: 'brand.text.muted', hex: '#64748B', usage: 'Placeholders, timestamps, metadatos' },
      { token: 'brand.border.DEFAULT', hex: '#1E293B', usage: 'Divisores y bordes de tarjeta estándar' },
    ],
  },
];

const TYPOGRAPHY_SCALE = [
  {
    token: 'text-display',
    size: '3.25rem (52px)',
    lineHeight: '1.1',
    tracking: '-0.03em',
    weight: 'font-black (900)',
    sample: 'Consultá tu equipo en tiempo real',
  },
  {
    token: 'text-h1',
    size: '2.25rem (36px)',
    lineHeight: '1.18',
    tracking: '-0.025em',
    weight: 'font-extrabold (800)',
    sample: 'Panel Operativo de Taller',
  },
  {
    token: 'text-h2',
    size: '1.5rem (24px)',
    lineHeight: '1.25',
    tracking: '-0.02em',
    weight: 'font-bold (700)',
    sample: 'Diagnóstico asistido por Gemini IA',
  },
  {
    token: 'text-h3',
    size: '1.125rem (18px)',
    lineHeight: '1.35',
    tracking: '-0.01em',
    weight: 'font-bold (700)',
    sample: 'iPhone 14 Pro Max — Cambio de Módulo OLED',
  },
  {
    token: 'text-body',
    size: '0.9375rem (15px)',
    lineHeight: '1.6',
    tracking: '0em',
    weight: 'font-normal (400)',
    sample:
      'Se realizó prueba de consumo en fuente regulada y reemplazo de flex de carga con limpieza ultrasónica.',
  },
  {
    token: 'text-small',
    size: '0.8125rem (13px)',
    lineHeight: '1.5',
    tracking: '0.01em',
    weight: 'font-medium (500)',
    sample: 'Actualizado hace 14 minutos por Técnico Principal',
  },
  {
    token: 'text-micro',
    size: '0.6875rem (11px)',
    lineHeight: '1.4',
    tracking: '0.06em (uppercase)',
    weight: 'font-bold (700)',
    sample: 'ORDEN #EF-9042 • PRIORIDAD ALTA',
  },
];

export default function StyleGuidePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [aiChipLoading, setAiChipLoading] = useState(false);

  const triggerAiDemo = () => {
    setAiChipLoading(true);
    setTimeout(() => setAiChipLoading(false), 1200);
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      {/* Header Sticky */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#050811]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ElectroFixLogo size="sm" />
            <span className="hidden sm:inline-block text-xs font-mono uppercase tracking-widest px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-cyan-400">
              Design System v1.0
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Volver al Inicio
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 px-3.5 py-2 rounded-xl transition-colors"
            >
              <Wrench className="w-3.5 h-3.5" />
              Panel Taller
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Hero Intro */}
        <section className="relative rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-cyan-950/25 via-[#0B1120] to-[#050811] p-8 sm:p-10 overflow-hidden">
          <div className="max-w-3xl space-y-4">
            <Badge tone="info">Sistema de Identidad Visual Global</Badge>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              ElectroFix <span className="text-cyan-400">Design System</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Lenguaje visual unificado de estética <strong>Dark SaaS + IA Técnica</strong>. Diseñado
              para garantizar alto contraste en entornos de laboratorio, jerarquía tipográfica clara
              y componentes reutilizables entre el Portal Público, el Cotizador IA y el Kanban
              Operativo.
            </p>
          </div>
        </section>

        {/* 1. Logotipo & Variantes de Marca */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">1. Identidad de Marca y Logotipo</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="surface" className="flex flex-col justify-between gap-6">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400">
                  Variante Principal (Horizontal)
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  Uso en navbars principales, portada pública y encabezados de reportes.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-[#050811] border border-slate-800/80 flex items-center justify-center">
                <ElectroFixLogo variant="horizontal" size="lg" />
              </div>
            </Card>

            <Card variant="surface" className="flex flex-col justify-between gap-6">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400">
                  Variante Compacta (Isotipo)
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  Uso en sidebars colapsados, favicons, avatares del agente IA y mobile.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-[#050811] border border-slate-800/80 flex items-center justify-center gap-4">
                <ElectroFixLogo variant="compact" size="sm" />
                <ElectroFixLogo variant="compact" size="md" />
                <ElectroFixLogo variant="compact" size="lg" />
              </div>
            </Card>

            <Card variant="surface" className="flex flex-col justify-between gap-6">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400">
                  Variante Monocromática
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  Uso en recibos térmicos de 80mm, sellos de garantía y footers secundarios.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-[#050811] border border-slate-800/80 flex items-center justify-center">
                <ElectroFixLogo variant="mono" size="md" />
              </div>
            </Card>
          </div>
        </section>

        {/* 2. Paleta de Colores Oficial */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <Palette className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">2. Paleta de Colores Semántica</h2>
          </div>

          <div className="space-y-8">
            {COLOR_SWATCHES.map((group) => (
              <div key={group.group} className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400">
                  {group.group}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {group.items.map((swatch) => (
                    <div
                      key={swatch.token}
                      className="rounded-xl border border-slate-800 bg-[#0B1120] overflow-hidden flex flex-col"
                    >
                      <div
                        className="h-16 w-full border-b border-slate-800/80"
                        style={{ backgroundColor: swatch.hex }}
                      />
                      <div className="p-3.5 space-y-1 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-mono font-bold text-slate-100">
                            {swatch.token}
                          </p>
                          <p className="text-[11px] font-mono text-cyan-400">{swatch.hex}</p>
                        </div>
                        <p className="text-[11px] text-slate-400 pt-1">{swatch.usage}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Escala Tipográfica */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <Type className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">3. Tipografía y Escalas de Texto</h2>
          </div>

          <Card variant="surface" className="divide-y divide-slate-800/80 p-0 overflow-hidden">
            {TYPOGRAPHY_SCALE.map((row) => (
              <div
                key={row.token}
                className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1 lg:w-64 shrink-0">
                  <span className="text-xs font-mono font-bold text-cyan-400">{row.token}</span>
                  <p className="text-[11px] font-mono text-slate-400">
                    {row.size} • LH {row.lineHeight}
                  </p>
                  <p className="text-[11px] text-slate-500">{row.weight}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-slate-100 truncate ${
                      row.token === 'text-display'
                        ? 'text-3xl sm:text-4xl font-black tracking-tight'
                        : row.token === 'text-h1'
                        ? 'text-2xl sm:text-3xl font-extrabold tracking-tight'
                        : row.token === 'text-h2'
                        ? 'text-xl font-bold'
                        : row.token === 'text-h3'
                        ? 'text-lg font-bold'
                        : row.token === 'text-body'
                        ? 'text-sm text-slate-300'
                        : row.token === 'text-small'
                        ? 'text-xs text-slate-400'
                        : 'text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold'
                    }`}
                  >
                    {row.sample}
                  </p>
                </div>
              </div>
            ))}
          </Card>
        </section>

        {/* 4. Componentes Base Interactivos */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <Box className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">4. Biblioteca de Componentes Base</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Botones */}
            <Card variant="surface" className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Botones (Variantes y Tamaños)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Un único botón <code className="text-cyan-400">primary</code> por vista o modal
                  para preservar foco visual.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Acción Principal</Button>
                <Button variant="secondary">Secundario</Button>
                <Button variant="outline">Outline Cian</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Eliminar</Button>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
                <Button size="sm" variant="secondary">
                  Tamaño SM
                </Button>
                <Button size="md" variant="secondary">
                  Tamaño MD
                </Button>
                <Button size="lg" variant="primary" leftIcon={<Sparkles className="w-4 h-4" />}>
                  Cotizar con IA (LG)
                </Button>
                <Button loading variant="primary">
                  Procesando...
                </Button>
              </div>
            </Card>

            {/* Inputs */}
            <Card variant="surface" className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Campos de Texto (TextField)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Focus ring cian (<code className="text-cyan-400">ring-cyan-500/20</code>) y
                  validación semántica.
                </p>
              </div>

              <TextField
                id="demo-dni"
                label="Consulta por DNI o N° de Orden"
                placeholder="Ej: 38910421"
                leftIcon={<Search className="w-4 h-4" />}
                helperText="Ingresá solo números sin puntos ni espacios."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField
                  id="demo-error"
                  label="Estado con Error"
                  defaultValue="ABC-123"
                  error="El DNI debe contener entre 7 y 9 dígitos."
                />
                <TextField
                  id="demo-disabled"
                  label="Campo Bloqueado (Tenant ID)"
                  defaultValue="ELECTROFIX-CENTRAL-01"
                  disabled
                />
              </div>
            </Card>

            {/* Badges & Chips */}
            <Card variant="surface" className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Badges de Estado Kanban & Chips IA
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Codificación cromática para las 7 etapas del taller y microinteracciones IA.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge tone="received">Recibido</Badge>
                <Badge tone="diagnosing">En Diagnóstico</Badge>
                <Badge tone="waiting_approval">Esperando Aprobación</Badge>
                <Badge tone="in_repair">En Reparación</Badge>
                <Badge tone="qc_check">Control Calidad</Badge>
                <Badge tone="ready">Listo p/ Entregar</Badge>
                <Badge tone="delivered">Entregado</Badge>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2.5">
                <Chip variant="ai" loading={aiChipLoading} onClick={triggerAiDemo}>
                  Mejorar informe con IA (Click Demo)
                </Chip>
                <Chip variant="priority_high">Prioridad Urgente</Chip>
                <Chip variant="priority_medium">Prioridad Media</Chip>
                <Chip variant="priority_low">Prioridad Baja</Chip>
              </div>
            </Card>

            {/* Toasts & Modal Trigger */}
            <Card variant="surface" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Toasts & Modales con Backdrop Blur
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Feedback inmediato para acciones del técnico o avisos de IA.
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setModalOpen(true)}>
                  Abrir Modal Demo
                </Button>
              </div>

              <div className="space-y-2.5">
                <Toast
                  variant="success"
                  title="Informe técnico optimizado con Gemini IA"
                  description="El diagnóstico fue formateado para el portal del cliente."
                />
                <Toast
                  variant="warning"
                  title="Equipo con antecedente de humedad"
                  description="Recordá adjuntar la cláusula de riesgo en el recibo térmico."
                />
              </div>
            </Card>
          </div>
        </section>

        {/* 5. Variantes de Cards */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">5. Jerarquía de Contenedores (Cards)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card variant="surface" interactive>
              <Badge tone="info" className="mb-3">
                Surface Standard
              </Badge>
              <h4 className="text-sm font-bold text-white">Tarjeta Estándar</h4>
              <p className="text-xs text-slate-400 mt-1">
                Para órdenes regulares en el tablero Kanban y métricas secundarias.
              </p>
            </Card>

            <Card variant="highlight" interactive>
              <Badge tone="in_repair" className="mb-3">
                Highlight IA
              </Badge>
              <h4 className="text-sm font-bold text-white">Tarjeta Destacada Cian</h4>
              <p className="text-xs text-slate-400 mt-1">
                Para el Cotizador IA 24/7, diagnósticos asistidos y planes principales.
              </p>
            </Card>

            <Card variant="success">
              <Badge tone="ready" className="mb-3">
                Success State
              </Badge>
              <h4 className="text-sm font-bold text-white">Equipo Listo / QC OK</h4>
              <p className="text-xs text-slate-400 mt-1">
                Resalta equipos verificados listos para retiro inmediato en mostrador.
              </p>
            </Card>

            <Card variant="danger">
              <Badge tone="danger" className="mb-3">
                Critical Alert
              </Badge>
              <h4 className="text-sm font-bold text-white">Alerta de Garantía / Riesgo</h4>
              <p className="text-xs text-slate-400 mt-1">
                Exclusivo para equipos con sulfatación severa o presupuesto rechazado.
              </p>
            </Card>
          </div>
        </section>

        {/* 6. Lineamientos de Uso */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">6. Reglas de Gobernanza Visual</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="surface" className="space-y-2">
              <h4 className="text-sm font-bold text-cyan-400">
                1. Disciplina de Gradientes y Brillos
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Los gradientes (<code className="text-cyan-300">from-cyan-500 to-blue-600</code>) se
                reservan exclusivamente para el CTA principal de cada pantalla y para acciones
                impulsadas por IA. Nunca apliques gradientes a fondos de tablas o tarjetas masivas
                del Kanban.
              </p>
            </Card>

            <Card variant="surface" className="space-y-2">
              <h4 className="text-sm font-bold text-emerald-400">
                2. Semántica Estricta de Color
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                El color <strong>Esmeralda</strong> significa únicamente éxito operativo (equipo
                listo o aprobado). El <strong>Cian</strong> representa navegación, foco activo e
                Inteligencia Artificial. El <strong>Ámbar</strong> indica bloqueo por espera del
                cliente.
              </p>
            </Card>

            <Card variant="surface" className="space-y-2">
              <h4 className="text-sm font-bold text-amber-400">
                3. Densidad y Legibilidad en Taller
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                En el tablero Kanban, cada tarjeta debe mostrar como máximo 5 puntos de datos: ID
                monoespaciado, modelo del equipo, cliente, chip de prioridad y acción de IA/avance,
                manteniendo un padding interno mínimo de <code className="text-cyan-300">16px</code>{' '}
                (<code className="text-cyan-300">p-4</code>).
              </p>
            </Card>
          </div>
        </section>
      </main>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Confirmar Presupuesto con IA"
        subtitle="Orden #EF-9042 • iPhone 14 Pro Max"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={() => setModalOpen(false)}>
              Aprobar y Notificar
            </Button>
          </>
        }
      >
        <p>
          Este modal utiliza <code className="text-cyan-400">backdrop-blur-md</code>, superficie{' '}
          <code className="text-cyan-400">#0B1120</code> y borde de acento sutil{' '}
          <code className="text-cyan-400">border-cyan-500/30</code> para mantener contexto sin
          perder contraste.
        </p>
      </Modal>
    </div>
  );
}
