'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Wrench,
  LayoutDashboard,
  Users,
  Receipt,
  FileText,
  ShieldCheck,
  BookOpen,
  Database,
  Sparkles,
  ExternalLink,
  LogOut,
  Loader2,
} from 'lucide-react';
import { ElectroFixLogo } from '@/components/ui';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export type UserRoleType = 'admin' | 'taller' | 'tecnico' | 'operador';

export interface AdminNavProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  className?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  external?: boolean;
}

const ALL_NAV_ITEMS: NavItem[] = [
  { name: 'Taller', href: '/admin', icon: Wrench },
  { name: 'Panel General', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Usuarios', href: '/admin/users', icon: Users },
  { name: 'Facturación', href: '/admin/billing', icon: Receipt },
  { name: 'Reportes PDF', href: '/admin/reports', icon: FileText },
  { name: 'Auditoría', href: '/admin/audit', icon: ShieldCheck },
  { name: 'Catálogo de Servicios', href: '/admin/catalog', icon: BookOpen },
  { name: 'Backups', href: '/admin/backup', icon: Database },
  { name: 'Landing Comercial', href: '/landing', icon: Sparkles, external: true },
];

const RBAC_ALLOWED_ITEMS: Record<UserRoleType, string[]> = {
  admin: [
    'Taller',
    'Panel General',
    'Usuarios',
    'Facturación',
    'Reportes PDF',
    'Auditoría',
    'Catálogo de Servicios',
    'Backups',
    'Landing Comercial',
    'Cerrar sesión',
  ],
  taller: [
    'Taller',
    'Panel General',
    'Reportes PDF',
    'Catálogo de Servicios',
    'Backups',
    'Landing Comercial',
    'Cerrar sesión',
  ],
  tecnico: [
    'Taller',
    'Panel General',
    'Reportes PDF',
    'Landing Comercial',
    'Cerrar sesión',
  ],
  operador: [
    'Taller',
    'Panel General',
    'Landing Comercial',
    'Cerrar sesión',
  ],
};

const ROLE_BADGE_MAP: Record<UserRoleType, { label: string; badgeClasses: string }> = {
  admin: {
    label: 'ADMIN',
    badgeClasses: 'bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.18)]',
  },
  taller: {
    label: 'TALLER',
    badgeClasses: 'bg-blue-500/15 text-blue-300 border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.18)]',
  },
  tecnico: {
    label: 'TÉCNICO',
    badgeClasses: 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.18)]',
  },
  operador: {
    label: 'OPERADOR',
    badgeClasses: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.18)]',
  },
};

export function AdminNav({
  title,
  subtitle,
  badge,
  badgeColor,
  className = '',
}: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<UserRoleType>('admin');
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const supabase = createSupabaseBrowserClient();

    const fetchRole = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!isMounted) return;

        if (user) {
          const rawRole = (
            user.app_metadata?.role ||
            user.user_metadata?.role ||
            'admin'
          )
            .toString()
            .trim()
            .toLowerCase();

          if (rawRole === 'taller') setRole('taller');
          else if (rawRole === 'tecnico' || rawRole === 'técnico') setRole('tecnico');
          else if (rawRole === 'operador') setRole('operador');
          else setRole('admin');
        } else {
          setRole('admin');
        }
      } catch (err) {
        console.warn('Error fetching role in AdminNav:', err);
        if (isMounted) setRole('admin');
      }
    };

    fetchRole();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        const rawRole = (
          session.user.app_metadata?.role ||
          session.user.user_metadata?.role ||
          'admin'
        )
          .toString()
          .trim()
          .toLowerCase();

        if (rawRole === 'taller') setRole('taller');
        else if (rawRole === 'tecnico' || rawRole === 'técnico') setRole('tecnico');
        else if (rawRole === 'operador') setRole('operador');
        else setRole('admin');
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      router.push('/auth/login');
      router.refresh();
    }
  };

  const allowedSet = useMemo(() => {
    return new Set(RBAC_ALLOWED_ITEMS[role] || RBAC_ALLOWED_ITEMS.admin);
  }, [role]);

  const visibleNavLinks = useMemo(() => {
    return ALL_NAV_ITEMS.filter((item) => allowedSet.has(item.name));
  }, [allowedSet]);

  const isTabActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    if (href === '/landing') {
      return pathname === '/landing';
    }
    if (href === '/admin/reports') {
      return (
        pathname === '/admin/reports' ||
        (pathname?.startsWith('/admin/tickets/') && pathname?.includes('/report'))
      );
    }
    return pathname === href || pathname?.startsWith(href + '/');
  };

  const currentRoleConfig = ROLE_BADGE_MAP[role] || ROLE_BADGE_MAP.admin;

  return (
    <header
      className={`sticky top-0 z-40 w-full bg-[#050811]/90 backdrop-blur-xl border-b border-slate-800 ${className}`}
    >
      <div className="max-w-[1840px] mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 sm:gap-4">
        {/* Brand & Role Badge */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <Link
            href="/admin"
            className="flex items-center gap-2 group transition hover:opacity-95"
            title={title || 'ElectroFix OS'}
          >
            <ElectroFixLogo variant="compact" size="sm" className="sm:hidden" />
            <ElectroFixLogo variant="horizontal" size="sm" className="hidden sm:inline-flex" />
          </Link>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* Role Badge */}
          <span
            className={`px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase rounded-md border transition ${currentRoleConfig.badgeClasses}`}
            title={`Rol de seguridad asignado: ${currentRoleConfig.label}`}
          >
            {currentRoleConfig.label}
          </span>

          {/* Optional context badge */}
          {badge && badge !== currentRoleConfig.label && (
            <span
              className={`hidden md:inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md border ${
                badgeColor
                  ? `bg-gradient-to-r ${badgeColor} text-white border-transparent`
                  : 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60'
              }`}
            >
              {badge}
            </span>
          )}
        </div>

        {/* Scrollable Navigation Bar */}
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none py-1 px-1">
          {visibleNavLinks.map((item) => {
            const Icon = item.icon;
            const active = isTabActive(item.href);

            const activeClasses =
              'text-cyan-400 border-cyan-400 bg-cyan-500/10 shadow-sm shadow-cyan-500/15 font-semibold';
            const inactiveClasses =
              'text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border-slate-800/80 hover:border-slate-700 font-medium';

            return (
              <Link
                key={item.href}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noreferrer' : undefined}
                className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl border transition shrink-0 ${
                  active ? activeClasses : inactiveClasses
                }`}
                title={item.name}
              >
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${
                    active ? 'text-cyan-400' : 'text-slate-400 group-hover:text-white'
                  }`}
                />
                <span>{item.name}</span>
                {item.external && <ExternalLink className="w-3 h-3 opacity-60 ml-0.5 shrink-0" />}
              </Link>
            );
          })}
        </nav>

        {/* Cerrar sesión Action Button */}
        {allowedSet.has('Cerrar sesión') && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              title="Cerrar sesión activa"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 rounded-xl transition shadow-sm disabled:opacity-50 shrink-0"
            >
              {signingOut ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
              )}
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default AdminNav;
