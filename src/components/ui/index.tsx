'use client';

import React, { useEffect } from 'react';
import { Loader2, Sparkles, CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';

/* ============================================================================
 * 1. ELECTROFIX BRAND LOGO (Herramienta + Circuito + Nodo IA)
 * ============================================================================ */
export interface ElectroFixLogoProps {
  variant?: 'horizontal' | 'compact' | 'mono';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ElectroFixLogo({
  variant = 'horizontal',
  size = 'md',
  className = '',
}: ElectroFixLogoProps) {
  const iconDimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }[size];

  const isMono = variant === 'mono';

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div
        className={`${iconDimensions} rounded-xl flex items-center justify-center relative overflow-hidden border transition-all ${
          isMono
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-gradient-to-br from-cyan-500/20 via-blue-600/15 to-indigo-600/20 border-cyan-500/35 shadow-[0_0_20px_-4px_rgba(6,182,212,0.35)]'
        }`}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          aria-hidden="true"
        >
          {/* Marco de microchip base */}
          <rect
            x="9"
            y="9"
            width="22"
            height="22"
            rx="5"
            stroke={isMono ? 'currentColor' : '#22D3EE'}
            strokeWidth="2"
          />
          {/* Pines de circuito electrónico */}
          <path
            d="M15 4V9M25 4V9M15 31V36M25 31V36M4 15H9M4 25H9M31 15H36M31 25H36"
            stroke={isMono ? 'currentColor' : '#3B82F6'}
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Trazo de llave técnica / pulso de diagnóstico */}
          <path
            d="M14 23L18 17L22 21L26 15"
            stroke={isMono ? 'currentColor' : '#F8FAFC'}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Nodo chispa IA */}
          <circle
            cx="26"
            cy="15"
            r="2.5"
            fill={isMono ? 'currentColor' : '#22D3EE'}
          />
        </svg>
      </div>

      {variant !== 'compact' && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`font-black tracking-tight ${
                size === 'lg' ? 'text-xl' : size === 'sm' ? 'text-sm' : 'text-base'
              } ${isMono ? 'text-slate-100' : 'text-slate-100'}`}
            >
              ELECTRO
              <span className={isMono ? 'text-slate-400' : 'text-cyan-400'}>FIX</span>
            </span>
            <span
              className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${
                isMono
                  ? 'bg-slate-800 text-slate-300 border-slate-700'
                  : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
              }`}
            >
              AI OS
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mt-1">
            Servicio Técnico
          </span>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
 * 2. BUTTON COMPONENT
 * ============================================================================ */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold shadow-lg shadow-cyan-950/50 border border-cyan-400/20',
    secondary:
      'bg-slate-900 hover:bg-slate-800 text-slate-100 font-semibold border border-slate-700/80 hover:border-cyan-500/40',
    outline:
      'bg-transparent hover:bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/40 hover:border-cyan-400',
    ghost:
      'bg-transparent hover:bg-slate-800/70 text-slate-300 hover:text-white font-medium border border-transparent',
    danger:
      'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-semibold border border-rose-500/35 hover:border-rose-500/60',
  };

  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
    lg: 'px-6 py-3.5 text-base rounded-xl gap-2.5',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center transition-all duration-200 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : leftIcon}
      <span>{children}</span>
      {!loading && rightIcon}
    </button>
  );
}

/* ============================================================================
 * 3. TEXTFIELD (INPUT) COMPONENT
 * ============================================================================ */
export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export function TextField({
  label,
  helperText,
  error,
  leftIcon,
  rightElement,
  id,
  disabled,
  className = '',
  ...props
}: TextFieldProps) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-bold uppercase tracking-wider text-slate-300"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-slate-500 pointer-events-none flex items-center">
            {leftIcon}
          </div>
        )}
        <input
          id={id}
          disabled={disabled}
          className={`w-full bg-slate-950/90 text-sm text-slate-100 placeholder:text-slate-600 rounded-xl py-2.5 transition-all focus:outline-none ${
            leftIcon ? 'pl-10' : 'pl-3.5'
          } ${rightElement ? 'pr-10' : 'pr-3.5'} ${
            error
              ? 'border border-rose-500/70 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20'
              : 'border border-slate-800 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20'
          } disabled:opacity-50 disabled:bg-slate-900/50 disabled:cursor-not-allowed ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 flex items-center">{rightElement}</div>
        )}
      </div>
      {error ? (
        <p className="text-xs text-rose-400 font-medium flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-xs text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
}

/* ============================================================================
 * 4. CARD COMPONENT
 * ============================================================================ */
export type CardVariant = 'surface' | 'elevated' | 'highlight' | 'danger' | 'success';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  interactive?: boolean;
}

