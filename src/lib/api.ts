import { RepairTicket, PriceCatalogItem, TicketStatus } from '../types/ticket';
import type {
  AuditLogsResponse,
  AuditLogEntry,
  InvitationEntry,
  DashboardMetricsData,
  DashboardChartsData,
} from '../types/admin-suite';
import type {
  CatalogItem,
  CreateCatalogItemInput,
  UpdateCatalogItemInput,
} from '../types/catalog';

// Sanitize API base URL by stripping trailing slashes to prevent double-slash request errors
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

export async function getAuthToken(): Promise<string | undefined> {
  if (typeof window === 'undefined') return undefined;
  try {
    const { createSupabaseBrowserClient } = await import('./supabase/client');
    const supabase = createSupabaseBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token;
  } catch {
    return undefined;
  }
}

async function getAuthHeaders(
  token?: string,
  extra: Record<string, string> = {},
): Promise<Record<string, string>> {
  const authToken = token || (await getAuthToken());
  const headers: Record<string, string> = { ...extra };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
}

// ==========================================
// TICKETS & WORKSHOP APIS
// ==========================================

export async function fetchTenant() {
  const res = await fetch(`${API_BASE}/tickets/tenant`);
  if (!res.ok) throw new Error('Error al cargar datos del taller');
  return res.json();
}

export async function fetchTickets(status?: TicketStatus, token?: string): Promise<RepairTicket[]> {
  const headers = await getAuthHeaders(token);
  const url = status ? `${API_BASE}/tickets?status=${status}` : `${API_BASE}/tickets`;
  const res = await fetch(url, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar tickets');
  return res.json();
}

export async function fetchTicketById(id: string, token?: string): Promise<RepairTicket> {
  const headers = await getAuthHeaders(token);
  const res = await fetch(`${API_BASE}/tickets/${encodeURIComponent(id)}`, {
    headers,
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Ticket no encontrado');
  return res.json();
}

export async function fetchCatalog(): Promise<PriceCatalogItem[]> {
  const res = await fetch(`${API_BASE}/tickets/catalog`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar catálogo');
  return res.json();
}

export async function createTicket(
  data: Partial<RepairTicket>,
  token?: string,
): Promise<RepairTicket> {
  const headers = await getAuthHeaders(token, { 'Content-Type': 'application/json' });

  const res = await fetch(`${API_BASE}/tickets`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error al crear ticket' }));
    throw new Error(err.message || 'Error al crear ticket');
  }
  return res.json();
}

export async function updateTicket(
  id: string,
  data: {
    status?: TicketStatus;
    technicalDiagnosis?: string;
    qcPassed?: boolean;
    finalCost?: number;
    estimatedCost?: number;
    isPaid?: boolean;
  },
  token?: string,
): Promise<RepairTicket> {
  const headers = await getAuthHeaders(token, { 'Content-Type': 'application/json' });

  const res = await fetch(`${API_BASE}/tickets/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error al actualizar ticket' }));
    throw new Error(err.message || 'Error al actualizar ticket');
  }
  return res.json();
}

export async function approveTicketBudget(idOrToken: string): Promise<RepairTicket> {
  const clean = idOrToken.trim();
  const res = await fetch(`${API_BASE}/tickets/${encodeURIComponent(clean)}/approve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    // Fallback to updateTicket
    return updateTicket(clean, { status: 'IN_REPAIR' });
  }
  return res.json();
}

export async function searchTicketsByDni(dni: string): Promise<RepairTicket[]> {
  const res = await fetch(`${API_BASE}/tickets/by-dni/${encodeURIComponent(dni)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al buscar tickets');
  return res.json();
}

export async function fetchTicketByToken(token: string): Promise<RepairTicket> {
  const res = await fetch(`${API_BASE}/tickets/track/${encodeURIComponent(token)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('No se encontró el ticket');
  return res.json();
}

// ==========================================
// AI ASSISTANT & QUOTING APIS
// ==========================================

export async function cleanNoteWithAi(
  rawNotes: string,
  device?: string,
  token?: string,
): Promise<{ cleanedReport: string }> {
  const headers = await getAuthHeaders(token, { 'Content-Type': 'application/json' });

  const res = await fetch(`${API_BASE}/ai/clean-note`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ rawNotes, device }),
  });
  if (!res.ok) throw new Error('Error al conectar con el asistente IA');
  return res.json();
}

export async function chatWithAi(message: string, customerDni?: string, history?: any[]): Promise<{ reply: string }> {
  const res = await fetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, customerDni, history }),
  });
  if (!res.ok) throw new Error('Error al conectar con el cotizador IA');
  return res.json();
}

