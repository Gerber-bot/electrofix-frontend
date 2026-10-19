export type UserRole = 'admin' | 'taller' | 'tecnico' | 'operador' | 'cliente';

export interface UserItem {
  id: string;
  email: string | null;
  role: UserRole;
  email_confirmed_at: string | null;
  banned_until?: string | null;
  created_at: string;
  updated_at?: string | null;
}
