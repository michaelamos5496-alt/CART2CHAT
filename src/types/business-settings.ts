export const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type Day = (typeof DAYS)[number];

export interface DayHours {
  open: string; // "HH:mm"
  close: string; // "HH:mm"
  closed: boolean;
}

export type BusinessHours = Record<Day, DayHours>;

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  twitter?: string;
  website?: string;
}

export interface BusinessSettings {
  business_id: string;
  business_hours: Partial<BusinessHours>;
  order_number_prefix: string;
  whatsapp_message_template: string;
  min_order_amount: number | null;
  delivery_fee: number;
  social_links: SocialLinks;
  auto_confirm_orders: boolean;
  notify_email: string | null;
  created_at: string;
  updated_at: string;
}
