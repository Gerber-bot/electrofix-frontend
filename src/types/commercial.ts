export interface Payment {
  id: string;
  ticket_id: string | null;
  amount: number;
  method: string; // CASH, TRANSFER, MERCADOPAGO, CARD
  status: string; // APPROVED, PENDING, REJECTED
  reference: string | null;
  notes: string | null;
  created_at: string;
}

export interface Invoice {
  id: string;
  ticket_id: string | null;
  customer_name: string;
  customer_tax_id: string | null;
  total_amount: number;
  status: string; // ISSUED, CANCELLED
  invoice_number: string;
  pdf_url: string | null;
  created_at: string;
}

export interface CashClosingSummary {
  date: string;
  totalCollectedToday: number;
  byMethod: {
    cash: number;
    transfer: number;
    card: number;
    mercadopago: number;
  };
  todayTransactionsCount: number;
  monthlyTotal: number;
  invoicesIssuedCount: number;
}

export interface MercadoPagoPreferenceResponse {
  id: string;
  ticketId?: string;
  title: string;
  unitPrice: number;
  currencyId: string;
  initPoint: string;
  sandboxInitPoint: string;
  status: string;
  createdAt: string;
}
