'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Wrench,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Layers,
  MessageCircle,
  FileText,
  QrCode,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Clock,
  DollarSign,
  ChevronRight,
  ExternalLink,
  Smartphone,
  Star,
  Users,
  Building,
  Lock,
  Headphones,
  Zap,
} from 'lucide-react';

export default function CommercialLandingPage() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [monthlyRepairs, setMonthlyRepairs] = useState<number>(150);
  const [isAnnual, setIsAnnual] = useState<boolean>(true);

  // ROI Calculator Calculations
  const hoursSavedPerMonth = Math.round(monthlyRepairs * 0.75); // 45 mins saved per repair
  const moneySavedEstimate = Math.round(hoursSavedPerMonth * 12); // $12/hr labor cost

  const features = [
    {
      id: 0,
      title: 'Tablero Kanban en Tiempo Real',
      shortTitle: 'Kanban Operativo',
      icon: Layers,
      color: 'from-cyan-500 to-blue-600',
      description:
        'Control total del flujo de trabajo de tu taller: Recepción, Diagnóstico, Aprobación de Presupuesto, Banco de Trabajo, Control de Calidad 5 Puntos y Entrega en mostrador.',
      bullets: [
        'Organización visual por columnas dinámicas',
        'Filtros por técnico responsable y prioridad de equipo',
        'Alertas automáticas por demoras o piezas faltantes',
        'Tiempos promedio de permanencia por etapa',
      ],
      mockupTitle: 'Vista en Vivo del Taller',
      mockupSnippet: '12 Equipos en Banco • 4 Listos para Retirar • 0 Cuellos de Botella',
    },
    {
      id: 1,
      title: 'Copiloto de Diagnósticos con Gemini IA',
      shortTitle: 'Copiloto IA',
      icon: Sparkles,
      color: 'from-blue-500 to-indigo-600',
      description:
        'Convierte mediciones crudas de laboratorio y patrones de consumo en presupuestos profesionales y comprensibles para el cliente con inteligencia artificial generativa de Google.',
      bullets: [
        'Diagnósticos asistidos en menos de 5 segundos',
        'Explicaciones pedagógicas sin jerga incomprensible',
        'Detección de fallas comunes por modelo de placa',
        'Cálculo de margen y sugerencias de componentes',
      ],
      mockupTitle: 'Asistente IA de Laboratorio',
      mockupSnippet: 'Diagnóstico analizado por Gemini 2.5 • Recomendación lista para el cliente',
    },
    {
      id: 2,
      title: 'Seguimiento en Vivo y Alertas de Taller',
      shortTitle: 'Tracking en Vivo',
      icon: Clock,
      color: 'from-emerald-500 to-teal-600',
      description:
        'Mantené a tus clientes informados en todo momento. Actualizaciones automáticas de estado en el portal, avisos de recepción, aprobación digital de presupuesto y retiro listo con link QR.',
      bullets: [
        'Actualización instantánea al cambiar el estado del ticket',
        'Portal interactivo para aprobación digital de presupuestos',
        'Aviso de equipo listo para retiro con verificación QR',
        'Registro de auditoría inmutable de cada cambio de etapa',
      ],
      mockupTitle: 'Portal del Cliente en Vivo',
      mockupSnippet: '"Tu iPhone 13 ya pasó el control de calidad y está listo para retirar."',
    },
    {
      id: 3,
      title: 'Facturación, Caja y Reportes en PDF Vectorial',
      shortTitle: 'Caja & PDFKit',
      icon: FileText,
      color: 'from-amber-500 to-orange-600',
      description:
        'Genera órdenes de servicio, diagnósticos técnicos y recibos de pago en PDF vectorial de alto rendimiento con PDFKit, cierre de caja diario y checkout con MercadoPago.',
      bullets: [
        'Generación de PDF vectorial en milisegundos sin navegadores headless',
        'Cláusula legal de riesgo por humedad incorporada',
        'Cierre de caja discriminado: Efectivo, Transferencia, Tarjeta, MP',
        'Compatibilidad nativa con impresoras térmicas de 80mm',
      ],
      mockupTitle: 'Documentos Oficiales con Marca',
      mockupSnippet: 'Orden #1042 • PDF Vectorial A4 • Validez Legal y Garantía 90 Días',
    },
    {
      id: 4,
      title: 'Portal Público de Seguimiento con QR',
      shortTitle: 'Portal QR',
      icon: QrCode,
      color: 'from-purple-500 to-pink-600',
      description:
        'Reduce hasta un 45% las llamadas y consultas por mostrador permitiendo que los clientes consulten el estado de su reparación escaneando el QR de su ticket o ingresando su DNI.',
      bullets: [
        'Acceso seguro 24/7 sin registro ni contraseñas',
        'Línea de tiempo de estados interactiva',
        'Aprobación o rechazo de presupuesto en línea',
        'Historial de reparaciones anteriores por DNI',
      ],
      mockupTitle: 'Experiencia del Cliente',
      mockupSnippet: 'electrofix.com/track?token=tok-001 • Estado: En Banco de Trabajo',
    },
  ];

  const plans = [
    {
      name: 'Taller Inicial',
      priceMonth: 19,
      priceYear: 15,
      description: 'Ideal para técnicos independientes o talleres que dan el salto a la digitalización.',
      features: [
        'Hasta 120 reparaciones por mes',
        '1 Usuario Técnico / Administrador',
        'Tablero Kanban operativo',
        'Seguimiento de reparaciones en tiempo real',
        'Generación de PDF vectorial para órdenes',
        'Portal de seguimiento QR',
        'Soporte por email en 24hs',
      ],
      cta: 'Comenzar Taller',
      highlighted: false,
    },
    {
      name: 'Laboratorio Pro',
      badge: 'MÁS POPULAR',
      priceMonth: 49,
      priceYear: 39,
      description: 'Para laboratorios de microelectrónica y talleres con alto volumen de trabajo.',
      features: [
        'Reparaciones ilimitadas',
        'Hasta 6 Técnicos y Administradores',
        'Copiloto de Diagnósticos con Gemini IA',
        'Alertas y tracking en vivo en portal de clientes',
        'Suite de Facturación y Cierre de Caja Diario',
        'Generación de Órdenes, Diagnósticos y Recibos PDF',
        'Impresión térmica de 80mm con QR directo',
        'Auditoría inmutable de todas las acciones',
        'Soporte prioritario técnico 24/7',
      ],
      cta: 'Probar Laboratorio Pro',
      highlighted: true,
    },
    {
      name: 'Cadena & Franquicia',
      priceMonth: 99,
      priceYear: 79,
      description: 'Solución multisede para cadenas de reparación y distribuidores oficiales.',
      features: [
        'Múltiples sucursales y talleres unificados',
        'Técnicos y operadores ilimitados',
        'Roles y permisos avanzados por sucursal',
        'API REST completa y webhooks para ERP',
        'Reportes corporativos consolidados',
        'Personalización total con tu propia marca',
        'Onboarding guiado y migración de datos',
        'SLA garantizado del 99.9% y account manager',
      ],
      cta: 'Contactar a Ventas',
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#050811]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20">
              <Wrench className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="font-black text-xl tracking-tight text-white">
              ELECTRO<span className="text-cyan-400">FIX</span>
            </span>
          </Link>

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-cyan-400 transition">
              Módulos del Sistema
            </a>
            <a href="#roi" className="hover:text-cyan-400 transition">
              Calculadora ROI
            </a>
            <a href="#pricing" className="hover:text-cyan-400 transition">
              Planes & Precios
            </a>
            <a href="#testimonials" className="hover:text-cyan-400 transition">
              Casos de Éxito
            </a>
          </div>

          {/* Right CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/cotizador"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cotizador IA</span>
            </Link>

            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl shadow-lg shadow-cyan-500/20 transition transform hover:-translate-y-0.5"
            >
              <span>Entrar al Taller</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Glow ambient background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-cyan-500/20 to-blue-600/10 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-indigo-500/15 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs font-semibold shadow-lg shadow-cyan-500/5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Suite Comercial ElectroFix v3.2 • Laboratorios & Servicios Técnicos</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight max-w-5xl mx-auto leading-[1.08]">
            El Sistema Operativo para{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">
              Laboratorios y Talleres
            </span>{' '}
            de Nueva Generación
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Gestioná órdenes de reparación en tiempo real con tablero Kanban, copiloto técnico con IA,
            portal de seguimiento para clientes, reportes en PDF vectorial y facturación con cierre de caja diario.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/admin"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-sm font-extrabold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-2xl shadow-xl shadow-cyan-500/25 transition transform hover:-translate-y-0.5"
            >
              <span>Probar Demo en Vivo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/cotizador"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 text-sm font-bold text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-2xl transition"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Cotizador IA 24/7</span>
            </Link>
          </div>

          {/* Trust points under Hero */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Sin instalación • 100% en la Nube</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>PDFKit Vectorial sin dependencias</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Portal de seguimiento en tiempo real</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Mockup Card */}
        <div className="max-w-6xl mx-auto px-4 mt-14 sm:mt-18">
          <div className="p-3 sm:p-5 rounded-3xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl">
            <div className="bg-[#050811] rounded-2xl border border-slate-800 overflow-hidden">
              {/* Window Bar */}
              <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-mono text-slate-400 ml-2">
                    electrofix.app/admin/kanban
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Laboratorio en Vivo • 14 Equipos Activos</span>
                </div>
              </div>

              {/* Kanban Preview Columns */}
              <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
                {/* Col 1: Recepción */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-3">
                  <div className="flex items-center justify-between font-bold text-slate-300">
                    <span className="flex items-center gap-1.5 text-cyan-400">
                      <Clock className="w-3.5 h-3.5" />
                      Recepción
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px]">3</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 space-y-1.5 shadow-sm">
                    <div className="font-semibold text-white">#1044 • iPhone 14 Pro</div>
                    <div className="text-[11px] text-slate-400">Falla: No enciende tras caída</div>
                    <div className="text-[10px] text-emerald-400 font-mono font-bold">$65.000 (Aprobado)</div>
                  </div>
                </div>

                {/* Col 2: En Diagnóstico */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-3">
                  <div className="flex items-center justify-between font-bold text-slate-300">
                    <span className="flex items-center gap-1.5 text-indigo-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      Diagnóstico IA
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px]">2</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-indigo-900/40 space-y-1.5 shadow-sm">
                    <div className="font-semibold text-white">#1043 • Samsung S23 Ultra</div>
                    <div className="text-[11px] text-slate-400">Gemini IA: Corto en línea VBUS</div>
                    <div className="text-[10px] text-indigo-300 font-mono font-semibold">Revisión placa</div>
                  </div>
                </div>

                {/* Col 3: En Reparación */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-3">
                  <div className="flex items-center justify-between font-bold text-slate-300">
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <Wrench className="w-3.5 h-3.5" />
                      Banco de Trabajo
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px]">4</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-amber-900/40 space-y-1.5 shadow-sm">
                    <div className="font-semibold text-white">#1041 • MacBook Air M2</div>
                    <div className="text-[11px] text-slate-400">Reemplazo módulo pantalla</div>
                    <div className="text-[10px] text-amber-300 font-semibold">Técnico: Lucas G.</div>
                  </div>
                </div>

                {/* Col 4: Listo para Retiro */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-3">
                  <div className="flex items-center justify-between font-bold text-slate-300">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Listo para Retiro
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px]">5</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-emerald-900/40 space-y-1.5 shadow-sm">
                    <div className="font-semibold text-white">#1039 • Xiaomi 13 Pro</div>
                    <div className="text-[11px] text-slate-400">QC Passed 5/5 • Listo para entrega</div>
                    <div className="text-[10px] text-emerald-400 font-mono font-bold">$38.000 (Abonado)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE STATS BAR */}
      <section className="border-y border-slate-800/80 bg-slate-950/70 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black font-mono text-cyan-400 tracking-tight">
                +12.000
              </div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Reparaciones Gestionadas
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-400 tracking-tight">
                99.8%
              </div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Satisfacción del Cliente
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black font-mono text-blue-400 tracking-tight">
                -45%
              </div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Tiempo en Mostrador
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black font-mono text-indigo-400 tracking-tight">
                100%
              </div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Trazabilidad & Auditoría
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE FEATURE SHOWCASES (5 TABS) */}
      <section id="features" className="py-20 lg:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-400 text-xs font-bold border border-cyan-800">
              <Cpu className="w-3.5 h-3.5" />
              <span>Potencia Todo en Uno</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Diseñado para los Desafíos Reales del Taller
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Cada módulo resuelve un problema concreto: eliminar papeles desordenados, evitar reclamos
              por humedad y automatizar el contacto con el cliente.
            </p>
          </div>

          {/* Tabs Selector */}
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2">
            {features.map((feat) => {
              const Icon = feat.icon;
              const isSelected = activeTab === feat.id;
              return (
                <button
                  key={feat.id}
                  onClick={() => setActiveTab(feat.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition border ${
                    isSelected
                      ? 'bg-slate-800 text-white border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{feat.shortTitle}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Card Content */}
          {(() => {
            const current = features[activeTab];
            const Icon = current.icon;
            return (
              <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Description (6 cols) */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl bg-gradient-to-tr ${current.color} text-white shadow-lg`}>
                      <Icon className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      {current.title}
                    </h3>
                  </div>

                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    {current.description}
                  </p>

                  <div className="space-y-3 pt-2">
                    {current.bullets.map((b, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <Link
                      href="/admin"
                      className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition"
                    >
                      <span>Ver este módulo funcionando en vivo</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Right Interactive Mockup (6 cols) */}
                <div className="lg:col-span-6">
                  <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-4 shadow-xl relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {current.mockupTitle}
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-800">
                        ElectroFix OS
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-200 font-mono leading-relaxed">
                      {current.mockupSnippet}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Estado</div>
                        <div className="text-emerald-400 font-bold mt-0.5">Operacional 100%</div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Latencia</div>
                        <div className="text-cyan-400 font-bold mt-0.5">&lt; 40 ms</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* INTERACTIVE PRICING & ROI CALCULATOR */}
      <section id="roi" className="py-20 bg-slate-950/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 text-xs font-bold border border-emerald-800">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Calculadora de Retorno de Inversión</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              ¿Cuánto Ahorra tu Taller con ElectroFix?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Deslizá para indicar cuántos equipos ingresan por mes a tu taller o laboratorio
            </p>
          </div>

          <div className="max-w-3xl mx-auto bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
            {/* Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-slate-300">Reparaciones mensuales:</span>
                <span className="text-2xl font-black font-mono text-cyan-400">
                  {monthlyRepairs} equipos / mes
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="600"
                step="10"
                value={monthlyRepairs}
                onChange={(e) => setMonthlyRepairs(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>20 (Taller Chico)</span>
                <span>300 (Laboratorio Medio)</span>
                <span>600+ (Cadena)</span>
              </div>
            </div>

            {/* Calculations Result Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-center">
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Horas de Mostrador Ahorradas
                </div>
                <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-400">
                  {hoursSavedPerMonth} hs / mes
                </div>
                <div className="text-[11px] text-slate-500">
                  Sin llamados repetitivos preguntando "¿ya está listo mi celu?"
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-center">
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Ahorro Operativo Estimado
                </div>
                <div className="text-3xl sm:text-4xl font-black font-mono text-cyan-400">
                  ${moneySavedEstimate} USD / mes
                </div>
                <div className="text-[11px] text-slate-500">
                  ¡ElectroFix se paga solo en los primeros 3 días del mes!
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING PLANS SECTION */}
      <section id="pricing" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Precios Transparentes, Sin Sorpresas
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Todos los planes incluyen actualizaciones continuas y migración asistida de datos.
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="pt-4 flex items-center justify-center gap-3 text-xs font-semibold">
              <span className={!isAnnual ? 'text-white' : 'text-slate-400'}>Facturación Mensual</span>
              <button
                type="button"
                onClick={() => setIsAnnual(!isAnnual)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                  isAnnual ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
              <span className={isAnnual ? 'text-white' : 'text-slate-400'}>
                Anual <span className="text-emerald-400 font-bold">(20% OFF)</span>
              </span>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {plans.map((p, idx) => {
              const price = isAnnual ? p.priceYear : p.priceMonth;
              return (
                <div
                  key={idx}
                  className={`rounded-3xl p-8 flex flex-col justify-between transition relative ${
                    p.highlighted
                      ? 'bg-slate-900/90 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/20'
                      : 'bg-slate-900/50 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {p.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-cyan-500 text-slate-950 font-black text-[10px] tracking-wider uppercase shadow-md">
                      {p.badge}
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-white">{p.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{p.description}</p>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl sm:text-5xl font-black font-mono text-white">
                        ${price}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">USD / mes</span>
                    </div>

                    <div className="space-y-2.5 pt-2 border-t border-slate-800 text-xs">
                      {p.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2.5 text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8">
                    <Link
                      href="/admin"
                      className={`w-full py-3.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition ${
                        p.highlighted
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25'
                          : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                      }`}
                    >
                      <span>{p.cta}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS & TRUST BADGES */}
      <section id="testimonials" className="py-20 bg-slate-950/60 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Respaldado por Laboratorios Líderes
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Mirá lo que opinan los especialistas que ya operan con ElectroFix
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                "El copiloto de IA nos ahorra 2 horas diarias redactando explicaciones técnicas para clientes. Y
                el portal de seguimiento en tiempo real terminó con las consultas por teléfono."
              </p>
              <div className="text-xs font-semibold text-white">
                Rodrigo Benítez • <span className="text-cyan-400">Lab MicroFix Belgrano</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                "La cláusula de humedad legal en el PDF de recepción nos salvó de 3 reclamos complicados de
                equipos sulfatados. Todo queda registrado y firmado."
              </p>
              <div className="text-xs font-semibold text-white">
                Marcela Rossi • <span className="text-cyan-400">iCenter Reparaciones</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                "El cierre de caja diario y la emisión de recibos PDF es impecable. Sabemos al centavo cuánto
                ingresó en efectivo y cuánto por MercadoPago."
              </p>
              <div className="text-xs font-semibold text-white">
                Federico Galván • <span className="text-cyan-400">TechLab Córdoba</span>
              </div>
            </div>
          </div>

          {/* Security & Enterprise Badges */}
          <div className="pt-8 border-t border-slate-800/60 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-xs text-slate-400">
            <div className="flex items-center justify-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Encriptación AES-256</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Auditoría Inmutable</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Building className="w-4 h-4 text-blue-400" />
              <span>Multi-Tenant Seguro</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>99.9% Uptime SLA</span>
            </div>
          </div>
        </div>
      </section>

      {/* SALES CTA & CONTACT */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
          <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-r from-cyan-950/60 via-blue-950/40 to-slate-900 border border-cyan-500/30 shadow-2xl space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              ¿Listo para transformar la gestión de tu taller?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
              Comenzá hoy mismo sin costo con la demo en vivo o coordiná una reunión directa con nuestro
              equipo de especialistas para resolver tus dudas.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/admin"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm shadow-xl shadow-cyan-500/25 transition"
              >
                Abrir Taller Demo en Vivo
              </Link>

              <a
                href="https://wa.me/5491140506070?text=Hola,%20quiero%20conocer%20m%C3%A1s%20sobre%20ElectroFix%20para%20mi%20taller"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/20 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Hablar con un Especialista</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-[#03060c] py-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Wrench className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-white">
              ELECTRO<span className="text-cyan-400">FIX</span> OS
            </span>
            <span className="text-slate-500 ml-2">© 2026 ElectroFix Lab. Todos los derechos reservados.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/admin" className="hover:text-white transition">
              Panel Taller
            </Link>
            <Link href="/cotizador" className="hover:text-white transition">
              Cotizador IA
            </Link>
            <Link href="/track" className="hover:text-white transition">
              Portal Seguimiento
            </Link>
            <Link href="/styleguide" className="hover:text-white transition">
              Styleguide
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
