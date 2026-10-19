import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#020617',          // slate-950 (Fondo principal laboratorio)
          bgElevated: '#0f172a',  // slate-900 (Superficie base)
          surface: '#0f172a',     // Tarjetas y contenedores
          surfaceHover: '#1e293b',// slate-800 (Hover en tarjetas/inputs)
          border: '#1e293b',      // Divisor estructural sutil
          primary: '#22d3ee',     // cyan-400 (Acción principal & foco)
          primaryBlue: '#3b82f6', // blue-500 (Gradiente primario)
          secondary: '#a855f7',   // purple-500 (IA avanzada & QC)
          success: '#10b981',     // emerald-500 (Listo p/ retirar / Aprobado)
          warning: '#f59e0b',     // amber-500 (En revisión / Precaución)
          orange: '#fb923c',      // orange-400 (Esperando aprobación)
          danger: '#ef4444',      // red-500 (Error crítico / Rechazo)
          text: '#e5e7eb',        // gray-200 (Texto principal de alto contraste)
          muted: '#9ca3af',       // gray-400 (Subtítulos y metadatos)
          subtle: '#6b7280',      // gray-500 (Placeholders y etiquetas)
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Inter', 'Manrope', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        display: ['2.75rem', { lineHeight: '1.12', letterSpacing: '-0.03em', fontWeight: '800' }],
        h1: ['2rem', { lineHeight: '1.2', letterSpacing: '-0.025em', fontWeight: '800' }],
        h2: ['1.5rem', { lineHeight: '1.28', letterSpacing: '-0.02em', fontWeight: '700' }],
        h3: ['1.125rem', { lineHeight: '1.35', letterSpacing: '-0.015em', fontWeight: '600' }],
        body: ['0.875rem', { lineHeight: '1.6', letterSpacing: '0em', fontWeight: '400' }],
        small: ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.01em', fontWeight: '500' }],
        micro: ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.04em', fontWeight: '600' }],
      },
      borderRadius: {
        btn: '0.5rem',    // rounded-lg (8px)
        card: '0.75rem',  // rounded-xl (12px)
        panel: '1rem',    // rounded-2xl (16px)
        modal: '1.5rem',  // rounded-3xl (24px)
      },
      boxShadow: {
        'brand-sm': '0 2px 8px -2px rgba(2, 6, 23, 0.7)',
        'brand-card': '0 10px 30px -10px rgba(2, 6, 23, 0.85), 0 0 1px 1px rgba(30, 41, 59, 0.6)',
        'brand-glow': '0 8px 25px -4px rgba(34, 211, 238, 0.22)',
        'brand-ai': '0 8px 25px -4px rgba(168, 85, 247, 0.22)',
      },
    },
  },
  plugins: [],
};

export default config;
