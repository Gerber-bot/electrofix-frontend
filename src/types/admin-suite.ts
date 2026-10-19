import { UserRole } from './user';

export interface AuditLogEntry {
  id: string;
  user_id: string | null;
  role: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface AuditLogsResponse {
  data: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InvitationEntry {
  id: string;
  email: string;
  role: UserRole;
  token: string;
  expires_at: string;
  used: boolean;
  created_at: string;
  status: 'active' | 'used' | 'expired';
}

export interface DashboardMetricsData {
  ticketsInRepair: number;
  ticketsDelivered: number;
  ticketsCreatedToday: number;
  activeTechniciansCount: number;
  averageRepairTimeHours: number;
  averageRepairTimeDays: number;
  monthlyEstimatedRevenue: number;
  aiDiagnosticsCount: number;
  operatorActivityCount: number;
  actionsByRole: Record<string, number>;
  peakActivityHours: Array<{ hour: number; count: number }>;
}

export interface DashboardChartsData {
  ticketsByDay: Array<{ date: string; label: string; count: number }>;
  productivityByTechnician: Array<{ name: string; count: number; completed: number }>;
  statusDistribution: Array<{ status: string; label: string; count: number; percentage: number }>;
  hourlyDistribution: Array<{ hour: number; label: string; count: number }>;
  deviceTypeDistribution: Array<{ type: string; count: number }>;
}
