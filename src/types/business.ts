export interface Business {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  whatsapp_number: string;
  logo_path: string | null;
  banner_path: string | null;
  theme_color: string;
  currency: string;
  is_active: boolean;
  is_suspended: boolean;
  suspended_at: string | null;
  suspended_reason: string | null;
  created_at: string;
  updated_at: string;
}