// ==========================================
// USERS & RBAC APIS
// ==========================================

export async function fetchUsers(token?: string): Promise<import('../types/user').UserItem[]> {
  const headers = await getAuthHeaders(token, { 'Content-Type': 'application/json' });

  const res = await fetch(`${API_BASE}/auth/users`, {
    headers,
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error al cargar usuarios' }));
    throw new Error(err.message || 'Error al cargar usuarios');
  }
  const data = await res.json();
  return Array.isArray(data) ? data : data.users || [];
}

export async function createUser(
  userData: { email: string; password: string; role: import('../types/user').UserRole },
  token?: string,
): Promise<import('../types/user').UserItem> {
  const headers = await getAuthHeaders(token, { 'Content-Type': 'application/json' });

  const res = await fetch(`${API_BASE}/auth/create-user`, {
    method: 'POST',
    headers,
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error al crear usuario' }));
    throw new Error(err.message || err.error || 'Error al crear usuario');
  }
  const data = await res.json();
  return data.user || data;
}

export async function updateUserRole(
  userId: string,
  role: import('../types/user').UserRole,
  token?: string,
): Promise<import('../types/user').UserItem> {
  const headers = await getAuthHeaders(token, { 'Content-Type': 'application/json' });

  const res = await fetch(`${API_BASE}/auth/update-role/${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ role }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error al actualizar rol' }));
    throw new Error(err.message || err.error || 'Error al actualizar rol');
  }
  const data = await res.json();
  return data.user || data;
}

export async function disableUser(
  userId: string,
  token?: string,
): Promise<{ ok: boolean; message: string }> {
  const headers = await getAuthHeaders(token, { 'Content-Type': 'application/json' });

  const res = await fetch(`${API_BASE}/auth/disable/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error al suspender usuario' }));
    throw new Error(err.message || err.error || 'Error al suspender usuario');
  }
  return res.json();
}

export async function deleteUser(
  userId: string,
  token?: string,
): Promise<{ ok: boolean; message: string }> {
  const headers = await getAuthHeaders(token, { 'Content-Type': 'application/json' });

  const res = await fetch(`${API_BASE}/auth/delete/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error al eliminar usuario' }));
    throw new Error(err.message || err.error || 'Error al eliminar usuario');
  }
  return res.json();
}

// ==========================================
// ADMIN SUITE APIS (AUDIT, INVITATIONS, DASHBOARD)
// ==========================================

export async function fetchAuditLogs(
  filters?: {
    user_id?: string;
    role?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  },
  token?: string,
): Promise<AuditLogsResponse> {
  const headers = await getAuthHeaders(token, { 'Content-Type': 'application/json' });

  const queryParams = new URLSearchParams();
  if (filters?.user_id) queryParams.set('user_id', filters.user_id);
  if (filters?.role) queryParams.set('role', filters.role);
  if (filters?.action) queryParams.set('action', filters.action);
  if (filters?.startDate) queryParams.set('startDate', filters.startDate);
  if (filters?.endDate) queryParams.set('endDate', filters.endDate);
  if (filters?.page) queryParams.set('page', filters.page.toString());
  if (filters?.limit) queryParams.set('limit', filters.limit.toString());

  const qs = queryParams.toString();
  const url = `${API_BASE}/admin-suite/audit${qs ? `?${qs}` : ''}`;

  const res = await fetch(url, { headers, cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error al cargar registros de auditoría' }));
    throw new Error(err.message || 'Error al cargar registros de auditoría');
  }
  return res.json();
}

export async function fetchAuditLogById(id: string, token?: string): Promise<AuditLogEntry> {
  const headers = await getAuthHeaders(token, { 'Content-Type': 'application/json' });

  const res = await fetch(`${API_BASE}/admin-suite/audit/${encodeURIComponent(id)}`, {
    headers,
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error al cargar registro de auditoría' }));
    throw new Error(err.message || 'Error al cargar registro de auditoría');
  }
  return res.json();
}

export async function fetchInvitations(token?: string): Promise<InvitationEntry[]> {
  const headers = await getAuthHeaders(token, { 'Content-Type': 'application/json' });

  const res = await fetch(`${API_BASE}/admin-suite/invitations`, {
    headers,
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error al cargar invitaciones' }));
    throw new Error(err.message || 'Error al cargar invitaciones');
  }
  return res.json();
}

export async function createInvitation(
  data: { email: string; role: string },
  token?: string,
): Promise<{ id: string; email: string; role: string; token: string; inviteUrl: string }> {
  const headers = await getAuthHeaders(token, { 'Content-Type': 'application/json' });

  const res = await fetch(`${API_BASE}/admin-suite/invitations`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error al crear invitación' }));
    throw new Error(err.message || err.error || 'Error al crear invitación');
  }
  return res.json();
}

export async function validateInvitationToken(
  token: string,
): Promise<{ valid: boolean; invitation?: InvitationEntry; reason?: string }> {
  const res = await fetch(`${API_BASE}/admin-suite/invitations/${encodeURIComponent(token)}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Invitación inválida o expirada' }));
    return { valid: false, reason: err.message || 'Invitación inválida o expirada' };
  }
  return res.json();
}

export async function acceptInvitation(
  data: { token: string; password: string },
): Promise<{ ok: boolean; message: string; user: any }> {
  const res = await fetch(`${API_BASE}/admin-suite/invitations/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error al aceptar invitación' }));
    throw new Error(err.message || err.error || 'Error al aceptar invitación');
  }
  return res.json();
}

export async function fetchDashboardMetrics(token?: string): Promise<DashboardMetricsData> {
  const headers = await getAuthHeaders(token, { 'Content-Type': 'application/json' });

  const res = await fetch(`${API_BASE}/admin-suite/dashboard/metrics`, {
    headers,
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error al cargar métricas del panel' }));
    throw new Error(err.message || 'Error al cargar métricas del panel');
  }
  return res.json();
}

export async function fetchDashboardCharts(token?: string): Promise<DashboardChartsData> {
  const headers = await getAuthHeaders(token, { 'Content-Type': 'application/json' });

  const res = await fetch(`${API_BASE}/admin-suite/dashboard/charts`, {
    headers,
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error al cargar gráficos del panel' }));
    throw new Error(err.message || 'Error al cargar gráficos del panel');
  }
  return res.json();
}

// ==========================================
// REPORTS API (PDF VECTOR GENERATION)
// ==========================================

export function getTicketPdfUrl(ticketId: string): string {
  return `${API_BASE}/reports/ticket/${encodeURIComponent(ticketId)}/pdf`;
}

export function getDiagnosticPdfUrl(ticketId: string): string {
  return `${API_BASE}/reports/diagnostic/${encodeURIComponent(ticketId)}/pdf`;
}

export function getPaymentPdfUrl(paymentId: string): string {
  return `${API_BASE}/reports/payment/${encodeURIComponent(paymentId)}/pdf`;
}

// ==========================================
// BILLING API (PAYMENTS, INVOICES, CASH CLOSING, MP)
// ==========================================

export async function fetchPayments(
  filters?: {
    ticketId?: string;
    status?: string;
    method?: string;
  },
  token?: string,
): Promise<any[]> {
  const headers = await getAuthHeaders(token);
  const query = new URLSearchParams();
  if (filters?.ticketId) query.set('ticketId', filters.ticketId);
  if (filters?.status) query.set('status', filters.status);
  if (filters?.method) query.set('method', filters.method);

  const qs = query.toString() ? `?${query.toString()}` : '';
  const res = await fetch(`${API_BASE}/billing/payments${qs}`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar pagos');
  return res.json();
}

export async function createPayment(
  data: {
    ticketId?: string;
    amount: number;
    method: string;
    status?: string;
    reference?: string;
    notes?: string;
  },
  token?: string,
): Promise<any> {
  const headers = await getAuthHeaders(token, { 'Content-Type': 'application/json' });
  const res = await fetch(`${API_BASE}/billing/payments`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error al registrar pago' }));
    throw new Error(err.message || 'Error al registrar pago');
  }
  return res.json();
}

export async function fetchInvoices(token?: string): Promise<any[]> {
  const headers = await getAuthHeaders(token);
  const res = await fetch(`${API_BASE}/billing/invoices`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar facturas');
  return res.json();
}

export async function createInvoice(
  data: {
    ticketId?: string;
    customerName: string;
    customerTaxId?: string;
    totalAmount: number;
  },
  token?: string,
): Promise<any> {
  const headers = await getAuthHeaders(token, { 'Content-Type': 'application/json' });
  const res = await fetch(`${API_BASE}/billing/invoices`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error al crear factura' }));
    throw new Error(err.message || 'Error al crear factura');
  }
  return res.json();
}

export async function fetchBillingSummary(token?: string): Promise<any> {
  const headers = await getAuthHeaders(token);
  const res = await fetch(`${API_BASE}/billing/summary`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar resumen de caja');
  return res.json();
}

export async function createMercadoPagoPreference(
  data: {
    ticketId?: string;
    title: string;
    amount: number;
    customerEmail?: string;
  },
  token?: string,
): Promise<any> {
  const headers = await getAuthHeaders(token, { 'Content-Type': 'application/json' });
  const res = await fetch(`${API_BASE}/billing/mercadopago/preference`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error al generar preferencia MercadoPago' }));
    throw new Error(err.message || 'Error al generar preferencia MercadoPago');
  }
  return res.json();
}

// ==========================================
// BACKUP & RESTORE MODULE API
// ==========================================

export function getBackupDownloadUrl(module: string, format: 'zip' | 'json' = 'json'): string {
  if (format === 'zip' || module === 'zip') {
    return `${API_BASE}/backup/zip`;
  }
  if (module === 'all') {
    return `${API_BASE}/backup/all?download=true`;
  }
  return `${API_BASE}/backup/${module}?download=true`;
}

export async function fetchBackupHistory(token?: string): Promise<AuditLogEntry[]> {
  const headers = await getAuthHeaders(token, { 'Content-Type': 'application/json' });

  const res = await fetch(`${API_BASE}/backup/history`, {
    headers,
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error al obtener historial de backups' }));
    throw new Error(err.message || 'Error al obtener historial de backups');
  }
  return res.json();
}

export async function downloadBackupFile(
  module: string,
  format: 'zip' | 'json' = 'json',
  token?: string,
): Promise<void> {
  const url = getBackupDownloadUrl(module, format);
  const headers = await getAuthHeaders(token);

  const res = await fetch(url, { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `Error al descargar respaldo (${res.statusText})` }));
    throw new Error(err.message || `Error al descargar respaldo (${res.statusText})`);
  }

  const blob = await res.blob();
  const dateStr = new Date().toISOString().split('T')[0];
  const defaultFilename =
    format === 'zip'
      ? `electrofix-backup-${dateStr}.zip`
      : module === 'all'
      ? `electrofix-full-backup-${dateStr}.json`
      : `electrofix-${module}-${dateStr}.json`;

  const disposition = res.headers.get('content-disposition');
  let filename = defaultFilename;
  if (disposition && disposition.includes('filename=')) {
    const match = disposition.match(/filename="?([^"]+)"?/);
    if (match && match[1]) filename = match[1];
  }

  const objectUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(objectUrl);
}

// ==========================================
// CATALOG API (CATALOG ITEMS & AI QUOTING)
// ==========================================

export async function fetchCatalogItems(
  activeOnly?: boolean,
  category?: string,
  token?: string,
): Promise<CatalogItem[]> {
  const headers = await getAuthHeaders(token);
  const query = new URLSearchParams();
  if (activeOnly !== undefined) query.set('active', String(activeOnly));
  if (category) query.set('category', category);

  const qs = query.toString() ? `?${query.toString()}` : '';
  const res = await fetch(`${API_BASE}/catalog${qs}`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar el catálogo de servicios');
  return res.json();
}

export async function fetchCatalogItemById(id: string, token?: string): Promise<CatalogItem> {
  const headers = await getAuthHeaders(token);
  const res = await fetch(`${API_BASE}/catalog/${encodeURIComponent(id)}`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error('Error al obtener servicio del catálogo');
  return res.json();
}

export async function searchCatalog(query: string, token?: string): Promise<CatalogItem[]> {
  const headers = await getAuthHeaders(token);
  const res = await fetch(`${API_BASE}/catalog/search?q=${encodeURIComponent(query)}`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error('Error al buscar en el catálogo');
  return res.json();
}

export async function createCatalogItem(
  data: CreateCatalogItemInput,
  token?: string,
): Promise<CatalogItem> {
  const headers = await getAuthHeaders(token, { 'Content-Type': 'application/json' });

  const res = await fetch(`${API_BASE}/catalog`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error al crear servicio en catálogo' }));
    throw new Error(err.message || 'Error al crear servicio en catálogo');
  }
  return res.json();
}

export async function updateCatalogItem(
  id: string,
  data: UpdateCatalogItemInput,
  token?: string,
): Promise<CatalogItem> {
  const headers = await getAuthHeaders(token, { 'Content-Type': 'application/json' });

  const res = await fetch(`${API_BASE}/catalog/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error al actualizar servicio del catálogo' }));
    throw new Error(err.message || 'Error al actualizar servicio del catálogo');
  }
  return res.json();
}

export async function deleteCatalogItem(
  id: string,
  token?: string,
): Promise<{ ok: boolean; id: string }> {
  const headers = await getAuthHeaders(token, { 'Content-Type': 'application/json' });

  const res = await fetch(`${API_BASE}/catalog/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error al eliminar servicio del catálogo' }));
    throw new Error(err.message || 'Error al eliminar servicio del catálogo');
  }
  return res.json();
}
