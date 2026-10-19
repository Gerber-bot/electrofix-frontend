'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wrench,
  Search,
  CheckCircle2,
  Clock,
  Smartphone,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  ArrowRight,
  Inbox,
  Microscope,
  Cpu,
  PackageCheck,
  LockKeyhole,
  Layers,
  Bot,
  FileText,
  Activity,
  Loader2,
} from 'lucide-react';
import { searchTicketsByDni } from '../lib/api';
import { AiChatWidget } from '../components/AiChatWidget';

const BENEFITS = [
  {
    title: 'Transparencia total en cada etapa',
    description:
      'Visualizá en vivo en qué sector del laboratorio se encuentra tu equipo, desde la recepción hasta las pruebas finales.',
    icon: Layers,
    accent: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  },
  {
    title: 'Seguimiento en tiempo real',
    description:
      'Consultá al instante el estado de tu equipo, presupuestos listos para aprobar o confirmación de retiro.',
    icon: Clock,
    accent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    title: 'Diagnósticos asistidos por IA',
    description:
      'Transformamos las mediciones de laboratorio en informes claros, detallados y comprensibles para que sepas qué se reparó.',
    icon: Sparkles,
    accent: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
  {
    title: 'Portal seguro sin contraseña',
    description:
      'Accedé al instante solo con tu número de DNI o escaneando el código QR impreso en tu recibo térmico de 80mm.',
    icon: LockKeyhole,
    accent: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  },
];

const WORKSHOP_FLOW = [
  {
    step: '01',
    title: 'Ingreso',
    description: 'Recepción en mostrador, registro fotográfico/legal y emisión de ticket con QR.',
    icon: Inbox,
    borderAccent: 'border-t-blue-400',
    iconStyle: 'text-blue-400 bg-blue-950/60 border-blue-800/50',
  },
  {
    step: '02',
    title: 'Diagnóstico',
    description: 'Inspección electrónica en banco para aislar la falla con instrumental de precisión.',
    icon: Microscope,
    borderAccent: 'border-t-yellow-400',
    iconStyle: 'text-yellow-400 bg-yellow-950/60 border-yellow-800/50',
  },
  {
    step: '03',
    title: 'Esperando aprobación',
    description: 'Recibís el informe y presupuesto detallado para autorizar online con un solo clic.',
    icon: Clock,
    borderAccent: 'border-t-orange-400',
    iconStyle: 'text-orange-400 bg-orange-950/60 border-orange-800/50',
  },
  {
    step: '04',
    title: 'En banco',
    description: 'Microsoldadura, sustitución de componentes originales o mantenimiento térmico.',
    icon: Cpu,
    borderAccent: 'border-t-cyan-400',
    iconStyle: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/50',
  },
  {
    step: '05',
    title: 'Control de calidad',
    description: 'Auditoría obligatoria de 5 puntos críticos (carga, cámaras, audio, táctil y señal).',
    icon: ShieldCheck,
    borderAccent: 'border-t-purple-400',
    iconStyle: 'text-purple-400 bg-purple-950/60 border-purple-800/50',
  },
  {
    step: '06',
    title: 'Listo para retirar',
    description: 'Equipo verificado, limpio y con garantía escrita listo para retiro en mostrador.',
    icon: PackageCheck,
    borderAccent: 'border-t-emerald-400',
    iconStyle: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/50',
  },
];

const AI_FEATURES = [
  {
    title: 'Cotizador IA 24/7',
    description:
      'Consultá precios de módulos, baterías, pines de carga o mantenimiento de notebooks en cualquier horario con stock real.',
    icon: Bot,
    tag: 'Atención inmediata',
  },
  {
    title: 'Mejoras automáticas de informes técnicos',
    description:
      'Nuestro copiloto de laboratorio traduce las notas técnicas de banco en reportes ejecutivos transparentes para el cliente.',
    icon: FileText,
    tag: 'Claridad técnica',
  },
  {
    title: 'Asistente de diagnóstico',
    description:
      'Orientación preventiva instantánea (qué hacer ante equipos mojados, golpes o fallas de encendido antes de venir al local).',
    icon: Activity,
    tag: 'Prevención inteligente',
  },
];

export default function PublicLandingPage() {
  const router = useRouter();
  const [dniInput, setDniInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow digits only for clean DNI validation
    const digitsOnly = e.target.value.replace(/\D/g, '');
    setDniInput(digitsOnly);
    if (errorMessage) setErrorMessage(null);
  };

  const handleConsultDni = async (overrideDni?: string) => {
    const targetDni = (overrideDni ?? dniInput).trim().replace(/\D/g, '');

    if (!targetDni || targetDni.length < 6) {
      setErrorMessage('Ingresá un número de DNI válido (solo números, mínimo 6 dígitos).');
      return;
    }

    setSearching(true);
    setErrorMessage(null);

    try {
      const tickets = await searchTicketsByDni(targetDni);
      if (!tickets || tickets.length === 0) {
        setErrorMessage(
          `No encontramos órdenes activas asociadas al DNI ${targetDni}. Verificá el número ingresado o consultá con el taller.`,
        );
        return;
      }

      router.push(`/track?dni=${encodeURIComponent(targetDni)}`);
    } catch {
      // If backend is temporarily unreachable, still allow navigation to /track so it can handle retry
      router.push(`/track?dni=${encodeURIComponent(targetDni)}`);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* 1. Sticky SaaS Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition">
              <Wrench className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight">ElectroFix</span>
              <span className="text-xs text-cyan-400 block -mt-1 font-medium">
                Servicio Técnico Especializado
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <a href="#consultar" className="hover:text-cyan-400 transition">
              Consultar reparación
            </a>
            <a href="#flujo" className="hover:text-cyan-400 transition">
              Etapas del laboratorio
            </a>
            <Link href="/cotizador" className="hover:text-cyan-400 transition flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cotizador IA</span>
            </Link>
            <Link href="/landing" className="text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Conocé ElectroFix SaaS</span>
            </Link>
          </nav>

          {/* Right CTA Controls */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/cotizador"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-cyan-950/50 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cotizador IA 24/7</span>
            </Link>

            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-cyan-500/30 hover:border-cyan-400 transition shadow-sm"
            >
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>Acceso Taller / Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Principal */}
      <section
        id="consultar"
        className="relative overflow-hidden border-b border-slate-800/70 bg-gradient-to-b from-slate-900/70 via-slate-950 to-slate-950 py-16 sm:py-24 px-4 sm:px-6"
      >
        {/* Ambient SaaS Glows */}
        <div className="pointer-events-none absolute inset-0 flex justify-center">
          <div className="w-[650px] h-[380px] bg-gradient-to-tr from-cyan-500/15 via-blue-600/10 to-purple-600/10 rounded-full blur-3xl -top-24" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Value Proposition & DNI Search */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-semibold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Laboratorio de Microelectrónica & Diagnóstico Inteligente</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
              Seguí tu reparación en{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-transparent">
                tiempo real
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Ingresá tu DNI y consultá el estado de tu celular, notebook o consola en nuestro
              laboratorio. Conocé el diagnóstico técnico, aprobá presupuestos online y recibí
              asistencia por IA las 24 horas.
            </p>

            {/* DNI Search Box */}
            <div className="max-w-xl mx-auto lg:mx-0 space-y-3 pt-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleConsultDni();
                }}
                className="flex flex-col sm:flex-row gap-2.5 bg-slate-900/95 p-2 rounded-2xl border border-slate-800 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/20 shadow-2xl shadow-cyan-950/20 transition"
              >
                <div className="relative flex-1 flex items-center">
                  <Search className="w-5 h-5 absolute left-3.5 text-slate-500" />
                  <input
                    type="text"
                    inputMode="numeric"
                    aria-label="Número de DNI"
                    placeholder="Ingresá tu número de DNI"
                    value={dniInput}
                    onChange={handleDniChange}
                    className="w-full bg-transparent pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching || !dniInput.trim()}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl border border-cyan-300/40 shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                >
                  {searching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <>
                      <span>Consultar estado</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Elegant Validation / Not Found Alert */}
              {errorMessage && (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/70 text-rose-200 text-xs flex items-center gap-2.5 text-left animate-in fade-in duration-200"
                >
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Clean Production Help Text */}
              <p className="text-xs text-slate-400 text-center lg:text-left pt-1">
                Ingresá el DNI registrado al momento de dejar tu equipo en el laboratorio.
              </p>
            </div>
          </div>

          {/* Right Column: Technological Vector Illustration Card */}
          <div className="lg:col-span-5">
            <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl shadow-black/60 space-y-5">
              {/* Top Telemetry Bar */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Monitor de Laboratorio en Vivo
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Trazabilidad digital por orden y QR
                    </span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Sistema Online
                </span>
              </div>

              {/* Simulated Live Order Preview */}
              <div className="bg-slate-950/90 border border-slate-800/90 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-cyan-400">#ORD-0004</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                    Control Calidad 5/5 OK
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">iPhone 11 • Cambio de Batería</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Informe estructurado con IA y verificado en banco ESD.
                  </p>
                </div>
                {/* Progress Visual */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[10px] font-semibold">
                    <span className="text-slate-400">Progreso de etapa</span>
                    <span className="text-cyan-400">85% • Listo para retirar</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div className="w-[85%] h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Bottom Feature Pills */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-slate-300 font-medium">Garantía Escrita</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="text-slate-300 font-medium">Informes con IA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Sección de Beneficios (4 Columnas) */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            Estándar de Calidad SaaS
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Por qué confiar tu equipo a ElectroFix
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Combinamos instrumentación electrónica profesional con software de seguimiento en tiempo
            real.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {BENEFITS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-slate-900/70 hover:bg-slate-900 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-6 shadow-lg transition-all duration-200 hover:-translate-y-0.5 space-y-3"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${item.accent}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-white">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Sección de Flujo del Taller (Timeline Visual) */}
      <section
        id="flujo"
        className="py-16 sm:py-20 px-4 sm:px-6 border-y border-slate-800/70 bg-slate-900/30"
      >
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Trazabilidad de Laboratorio
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Flujo de trabajo transparente de punta a punta
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Cada orden atraviesa 6 etapas auditadas que podés monitorear desde tu celular.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {WORKSHOP_FLOW.map((stage) => {
              const StageIcon = stage.icon;
              return (
                <div
                  key={stage.step}
                  className={`bg-slate-900/80 border border-slate-800/90 border-t-2 ${stage.borderAccent} rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:-translate-y-0.5 transition`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-xl border ${stage.iconStyle}`}>
                        <StageIcon className="w-4 h-4" />
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-500">
                        ETAPA {stage.step}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-white">{stage.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{stage.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Sección de Herramientas Inteligentes (IA) */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-cyan-950/30 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400">
                <Sparkles className="w-4 h-4" />
                <span>Potenciado por Google Gemini</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Herramientas Inteligentes al servicio de tu equipo
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Integramos inteligencia artificial generativa conectada a nuestro catálogo y banco
                de trabajo para cotizar al instante y detallar cada intervención técnica.
              </p>
            </div>

            <Link
              href="/cotizador"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider border border-cyan-300/40 shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01] active:scale-95 shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>Probar Cotizador IA</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {AI_FEATURES.map((feat, i) => {
              const FeatIcon = feat.icon;
              return (
                <div
                  key={i}
                  className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-6 space-y-3 hover:border-cyan-500/40 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <FeatIcon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-900 text-cyan-300 border border-slate-800">
                      {feat.tag}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white">{feat.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Footer Profesional */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950">
              <Wrench className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-bold text-sm text-white">ElectroFix Servicio Técnico</span>
              <p className="text-xs text-slate-500">
                ElectroFix Servicio Técnico — Plataforma de Gestión de Taller
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link href="/landing" className="text-emerald-400 hover:text-emerald-300 font-semibold transition">
              ElectroFix SaaS Comercial
            </Link>
            <a href="#consultar" className="hover:text-cyan-400 transition">
              Términos
            </a>
            <a href="#consultar" className="hover:text-cyan-400 transition">
              Privacidad
            </a>
            <Link href="/cotizador" className="hover:text-cyan-400 transition">
              Contacto
            </Link>
          </div>
        </div>
      </footer>

      {/* Floating 24/7 AI Quoter Widget */}
      <AiChatWidget />
    </div>
  );
}
