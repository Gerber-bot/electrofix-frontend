export type TicketStatus =
  | 'RECEIVED'
  | 'DIAGNOSING'
  | 'WAITING_APPROVAL'
  | 'WAITING_PARTS'
  | 'IN_REPAIR'
  | 'QC_CHECK'
  | 'READY_FOR_PICKUP'
  | 'DELIVERED';

export interface Tenant {
  id: string;
  name: string;
  phone?: string | null;
}

export interface RepairTicket {
  id: string;
  orderNumber: number;
  trackingToken: string;
  tenantId: string;
  tenant?: Tenant;
  customerName: string;
  customerDni: string;
  customerPhone: string;
  deviceType: string;
  brandModel: string;
  serialOrImei?: string | null;
  reportedIssue: string;
  technicalDiagnosis?: string | null;
  liquidDamageRisk: boolean;
  estimatedCost?: number | string | null;
  finalCost?: number | string | null;
  isPaid: boolean;
  status: TicketStatus;
  qcPassed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PriceCatalogItem {
  id: string;
  tenantId: string;
  brandModel: string;
  serviceName: string;
  price: number | string;
  estimatedTime: string;
  inStock: boolean;
}