export function Card({
  variant = 'surface',
  interactive = false,
  children,
  className = '',
  ...props
}: CardProps) {
  const variantClasses: Record<CardVariant, string> = {
    surface: 'bg-[#0B1120] border-slate-800/90 shadow-lg shadow-black/40',
    elevated: 'bg-[#111A2E] border-slate-700/80 shadow-xl shadow-black/50',
    highlight:
      'bg-gradient-to-b from-cyan-950/30 to-[#0B1120] border-cyan-500/35 shadow-[0_0_28px_-6px_rgba(6,182,212,0.2)]',
    danger: 'bg-rose-950/20 border-rose-500/35 shadow-lg shadow-rose-950/20',
    success: 'bg-emerald-950/20 border-emerald-500/35 shadow-lg shadow-emerald-950/20',
  };

  return (
    <div
      className={`rounded-2xl border p-5 transition-all duration-200 ${variantClasses[variant]} ${
        interactive
          ? 'hover:-translate-y-0.5 hover:border-cyan-500/45 hover:shadow-xl hover:shadow-cyan-950/20 cursor-pointer'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

/* ============================================================================
 * 5. BADGE COMPONENT (Estados del Taller y Semánticos)
 * ============================================================================ */
export type BadgeTone =
  | 'received'
  | 'diagnosing'
  | 'waiting_approval'
  | 'in_repair'
  | 'qc_check'
  | 'ready'
  | 'delivered'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger';

export interface BadgeProps {
  tone?: BadgeTone;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ tone = 'info', dot = true, children, className = '' }: BadgeProps) {
  const toneStyles: Record<BadgeTone, { badge: string; dot: string }> = {
    received: {
      badge: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
      dot: 'bg-sky-400',
    },
    diagnosing: {
      badge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
      dot: 'bg-indigo-400',
    },
    waiting_approval: {
      badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      dot: 'bg-amber-400',
    },
    in_repair: {
      badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      dot: 'bg-cyan-400',
    },
    qc_check: {
      badge: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
      dot: 'bg-purple-400',
    },
    ready: {
      badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      dot: 'bg-emerald-400',
    },
    delivered: {
      badge: 'bg-slate-800/80 text-slate-300 border-slate-700',
      dot: 'bg-slate-400',
    },
    info: {
      badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      dot: 'bg-cyan-400',
    },
    success: {
      badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      dot: 'bg-emerald-400',
    },
    warning: {
      badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      dot: 'bg-amber-400',
    },
    danger: {
      badge: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
      dot: 'bg-rose-400',
    },
  };

  const current = toneStyles[tone];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${current.badge} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />}
      {children}
    </span>
  );
}

/* ============================================================================
 * 6. CHIP COMPONENT (Acciones IA & Prioridades)
 * ============================================================================ */
export type ChipVariant = 'ai' | 'priority_high' | 'priority_medium' | 'priority_low' | 'filter';

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ChipVariant;
  loading?: boolean;
  active?: boolean;
}

export function Chip({
  variant = 'ai',
  loading = false,
  active = false,
  children,
  className = '',
  disabled,
  ...props
}: ChipProps) {
  const variantStyles: Record<ChipVariant, string> = {
    ai: 'bg-gradient-to-r from-cyan-500/15 to-blue-500/15 hover:from-cyan-500/25 hover:to-blue-500/25 text-cyan-300 border-cyan-500/35 shadow-sm shadow-cyan-950/40',
    priority_high: 'bg-rose-500/15 text-rose-300 border-rose-500/35',
    priority_medium: 'bg-amber-500/15 text-amber-300 border-amber-500/35',
    priority_low: 'bg-slate-800/80 text-slate-300 border-slate-700',
    filter: active
      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/45'
      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border-slate-800',
  };

  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer disabled:opacity-50 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
      ) : variant === 'ai' ? (
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}

/* ============================================================================
 * 7. TOAST / NOTIFICATION BANNER
 * ============================================================================ */
export type ToastVariant = 'success' | 'info' | 'warning' | 'error';

export interface ToastProps {
  variant?: ToastVariant;
  title: string;
  description?: string;
  onClose?: () => void;
}

export function Toast({ variant = 'info', title, description, onClose }: ToastProps) {
  const config: Record<
    ToastVariant,
    { wrapper: string; icon: React.ReactNode }
  > = {
    success: {
      wrapper: 'bg-[#0B1120]/95 border-emerald-500/40 text-emerald-200 shadow-emerald-950/30',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    },
    info: {
      wrapper: 'bg-[#0B1120]/95 border-cyan-500/40 text-cyan-200 shadow-cyan-950/30',
      icon: <Info className="w-5 h-5 text-cyan-400 shrink-0" />,
    },
    warning: {
      wrapper: 'bg-[#0B1120]/95 border-amber-500/40 text-amber-200 shadow-amber-950/30',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    },
    error: {
      wrapper: 'bg-[#0B1120]/95 border-rose-500/40 text-rose-200 shadow-rose-950/30',
      icon: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    },
  };

  const current = config[variant];

  return (
    <div
      role="status"
      className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-xl ${current.wrapper}`}
    >
      {current.icon}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-100">{title}</p>
        {description && <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{description}</p>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-slate-500 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-800/60"
          aria-label="Cerrar notificación"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

/* ============================================================================
 * 8. MODAL COMPONENT
 * ============================================================================ */
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ open, onClose, title, subtitle, children, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg rounded-2xl bg-[#0B1120] border border-cyan-500/30 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.85)] overflow-hidden"
      >
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-slate-800/90 bg-slate-900/40">
          <div>
            <h3 className="text-base font-bold text-slate-100">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 text-sm text-slate-300 space-y-4">{children}</div>

        {footer && (
          <div className="px-6 py-3.5 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
